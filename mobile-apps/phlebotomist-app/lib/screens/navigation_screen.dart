import 'dart:convert';
import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import '../utils/app_toast.dart';

class NavigationScreen extends StatefulWidget {
  final dynamic booking;

  const NavigationScreen({super.key, required this.booking});

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> with TickerProviderStateMixin {
  final MapController _mapController = MapController();
  dynamic _bookingData;
  Position? _currentPosition;
  LatLng? _animatedPosition;
  double _rotation = 0;
  AnimationController? _moveController;
  Animation<double>? _latAnimation;
  Animation<double>? _lngAnimation;
  late LatLng _patientLocation;
  List<LatLng> _routePoints = [];
  bool _isLoading = true;
  bool _isJourneyStarted = false;
  String _distance = "Calculating...";
  double _rawDistance = 0;
  StreamSubscription<Position>? _positionStream;
  bool _autoFollow = true;
  DateTime? _lastSyncTime;
  Position? _lastRouteUpdatePosition;

  @override
  void initState() {
    super.initState();
    _bookingData = widget.booking;
    _isJourneyStarted = widget.booking['journeyStarted'] ?? false;
    _initLocations();
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    _moveController?.dispose();
    super.dispose();
  }

  double _calculateBearing(LatLng start, LatLng end) {
    final double lat1 = start.latitude * pi / 180;
    final double lon1 = start.longitude * pi / 180;
    final double lat2 = end.latitude * pi / 180;
    final double lon2 = end.longitude * pi / 180;

    final double dLon = lon2 - lon1;
    final double y = sin(dLon) * cos(lat2);
    final double x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon);
    
    double bearing = atan2(y, x) * 180 / pi;
    return (bearing + 360) % 360;
  }

  void _initLocations() async {
    try {
      final bookingId = widget.booking['bookingId'];
      final freshResponse = await http.get(Uri.parse('${ApiConstants.baseUrl}/bookings/$bookingId'));
      if (freshResponse.statusCode == 200) {
        final freshData = json.decode(freshResponse.body);
        if (freshData['success'] == true) {
          setState(() {
            _bookingData = freshData['booking'];
            _isJourneyStarted = _bookingData['journeyStarted'] ?? false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching fresh booking: $e');
    }

    if (_bookingData['userLocation'] != null && 
        _bookingData['userLocation']['coordinates'] != null &&
        _bookingData['userLocation']['coordinates'].length >= 2 &&
        _bookingData['userLocation']['coordinates'][0] != 0) {
      final coords = _bookingData['userLocation']['coordinates'];
      _patientLocation = LatLng(coords[1].toDouble(), coords[0].toDouble());
    } else {
      final String city = (widget.booking['city'] ?? '').toString().toLowerCase();
      if (city.contains('kolkata')) {
        _patientLocation = const LatLng(22.5726, 88.3639);
      } else if (city.contains('mumbai')) {
        _patientLocation = const LatLng(19.0760, 72.8777);
      } else if (city.contains('delhi')) {
        _patientLocation = const LatLng(28.6139, 77.2090);
      } else if (city.contains('bangalore') || city.contains('bengaluru')) {
        _patientLocation = const LatLng(12.9716, 77.5946);
      } else if (city.contains('pune')) {
        _patientLocation = const LatLng(18.5204, 73.8567);
      } else {
        _patientLocation = const LatLng(22.5726, 88.3639);
      }
    }

    try {
      final position = await _determinePosition();
      setState(() {
        _currentPosition = position;
        _animatedPosition = LatLng(position.latitude, position.longitude);
        _lastRouteUpdatePosition = position;
      });
      
      await _fetchRoute(
        LatLng(position.latitude, position.longitude),
        _patientLocation,
      );
      
      _startTracking();
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      AppToast.show(context, 'Error: $e');
    }
  }

  void _startTracking() {
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((Position position) {
      final newLatLng = LatLng(position.latitude, position.longitude);
      
      if (_currentPosition != null && _animatedPosition != null) {
        final bearing = _calculateBearing(_animatedPosition!, _patientLocation);
        double distanceMoved = Geolocator.distanceBetween(
          _currentPosition!.latitude, _currentPosition!.longitude,
          position.latitude, position.longitude
        );

        _moveController?.dispose();
        _moveController = AnimationController(
          duration: const Duration(milliseconds: 1000),
          vsync: this,
        );

        _latAnimation = Tween<double>(
          begin: _animatedPosition!.latitude,
          end: position.latitude,
        ).animate(CurvedAnimation(parent: _moveController!, curve: Curves.linear));

        _lngAnimation = Tween<double>(
          begin: _animatedPosition!.longitude,
          end: position.longitude,
        ).animate(CurvedAnimation(parent: _moveController!, curve: Curves.linear));

        _moveController!.addListener(() {
          setState(() {
            _animatedPosition = LatLng(_latAnimation!.value, _lngAnimation!.value);
            if (distanceMoved > 2) {
              _rotation = bearing;
            }
            if (_isJourneyStarted && _autoFollow) {
              _mapController.move(_animatedPosition!, 16);
            }
          });
        });

        _moveController!.forward();
      } else {
        setState(() {
          _animatedPosition = newLatLng;
          if (_isJourneyStarted && _autoFollow) {
            _mapController.move(newLatLng, 16);
          }
        });
      }

      setState(() {
        _currentPosition = position;
        _updateDistance(position);
      });

      if (_isJourneyStarted) {
        if (_lastSyncTime == null || 
            DateTime.now().difference(_lastSyncTime!).inSeconds > 30) {
          _syncLocationWithDB(position);
          _lastSyncTime = DateTime.now();
        }

        if (_lastRouteUpdatePosition != null) {
          double distFromLastUpdate = Geolocator.distanceBetween(
            _lastRouteUpdatePosition!.latitude, _lastRouteUpdatePosition!.longitude,
            position.latitude, position.longitude
          );
          if (distFromLastUpdate > 100) {
            _fetchRoute(newLatLng, _patientLocation);
            _lastRouteUpdatePosition = position;
          }
        }
      }
    });
  }

  void _animatedMapMove(LatLng destLocation, double destZoom) {
    final latTween = Tween<double>(begin: _mapController.camera.center.latitude, end: destLocation.latitude);
    final lngTween = Tween<double>(begin: _mapController.camera.center.longitude, end: destLocation.longitude);
    final zoomTween = Tween<double>(begin: _mapController.camera.zoom, end: destZoom);

    final controller = AnimationController(duration: const Duration(milliseconds: 800), vsync: this);
    final animation = CurvedAnimation(parent: controller, curve: Curves.fastOutSlowIn);

    controller.addListener(() {
      _mapController.move(
        LatLng(latTween.evaluate(animation), lngTween.evaluate(animation)),
        zoomTween.evaluate(animation),
      );
    });

    animation.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        controller.dispose();
      } else if (status == AnimationStatus.dismissed) {
        controller.dispose();
      }
    });

    controller.forward();
  }

  Future<void> _syncLocationWithDB(Position pos) async {
    try {
      final bookingId = _bookingData['bookingId'];
      await http.patch(
        Uri.parse('${ApiConstants.baseUrl}/bookings/$bookingId/journey'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phlebotomistLocation': {
            'coordinates': [pos.longitude, pos.latitude]
          }
        }),
      );
    } catch (e) {
      debugPrint('Sync location error: $e');
    }
  }

  void _updateDistance(Position position) {
    double distanceInMeters = Geolocator.distanceBetween(
      position.latitude, 
      position.longitude, 
      _patientLocation.latitude, 
      _patientLocation.longitude
    );
    
    setState(() {
      _rawDistance = distanceInMeters;
      if (distanceInMeters < 1000) {
        _distance = "${distanceInMeters.toStringAsFixed(0)} m";
      } else {
        _distance = "${(distanceInMeters / 1000).toStringAsFixed(1)} km";
      }
    });
  }


  Future<void> _fetchRoute(LatLng start, LatLng end) async {
    try {
      final url = 'http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson';
      final response = await http.get(Uri.parse(url));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final List<dynamic> coords = data['routes'][0]['geometry']['coordinates'];
          final double routeDistance = data['routes'][0]['distance'].toDouble();
          
          setState(() {
            _routePoints = coords.map((c) => LatLng(c[1].toDouble(), c[0].toDouble())).toList();
            if (routeDistance < 1000) {
              _distance = "${routeDistance.toStringAsFixed(0)} m";
            } else {
              _distance = "${(routeDistance / 1000).toStringAsFixed(1)} km";
            }
          });
          
          _mapController.fitCamera(
            CameraFit.bounds(
              bounds: LatLngBounds.fromPoints([start, end, ..._routePoints]),
              padding: const EdgeInsets.all(50),
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Route fetch error: $e');
    }
  }

  Future<Position> _determinePosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return Future.error('Location services are disabled.');

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return Future.error('Location permissions are denied');
    }
    
    if (permission == LocationPermission.deniedForever) return Future.error('Location permissions are permanently denied');
    return await Geolocator.getCurrentPosition();
  }

  void _startJourney() async {
    setState(() => _isLoading = true);
    try {
      final bookingId = _bookingData['bookingId'];
      final response = await http.patch(
        Uri.parse('${ApiConstants.baseUrl}/bookings/$bookingId/journey'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'journeyStarted': true,
          if (_currentPosition != null)
            'phlebotomistLocation': {
              'coordinates': [_currentPosition!.longitude, _currentPosition!.latitude]
            }
        }),
      );

      if (response.statusCode == 200) {
        setState(() {
          _isJourneyStarted = true;
          _autoFollow = true;
          _isLoading = false;
        });
        if (_currentPosition != null) {
          _mapController.move(LatLng(_currentPosition!.latitude, _currentPosition!.longitude), 16);
        }
        AppToast.show(context, 'Journey Sync Successfully');
      } else {
        setState(() => _isLoading = false);
        AppToast.show(context, 'Failed to sync journey');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      AppToast.show(context, 'Error: $e');
    }
  }

  void _openInGoogleMaps() async {
    final url = 'https://www.google.com/maps/dir/?api=1&origin=${_currentPosition?.latitude},${_currentPosition?.longitude}&destination=${_patientLocation.latitude},${_patientLocation.longitude}&travelmode=driving';
    try {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    } catch (e) {
      AppToast.show(context, 'Could not launch Google Maps');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _distance == "Calculating...") {
      return Scaffold(
        appBar: AppBar(title: const Text('Loading Navigation...'), backgroundColor: ApiConstants.oceanEnd, elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_isJourneyStarted ? 'In Journey - $_distance' : 'Navigation to Patient', 
          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        backgroundColor: ApiConstants.oceanEnd,
        elevation: 0,
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _patientLocation,
              initialZoom: 15.0,
              onPositionChanged: (pos, hasGesture) {
                if (hasGesture) {
                  setState(() => _autoFollow = false);
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.health_ocean_phlebotomist',
              ),
              if (_routePoints.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: [
                        if (_animatedPosition != null) _animatedPosition!,
                        ..._routePoints
                      ],
                      color: ApiConstants.oceanMid.withOpacity(0.7),
                      strokeWidth: 8.0,
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  Marker(
                    point: _patientLocation,
                    width: 80,
                    height: 80,
                    child: Column(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red, size: 45),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)]),
                          child: Text(_bookingData['name'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                  if (_animatedPosition != null)
                    Marker(
                      point: _animatedPosition!,
                      width: 85,
                      height: 85,
                      alignment: Alignment.center,
                      child: Transform.rotate(
                        angle: _rotation * pi / 180,
                        child: Image.asset(
                          'assets/scooty_logo.webp',
                          width: 85,
                          height: 85,
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          
          // Premium Re-center Button
          if (!_autoFollow && _isJourneyStarted)
            Positioned(
              top: 20,
              right: 20,
              child: GestureDetector(
                onTap: () {
                  setState(() => _autoFollow = true);
                  if (_currentPosition != null) {
                    _animatedMapMove(LatLng(_currentPosition!.latitude, _currentPosition!.longitude), 16);
                  }
                },
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(Icons.my_location, color: ApiConstants.oceanEnd, size: 28),
                ),
              ),
            ),

          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_isJourneyStarted)
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(30)),
                    child: Text('DISTANCE REMAINING: $_distance', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
                  ),
                Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  elevation: 12,
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 48, height: 48,
                              decoration: BoxDecoration(color: ApiConstants.oceanLight, borderRadius: BorderRadius.circular(16)),
                              child: Icon(Icons.person_pin_circle, color: ApiConstants.oceanEnd),
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_bookingData['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                  Text(_bookingData['address'], style: TextStyle(color: Colors.grey[600], fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                            if (!_isJourneyStarted)
                              Column(
                                children: [
                                  const Text('EST.', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey)),
                                  Text(_distance, style: TextStyle(fontWeight: FontWeight.bold, color: ApiConstants.oceanEnd, fontSize: 16)),
                                ],
                              ),
                          ],
                        ),
                        const SizedBox(height: 15),
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: SizedBox(
                                height: 50,
                                child: ElevatedButton(
                                  onPressed: _isJourneyStarted ? null : _startJourney,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: ApiConstants.oceanEnd,
                                    foregroundColor: Colors.white,
                                    disabledBackgroundColor: Colors.grey[200],
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                                    elevation: 0,
                                  ),
                                  child: Text(_isJourneyStarted ? 'IN PROGRESS' : 'START JOURNEY', 
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.0)),
                                ),
                              ),
                            ),
                            if (_isJourneyStarted) ...[
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 3,
                                child: SizedBox(
                                  height: 50,
                                  child: ElevatedButton.icon(
                                    onPressed: _openInGoogleMaps,
                                    icon: Image.asset(
                                      'assets/google-maps-icon.webp',
                                      width: 20,
                                      height: 20,
                                    ),
                                    label: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('OPEN IN', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 8, height: 1.1)),
                                        Text('GOOGLE MAPS', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 8, height: 1.1)),
                                      ],
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 4),
                                      side: BorderSide(color: Colors.grey[300]!, width: 1),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                                      elevation: 2,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
