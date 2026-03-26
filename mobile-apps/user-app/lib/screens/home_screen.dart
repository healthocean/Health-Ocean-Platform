import 'dart:ui';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../widgets/shimmer_placeholder.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import 'body_map_screen.dart';
import '../providers/cart_provider.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';
import 'package:geolocator/geolocator.dart';
import 'bookings_screen.dart';
import 'reports_screen.dart';
import 'health_history_screen.dart';
import 'settings_screen.dart';
import 'cart_screen.dart';
import 'test_details_screen.dart';
import 'package_details_screen.dart';
import 'profile_screen.dart';
import 'search_screen.dart';
import 'tests_screen.dart';
import 'packages_screen.dart';
import 'labs_screen.dart';
import 'lab_detail_screen.dart';
import 'sanmare_assist_screen.dart';
import '../utils/history_service.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
// Just in case

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  int _selectedIndex = 0;
  List<dynamic> _tests = [];
  List<dynamic> _packages = [];
  bool _isLoading = true;
  String? _currentCity;
  String? _currentPincode;
  List<Map<String, dynamic>> _browsedItems = [];
  final PageController _promoController = PageController(initialPage: 5001, viewportFraction: 1.0);
  int _currentPromoRawPage = 5001;
  int _currentPromoPage = 0;
  late Stream<int> _promoStream;
  bool _isPromoInteracting = false;

  bool _isLocationChecking = false;
  List<dynamic> _nearbyLabs = [];
  bool _isLabsLoading = false;
  double? _userLat;
  double? _userLng;

  final PageController _topLabsController = PageController(initialPage: 5000, viewportFraction: 0.88);
  Timer? _topLabsTimer;
  int _currentTopLabRawPage = 5000;
  int _currentTopLabPage = 0;
  bool _isTopLabsInteracting = false;
  DateTime? _lastLabsRetryTime;

  String? _initialTestCategory;
  String? _initialTestGender;
  String? _initialTestOrgan;
  String? _initialPkgCategory;
  String? _initialPkgGender;
  String? _initialPkgOrgan;

  void _navToTests({String? category, String? gender, String? organ}) {
    setState(() {
      _initialTestCategory = category;
      _initialTestGender = gender;
      _initialTestOrgan = organ;
      _selectedIndex = 1;
    });
  }

  void _navToPackages({String? category, String? gender, String? organ}) {
    setState(() {
      _initialPkgCategory = category;
      _initialPkgGender = gender;
      _initialPkgOrgan = organ;
      _selectedIndex = 2;
    });
  }

  Future<void> _fetchNearbyLabs(double lat, double lng) async {
    if (_isLabsLoading) return;
    if (mounted) setState(() => _isLabsLoading = true);
    try {
      final labs = await ApiService.getNearbyLabs(lat: lat, lng: lng);
      if (mounted) {
        setState(() {
          _nearbyLabs = labs;
          _isLabsLoading = false;
        });
      }
    } catch (e) {
      print('Error fetching nearby labs: $e');
      if (mounted) setState(() => _isLabsLoading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadData();
    _loadHistory();
    _loadCachedLocation().then((_) => _initLocationDetection());
    _startPromoTimer();
  }

  Future<void> _loadCachedLocation() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final city = prefs.getString('cached_city');
      final pin = prefs.getString('cached_pincode');
      final lat = prefs.getDouble('cached_lat');
      final lng = prefs.getDouble('cached_lng');
      if (mounted) {
        setState(() {
          if (city != null) _currentCity = city;
          if (pin != null) _currentPincode = pin;
          if (lat != null) _userLat = lat;
          if (lng != null) _userLng = lng;
        });
        // Immediately fetch labs for the cached location
        if (lat != null && lng != null) {
          _fetchNearbyLabs(lat, lng);
        }
      }
    } catch (e) {
      print('Error loading cached location: $e');
    }
  }

  void _startPromoTimer() {
    Future.delayed(const Duration(milliseconds: 3300), () {
      if (!mounted) return;
      if (!_isPromoInteracting && _promoController.hasClients && _promoController.positions.length == 1) {
        final total = 7; // Matching our new promo asset count
        final nextPage = _currentPromoRawPage + 1;
        _promoController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 900),
          curve: Curves.easeInOutCubic,
        ).then((_) {
          _startPromoTimer();
        });
      } else {
        _startPromoTimer();
      }
    });
  }

  void _startTopLabsTimer() {
    if (_topLabsTimer != null || _nearbyLabs.isEmpty) return;
    _topLabsTimer = Timer.periodic(const Duration(seconds: 2, milliseconds: 600), (timer) {
      if (!mounted || _isTopLabsInteracting || _nearbyLabs.isEmpty) return;
      if (_topLabsController.hasClients) {
        final nextPage = _currentTopLabRawPage + 1;
        _topLabsController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 900),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  @override
  void dispose() {
    _promoController.dispose();
    _topLabsController.dispose();
    _topLabsTimer?.cancel(); // Cancel the top labs timer
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _initLocationDetection();
    }
  }

  Future<void> _initLocationDetection() async {
    if (_isLocationChecking) return;
    _isLocationChecking = true;

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        await _detectLocationByIP();
        _isLocationChecking = false;
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      
      // If not determined yet, ask once
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        try {
          // Try getting last known position first (fast) then fresh position (accurate)
          Position? pos = await Geolocator.getLastKnownPosition();
          
          try {
            pos = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.medium,
              timeLimit: const Duration(seconds: 12),
            );
          } catch (_) {
            // If fresh position fails/times out, we still have our last known (if any)
          }

          if (pos != null) {
            final uri = Uri.parse(
              'https://nominatim.openstreetmap.org/reverse?lat=${pos.latitude}&lon=${pos.longitude}&format=json&addressdetails=1',
            );
            final res = await http.get(uri, headers: {'User-Agent': 'HealthOceanApp/1.0'});
            final data = json.decode(res.body);
            final addr = data['address'] as Map<String, dynamic>;
            
            final city = addr['city'] ?? addr['town'] ?? addr['district'] ?? addr['village'] ?? addr['suburb'] ?? addr['state_district'] ?? '';
            final pin = addr['postcode']?.toString().replaceAll(' ', '').substring(0, 6) ?? '';
            
            if (mounted) {
              setState(() {
                if (city.isNotEmpty) _currentCity = city;
                if (pin.isNotEmpty) _currentPincode = pin;
                _userLat = pos!.latitude;
                _userLng = pos!.longitude;
              });
              // Always save to cache and refresh labs with success
              final prefs = await SharedPreferences.getInstance();
              if (city.isNotEmpty) await prefs.setString('cached_city', city);
              if (pin.isNotEmpty) await prefs.setString('cached_pincode', pin);
              await prefs.setDouble('cached_lat', pos!.latitude);
              await prefs.setDouble('cached_lng', pos!.longitude);
              
              _fetchNearbyLabs(pos!.latitude, pos!.longitude);
              _isLocationChecking = false;
              return; // success
            }
          }
        } catch (e) {
          print('GPS location resolution failed: $e');
        }
      }
      
      // Fallback to IP detection if GPS is denied or fails
      await _detectLocationByIP();
    } finally {
      _isLocationChecking = false;
    }
  }

  Future<void> _detectLocationByIP() async {
    try {
      final response = await http.get(Uri.parse('http://ip-api.com/json'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final city = data['city'];
        final pin = data['zip'];
        
        if (mounted) {
          if (city != _currentCity || pin != _currentPincode) {
            setState(() {
              _currentCity = city;
              _currentPincode = pin;
            });
            // Save to cache
            final prefs = await SharedPreferences.getInstance();
            if (city != null) await prefs.setString('cached_city', city);
            if (pin != null) await prefs.setString('cached_pincode', pin);
            if (data['lat'] != null) await prefs.setDouble('cached_lat', double.parse(data['lat'].toString()));
            if (data['lon'] != null) await prefs.setDouble('cached_lng', double.parse(data['lon'].toString()));
            setState(() {
              _userLat = double.parse(data['lat'].toString());
              _userLng = double.parse(data['lon'].toString());
            });
            // Fetch nearby labs
            _fetchNearbyLabs(double.parse(data['lat'].toString()), double.parse(data['lon'].toString()));
          }
        }
      }
    } catch (e) {
      print('Error detecting location by IP: $e');
    }
  }

  Future<void> _requestLocationPermission() async {
    final status = await Geolocator.checkPermission();
    if (status == LocationPermission.denied) {
      await Geolocator.requestPermission();
    }
  }

  Future<void> _loadData() async {
    try {
      final testsResponse = await http.get(Uri.parse(ApiConstants.tests));
      final packagesResponse = await http.get(Uri.parse(ApiConstants.packages));

      if (testsResponse.statusCode == 200) {
        final testsData = json.decode(testsResponse.body);
        setState(() => _tests = testsData['tests'] ?? []);
      }
      if (packagesResponse.statusCode == 200) {
        final pkgData = json.decode(packagesResponse.body);
        setState(() => _packages = pkgData['packages'] ?? []);
      }
      setState(() => _isLoading = false);
    } catch (e) {
      print('Error loading data: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadHistory() async {
    final history = await HistoryService.getHistory();
    if (mounted) setState(() => _browsedItems = history);
  }
  // Ocean Breeze gradient: consistent light-to-darker left to right
  static const _gradStart = Color(0xFF90E0EF); // Frosted Blue
  static const _gradMid   = Color(0xFF00B4D8); // Turquoise Surf
  static const _gradEnd   = Color(0xFF0077B6); // Bright Teal Blue (label/indicator color)
  static const _gradRight = Color(0xFF0077B6); // Bright Teal Blue (appbar right edge)

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final cartProvider = Provider.of<CartProvider>(context);

    return Scaffold(
      extendBody: true,
      backgroundColor: const Color(0xFFF0FAFF),
      appBar: (_selectedIndex != 0 && _selectedIndex != 3)
          ? AppBar(
              elevation: 0,
              backgroundColor: Colors.transparent,
              automaticallyImplyLeading: false,
              flexibleSpace: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_gradStart, _gradMid, _gradRight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
              toolbarHeight: 60,
              title: Image.asset('assets/healthoceanlogo.png', height: 40, fit: BoxFit.contain),
              centerTitle: false,
              actions: [
                _authAction(authProvider),
                _buildLocationDropdown(),
                _cartIcon(cartProvider),
              ],
            )
          : null,
      body: Stack(
        children: [
          _selectedIndex == 0
              ? _buildHomeTab(authProvider, cartProvider)
              : _selectedIndex == 1
                  ? TestsScreen(
                      initialCategory: _initialTestCategory,
                      initialGender: _initialTestGender,
                      initialOrgan: _initialTestOrgan,
                      key: ValueKey('tests-$_initialTestCategory-$_initialTestGender-$_initialTestOrgan'),
                    )
                  : _selectedIndex == 2
                      ? PackagesScreen(
                          initialCategory: _initialPkgCategory,
                          initialGender: _initialPkgGender,
                          initialOrgan: _initialPkgOrgan,
                          key: ValueKey('pkgs-$_initialPkgCategory-$_initialPkgGender-$_initialPkgOrgan'),
                        )
                      : const ProfileScreen(),
          
          // Bottom area blur (Pinned) - exactly behind the bottom bar zone
          Positioned(
            bottom: 0, left: 0, right: 0,
            height: 92, // Exactly 20 margin + 70 bar height
            child: IgnorePointer(
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 7, sigmaY: 7),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFFF0FAFF).withOpacity(0.0),
                          const Color(0xFFF0FAFF).withOpacity(0.95),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomNav(context),
      floatingActionButton: _selectedIndex == 3 ? null : _buildChatbotFab(context),
    );
  }

  Widget _buildChatbotFab(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                _gradStart.withOpacity(0.85),
                _gradMid.withOpacity(0.85),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _gradMid.withOpacity(0.6), width: 1.5),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context, 
                  MaterialPageRoute(builder: (_) => const SanmareAssistScreen())
                );
              },
              child: const Icon(Icons.support_agent_rounded, color: _gradEnd, size: 28),
            ),
          ),
        ),
      ),
    );
  }

  Widget _cartIcon(CartProvider cartProvider) {
    return Stack(
      children: [
        IconButton(
          icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 26),
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
        ),
        if (cartProvider.itemCount > 0)
          Positioned(
            right: 8, top: 8,
            child: Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 1.5)),
              constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
              child: Text('${cartProvider.itemCount}', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
            ),
          ),
      ],
    );
  }

  Widget _authAction(AuthProvider authProvider) {
    if (!authProvider.isAuthenticated) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.only(right: 2),
          child: TextButton(
            onPressed: () => Navigator.pushNamed(context, '/login'),
            style: TextButton.styleFrom(
              backgroundColor: Colors.white.withOpacity(0.2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            ),
            child: const Text('Login', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildLocationDropdown() {
    return InkWell(
      onTap: _showPincodeDialog,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 0, 16, 0),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.location_on, color: Colors.white, size: 12),
                    const SizedBox(width: 2),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 100),
                      child: Text(
                        _currentCity ?? 'Detecting...',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    const Icon(Icons.arrow_drop_down, color: Colors.white, size: 16),
                  ],
                ),
                if (_currentPincode != null)
                  Padding(
                    padding: const EdgeInsets.only(left: 14),
                    child: Text(
                      _currentPincode!,
                      style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 9, fontWeight: FontWeight.w500),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showPincodeDialog() async {
    final controller = TextEditingController(text: _currentPincode);
    String? error;
    bool loading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Change Location', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Enter your pincode to check service availability in your area.', 
                style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'Pincode',
                  hintText: 'e.g. 110001',
                  errorText: error,
                  prefixIcon: const Icon(Icons.pin_drop_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  suffixIcon: loading ? const Padding(
                    padding: EdgeInsets.all(12),
                    child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                  ) : null,
                ),
                keyboardType: TextInputType.number,
                maxLength: 6,
                onChanged: (val) async {
                  if (val.length == 6) {
                    setDialogState(() => loading = true);
                    try {
                      final uri = Uri.parse(
                        'https://nominatim.openstreetmap.org/search?postalcode=$val&country=India&format=json&addressdetails=1&limit=1',
                      );
                      final res = await http.get(uri, headers: {'User-Agent': 'HealthOceanApp/1.0'});
                      final data = jsonDecode(res.body) as List;
                      if (data.isNotEmpty) {
                        final addr = data[0]['address'] as Map<String, dynamic>;
                        final city = addr['city'] ?? addr['town'] ?? addr['village'] ?? addr['county'] ?? addr['state_district'] ?? 'Unknown';
                        final double? newLat = data[0]['lat'] != null ? double.parse(data[0]['lat'].toString()) : null;
                        final double? newLng = data[0]['lon'] != null ? double.parse(data[0]['lon'].toString()) : null;

                        setDialogState(() => error = null);
                          if (mounted) {
                            setState(() {
                              _currentCity = city;
                              _currentPincode = val;
                              if (newLat != null) _userLat = newLat;
                              if (newLng != null) _userLng = newLng;
                            });
                            // Fetch new labs for this new pincode location
                            if (newLat != null && newLng != null) {
                              _fetchNearbyLabs(newLat, newLng);
                            }
                          }
                          // Save to cache
                          final prefs = await SharedPreferences.getInstance();
                          await prefs.setString('cached_city', city);
                          await prefs.setString('cached_pincode', val);
                          if (newLat != null) await prefs.setDouble('cached_lat', newLat);
                          if (newLng != null) await prefs.setDouble('cached_lng', newLng);
                          
                          Navigator.pop(ctx);
                          AppToast.show(context, 'Location updated to $city', type: ToastType.success);
                      } else {
                        setDialogState(() => error = 'Invalid Pincode');
                      }
                    } catch (_) {
                      setDialogState(() => error = 'Error checking pincode');
                    } finally {
                      setDialogState(() => loading = false);
                    }
                  }
                },
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBarTitle() {
    return const SizedBox.shrink();
  }

  Widget _buildBottomNav(BuildContext context) {
    final items = [
      {'icon': Icons.home_outlined,          'filled': Icons.home_rounded,         'label': 'Home'},
      {'icon': Icons.science_outlined,       'filled': Icons.science_rounded,      'label': 'Tests'},
      {'icon': Icons.local_offer_outlined,   'filled': Icons.local_offer_rounded,  'label': 'Packages'},
      {'icon': Icons.person_outline_rounded, 'filled': Icons.person_rounded,       'label': 'Profile'},
    ];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
      height: 70,
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(color: _gradMid.withOpacity(0.12), blurRadius: 24, offset: const Offset(0, 8)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: const Color(0xFF303030).withOpacity(0.15), width: 1.0),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
          final itemWidth = constraints.maxWidth / items.length;
          const pillW = 52.0;
          const pillH = 32.0;
          const iconAreaTop = 10.0; // pill sits near top of bar
          final pillLeft = _selectedIndex * itemWidth + (itemWidth - pillW) / 2;

          return Stack(
            children: [
              // Sliding gradient pill — only behind the icon, not the label
              AnimatedPositioned(
                duration: const Duration(milliseconds: 280),
                curve: Curves.easeInOut,
                left: pillLeft,
                top: iconAreaTop,
                width: pillW,
                height: pillH,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [_gradStart, _gradMid, _gradRight],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
              // Tab items — icon sits inside pill area, label sits below
              Row(
                children: List.generate(items.length, (index) {
                  final isSelected = _selectedIndex == index;
                  final item = items[index];
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedIndex = index;
                        // Reset filters when manually switching tabs for a fresh view
                        _initialTestCategory = null;
                        _initialTestGender = null;
                        _initialTestOrgan = null;
                        _initialPkgCategory = null;
                        _initialPkgGender = null;
                        _initialPkgOrgan = null;
                      });
                      if (index == 0) _loadHistory(); // Refresh history when coming back to home
                    },
                    behavior: HitTestBehavior.opaque,
                    child: SizedBox(
                      width: itemWidth,
                      height: 70,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          const SizedBox(height: iconAreaTop),
                          SizedBox(
                            height: pillH,
                            child: Center(
                              child: Icon(
                                isSelected ? item['filled'] as IconData : item['icon'] as IconData,
                                color: isSelected ? Colors.white : Colors.grey.shade400,
                                size: 22,
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          AnimatedDefaultTextStyle(
                            duration: const Duration(milliseconds: 250),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                              color: isSelected ? _gradEnd : Colors.grey.shade500,
                            ),
                            child: Text(item['label'] as String),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ],
          );
        },
      ),
    ),
  ),
);
}

  Widget _buildHomeTab(AuthProvider authProvider, CartProvider cartProvider) {
    final statusBarH = MediaQuery.of(context).padding.top;
    // appbar toolbar = 60, hero content ≈ 140 → total expanded = 60 + statusBarH + 140
    final expandedH = 60.0 + statusBarH + 160.0;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          expandedHeight: expandedH,
          toolbarHeight: 60,
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: Image.asset('assets/healthoceanlogo.png', height: 40, fit: BoxFit.contain),
          centerTitle: false,
          actions: [
            _authAction(authProvider),
            _buildLocationDropdown(),
            _cartIcon(cartProvider),
          ],
          flexibleSpace: Stack(
            children: [
              // Always-visible gradient behind the pinned toolbar
              Positioned(
                top: 0, left: 0, right: 0,
                height: 60 + MediaQuery.of(context).padding.top,
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [_gradStart, _gradMid, _gradRight],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
              ),
              FlexibleSpaceBar(
            collapseMode: CollapseMode.pin,
            background: ClipPath(
              clipper: _WaveClipper(),
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_gradStart, _gradMid, _gradRight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: EdgeInsets.fromLTRB(20, statusBarH + 68, 20, 40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Book Lab Tests',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                    const SizedBox(height: 4),
                    const Text('Get tested at home with certified labs',
                        style: TextStyle(fontSize: 13, color: Colors.white70)),
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: TextField(
                        readOnly: true,
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
                        },
                        decoration: InputDecoration(
                          hintText: 'Search for tests, packages...',
                          hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                          prefixIcon: const Icon(Icons.search, color: _gradEnd),
                          suffixIcon: Container(
                            margin: const EdgeInsets.all(7),
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [_gradStart, _gradMid, _gradRight]),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.tune, color: Colors.white, size: 16),
                          ),
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
            ],
          ),
        ),
        SliverList(
          delegate: SliverChildListDelegate([
            _buildHealthConcernsSection(),
            _buildTestExplorerBanner(),
            if (_browsedItems.isNotEmpty) _buildPreviouslyBrowsedSection(),
            _buildVitalOrgansSection(),
            _buildLabsDiscoveryCard(),
            _buildTopLabsSection(),
            _buildPromoBannerCarousel(),
            _buildRecommendedCheckupsSection(),
            _buildBookingProcessSection(),
            _buildWhyTrustSection(),
            const SizedBox(height: 100),
          ]),
        ),
      ],
    );
  }

  Widget _buildHealthConcernsSection() {
    // PRESET PROMPTS FOR GENERATION:
    // 1. Full Body: "Realistic 3d isometric icon of a medical clipboard with DNA helix, clean blue background, medical photography style"
    // 2. Fever: "Close-up realistic photo of a modern digital medical thermometer, soft blue lighting"
    // 3. Thyroid: "Realistic anatomical 3d model of a human thyroid gland, floating in a clean medical blue space"
    // 4. Diabetes: "Realistic photo of a sleek modern glucose monitoring device, clean medical studio lighting"
    // 5. Heart: "Realistic 3d red heart model with glowing stethoscope around it, clean white background"
    // 6. Allergy: "Realistic photo of a skin prick allergy test on a forearm, professional medical photography"
    // 7. Hair/Skin: "Aesthetic photography of healthy glowing skin and silky human hair strands, soft blue tones"
    
    final concerns = [
      {'name': 'Full Body\nCheckups', 'image': 'assets/home/full_body.webp', 'color': const Color(0xFFE0F2F1)},
      {'name': 'Fever', 'image': 'assets/home/fever.webp', 'color': const Color(0xFFE3F2FD)},
      {'name': 'Thyroid', 'image': 'assets/home/thyroid.webp', 'color': const Color(0xFFF3E5F5)},
      {'name': 'Diabetes', 'image': 'assets/home/diabetes.webp', 'color': const Color(0xFFE8EAF6)},
      {'name': 'Heart\nHealth', 'image': 'assets/home/heart_health.webp', 'color': const Color(0xFFFFEBEE)},
      {'name': 'Allergy\nTests', 'image': 'assets/home/allergy.webp', 'color': const Color(0xFFFFF3E0)},
      {'name': 'Hair &\nSkin', 'image': 'assets/home/hair_skin.webp', 'color': const Color(0xFFE0F7FA)},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Shop by Health Concern', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
                  SizedBox(height: 2),
                  Text('Find tests curated for your symptoms', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
              TextButton(
                onPressed: () => _navToTests(),
                child: const Text('View All', style: TextStyle(color: _gradEnd, fontWeight: FontWeight.bold, fontSize: 13)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 130,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: concerns.length,
              itemBuilder: (context, index) {
                final concern = concerns[index];
                return GestureDetector(
                  onTap: () {
                    final name = (concern['name'] as String).replaceAll('\n', ' ');
                    _navToTests(category: name);
                  },
                  child: Container(
                    width: 90,
                    margin: const EdgeInsets.only(right: 16),
                    child: Column(
                      children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(22),
                          boxShadow: [
                            BoxShadow(color: (concern['color'] as Color).withOpacity(0.5), blurRadius: 12, offset: const Offset(0, 6)),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(22),
                          child: Image.asset(
                            concern['image'] as String,
                            fit: BoxFit.cover,
                            errorBuilder: (context, _, _) => Center(
                              child: Icon(Icons.medical_services_outlined, color: _gradEnd.withOpacity(0.3), size: 30),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        concern['name'] as String,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black87, height: 1.2),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        ],
      ),
    );
  }

  Widget _buildLabsDiscoveryCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const LabsScreen()));
        },
        child: Container(
          height: 180,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: _gradEnd.withOpacity(0.2),
                blurRadius: 25,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: Stack(
              children: [
                // 1. BASE SOLID GRADIENT
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFF023E8A).withOpacity(0.8),
                          const Color(0xFF48CAE4).withOpacity(0.8),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                ),

                // 2. LIVE FADING MAP OVERLAY
                if (_userLat != null && _userLng != null)
                  Positioned.fill(
                    child: ShaderMask(
                      shaderCallback: (rect) {
                        return const LinearGradient(
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                          colors: [Colors.transparent, Colors.black],
                          stops: [0.2, 0.95],
                        ).createShader(rect);
                      },
                      blendMode: BlendMode.dstIn,
                      child: Opacity(
                        opacity: 0.35,
                        child: AbsorbPointer(
                          child: FlutterMap(
                            key: ValueKey('bg-map-$_userLat-$_userLng'),
                            options: MapOptions(
                              initialCenter: LatLng(_userLat!, _userLng!),
                              initialZoom: 14.0,
                            ),
                            children: [
                              TileLayer(
                                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                userAgentPackageName: 'com.healthocean.app',
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                // CONTENT
                Padding(
                  padding: const EdgeInsets.all(28),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white24,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.white30),
                              ),
                              child: const Text(
                                'MAP INTEGRATED',
                                style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Nearby Labs\nDiscovery',
                              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, height: 1.1, letterSpacing: -0.5),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Find certified diagnostic centers around you on an interactive map.',
                              style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.3),
                              maxLines: 2,
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      // FLOATING 3D-ISH ICON
                      Container(
                        width: 64, height: 64,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 15, offset: const Offset(0, 8)),
                          ],
                        ),
                        child: const Icon(Icons.map_rounded, color: _gradEnd, size: 32),
                      ),
                    ],
                  ),
                ),
                // PULSE ANIMATION INDICATOR (Subtle)
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPreviouslyBrowsedSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recently Browsed by You', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
              GestureDetector(
                onTap: () async {
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.remove('browsing_history');
                  _loadHistory();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFCAF0F8),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _gradMid.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.delete_outline_rounded, color: _gradMid, size: 14),
                      const SizedBox(width: 4),
                      Text('Clear', style: TextStyle(color: _gradMid, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              itemCount: _browsedItems.length,
              itemBuilder: (context, index) {
                final item = _browsedItems[index];
                final isTest = item['type'] == 'test';
                final accent = _gradMid; // Matches 'Turquoise Surf' (#00b4d8) perfectly
                return GestureDetector(
                  onTap: () {
                    if (isTest) {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => TestDetailsScreen(test: item))).then((_) => _loadHistory());
                    } else {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => PackageDetailsScreen(package: item))).then((_) => _loadHistory());
                    }
                  },
                  child: Container(
                    width: 240,
                    margin: const EdgeInsets.only(right: 14),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFCAF0F8).withOpacity(0.3), // Light Cyan match
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _gradMid.withOpacity(0.1), width: 1.5),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 52, height: 52,
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                          child: Icon(isTest ? Icons.science_rounded : Icons.inventory_2_rounded, color: accent, size: 26),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(item['name'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, height: 1.2), maxLines: 1, overflow: TextOverflow.ellipsis),
                              if (item['lab'] != null)
                                Text(item['lab']['name'] ?? '', style: TextStyle(fontSize: 10, color: Colors.grey.shade600, fontWeight: FontWeight.w500), maxLines: 1),
                              const SizedBox(height: 4),
                              Text('₹${item['price']}', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: accent)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPromoBannerCarousel() {
    final screenW = MediaQuery.of(context).size.width;
    const bannerRatio = 2560 / 915;
    final carouselH = screenW / bannerRatio;

    final promos = [
      'assets/home/151399.webp',
      'assets/home/151400.webp',
      'assets/home/151401.webp',
      'assets/home/151402.webp',
      'assets/home/151403.webp',
      'assets/home/151404.webp',
      'assets/home/151405.webp',
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Offers and Deals', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.6, color: Color(0xFF1E293B))),
                SizedBox(height: 4),
                Text('Checkout exclusive Offers & Deals', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.blueGrey)),
              ],
            ),
          ),
          SizedBox(
            height: carouselH,
            child: Listener(
              onPointerDown: (_) => _isPromoInteracting = true,
              onPointerUp: (_) => _isPromoInteracting = false,
              child: PageView.builder(
                controller: _promoController,
                onPageChanged: (i) => setState(() {
                  _currentPromoRawPage = i;
                  _currentPromoPage = i % promos.length;
                }),
                itemCount: 10000,
                itemBuilder: (context, index) {
                  final promoIndex = index % promos.length;
                  return AnimatedBuilder(
                    animation: _promoController,
                    builder: (context, child) {
                      double value = 1.0;
                      if (_promoController.hasClients && _promoController.position.haveDimensions) {
                        try {
                          value = (_promoController.page! - index);
                          value = (1 - (value.abs() * 0.1)).clamp(0.0, 1.0);
                        } catch (_) {}
                      }
                      return Transform.scale(
                        scale: Curves.easeOut.transform(value),
                        child: child,
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: AspectRatio(
                        aspectRatio: 2.9, // Slightly zoomed in from 2.8 to fill top/bottom gaps
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(20),
                            child: Image.asset(
                              promos[promoIndex],
                              fit: BoxFit.cover,
                              errorBuilder: (context, _, _) => Container(
                                color: _gradEnd.withOpacity(0.1),
                                child: const Icon(Icons.broken_image_outlined, color: _gradEnd),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(promos.length, (index) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: _currentPromoPage == index ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _currentPromoPage == index ? _gradMid : const Color(0xFFCAF0F8),
                  borderRadius: BorderRadius.circular(4),
                  boxShadow: _currentPromoPage == index ? [BoxShadow(color: _gradMid.withOpacity(0.3), blurRadius: 4, offset: const Offset(0, 2))] : null,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalOrgansSection() {

    final organs = [
      {'name': 'Heart', 'image': 'assets/home/vital_heart.webp', 'color': const Color(0xFFFFEBEE)},
      {'name': 'Thyroid', 'image': 'assets/home/vital_thyroid.webp', 'color': const Color(0xFFF3E5F5)},
      {'name': 'Liver', 'image': 'assets/home/vital_liver.webp', 'color': const Color(0xFFEFEBE9)},
      {'name': 'Lungs', 'image': 'assets/home/vital_lungs.webp', 'color': const Color(0xFFE0F2F1)},
      {'name': 'Kidney', 'image': 'assets/home/vital_kidneys.webp', 'color': const Color(0xFFFFECB3)},
      {'name': 'Bone', 'image': 'assets/home/vital_bone.webp', 'color': const Color(0xFFECEFF1)},
      {'name': 'Brain', 'image': 'assets/home/vital_brain.webp', 'color': const Color(0xFFEDE7F6)},
      {'name': 'Joints', 'image': 'assets/home/vital_joint.webp', 'color': const Color(0xFFF1F8E9)},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Check Vital Organs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.75,
            ),
            padding: EdgeInsets.zero,
            itemCount: organs.length,
            itemBuilder: (context, index) {
              final organ = organs[index];
              return GestureDetector(
                onTap: () => _navToTests(organ: organ['name'] as String),
                child: Column(
                  children: [
                    AspectRatio(
                      aspectRatio: 1,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.asset(
                            organ['image'] as String,
                            fit: BoxFit.cover,
                            errorBuilder: (context, _, _) => Container(
                              decoration: BoxDecoration(color: (organ['color'] as Color).withOpacity(0.3), shape: BoxShape.circle),
                              child: Icon(Icons.favorite_outline, color: _gradEnd.withOpacity(0.5), size: 20),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(organ['name'] as String, 
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.black87), 
                      textAlign: TextAlign.center),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendedCheckupsSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Recommended Checkups', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
          const SizedBox(height: 4),
          const Text('Lifestyle & age-based health packages', style: TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 12),
          _buildGenderCheckups('For Men', ['assets/home/young_man.webp', 'assets/home/middle_age_man.webp', 'assets/home/old_man.webp'], const Color(0xFFE3F2FD), _gradMid),
          const SizedBox(height: 12),
          _buildGenderCheckups('For Women', ['assets/home/young_woman.webp', 'assets/home/middle_age_woman.webp', 'assets/home/old_woman.webp'], const Color(0xFFFCE4EC), Colors.pinkAccent),
        ],
      ),
    );
  }

  Widget _buildGenderCheckups(String title, List<String> images, Color bgColor, Color accent) {
    final ages = ['Under 25', '25-50', 'Above 50'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 4, height: 18, decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(2))),
            const SizedBox(width: 10),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 140,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            itemCount: 4,
            itemBuilder: (context, index) {
              final gender = title.contains('Men') ? 'Male' : 'Female';
              if (index == 3) {
                return GestureDetector(
                  onTap: () => _navToPackages(gender: gender),
                  child: Container(
                    width: 120,
                    margin: const EdgeInsets.only(right: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: accent.withOpacity(0.2), width: 1.5),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_shopping_cart_rounded, color: accent, size: 32),
                        const SizedBox(height: 8),
                        Text('View All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: accent)),
                      ],
                    ),
                  ),
                );
              }
              return GestureDetector(
                onTap: () => _navToPackages(gender: gender),
                child: Container(
                width: 130,
                margin: const EdgeInsets.only(right: 16),
                decoration: BoxDecoration(
                  color: bgColor.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: accent.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Stack(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(ages[index], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, height: 1.1)),
                          const SizedBox(height: 4),
                          const Text('Detailed Screening', style: TextStyle(fontSize: 10, color: Colors.black54)),
                          const Spacer(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(
                                width: 64, height: 64,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: accent.withOpacity(0.12), width: 1.5),
                                  boxShadow: [BoxShadow(color: accent.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 4))],
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(32),
                                  child: Image.asset(images[index], fit: BoxFit.cover, errorBuilder: (context, _, _) => Icon(Icons.person_3_outlined, color: accent, size: 28)),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                child: Icon(Icons.arrow_forward_rounded, color: accent, size: 18),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      right: -10, bottom: -10,
                      child: IgnorePointer(
                        child: Icon(Icons.favorite, color: accent.withOpacity(0.06), size: 100),
                      ),
                    ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBookingProcessSection() {
    final steps = [
      {
        'title': 'Explore & Choose',
        'desc': 'Navigate 1000+ tests. Find your path to wellness with smart search.',
        'icon': Icons.explore_rounded,
        'grad': [const Color(0xFF90E0EF), const Color(0xFF00B4D8)],
        'accent': const Color(0xFF0077B6),
      },
      {
        'title': 'Smart Labs',
        'desc': 'Real-time lab comparison. Get the best tech at the best price.',
        'icon': Icons.home_work_rounded,
        'grad': [const Color(0xFFE0F7FA), const Color(0xFF80DEEA)],
        'accent': const Color(0xFF0097A7),
      },
      {
        'title': 'Instant Booking',
        'desc': 'Seamless scheduling for your home sample collection.',
        'icon': Icons.electric_bolt_rounded,
        'grad': [const Color(0xFFE8F5E9), const Color(0xFFA5D6A7)],
        'accent': const Color(0xFF388E3C),
      },
      {
        'title': 'Reports Unlocked',
        'desc': 'NABL standard digital reports. Instant health notifications.',
        'icon': Icons.auto_awesome_rounded,
        'grad': [const Color(0xFFFFF3E0), const Color(0xFFFFCC80)],
        'accent': const Color(0xFFF57C00),
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Icon(Icons.auto_graph_rounded, color: _gradEnd, size: 24),
                SizedBox(width: 12),
                Text('Booking Made Simple', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: -0.8)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: steps.asMap().entries.expand((entry) {
                final index = entry.key;
                final step = entry.value;
                final colors = step['grad'] as List<Color>;
                final accent = step['accent'] as Color;

                return [
                  Container(
                    width: 280, height: 210,
                    margin: EdgeInsets.only(right: index == steps.length - 1 ? 0 : 0),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(32),
                      child: Stack(
                        children: [
                          // LIGHT GLASS BASE
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.35),
                              borderRadius: BorderRadius.circular(32),
                              border: Border.all(color: accent.withOpacity(0.1), width: 1.5),
                            ),
                          ),
                          // UNIQUE OVERLAY: MEDICAL PULSE SINE WAVE
                          Positioned.fill(
                            child: CustomPaint(
                              painter: MedicalPulsePainter(color: accent.withOpacity(0.08)),
                            ),
                          ),
                          // REDESIGNED INDEX (NO '0', MOVED LEFT)
                          Positioned(
                            right: 15, top: -5,
                            child: Text(
                              '${index + 1}',
                              style: TextStyle(
                                fontSize: 108,
                                fontWeight: FontWeight.w900,
                                color: accent.withOpacity(0.04), 
                              ),
                            ),
                          ),
                          // ACCENT TOP GLOW BAR (RESTORED)
                          Positioned(
                            top: 0, left: 40, right: 40,
                            child: Container(
                              height: 4,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [accent.withOpacity(0.0), accent.withOpacity(0.6), accent.withOpacity(0.0)]),
                                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(4)),
                              ),
                            ),
                          ),
                          // DECORATIVE GLOW
                          Positioned(
                            bottom: -40, right: -30,
                            child: Container(
                              width: 150, height: 150,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: RadialGradient(
                                  colors: [accent.withOpacity(0.08), Colors.transparent],
                                ),
                              ),
                            ),
                          ),
                          // CONTENT
                          Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(colors: [colors[0].withOpacity(0.5), colors[1].withOpacity(0.5)]),
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                  child: Icon(step['icon'] as IconData, color: Colors.white.withOpacity(0.7), size: 24),
                                ),
                                const Spacer(),
                                Text(step['title'] as String, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 8),
                                Text(
                                  step['desc'] as String,
                                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600, height: 1.4, letterSpacing: -0.2),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (index < steps.length - 1)
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      child: Icon(Icons.double_arrow_rounded, color: _gradEnd.withOpacity(0.4), size: 32),
                    ),
                ];
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWhyTrustSection() {

    final features = [
      {
        'icon': Icons.verified_user_rounded, 
        'title': '100% NABL', 
        'desc': 'ISO certified lab partners', 
        'color': const Color(0xFFE8F5E9)
      },
      {
        'icon': Icons.timer_rounded, 
        'title': '24-48h Result', 
        'desc': 'Fastest report delivery', 
        'color': const Color(0xFFE1F5FE)
      },
      {
        'icon': Icons.home_rounded, 
        'title': '1k+ Experts', 
        'desc': 'Certified phlebotomists', 
        'color': const Color(0xFFFFF3E0)
      },
      {
        'icon': Icons.security_rounded, 
        'title': 'Secure Data', 
        'desc': 'Encrypted health reports', 
        'color': const Color(0xFFF3E5F5)
      },
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade100)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 4, height: 24, decoration: BoxDecoration(color: _gradEnd, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 12),
              const Text('Why Trust Health Ocean?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
            ],
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(left: 16),
            child: Text('We prioritize accuracy, safety and your convenience', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
          ),
          const SizedBox(height: 20),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 2.0,
            ),
            padding: EdgeInsets.zero,
            itemCount: features.length,
            itemBuilder: (context, index) {
              final feature = features[index];
              final color = feature['color'] as Color;
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.grey.shade100, width: 1.5),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Container(
                      width: 42, height: 42,
                      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(14)),
                      child: Icon(feature['icon'] as IconData, color: _gradEnd, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(feature['title'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: -0.2)),
                          const SizedBox(height: 2),
                          Text(feature['desc'] as String, style: TextStyle(fontSize: 9, color: Colors.grey.shade600, height: 1.1), maxLines: 2, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 16),
          // Additional quality badge or mention
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F8E9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.green.shade100),
            ),
            child: Row(
              children: [
                Icon(Icons.verified_outlined, color: Colors.green.shade700, size: 28),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Certified Quality Assurance', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87)),
                      SizedBox(height: 2),
                      Text('Our lab partners are NABL, CAP & ISO certified for zero-error results.', style: TextStyle(fontSize: 11, color: Colors.black54)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Inline tests UI removed as we now route explicitly to TestsScreen

  Widget _buildChip(BuildContext context, String label, IconData icon) {
    final primary = Theme.of(context).colorScheme.primary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: primary.withOpacity(0.08), borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: primary),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, color: primary)),
        ],
      ),
    );
  }



  Widget _infoTile(BuildContext context, IconData icon, String label, String value) {
    final primary = Theme.of(context).colorScheme.primary;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: primary.withOpacity(0.06), borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 18, color: primary),
        const SizedBox(height: 6),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Widget _detailCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: child,
    );
  }

  Widget _labRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, size: 15, color: Colors.grey),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: Colors.black87))),
      ]),
    );
  }

  // Inline packages UI removed as we now route explicitly to PackagesScreen

  Widget _buildProfileTab() {
    final authProvider = Provider.of<AuthProvider>(context);
    
    if (!authProvider.isAuthenticated) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/healthoceanlogo.png', height: 80, fit: BoxFit.contain),
              const SizedBox(height: 12),
              const Text('Please login to view profile', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
              const SizedBox(height: 8),
              const Text('Access your bookings, reports and health history', style: TextStyle(fontSize: 14, color: Colors.grey), textAlign: TextAlign.center),
              const SizedBox(height: 24),
              Container(
                height: 48,
                width: 200,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [_gradStart, _gradMid, _gradEnd]),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ElevatedButton(
                  onPressed: () => Navigator.pushNamed(context, '/login'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: const Text('Login', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: 200,
                height: 48,
                child: OutlinedButton(
                  onPressed: () => Navigator.pushNamed(context, '/signup'),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: _gradEnd, width: 2),
                    foregroundColor: _gradEnd,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Sign Up', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(colors: [_gradStart, _gradMid], begin: Alignment.topLeft, end: Alignment.bottomRight),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person, size: 48, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Text(authProvider.user?['name'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(authProvider.user?['email'] ?? '', style: const TextStyle(fontSize: 14, color: Colors.grey)),
                if (authProvider.user?['phone'] != null) ...[
                  const SizedBox(height: 4),
                  Text(authProvider.user?['phone'] ?? '', style: const TextStyle(fontSize: 14, color: Colors.grey)),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        _buildProfileMenuItem(
          icon: Icons.calendar_today,
          title: 'My Bookings',
          subtitle: 'View all your test bookings',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => BookingsScreen()));
          },
        ),
        _buildProfileMenuItem(
          icon: Icons.description,
          title: 'My Reports',
          subtitle: 'Access your test reports',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => ReportsScreen()));
          },
        ),
        _buildProfileMenuItem(
          icon: Icons.history,
          title: 'Health History',
          subtitle: 'Track your health over time',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => HealthHistoryScreen()));
          },
        ),
        _buildProfileMenuItem(
          icon: Icons.settings,
          title: 'Settings',
          subtitle: 'Manage your preferences',
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => SettingsScreen()));
          },
        ),
        const SizedBox(height: 8),
        Card(
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.logout, color: Colors.red),
            ),
            title: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w500)),
            onTap: () => _showLogoutDialog(context, authProvider),
          ),
        ),
      ],
    );
  }

  Widget _buildProfileMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: Theme.of(context).colorScheme.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              authProvider.logout();
              Navigator.pop(context);
              AppToast.show(context, 'Logged out successfully', type: ToastType.success);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  Widget _buildTestExplorerBanner() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BodyMapScreen())),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF023E8A).withOpacity(0.8), 
                    const Color(0xFF48CAE4).withOpacity(0.8) // Slightly darker than frosted blue
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.2)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF03045E).withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  // Abstract background pulse
                  Positioned(
                    right: -20,
                    top: -20,
                    child: Icon(Icons.blur_on_rounded, color: Colors.white.withOpacity(0.05), size: 100),
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: const Icon(Icons.accessibility_new_rounded, color: Colors.cyanAccent, size: 36),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.cyanAccent,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'NEW & GAMIFIED',
                                style: TextStyle(color: Color(0xFF03045E), fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Test Explorer',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22, letterSpacing: -0.5),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Discover health through an interactive map.',
                              style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.3),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
   Widget _buildTopLabsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 32, 16, 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Top Labs Near You', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: -0.5)),
                  SizedBox(height: 2),
                  Text('Highly rated diagnostic centers in your area', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ),
        ),
        SizedBox(
          height: 140,
          child: _isLabsLoading 
            ? _buildTopLabsSkeleton() 
            : (_nearbyLabs.isEmpty ? _buildTopLabsEmpty() : _buildTopLabsList()),
        ),
      ],
    );
  }

  Widget _buildTopLabsSkeleton() {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: 3,
      itemBuilder: (context, _) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
        child: ShimmerPlaceholder.rounded(
          width: MediaQuery.of(context).size.width * 0.88,
          height: 140,
          borderRadius: 24,
        ),
      ),
    );
  }

  Widget _buildTopLabsEmpty() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.blue.shade50, shape: BoxShape.circle),
            child: Icon(Icons.info_outline_rounded, color: Colors.blue.shade400),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('No curated labs here yet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1E293B))),
                const SizedBox(height: 2),
                const Text('We are arriving in your area soon!', style: TextStyle(fontSize: 11, color: Colors.blueGrey)),
                const SizedBox(height: 8),
                TextButton.icon(
                  onPressed: () async {
                    final now = DateTime.now();
                    if (_lastLabsRetryTime != null && now.difference(_lastLabsRetryTime!).inSeconds < 5) {
                      AppToast.show(context, 'Please wait a moment before retrying', type: ToastType.info);
                      return;
                    }
                    _lastLabsRetryTime = now;
                    if (_userLat != null && _userLng != null) {
                      await _fetchNearbyLabs(_userLat!, _userLng!);
                    }
                  },
                  icon: const Icon(Icons.refresh_rounded, size: 16),
                  label: const Text('Retry', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    foregroundColor: Colors.blue.shade400,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopLabsList() {
    final topLabs = _nearbyLabs.take(10).toList();
    _startTopLabsTimer();

    return MouseRegion(
      onEnter: (_) => _isTopLabsInteracting = true,
      onExit: (_) => _isTopLabsInteracting = false,
      child: PageView.builder(
        controller: _topLabsController,
        onPageChanged: (i) => setState(() {
          _currentTopLabRawPage = i;
          if (topLabs.isNotEmpty) {
            _currentTopLabPage = i % topLabs.length;
          }
        }),
        itemCount: 10000,
        itemBuilder: (context, index) {
          final lab = topLabs[index % topLabs.length];
          return AnimatedBuilder(
            animation: _topLabsController,
            builder: (context, child) {
              double value = 1.0;
              if (_topLabsController.position.haveDimensions) {
                value = (_topLabsController.page! - index);
                value = (1 - (value.abs() * 0.08)).clamp(0.9, 1.0);
              }
              return Transform.scale(scale: value, child: child);
            },
            child: GestureDetector(
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => LabDetailScreen(lab: lab))),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFF023E8A).withOpacity(0.08), blurRadius: 20, offset: const Offset(0, 8)),
                    BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2)),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 72, height: 72,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0F9FF),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFF0077B6).withOpacity(0.08)),
                          ),
                          child: const Center(child: Icon(Icons.science_rounded, color: Color(0xFF0077B6), size: 34)),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(lab['name'] ?? '', 
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, letterSpacing: -0.6, color: Color(0xFF1E293B)), 
                                maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(6)),
                                    child: Row(
                                      children: [
                                        Icon(Icons.star_rounded, color: Colors.amber[600], size: 12),
                                        const Text(' 4.9', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF92400E))),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(_getDistanceString(lab), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade400)),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text('${lab['city'] ?? ''} • Verified Laboratory', 
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Colors.grey.shade400, letterSpacing: 0.1)),
                            ],
                          ),
                        ),
                        Container(
                          width: 32, height: 32,
                          decoration: BoxDecoration(color: const Color(0xFF0077B6).withOpacity(0.06), shape: BoxShape.circle),
                          child: const Icon(Icons.chevron_right_rounded, color: Color(0xFF0077B6), size: 20),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        },
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
    final double roadKm = directKm * 1.3;
    
    if (roadKm < 1) return '${(roadKm * 1000).round()}m away';
    return '${roadKm.toStringAsFixed(1)} km away';
  }
}

class _WaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height - 30);

    final firstControlPoint = Offset(size.width * 0.2, size.height);
    final firstEndPoint    = Offset(size.width * 0.4, size.height - 20);
    path.quadraticBezierTo(
      firstControlPoint.dx, firstControlPoint.dy,
      firstEndPoint.dx,     firstEndPoint.dy,
    );

    final secondControlPoint = Offset(size.width * 0.6, size.height - 40);
    final secondEndPoint     = Offset(size.width * 0.8, size.height - 10);
    path.quadraticBezierTo(
      secondControlPoint.dx, secondControlPoint.dy,
      secondEndPoint.dx,     secondEndPoint.dy,
    );

    final thirdControlPoint = Offset(size.width * 0.9, size.height + 5);
    final thirdEndPoint     = Offset(size.width,       size.height - 20);
    path.quadraticBezierTo(
      thirdControlPoint.dx, thirdControlPoint.dy,
      thirdEndPoint.dx,     thirdEndPoint.dy,
    );

    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(_WaveClipper old) => false;
}

class MedicalPulsePainter extends CustomPainter {
  final Color color;
  MedicalPulsePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final midY = size.height * 0.75;
    
    path.moveTo(0, midY);
    path.lineTo(size.width * 0.1, midY);
    path.lineTo(size.width * 0.15, midY - 10);
    path.lineTo(size.width * 0.2, midY + 10);
    path.lineTo(size.width * 0.25, midY);
    path.lineTo(size.width * 0.45, midY);
    path.lineTo(size.width * 0.5, midY - 40);
    path.lineTo(size.width * 0.55, midY + 30);
    path.lineTo(size.width * 0.6, midY);
    path.lineTo(size.width * 0.8, midY);
    path.lineTo(size.width * 0.85, midY - 15);
    path.lineTo(size.width * 0.9, midY + 15);
    path.lineTo(size.width * 0.95, midY);
    path.lineTo(size.width, midY);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

