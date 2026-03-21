import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/auth_provider.dart';
import '../providers/booking_provider.dart';
import '../utils/constants.dart';
import 'navigation_screen.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status updated to $newStatus')),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update status: $e')),
      );
    } finally {
      setState(() => _isUpdating = false);
    }
  }

  void _openMap() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NavigationScreen(booking: widget.booking),
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
    final status = widget.booking['status'];

    return Scaffold(
      backgroundColor: ApiConstants.paleCyan,
      appBar: AppBar(
        title: const Text('Booking Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: ApiConstants.oceanEnd,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Patient Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 30,
                        backgroundColor: ApiConstants.oceanStart,
                        child: Icon(Icons.person, color: Colors.white, size: 30),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.booking['name'], style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            Text(widget.booking['phone'], style: const TextStyle(fontSize: 16, color: Colors.grey)),
                            const SizedBox(height: 5),
                            Row(
                              children: [
                                const Icon(Icons.access_time, size: 16, color: ApiConstants.oceanEnd),
                                const SizedBox(width: 5),
                                Text(widget.booking['timeSlot'], style: const TextStyle(fontWeight: FontWeight.bold, color: ApiConstants.oceanEnd)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => _launchPhone(widget.booking['phone']),
                        icon: const Icon(Icons.call, color: Colors.green, size: 30),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Address Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Collection Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey)),
                      const SizedBox(height: 10),
                      Text(widget.booking['address'], style: const TextStyle(fontSize: 18)),
                      Text('${widget.booking['city']} - ${widget.booking['pincode']}', style: const TextStyle(fontSize: 16, color: Colors.grey)),
                      const SizedBox(height: 15),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton.icon(
                          onPressed: _openMap,
                          icon: const Icon(Icons.map_outlined),
                          label: const Text('VIEW ON MAP'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: ApiConstants.oceanEnd,
                            side: const BorderSide(color: ApiConstants.oceanEnd),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Payment Card
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Row(
                    children: [
                      const Icon(Icons.payments_outlined, color: Colors.green, size: 40),
                      const SizedBox(width: 15),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Amount to Collect', style: TextStyle(color: Colors.grey, fontSize: 14)),
                            Text('₹${widget.booking['totalAmount'] ?? widget.booking['total']}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.green)),
                          ],
                        ),
                      ),
                      Switch(
                        value: _isPaymentCollected,
                        activeColor: Colors.green,
                        onChanged: (val) {
                          setState(() => _isPaymentCollected = val);
                        },
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Tests List
              const Text('Tests To Collect', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ApiConstants.deepNavy)),
              const SizedBox(height: 10),
              if (widget.booking['tests'] != null && widget.booking['tests'] is List)
                ... (widget.booking['tests'] as List).map((t) => Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: const Icon(Icons.science, color: ApiConstants.oceanEnd),
                    title: Text(t, style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ))
              else
                 const Card(child: ListTile(title: Text('Test collection as per manual directive'))),
              
              const SizedBox(height: 20),
              // Sample Barcode
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Scan/Enter Sample Barcode', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey)),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _barcodeController,
                        decoration: InputDecoration(
                          hintText: 'Enter 10-digit barcode',
                          suffixIcon: IconButton(icon: const Icon(Icons.qr_code_scanner), onPressed: () {}),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 40),
              // Status Updates
              const Text('Update Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: ApiConstants.deepNavy)),
              const SizedBox(height: 15),
              _buildStatusTimeline(),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusTimeline() {
    final status = widget.booking['status'];
    
    return Column(
      children: [
        _statusButton('On My Way', status == 'Confirmed', Colors.orange, Icons.directions_bike),
        _statusButton('Arrived', status == 'On My Way', Colors.blue, Icons.near_me),
        _statusButton('Sample Collected', status == 'Arrived', Colors.purple, Icons.science),
        _statusButton('InProgress', status == 'Sample Collected', Colors.indigo, Icons.biotech),
      ],
    );
  }

  Widget _statusButton(String label, bool isEnabled, Color color, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15),
      child: SizedBox(
        width: double.infinity,
        height: 60,
        child: ElevatedButton.icon(
          onPressed: isEnabled && !_isUpdating ? () => _updateStatus(label) : null,
          icon: Icon(icon, size: 28),
          label: Text(label, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: isEnabled ? color : Colors.grey[200],
            foregroundColor: isEnabled ? Colors.white : Colors.grey[400],
            elevation: isEnabled ? 4 : 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          ),
        ),
      ),
    );
  }
}
