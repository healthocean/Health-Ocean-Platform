import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import '../services/api_service.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';
import './lab_detail_screen.dart';

class LabsScreen extends StatefulWidget {
  const LabsScreen({super.key});

  @override
  State<LabsScreen> createState() => _LabsScreenState();
}

class _LabsScreenState extends State<LabsScreen> with TickerProviderStateMixin {
  List<dynamic> _nearbyLabs = [];
  List<dynamic> _searchResults = [];
  bool _isLoading = true;
  bool _isSearching = false;
  double? _userLat;
  double? _userLng;
  final MapController _mapController = MapController();
  final TextEditingController _searchController = TextEditingController();
  dynamic _selectedLab;
  final DraggableScrollableController _sheetController = DraggableScrollableController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _loadLocationAndLabs();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.isEmpty) {
        setState(() {
          _searchResults = [];
          _isSearching = false;
        });
        return;
      }

      setState(() => _isSearching = true);
      try {
        // We filter nearby labs locally for suggestions, or could call a search API
        final filtered = _nearbyLabs.where((lab) {
          final name = (lab['name'] ?? '').toString().toLowerCase();
          return name.contains(query.toLowerCase());
        }).toList();
        
        setState(() {
          _searchResults = filtered;
          _isSearching = false;
        });
      } catch (e) {
        setState(() => _isSearching = false);
      }
    });
  }

  void _animatedMapMove(LatLng destLocation, double destZoom) {
    if (!mounted) return;

    // Calculate the 'visible' center of the map, accounting for the bottom overlay
    // If a lab is selected, we have a fixed height card (~300px)
    // If not, we have the DraggableScrollableSheet partially or fully open
    double bottomOffset = 0;
    final screenH = MediaQuery.of(context).size.height;
    
    if (_selectedLab != null) {
      bottomOffset = 300; // Approx height of the selected lab card
    } else if (_sheetController.isAttached) {
      bottomOffset = _sheetController.size * screenH;
    } else {
      bottomOffset = screenH * 0.15; // Default bottom list handle height
    }

    // We want the target location to be in the center of the VISIBLE area (Top to bottomOffset)
    // The default center of the map is ScreenH / 2.
    // The visual center is (ScreenH - bottomOffset) / 2.
    // So we need to shift the map center by (ScreenH / 2) - ((ScreenH - bottomOffset) / 2) pixels DOWN.
    // This simplifies to: bottomOffset / 2 pixels.
    final double pixelShiftY = bottomOffset / 2;
    
    // Convert this pixel shift to LatLng at the target zoom level
    // We use the current point as a reference to calculate the offset center
    // We use the EPSG:3857 projection logic to calculate the target center at the new zoom level
    // This allows us to shift the destination so it is visually centered in the visible area
    const double tileSize = 256.0;
    final double scale = tileSize * pow(2, destZoom);
    
    // Project the destination point to world coordinates
    final double sinLat = sin(destLocation.latitude * pi / 180);
    final double initialY = 0.5 - log((1 + sinLat) / (1 - sinLat)) / (4 * pi);
    final double targetCenterY = initialY + (pixelShiftY / scale);
    
    // Unproject the shifted Y back to Latitude
    final double shiftedLat = 90 - 360 * atan(exp((targetCenterY - 0.5) * (2 * pi))) / pi;
    final LatLng customDestCenter = LatLng(shiftedLat, destLocation.longitude);

    final latTween = Tween<double>(begin: _mapController.camera.center.latitude, end: customDestCenter.latitude);
    final lngTween = Tween<double>(begin: _mapController.camera.center.longitude, end: customDestCenter.longitude);
    final zoomTween = Tween<double>(begin: _mapController.camera.zoom, end: destZoom);
    final rotationTween = Tween<double>(begin: _mapController.camera.rotation, end: 0.0);

    final controller = AnimationController(duration: const Duration(milliseconds: 1000), vsync: this);
    final Animation<double> animation = CurvedAnimation(parent: controller, curve: Curves.fastOutSlowIn);

    controller.addListener(() {
      _mapController.move(
        LatLng(latTween.evaluate(animation), lngTween.evaluate(animation)),
        zoomTween.evaluate(animation),
      );
      _mapController.rotate(rotationTween.evaluate(animation));
    });

    animation.addStatusListener((status) {
      if (status == AnimationStatus.completed || status == AnimationStatus.dismissed) {
        controller.dispose();
      }
    });

    controller.forward();
  }

  Future<void> _loadLocationAndLabs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lat = prefs.getDouble('cached_lat');
      final lng = prefs.getDouble('cached_lng');
      
      if (lat != null && lng != null) {
        setState(() {
          _userLat = lat;
          _userLng = lng;
        });
        await _fetchLabs(lat, lng);
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error getting location: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchLabs(double lat, double lng) async {
    try {
      final labs = await ApiService.getNearbyLabs(lat: lat, lng: lng);
      if (mounted) {
        setState(() {
          _nearbyLabs = labs;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching labs: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: const Text('Registered Labs Around You', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
        elevation: 0,
        automaticallyImplyLeading: true,
        iconTheme: const IconThemeData(color: Colors.white),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF90E0EF), Color(0xFF00B4D8), Color(0xFF0077B6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        actions: const [],
      ),
      body: Stack(
        children: [
          // Map Background
          Positioned.fill(
            child: _userLat == null || _userLng == null && !_isLoading
                ? const Center(child: Text('Location not available.'))
                : FlutterMap(
                    mapController: _mapController,
                        options: MapOptions(
                          initialCenter: LatLng(_userLat!, _userLng!),
                          initialZoom: 15.5,
                          minZoom: 10.0,
                        ),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.healthocean.app',
                          ),
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: LatLng(_userLat!, _userLng!),
                                width: 40, height: 40,
                                child: Container(
                                  decoration: BoxDecoration(color: Colors.blue.withOpacity(0.2), shape: BoxShape.circle),
                                  child: Center(
                                    child: Container(
                                      width: 14, height: 14,
                                      decoration: BoxDecoration(
                                        color: Colors.blue, shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white, width: 2),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              ..._nearbyLabs.map((lab) {
                                final coords = lab['location']?['coordinates'] as List?;
                                if (coords == null || coords.length < 2) return null;
                                return Marker(
                                  point: LatLng(coords[1].toDouble(), coords[0].toDouble()),
                                  width: 45, height: 45,
                                  child: GestureDetector(
                                    onTap: () {
                                      _animatedMapMove(LatLng(coords[1].toDouble(), coords[0].toDouble()), 16.5);
                                      _showLabDetail(lab);
                                    },
                                    child: const Icon(Icons.location_on_rounded, color: Colors.pinkAccent, size: 40),
                                  ),
                                );
                              }).whereType<Marker>().toList(),
                            ],
                          ),
                        ],
                      ),
          ),

          // Search Header with Suggestions
          Positioned(
            top: 0, left: 0, right: 0,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16).copyWith(bottom: 8),
                  child: TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    onTap: () {
                      setState(() => _selectedLab = null);
                      if (_sheetController.isAttached) {
                        _sheetController.animateTo(0.15, duration: const Duration(milliseconds: 200), curve: Curves.easeIn);
                      }
                    },
                    decoration: InputDecoration(
                      hintText: 'Search for labs or locations...',
                      hintStyle: const TextStyle(color: Colors.blueGrey, fontSize: 14),
                      prefixIcon: const Icon(Icons.search, color: ApiConstants.oceanMid),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: Colors.grey, size: 20),
                              onPressed: () {
                                _searchController.clear();
                                _onSearchChanged('');
                                setState(() {});
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32),
                        borderSide: BorderSide(color: ApiConstants.oceanMid.withOpacity(0.1)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32),
                        borderSide: BorderSide(color: ApiConstants.oceanMid.withOpacity(0.1)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(32),
                        borderSide: const BorderSide(color: ApiConstants.oceanMid, width: 1.5),
                      ),
                    ),
                  ),
                ),
                if (_searchResults.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FBFE),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 20, offset: const Offset(0, 10))],
                    ),
                    constraints: const BoxConstraints(maxHeight: 350),
                    child: ListView.separated(
                      shrinkWrap: true,
                      padding: EdgeInsets.zero,
                      itemCount: _searchResults.length,
                      separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey[100]),
                      itemBuilder: (context, index) {
                        final lab = _searchResults[index];
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: ApiConstants.oceanLight, borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.local_hospital_rounded, color: ApiConstants.oceanEnd, size: 20),
                          ),
                          title: Text(lab['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          subtitle: Text(lab['city'] ?? '', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                          trailing: Icon(Icons.north_west_rounded, size: 16, color: Colors.grey[300]),
                          onTap: () {
                            FocusScope.of(context).unfocus();
                            final coords = lab['location']?['coordinates'] as List?;
                            if (coords != null) {
                              _animatedMapMove(LatLng(coords[1].toDouble(), coords[0].toDouble()), 16.5);
                              _showLabDetail(lab);
                            }
                            setState(() {
                              _searchResults = [];
                              _searchController.clear();
                            });
                          },
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),

          // Floating Location Button (Moves with sheet)
          if (_userLat != null && _userLng != null)
            ListenableBuilder(
              listenable: _sheetController,
              builder: (context, child) {
                double bottomPadding = 16;
                
                if (_selectedLab != null) {
                  // If lab detail is open, move above the fixed card (approx 310+ px)
                  bottomPadding = 320;
                } else if (_sheetController.isAttached) {
                  // Move above the draggable sheet
                  bottomPadding = (_sheetController.size * MediaQuery.of(context).size.height) + 16;
                } else {
                  // Default closed state height (approx 15% of screen)
                  bottomPadding = (MediaQuery.of(context).size.height * 0.15) + 16;
                }

                return AnimatedPositioned(
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOutCubic,
                  bottom: bottomPadding,
                  right: 16,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(color: ApiConstants.oceanEnd.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 5)),
                      ],
                    ),
                    child: FloatingActionButton(
                      heroTag: 'loc_btn',
                      backgroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      onPressed: () {
                        setState(() => _selectedLab = null);
                        _animatedMapMove(LatLng(_userLat!, _userLng!), 15.5);
                      },
                      child: const Icon(Icons.my_location_rounded, color: ApiConstants.oceanEnd, size: 24),
                    ),
                  ),
                );
              },
            ),

          // Draggable Lab List (Only visible if no lab is selected)
          if (_selectedLab == null)
            DraggableScrollableSheet(
              controller: _sheetController,
              initialChildSize: 0.15,
              minChildSize: 0.15,
              maxChildSize: 0.6,
              snap: true, // Makes it snap to min/max
              builder: (context, scrollController) {
                return ListenableBuilder(
                  listenable: _sheetController,
                  builder: (context, child) {
                    final isExpanded = _sheetController.isAttached && _sheetController.size > 0.3;
                    
                    return Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFF8FBFE),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 20, spreadRadius: 1)],
                      ),
                      child: CustomScrollView(
                        controller: scrollController,
                        slivers: [
                          // Header / Drag Handle (Fixed position)
                          SliverPersistentHeader(
                            pinned: true,
                            delegate: _StickyHeaderDelegate(
                              minHeight: 82.0,
                              maxHeight: 82.0,
                              child: GestureDetector(
                                onTap: () {
                                  if (_sheetController.isAttached) {
                                    if (_sheetController.size > 0.3) {
                                      _sheetController.animateTo(0.15, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                                    } else {
                                      _sheetController.animateTo(0.6, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                                    }
                                  }
                                },
                                child: Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFF8FBFE),
                                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                  ),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 40, height: 4,
                                        decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                                      ),
                                      const SizedBox(height: 8),
                                      Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 16),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            const Spacer(),
                                            Text(
                                              _nearbyLabs.isEmpty ? 'Searching Labs...' : '${_nearbyLabs.length} Labs Near You',
                                              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blueGrey),
                                            ),
                                            Expanded(
                                              child: Align(
                                                alignment: Alignment.centerRight,
                                                child: isExpanded 
                                                  ? GestureDetector(
                                                      onTap: () {
                                                        if (_sheetController.isAttached) {
                                                          _sheetController.animateTo(0.15, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                                                        }
                                                      },
                                                      child: const Padding(
                                                        padding: EdgeInsets.all(4.0),
                                                        child: Icon(Icons.close, color: Colors.grey, size: 22),
                                                      ),
                                                    )
                                                  : const SizedBox(width: 22, height: 22),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                        if (!isExpanded) ...[
                                          const SizedBox(height: 6),
                                          _isLoading
                                              ? const _DotLoader()
                                              : Text(
                                                  'Swipe up to see list',
                                                  style: TextStyle(
                                                    color: Colors.grey[400],
                                                    fontSize: 11,
                                                    fontStyle: FontStyle.italic,
                                                  ),
                                                ),
                                        ],
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          // List of Labs
                          if (_isLoading && _nearbyLabs.isEmpty)
                            const SliverFillRemaining(
                              child: Center(
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: 100),
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                            )
                          else if (!isExpanded)
                            const SliverToBoxAdapter(child: SizedBox())
                          else
                            SliverPadding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              sliver: SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (context, index) {
                                    final lab = _nearbyLabs[index];
                                    return Card(
                                      elevation: 0,
                                      margin: const EdgeInsets.only(bottom: 12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                        side: BorderSide(color: Colors.grey[100]!),
                                      ),
                                      child: InkWell(
                                        onTap: () {
                                          final coords = lab['location']?['coordinates'] as List?;
                                          if (coords != null) {
                                            _animatedMapMove(LatLng(coords[1].toDouble(), coords[0].toDouble()), 16.5);
                                          }
                                          _showLabDetail(lab);
                                        },
                                        borderRadius: BorderRadius.circular(20),
                                        child: Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(20),
                                            boxShadow: [
                                              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
                                            ],
                                            border: Border.all(color: Colors.grey[100]!),
                                          ),
                                          child: Row(
                                            children: [
                                              Container(
                                                width: 52, height: 52,
                                                decoration: BoxDecoration(
                                                  gradient: LinearGradient(
                                                    colors: [ApiConstants.oceanLight, Colors.white],
                                                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                                                  ),
                                                  borderRadius: BorderRadius.circular(14),
                                                ),
                                                child: const Icon(Icons.local_hospital_rounded, color: ApiConstants.oceanEnd, size: 28),
                                              ),
                                              const SizedBox(width: 16),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(lab['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                                                    const SizedBox(height: 4),
                                                    Row(
                                                      children: [
                                                        Icon(Icons.near_me_rounded, size: 12, color: ApiConstants.oceanEnd.withOpacity(0.6)),
                                                        const SizedBox(width: 4),
                                                        Text(_getDistanceString(lab), style: TextStyle(color: ApiConstants.oceanEnd, fontWeight: FontWeight.w600, fontSize: 12)),
                                                        const SizedBox(width: 8),
                                                        Text('• ${lab['city'] ?? ''}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Icon(Icons.chevron_right_rounded, color: Colors.grey[300]),
                                            ],
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                  childCount: _nearbyLabs.length,
                                ),
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),

          // Persistent Detail Card (Visible if a lab is selected)
          if (_selectedLab != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.only(left: 24, right: 24, top: 24, bottom: 32),
                decoration: const BoxDecoration(
                  color: Color(0xFFF8FBFE),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 20, spreadRadius: 1)],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                Row(
                                  children: [
                                    Flexible(child: Text(_selectedLab!['name'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: -0.5), overflow: TextOverflow.ellipsis)),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.verified, color: Colors.green, size: 22),
                                  ],
                                ),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: ApiConstants.oceanLight, borderRadius: BorderRadius.circular(8)),
                                child: Text(_getDistanceString(_selectedLab!), style: const TextStyle(color: ApiConstants.oceanEnd, fontWeight: FontWeight.bold, fontSize: 12)),
                              ),
                              const SizedBox(height: 8),
                              Text(_selectedLab!['address'] ?? '', style: TextStyle(color: Colors.grey[600], fontSize: 13, height: 1.4)),
                            ],
                          ),
                        ),
                        Material(
                          color: Colors.grey[100],
                          shape: const CircleBorder(),
                          child: IconButton(
                            icon: const Icon(Icons.close_rounded, color: Colors.grey),
                            onPressed: () => setState(() => _selectedLab = null),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Icon(Icons.star_rounded, color: Colors.orange[400], size: 22),
                        const Text(' 5.0 ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('(120+ reviews)', style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                        const Spacer(),
                        _circularAction(Icons.phone_enabled_rounded, () {}),
                        const SizedBox(width: 12),
                        _circularAction(Icons.directions_rounded, () {}),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Container(
                      width: double.infinity,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [ApiConstants.oceanMid, ApiConstants.oceanEnd]),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: ApiConstants.oceanEnd.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => LabDetailScreen(lab: _selectedLab!)),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('View Full Details & Tests', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _getDistanceString(dynamic lab) {
    if (_userLat == null || _userLng == null) return 'Distance N/A';
    final coords = lab['location']?['coordinates'] as List?;
    if (coords == null) return 'Distance N/A';
    
    final double labLat = coords[1].toDouble();
    final double labLng = coords[0].toDouble();
    
    const Distance distance = Distance();
    final double directKm = distance.as(LengthUnit.Kilometer, LatLng(_userLat!, _userLng!), LatLng(labLat, labLng));
    
    // Estimate road distance (approx 1.3x multiplier)
    final double roadKm = directKm * 1.3;
    
    if (roadKm < 1) {
      return '${(roadKm * 1000).round()}m away';
    }
    return '${roadKm.toStringAsFixed(1)} km away';
  }

  void _showLabDetail(dynamic lab) {
    setState(() {
      _selectedLab = lab;
    });
  }

  Widget _circularAction(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Icon(icon, color: ApiConstants.oceanEnd, size: 24),
      ),
    );
  }
}

class _StickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final double minHeight;
  final double maxHeight;
  final Widget child;

  _StickyHeaderDelegate({
    required this.minHeight,
    required this.maxHeight,
    required this.child,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => maxHeight;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return SizedBox.expand(child: child);
  }

  @override
  bool shouldRebuild(_StickyHeaderDelegate oldDelegate) {
    return maxHeight != oldDelegate.maxHeight || minHeight != oldDelegate.minHeight || child != oldDelegate.child;
  }
}

class _DotLoader extends StatefulWidget {
  const _DotLoader();

  @override
  State<_DotLoader> createState() => _DotLoaderState();
}

class _DotLoaderState extends State<_DotLoader> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(4, (index) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final delay = index * 0.2;
            final val = (sin((_controller.value * 2 * pi) - (delay * 2 * pi)) + 1) / 2;
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2),
              width: 5, height: 5,
              decoration: BoxDecoration(
                color: ApiConstants.oceanEnd.withOpacity(0.3 + (val * 0.7)),
                shape: BoxShape.circle,
              ),
            );
          },
        );
      }),
    );
  }
}
