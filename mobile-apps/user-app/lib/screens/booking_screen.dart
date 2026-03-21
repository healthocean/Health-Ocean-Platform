import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/app_toast.dart';
import '../providers/cart_provider.dart';
import '../providers/address_provider.dart';
import 'payment_screen.dart';

const _gradStart = Color(0xFF90E0EF);
const _gradMid = Color(0xFF00B4D8);
const _gradEnd = Color(0xFF0077B6);
const _deepNavy = Color(0xFF03045E);

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  final _addressController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _pincodeFocus = FocusNode();
  String? _detectedArea;
  String? _detectedCity;
  String? _detectedState;
  bool _pincodeLoading = false;
  String? _pincodeError;
  String? _pincodeFieldError;
  bool _pincodeTouched = false;
  DateTime? _selectedDate;
  String? _selectedTimeSlot;

  final _couponController = TextEditingController();
  String? _appliedCoupon;
  double _discountPercent = 0;

  // Location
  LatLng? _currentLocation;
  bool _locationLoading = false;
  bool _locationPermissionDenied = false;
  bool _autoFillLoading = false;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _fetchLocation();
    _pincodeFocus.addListener(() {
      // When focus is lost, validate if touched and incomplete
      if (!_pincodeFocus.hasFocus && _pincodeTouched) {
        final len = _pincodeController.text.length;
        setState(() {
          _pincodeFieldError = len != 6 ? 'Enter valid 6-digit pincode' : null;
        });
      }
      // When focus is gained, clear the error
      if (_pincodeFocus.hasFocus) {
        setState(() => _pincodeFieldError = null);
      }
    });
  }

  Future<void> _lookupPincode(String pincode) async {
    // Mark touched, clear errors while user is typing
    setState(() { _pincodeTouched = true; _pincodeError = null; _pincodeFieldError = null; });
    if (pincode.length != 6) {
      setState(() { _detectedArea = null; _detectedCity = null; _detectedState = null; });
      return;
    }
    setState(() { _pincodeLoading = true; _pincodeError = null; });
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/search?postalcode=$pincode&country=India&format=json&addressdetails=1&limit=1',
      );
      final res = await http.get(uri, headers: {'User-Agent': 'HealthOceanApp/1.0'});
      final data = jsonDecode(res.body) as List;
      if (data.isNotEmpty) {
        final addr = data[0]['address'] as Map<String, dynamic>;
        // OSM returns different keys depending on the area — try in order of preference
        final city = addr['city'] ?? addr['town'] ?? addr['village'] ?? addr['county'] ?? '';
        final state = addr['state'] ?? '';
        final suburb = addr['suburb'] ?? addr['neighbourhood'] ?? addr['district'] ?? '';
        setState(() {
          _detectedCity = city;
          _detectedState = state;
          _detectedArea = suburb.isNotEmpty ? suburb : city;
          _pincodeError = null;
        });
      } else {
        setState(() { _detectedArea = null; _detectedCity = null; _detectedState = null; _pincodeError = 'Pincode not found'; });
      }
    } catch (_) {
      setState(() { _pincodeError = 'Could not fetch location'; });
    } finally {
      setState(() => _pincodeLoading = false);
    }
  }

  final List<Map<String, String>> _timeSlots = [
    {'time': '6:00 AM - 8:00 AM', 'label': 'Early Morning'},
    {'time': '8:00 AM - 10:00 AM', 'label': 'Morning'},
    {'time': '10:00 AM - 12:00 PM', 'label': 'Late Morning'},
    {'time': '12:00 PM - 2:00 PM', 'label': 'Afternoon'},
    {'time': '2:00 PM - 4:00 PM', 'label': 'Late Afternoon'},
    {'time': '4:00 PM - 6:00 PM', 'label': 'Evening'},
  ];

  Future<void> _autoFillAddress() async {
    if (_currentLocation == null) return;
    setState(() => _autoFillLoading = true);
    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?lat=${_currentLocation!.latitude}&lon=${_currentLocation!.longitude}&format=json&addressdetails=1',
      );
      final res = await http.get(uri, headers: {'User-Agent': 'HealthOceanApp/1.0'});
      final data = jsonDecode(res.body);
      final addr = data['address'] as Map<String, dynamic>;

      final road = addr['road'] ?? addr['pedestrian'] ?? addr['footway'] ?? '';
      final suburb = addr['suburb'] ?? addr['neighbourhood'] ?? addr['village'] ?? '';
      final postcode = addr['postcode'] ?? '';
      final city = addr['city'] ?? addr['town'] ?? addr['county'] ?? '';
      final state = addr['state'] ?? '';

      // Fill address field
      final fullAddress = [road, suburb].where((s) => s.isNotEmpty).join(', ');
      if (fullAddress.isNotEmpty) {
        _addressController.text = fullAddress;
      }

      // Fill pincode and trigger lookup
      if (postcode.isNotEmpty) {
        _pincodeController.text = postcode.replaceAll(' ', '').substring(0, postcode.replaceAll(' ', '').length.clamp(0, 6));
        _lookupPincode(_pincodeController.text);
      } else if (city.isNotEmpty) {
        setState(() {
          _detectedCity = city;
          _detectedState = state;
          _detectedArea = suburb.isNotEmpty ? suburb : city;
        });
      }

      AppToast.show(context, 'Address auto-filled from your location', type: ToastType.success);
    } catch (_) {
      AppToast.show(context, 'Could not fetch address', type: ToastType.error);
    } finally {
      setState(() => _autoFillLoading = false);
    }
  }

  Future<void> _fetchLocation() async {
    setState(() { _locationLoading = true; _locationPermissionDenied = false; });
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) {
        // Can't request again — open app settings
        await Geolocator.openAppSettings();
        setState(() { _locationPermissionDenied = true; _locationLoading = false; });
        return;
      }
      if (permission == LocationPermission.denied) {
        setState(() { _locationPermissionDenied = true; _locationLoading = false; });
        return;
      }
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      setState(() {
        _currentLocation = LatLng(pos.latitude, pos.longitude);
        _locationLoading = false;
        _locationPermissionDenied = false;
      });
      Future.delayed(const Duration(milliseconds: 300), () {
        if (_currentLocation != null) {
          _mapController.move(_currentLocation!, 16);
        }
      });
    } catch (_) {
      setState(() { _locationLoading = false; });
    }
  }

  void _applyCoupon() {
    final code = _couponController.text.trim().toUpperCase();
    const coupons = {'HEALTH10': 10.0, 'OCEAN20': 20.0, 'FIRST15': 15.0};
    if (coupons.containsKey(code)) {
      setState(() { _appliedCoupon = code; _discountPercent = coupons[code]!; });
      AppToast.show(context, 'Coupon applied! ${coupons[code]!.toInt()}% off', type: ToastType.success);
    } else {
      setState(() { _appliedCoupon = null; _discountPercent = 0; });
      AppToast.show(context, 'Invalid coupon code', type: ToastType.error);
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      // Manually validate pincode field on continue
      if (_pincodeController.text.length != 6) {
        setState(() => _pincodeFieldError = 'Enter valid 6-digit pincode');
      }
      if (_formKey.currentState!.validate() && _pincodeController.text.length == 6) {
        setState(() => _currentStep = 1);
      }
    } else if (_currentStep == 1) {
      if (_selectedDate == null) {
        AppToast.show(context, 'Please select a date', type: ToastType.error);
        return;
      }
      if (_selectedTimeSlot == null) {
        AppToast.show(context, 'Please select a time slot', type: ToastType.error);
        return;
      }
      setState(() => _currentStep = 2);
    } else {
      final cartProvider = Provider.of<CartProvider>(context, listen: false);
      final addressProvider = Provider.of<AddressProvider>(context, listen: false);
      
      // Auto-save the address if it's new
      addressProvider.addAddress({
        'address': _addressController.text,
        'city': _detectedCity ?? '',
        'pincode': _pincodeController.text,
      });

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentScreen(
            bookingData: {
              'address': _addressController.text,
              'city': _detectedCity ?? '',
              'area': _detectedArea ?? '',
              'state': _detectedState ?? '',
              'pincode': _pincodeController.text,
              'latitude': _currentLocation?.latitude,
              'longitude': _currentLocation?.longitude,
              'date': _selectedDate!.toIso8601String(),
              'timeSlot': _selectedTimeSlot,
              'testIds': cartProvider.items
                  .where((item) => !item.containsKey('packageId'))
                  .map<String>((item) => (item['testId'] ?? item['_id'] ?? item['id'] ?? '').toString())
                  .toList(),
              'packageIds': cartProvider.items
                  .where((item) => item.containsKey('packageId'))
                  .map<String>((item) => (item['packageId'] ?? item['_id'] ?? item['id'] ?? '').toString())
                  .toList(),
              'total': cartProvider.total * (1 - _discountPercent / 100),
              'couponCode': _appliedCoupon,
              'discount': _discountPercent,
            },
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Book Appointment', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [_gradStart, _gradMid, _gradEnd],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Step indicator
          _buildStepIndicator(primary),
          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _currentStep == 0
                    ? _buildAddressStep()
                    : _currentStep == 1
                        ? _buildScheduleStep()
                        : _buildReviewStep(),
              ),
            ),
          ),
          // Bottom buttons
          _buildBottomBar(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(Color primary) {
    final steps = ['Address', 'Schedule', 'Review'];
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: List.generate(steps.length * 2 - 1, (i) {
          if (i.isOdd) {
            // Connector line
            final stepIndex = i ~/ 2;
            return Expanded(
              child: Container(
                height: 2,
                color: _currentStep > stepIndex ? primary : const Color(0xFFE5E7EB),
              ),
            );
          }
          final stepIndex = i ~/ 2;
          final isActive = _currentStep == stepIndex;
          final isDone = _currentStep > stepIndex;
          return Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDone ? primary : isActive ? primary : const Color(0xFFE5E7EB),
                ),
                child: Center(
                  child: isDone
                      ? const Icon(Icons.check, color: Colors.white, size: 18)
                      : Text(
                          '${stepIndex + 1}',
                          style: TextStyle(
                            color: isActive ? Colors.white : const Color(0xFF9CA3AF),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                steps[stepIndex],
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                  color: isActive ? primary : const Color(0xFF9CA3AF),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildAddressStep() {
    final primary = Theme.of(context).colorScheme.primary;
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionHeader(Icons.location_on, 'Collection Address', 'Where should we collect the sample?'),
          Consumer<AddressProvider>(
            builder: (context, provider, _) {
              if (provider.addresses.isEmpty) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(top: 12, bottom: 8),
                child: OutlinedButton.icon(
                  onPressed: () => _showSavedAddressesSheet(context, provider),
                  icon: const Icon(Icons.bookmark_added_rounded, size: 18, color: _gradEnd),
                  label: const Text('Use a Saved Address', style: TextStyle(color: _deepNavy)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: _gradEnd,
                    side: BorderSide(color: _gradEnd.withOpacity(0.5)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          _buildLabel('Pincode'),
          const SizedBox(height: 8),
          TextFormField(
            controller: _pincodeController,
            focusNode: _pincodeFocus,
            decoration: _inputDecoration('6-digit pincode', Icons.pin_drop).copyWith(
              suffixIcon: _pincodeLoading
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : _detectedCity != null
                      ? Icon(Icons.check_circle, color: primary, size: 20)
                      : null,
              errorText: _pincodeFieldError ?? _pincodeError,
            ),
            keyboardType: TextInputType.number,
            maxLength: 6,
            onChanged: _lookupPincode,
          ),
          if (_detectedCity != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: primary.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: primary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Icon(Icons.location_on, color: primary, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${_detectedArea}, ${_detectedCity}, ${_detectedState}',
                      style: TextStyle(fontSize: 13, color: primary, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          _buildLabel('Complete Address'),
          const SizedBox(height: 8),
          TextFormField(
            controller: _addressController,
            decoration: _inputDecoration('House/Flat No., Building, Street, Area', Icons.home),
            maxLines: 3,
            validator: (v) => (v?.trim().isEmpty ?? true) ? 'Please enter your address' : null,
          ),
          const SizedBox(height: 12),
          // Location map
          _buildLocationMap(),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFCAF0F8),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: _gradEnd, size: 18),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text(
                    'Our phlebotomist will visit this address for sample collection.',
                    style: TextStyle(fontSize: 12, color: _gradEnd),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showSavedAddressesSheet(BuildContext context, AddressProvider provider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 12),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              const Text('Saved Addresses', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _deepNavy)),
              const SizedBox(height: 16),
              Flexible(
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: provider.addresses.length,
                  itemBuilder: (context, index) {
                    final address = provider.addresses[index];
                    return ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: _gradEnd.withOpacity(0.1), shape: BoxShape.circle),
                        child: const Icon(Icons.home_rounded, color: _gradEnd),
                      ),
                      title: Text(address['address'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text('${address['city'] ?? ''} - ${address['pincode'] ?? ''}', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                      onTap: () {
                        setState(() {
                          _addressController.text = address['address'] ?? '';
                          _pincodeController.text = address['pincode'] ?? '';
                          _pincodeTouched = true;
                        });
                        if (_pincodeController.text.length == 6) {
                          _lookupPincode(_pincodeController.text);
                        }
                        Navigator.pop(ctx);
                        AppToast.show(context, 'Address applied', type: ToastType.success);
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  Widget _buildLocationMap() {
    final primary = Theme.of(context).colorScheme.primary;

    if (_locationLoading) {
      return Container(
        height: 180,
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: primary, strokeWidth: 2),
              const SizedBox(height: 10),
              const Text('Fetching your location...', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
            ],
          ),
        ),
      );
    }

    if (_locationPermissionDenied || _currentLocation == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.orange.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.orange.shade200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.location_off, color: Colors.orange.shade700, size: 20),
                const SizedBox(width: 8),
                Text('Location access needed', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.orange.shade800)),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Sharing your location helps our sample collector find your address quickly and accurately, reducing delays on the day of collection.',
              style: TextStyle(fontSize: 12, color: Colors.orange.shade900, height: 1.5),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _fetchLocation,
                icon: const Icon(Icons.my_location, size: 16),
                label: const Text('Allow Location Access'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.orange.shade800,
                  side: BorderSide(color: Colors.orange.shade400),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.location_on, color: primary, size: 16),
            const SizedBox(width: 6),
            Text('Your Location', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: primary)),
            const Spacer(),
            SizedBox(
              height: 34,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [_gradStart, _gradMid, _gradEnd],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ElevatedButton.icon(
                  onPressed: _autoFillLoading ? null : _autoFillAddress,
                  icon: _autoFillLoading
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.auto_fix_high, size: 15, color: Colors.white),
                  label: Text(_autoFillLoading ? 'Filling...' : 'Auto-fill', style: const TextStyle(fontSize: 12, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: SizedBox(
            height: 180,
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _currentLocation!,
                initialZoom: 16,
                minZoom: 12,
                maxZoom: 18,
                interactionOptions: const InteractionOptions(
                  flags: InteractiveFlag.pinchZoom | InteractiveFlag.drag,
                ),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.healthocean.health_ocean_user',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _currentLocation!,
                      width: 40,
                      height: 40,
                      child: Icon(Icons.location_pin, color: primary, size: 40),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final d = date.day.toString().padLeft(2, '0');
    final m = date.month.toString().padLeft(2, '0');
    final y = date.year.toString();
    return '$d/$m/$y';
  }

  void _openCalendarSheet() {
    final primary = Theme.of(context).colorScheme.primary;
    DateTime focusedDay = _selectedDate ?? DateTime.now().add(const Duration(days: 1));

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              backgroundColor: Colors.white,
              insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 40),
              child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Select Date',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.grey.shade800),
                  ),
                  const SizedBox(height: 12),
                  TableCalendar(
                    firstDay: DateTime.now(),
                    lastDay: DateTime.now().add(const Duration(days: 60)),
                    focusedDay: focusedDay,
                    selectedDayPredicate: (day) => isSameDay(_selectedDate, day),
                    onPageChanged: (fd) => focusedDay = fd,
                    onDaySelected: (selectedDay, fd) {
                      setState(() => _selectedDate = selectedDay);
                      Navigator.pop(ctx);
                    },
                    calendarFormat: CalendarFormat.month,
                    availableCalendarFormats: const {CalendarFormat.month: 'Month'},
                    headerStyle: HeaderStyle(
                      formatButtonVisible: false,
                      titleCentered: true,
                      titleTextStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      leftChevronIcon: Icon(Icons.chevron_left, color: primary),
                      rightChevronIcon: Icon(Icons.chevron_right, color: primary),
                      headerPadding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                    calendarStyle: CalendarStyle(
                      selectedDecoration: BoxDecoration(color: primary, shape: BoxShape.circle),
                      todayDecoration: BoxDecoration(color: primary.withOpacity(0.2), shape: BoxShape.circle),
                      todayTextStyle: TextStyle(color: primary, fontWeight: FontWeight.bold),
                      selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      // weekendTextStyle applies to both Sat & Sun — we override Sunday via calendarBuilders
                      weekendTextStyle: const TextStyle(color: Colors.black87),
                      outsideDaysVisible: false,
                      defaultDecoration: const BoxDecoration(shape: BoxShape.circle),
                      weekendDecoration: const BoxDecoration(shape: BoxShape.circle),
                    ),
                    daysOfWeekStyle: DaysOfWeekStyle(
                      weekdayStyle: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontWeight: FontWeight.w600),
                      // Saturday header same as weekday — only Sunday header red
                      weekendStyle: TextStyle(color: Colors.grey.shade600, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    calendarBuilders: CalendarBuilders(
                      // Override Sunday day cells to show red text
                      defaultBuilder: (ctx, day, focusedDay) {
                        if (day.weekday == DateTime.sunday) {
                          return Center(
                            child: Text(
                              '${day.day}',
                              style: const TextStyle(color: Colors.red, fontSize: 14),
                            ),
                          );
                        }
                        return null; // use default for all other days
                      },
                      dowBuilder: (ctx, day) {
                        if (day.weekday == DateTime.sunday) {
                          const text = 'Su';
                          return Center(
                            child: Text(
                              text,
                              style: const TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                          );
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
            ),
            );
          },
        );
      },
    );
  }

  Widget _buildScheduleStep() {
    final primary = Theme.of(context).colorScheme.primary;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(Icons.calendar_today, 'Schedule Collection', 'Pick a convenient date and time'),
        const SizedBox(height: 20),
        _buildLabel('Select Date'),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _openCalendarSheet,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _selectedDate != null ? primary : const Color(0xFFE5E7EB),
                width: _selectedDate != null ? 1.5 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.calendar_month, color: _selectedDate != null ? primary : const Color(0xFF6B7280), size: 20),
                const SizedBox(width: 12),
                Text(
                  _selectedDate != null ? _formatDate(_selectedDate!) : 'Tap to select a date',
                  style: TextStyle(
                    fontSize: 15,
                    color: _selectedDate != null ? Colors.black87 : const Color(0xFF9CA3AF),
                    fontWeight: _selectedDate != null ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                const Spacer(),
                Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        _buildLabel('Select Time Slot'),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.4,
          ),
          itemCount: _timeSlots.length,
          itemBuilder: (context, index) {
            final slot = _timeSlots[index];
            final isSelected = _selectedTimeSlot == slot['time'];
            return GestureDetector(
              onTap: () => setState(() => _selectedTimeSlot = slot['time']),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? primary : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? primary : const Color(0xFFE5E7EB),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      slot['time']!,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? Colors.white : Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      slot['label']!,
                      style: TextStyle(
                        fontSize: 10,
                        color: isSelected ? Colors.white70 : const Color(0xFF9CA3AF),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildReviewStep() {
    final cartProvider = Provider.of<CartProvider>(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(Icons.checklist, 'Review Booking', 'Confirm your booking details'),
        const SizedBox(height: 20),
        _buildReviewCard(
          icon: Icons.location_on,
          title: 'Collection Address',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_detectedCity ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              const SizedBox(height: 4),
              if (_detectedArea != null)
                Text('${_detectedArea}, ${_detectedState}', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
              const SizedBox(height: 2),
              Text(_addressController.text, style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
              Text('Pincode: ${_pincodeController.text}', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
            ],
          ),
          onEdit: () => setState(() => _currentStep = 0),
        ),
        const SizedBox(height: 12),
        _buildReviewCard(
          icon: Icons.schedule,
          title: 'Schedule',
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _selectedDate != null ? _formatDate(_selectedDate!) : '',
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
              ),
              const SizedBox(height: 4),
              Text(_selectedTimeSlot ?? '', style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
            ],
          ),
          onEdit: () => setState(() => _currentStep = 1),
        ),
        const SizedBox(height: 12),
        // Coupon section
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.local_offer, color: Theme.of(context).colorScheme.primary, size: 18),
                  ),
                  const SizedBox(width: 10),
                  const Text('Apply Coupon', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _couponController,
                      textCapitalization: TextCapitalization.characters,
                      decoration: InputDecoration(
                        hintText: 'Enter coupon code',
                        hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                        filled: true,
                        fillColor: const Color(0xFFF9FAFB),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide(color: Theme.of(context).colorScheme.primary),
                        ),
                        suffixIcon: _appliedCoupon != null
                            ? IconButton(
                                icon: const Icon(Icons.close, size: 18, color: Colors.red),
                                onPressed: () => setState(() {
                                  _appliedCoupon = null;
                                  _discountPercent = 0;
                                  _couponController.clear();
                                }),
                              )
                            : null,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [_gradStart, _gradMid, _gradEnd],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: ElevatedButton(
                      onPressed: _applyCoupon,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Apply', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
              if (_appliedCoupon != null) ...[
                const SizedBox(height: 10),
                Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      '$_appliedCoupon applied — ${_discountPercent.toInt()}% off',
                      style: const TextStyle(color: Colors.green, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        _buildReviewCard(
          icon: Icons.science,
          title: 'Tests (${cartProvider.items.length})',
          content: Column(
            children: [
              ...cartProvider.items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text(item['name'] ?? '', style: const TextStyle(fontSize: 14))),
                    Text('₹${item['price']}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  ],
                ),
              )),
              const Divider(height: 16),
              if (_discountPercent > 0) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Subtotal', style: TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
                    Text('₹${cartProvider.total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Discount ($_appliedCoupon)', style: const TextStyle(fontSize: 14, color: Colors.green)),
                    Text('-₹${(cartProvider.total * _discountPercent / 100).toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, color: Colors.green, fontWeight: FontWeight.w600)),
                  ],
                ),
                const Divider(height: 16),
              ],
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(
                    '₹${(cartProvider.total * (1 - _discountPercent / 100)).toStringAsFixed(0)}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildReviewCard({
    required IconData icon,
    required String title,
    required Widget content,
    VoidCallback? onEdit,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 18),
              ),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const Spacer(),
              if (onEdit != null)
                GestureDetector(
                  onTap: onEdit,
                  child: Text(
                    'Edit',
                    style: TextStyle(
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          content,
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _currentStep--),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  foregroundColor: _gradEnd,
                  side: const BorderSide(color: _gradEnd),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Back'),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [_gradStart, _gradMid, _gradEnd],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: ElevatedButton(
                onPressed: _nextStep,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text(
                  _currentStep == 2 ? 'Proceed to Payment' : 'Continue',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title, String subtitle) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 22),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
          ],
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF374151)),
    );
  }

  InputDecoration _inputDecoration(String hint, IconData icon) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, color: const Color(0xFF6B7280), size: 20),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Colors.red),
      ),
    );
  }


  @override
  void dispose() {
    _addressController.dispose();
    _pincodeController.dispose();
    _couponController.dispose();
    _pincodeFocus.dispose();
    super.dispose();
  }
}
