import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import '../providers/auth_provider.dart';
import '../providers/booking_provider.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';
import 'navigation_screen.dart';
import '../widgets/app_dialog.dart';

class BookingDetailScreen extends StatefulWidget {
  final dynamic booking;

  const BookingDetailScreen({super.key, required this.booking});

  @override
  _BookingDetailScreenState createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends State<BookingDetailScreen> {
  bool _isUpdating = false;
  final TextEditingController _barcodeController = TextEditingController();
  bool _isPaymentCollected = false;
  bool _isFetchingItems = false;
  dynamic _bookingData;

  @override
  void initState() {
    super.initState();
    _bookingData = widget.booking;
    _fetchFreshBooking();
  }

  void _fetchFreshBooking() async {
    setState(() => _isFetchingItems = true);
    try {
      final bookingId = widget.booking['bookingId'] ?? widget.booking['_id'];
      final response = await http.get(Uri.parse('${ApiConstants.baseUrl}/bookings/$bookingId'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          setState(() {
            _bookingData = data['booking'];
            _isFetchingItems = false;
          });
        }
      }
    } catch (e) {
      setState(() => _isFetchingItems = false);
      debugPrint('Error fetching fresh booking details: $e');
    }
  }

  Widget _buildItemChip(String label, bool isPackage) {
    return Container(
      margin: const EdgeInsets.only(right: 8, bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isPackage ? Colors.amber.withOpacity(0.1) : ApiConstants.oceanLight.withOpacity(0.4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isPackage ? Colors.amber.withOpacity(0.3) : ApiConstants.oceanMid.withOpacity(0.3),
          width: 1.5,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isPackage ? Icons.inventory_2_rounded : Icons.science_rounded, 
            size: 14, 
            color: isPackage ? Colors.amber[900] : ApiConstants.oceanEnd
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: isPackage ? Colors.amber[900] : ApiConstants.oceanEnd, 
              fontSize: 12, 
              fontWeight: FontWeight.w800
            ),
          ),
        ],
      ),
    );
  }

  void _updateStatus(String newStatus) async {
    setState(() => _isUpdating = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final bookingProvider = Provider.of<BookingProvider>(context, listen: false);
    
    try {
      await bookingProvider.updateBookingStatus(
        auth.token!,
        widget.booking['bookingId'] ?? widget.booking['_id'],
        newStatus,
      );
      if (mounted) {
        AppToast.show(context, 'Status updated to $newStatus');
      }
      Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        AppToast.show(context, 'Update failed: $e', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isUpdating = false);
      }
    }
  }

  void _showOtpVerification() async {
    final success = await AppDialog.showOtp(
      context,
      title: 'Verify Collection',
      message: 'Enter the 4-digit OTP shown on the customer\'s app to confirm sample collection.',
      correctOtp: _bookingData['collectionOtp']?.toString() ?? '',
    );

    if (success == true) {
      _updateStatus('Sample Collected');
    }
  }

  void _openMap() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NavigationScreen(booking: _bookingData),
      ),
    );
  }

  void _launchPhone(String phone) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_bookingData == null) {
      return Scaffold(
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    final status = _bookingData['status'];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Assignment Details', style: TextStyle(color: ApiConstants.deepNavy, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: ApiConstants.deepNavy),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              // Patient Card
              _buildModernCard(
                child: Row(
                  children: [
                    Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        color: ApiConstants.oceanLight.withOpacity(0.4),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.person_rounded, color: ApiConstants.oceanEnd, size: 36),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.booking['name'], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: ApiConstants.deepNavy, letterSpacing: -0.5)),
                          const SizedBox(height: 4),
                          Text(widget.booking['phone'], style: TextStyle(fontSize: 15, color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    _buildActionCircle(
                      icon: Icons.call_rounded,
                      color: Colors.green,
                      onTap: () => _launchPhone(widget.booking['phone']),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              const Text('COLLECTION ADDRESS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.2)),
              const SizedBox(height: 10),
              _buildModernCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.location_on_rounded, color: ApiConstants.oceanEnd, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(widget.booking['address'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: ApiConstants.deepNavy, height: 1.4)),
                              const SizedBox(height: 4),
                              Text('${widget.booking['city']} - ${widget.booking['pincode']}', style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton.icon(
                        onPressed: _openMap,
                        icon: const Icon(Icons.navigation_rounded, size: 18),
                        label: const Text('OPEN IN NAVIGATION', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ApiConstants.oceanEnd,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              const Text('PAYMENT DETAILS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.2)),
              const SizedBox(height: 10),
              _buildModernCard(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(14)),
                      child: Icon(Icons.account_balance_wallet_rounded, color: Colors.green.shade700, size: 28),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('CASH TO COLLECT', style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                          Text('₹${_bookingData['totalAmount'] ?? _bookingData['total']}', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.green.shade700)),
                        ],
                      ),
                    ),
                    Switch(
                      value: _isPaymentCollected,
                      activeColor: Colors.green,
                      onChanged: (val) => setState(() => _isPaymentCollected = val),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const Text('SAMPLE COLLECTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.2)),
              const SizedBox(height: 10),
              _buildModernCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ITEMS INCLUDED', style: TextStyle(fontWeight: FontWeight.w900, color: ApiConstants.deepNavy, fontSize: 14, letterSpacing: 0.5)),
                    const SizedBox(height: 16),
                    if (_isFetchingItems)
                      const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
                    else if ((_bookingData['tests'] != null && (_bookingData['tests'] as List).isNotEmpty) || 
                        (_bookingData['packages'] != null && (_bookingData['packages'] as List).isNotEmpty))
                      Wrap(
                        children: [
                          ...(_bookingData['packages'] as List? ?? []).map((pkg) => _buildItemChip(pkg.toString(), true)),
                          ...(_bookingData['tests'] as List? ?? []).map((test) => _buildItemChip(test.toString(), false)),
                        ],
                      )
                    else
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: Column(
                            children: [
                              Icon(Icons.inventory_2_outlined, color: Colors.grey, size: 40),
                              SizedBox(height: 10),
                              Text('No items included in this booking', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.grey, fontSize: 13)),
                            ],
                          ),
                        ),
                      ),
                    
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Divider(height: 1),
                    ),
                    
                    const Text('COLLECTION VERIFICATION', style: TextStyle(fontWeight: FontWeight.w800, color: ApiConstants.deepNavy, fontSize: 14)),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton.icon(
                        onPressed: (_bookingData['status'] != 'Completed' && _bookingData['status'] != 'Cancelled') ? _showOtpVerification : null,
                        icon: const Icon(Icons.verified_user_rounded),
                        label: const Text('MARK SAMPLES COLLECTED', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green.shade600,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: Colors.grey.shade100,
                          disabledForegroundColor: Colors.grey.shade400,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              const Text('STATUS UPDATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1.2)),
              const SizedBox(height: 10),
              _buildStatusButtons(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModernCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildActionCircle({required IconData icon, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 24),
      ),
    );
  }

  Widget _buildStatusButtons() {
    final curStatus = _bookingData['status'];
    
    return Column(
      children: [
        _statusBtn('On My Way', curStatus == 'Confirmed' || curStatus == 'Assigned', Colors.orange.shade700, Icons.directions_bike_rounded),
        const SizedBox(height: 12),
        _statusBtn('Arrived', curStatus == 'On My Way', Colors.blue.shade700, Icons.near_me_rounded),
        const SizedBox(height: 12),
        _statusBtn('Sample Collected', curStatus == 'Arrived', Colors.green.shade700, Icons.science_rounded),
      ],
    );
  }

  Widget _statusBtn(String label, bool isEnabled, Color color, IconData icon) {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton.icon(
        onPressed: isEnabled && !_isUpdating ? () => _updateStatus(label) : null,
        icon: Icon(icon, size: 20),
        label: Text(label.toUpperCase(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
        style: ElevatedButton.styleFrom(
          backgroundColor: isEnabled ? color : Colors.grey.shade100,
          foregroundColor: isEnabled ? Colors.white : Colors.grey.shade400,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
