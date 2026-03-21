import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';

class BookingDetailsScreen extends StatelessWidget {
  final Map<String, dynamic> booking;

  const BookingDetailsScreen({super.key, required this.booking});

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Colors.blue;
      case 'sample collected':
        return Colors.orange;
      case 'in transit':
        return Colors.purple;
      case 'at lab':
        return Colors.indigo;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = booking['status'] ?? 'Pending';

    return Scaffold(
      appBar: AppBar(title: const Text('Booking Details')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: _getStatusColor(status).withOpacity(0.1),
              ),
              child: Column(
                children: [
                  Icon(_getStatusIcon(status), size: 48, color: _getStatusColor(status)),
                  const SizedBox(height: 12),
                  Text(
                    status,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: _getStatusColor(status),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Booking ID: ${booking['_id']?.substring(0, 8)}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSection('Schedule', [
                    _buildRow('Date', booking['date'] ?? 'N/A'),
                    _buildRow('Time Slot', booking['timeSlot'] ?? 'N/A'),
                  ]),
                  const SizedBox(height: 16),
                  _buildSection('Address', [
                    _buildRow('City', booking['city'] ?? 'N/A'),
                    _buildRow('Address', booking['address'] ?? 'N/A'),
                    _buildRow('Pincode', booking['pincode'] ?? 'N/A'),
                  ]),
                  const SizedBox(height: 16),
                  _buildSection('Contact', [
                    _buildRow('Name', booking['name'] ?? 'N/A'),
                    _buildRow('Phone', booking['phone'] ?? 'N/A'),
                    _buildRow('Email', booking['email'] ?? 'N/A'),
                  ]),
                  const SizedBox(height: 16),
                  _buildSection('Payment', [
                    _buildRow('Total Amount', '₹${booking['total'] ?? 0}'),
                    _buildRow('Payment Status', booking['paymentStatus'] ?? 'Pending'),
                  ]),
                ],
              ),
            ),
            if (booking['reportUrl'] != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      try {
                        if (context.mounted) {
                          AppToast.show(context, 'Downloading report...', type: ToastType.info, duration: const Duration(seconds: 2));
                        }
                        
                        final baseUrl = ApiConstants.baseUrl.replaceAll('/api', '');
                        final urlPath = booking['reportUrl'];
                        final fullUrl = '$baseUrl$urlPath';
                        final uri = Uri.parse(fullUrl);
                        
                        final response = await http.get(uri);
                        if (response.statusCode == 200) {
                          final dir = await getApplicationDocumentsDirectory();
                          final fileName = urlPath.toString().split('/').last;
                          final file = File('${dir.path}/$fileName');
                          
                          await file.writeAsBytes(response.bodyBytes);
                          
                          if (context.mounted) {
                            AppToast.show(context, 'Report downloaded successfully. Opening...', type: ToastType.success);
                          }
                          
                          await OpenFile.open(file.path);
                        } else {
                          if (context.mounted) {
                            AppToast.show(context, 'Failed to download report', type: ToastType.error);
                          }
                        }
                      } catch (e) {
                        if (context.mounted) {
                          AppToast.show(context, 'Error: ${e.toString()}', type: ToastType.error);
                        }
                      }
                    },
                    icon: const Icon(Icons.download_rounded),
                    label: const Text('Download Report', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Icons.check_circle;
      case 'sample collected':
        return Icons.science;
      case 'completed':
        return Icons.done_all;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.pending;
    }
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
