import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../utils/constants.dart';

class NavigationScreen extends StatefulWidget {
  final dynamic booking;

  const NavigationScreen({super.key, required this.booking});

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  final MapController _mapController = MapController();
  Position? _currentPosition;
  late LatLng _patientLocation;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initLocations();
  }

  void _initLocations() async {
    // Determine patient location
    // Try to get from booking userLocation coordinates [long, lat]
    if (widget.booking['userLocation'] != null && 
        widget.booking['userLocation']['coordinates'] != null &&
        widget.booking['userLocation']['coordinates'][0] != 0) {
      final coords = widget.booking['userLocation']['coordinates'];
      _patientLocation = LatLng(coords[1].toDouble(), coords[0].toDouble());
    } else {
      // Fallback location (e.g., center of city or default)
      _patientLocation = const LatLng(18.5204, 73.8567); // Pune default
    }

    try {
      final position = await _determinePosition();
      setState(() {
        _currentPosition = position;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not get your location: $e')),
      );
    }
  }

  Future<Position> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return Future.error('Location services are disabled.');

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return Future.error('Location permissions are denied');
    }
    
    if (permission == LocationPermission.deniedForever) return Future.error('Location permissions are permanently denied');

    return await Geolocator.getCurrentPosition();
  }

  void _openInGoogleMaps() async {
    final url = 'https://www.google.com/maps/dir/?api=1&destination=${_patientLocation.latitude},${_patientLocation.longitude}';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Navigation to Patient', style: TextStyle(color: Colors.white)),
        backgroundColor: ApiConstants.oceanEnd,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_location),
            onPressed: () => _mapController.move(_patientLocation, 15),
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _patientLocation,
              initialZoom: 15.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.health_ocean_phlebotomist',
              ),
              MarkerLayer(
                markers: [
                  // Patient Marker
                  Marker(
                    point: _patientLocation,
                    width: 80,
                    height: 80,
                    child: Column(
                      children: [
                        const Icon(Icons.location_on, color: Colors.red, size: 40),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(5)),
                          child: Text(widget.booking['name'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                  // Current Position Marker
                  if (_currentPosition != null)
                    Marker(
                      point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      width: 40,
                      height: 40,
                      child: const Icon(Icons.my_location, color: Colors.blue, size: 30),
                    ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              elevation: 8,
              child: Padding(
                padding: const EdgeInsets.all(15.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, color: Colors.grey),
                        const SizedBox(width: 10),
                        Expanded(child: Text(widget.booking['address'], style: const TextStyle(fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const Divider(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _openInGoogleMaps,
                            icon: const Icon(Icons.navigation_outlined),
                            label: const Text('GET DIRECTIONS'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: ApiConstants.oceanEnd,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_isLoading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
