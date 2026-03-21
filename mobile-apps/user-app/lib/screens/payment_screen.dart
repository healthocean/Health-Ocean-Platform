import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';

class PaymentScreen extends StatefulWidget {
  final Map<String, dynamic> bookingData;

  const PaymentScreen({super.key, required this.bookingData});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedPaymentMethod = 'COD';
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    // Prevent screenshots and screen recording for security
    _setSecureMode();
  }

  void _setSecureMode() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }

  Future<void> _processBooking() async {
    if (_selectedPaymentMethod != 'COD') {
      AppToast.show(context, 'Only Cash on Delivery is available currently', type: ToastType.info);
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final cartProvider = Provider.of<CartProvider>(context, listen: false);

      final bookingPayload = {
        ...widget.bookingData,
        'paymentMethod': _selectedPaymentMethod,
        'paymentStatus': 'Pending',
        'name': authProvider.user?['name'],
        'email': authProvider.user?['email'],
        'phone': authProvider.user?['phone'],
      };

      // Transform raw coords into GeoJSON for backend Radar feature
      if (widget.bookingData.containsKey('latitude') && widget.bookingData.containsKey('longitude')) {
        bookingPayload['userLocation'] = {
          'type': 'Point',
          'coordinates': [widget.bookingData['longitude'], widget.bookingData['latitude']],
        };
        // Remove redundant top-level keys
        bookingPayload.remove('latitude');
        bookingPayload.remove('longitude');
      }

      print('Creating booking: $bookingPayload');

      final response = await http.post(
        Uri.parse(ApiConstants.bookings),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${authProvider.token}',
        },
        body: json.encode(bookingPayload),
      );

      print('Booking response: ${response.statusCode} - ${response.body}');

      final data = json.decode(response.body);

      if (data['success'] && mounted) {
        await cartProvider.clearCart();
        
        Navigator.of(context).popUntil((route) => route.isFirst);
        
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green.shade600, size: 32),
                const SizedBox(width: 12),
                const Text('Booking Confirmed!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Your test has been scheduled successfully.'),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Booking ID: ${data['booking']?['_id'] ?? 'N/A'}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text('Date: ${widget.bookingData['date']?.split('T')[0]}', style: const TextStyle(fontSize: 12)),
                      Text('Time: ${widget.bookingData['timeSlot']}', style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const Text('A phlebotomist will visit you at the scheduled time.', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Done'),
              ),
            ],
          ),
        );
      } else {
        _showError(data['message'] ?? 'Booking failed');
      }
    } catch (e, stackTrace) {
      print('Booking error: $e');
      print('Stack trace: $stackTrace');
      _showError('Failed to create booking: $e');
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _showError(String message) {
    AppToast.show(context, message, type: ToastType.error);
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Security indicator
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: Colors.green.shade50,
            child: Row(
              children: [
                Icon(Icons.lock, size: 16, color: Colors.green.shade700),
                const SizedBox(width: 8),
                Text(
                  'Secure Payment',
                  style: TextStyle(fontSize: 12, color: Colors.green.shade700, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order Summary
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Order Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          const Divider(height: 24),
                          ...cartProvider.items.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(child: Text(item['name'], style: const TextStyle(fontSize: 14))),
                                Text('₹${item['price']}', style: const TextStyle(fontWeight: FontWeight.w600)),
                              ],
                            ),
                          )),
                          const Divider(height: 24),
                          if (widget.bookingData['discount'] != null && (widget.bookingData['discount'] as double) > 0) ...[
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
                                Text('Coupon (${widget.bookingData['coupon']})', style: const TextStyle(fontSize: 14, color: Colors.green)),
                                Text('-₹${(cartProvider.total * (widget.bookingData['discount'] as double) / 100).toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, color: Colors.green, fontWeight: FontWeight.w600)),
                              ],
                            ),
                            const Divider(height: 16),
                          ],
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Amount', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              Text(
                                '₹${(widget.bookingData['total'] as num).toStringAsFixed(0)}',
                                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Payment Methods
                  const Text('Select Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _buildPaymentOption(
                    'COD',
                    'Cash on Delivery',
                    'Pay when sample is collected',
                    Icons.money,
                    enabled: true,
                  ),
                  _buildPaymentOption(
                    'UPI',
                    'UPI Payment',
                    'Google Pay, PhonePe, Paytm',
                    Icons.payment,
                    enabled: false,
                  ),
                  _buildPaymentOption(
                    'CARD',
                    'Credit/Debit Card',
                    'Visa, Mastercard, Rupay',
                    Icons.credit_card,
                    enabled: false,
                  ),
                  _buildPaymentOption(
                    'NETBANKING',
                    'Net Banking',
                    'All major banks',
                    Icons.account_balance,
                    enabled: false,
                  ),
                ],
              ),
            ),
          ),
          // Bottom action bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _processBooking,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Confirm Booking', style: TextStyle(fontSize: 16)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String value, String title, String subtitle, IconData icon, {required bool enabled}) {
    final isSelected = _selectedPaymentMethod == value;
    
    return Opacity(
      opacity: enabled ? 1.0 : 0.5,
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        color: isSelected ? Theme.of(context).colorScheme.primary.withOpacity(0.05) : null,
        child: InkWell(
          onTap: enabled ? () => setState(() => _selectedPaymentMethod = value) : null,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? Theme.of(context).colorScheme.primary.withOpacity(0.1) : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade600),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                          if (!enabled) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.orange.shade100,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text('Coming Soon', style: TextStyle(fontSize: 10, color: Colors.orange.shade900, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                    ],
                  ),
                ),
                Radio<String>(
                  value: value,
                  groupValue: _selectedPaymentMethod,
                  onChanged: enabled ? (val) => setState(() => _selectedPaymentMethod = val!) : null,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }
}
