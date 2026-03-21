import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/address_provider.dart';

const _deepNavy = Color(0xFF03045E);
const _gradStart = Color(0xFF90E0EF);
const _gradMid = Color(0xFF00B4D8);
const _gradEnd = Color(0xFF0077B6);

class SavedAddressesScreen extends StatelessWidget {
  const SavedAddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Saved Addresses', style: TextStyle(color: _deepNavy, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: _deepNavy),
        centerTitle: true,
      ),
      body: Consumer<AddressProvider>(
        builder: (context, provider, child) {
          if (provider.addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off_rounded, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  const Text('No saved addresses yet', style: TextStyle(fontSize: 18, color: Colors.grey, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  const Text('Addresses used in your bookings will appear here.', style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.addresses.length,
            itemBuilder: (context, index) {
              final address = provider.addresses[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: _deepNavy.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4)),
                  ],
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _gradEnd.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.home_rounded, color: _gradEnd),
                  ),
                  title: Text(address['address'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: _deepNavy)),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      '${address['city'] ?? ''} - ${address['pincode'] ?? ''}', 
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                    ),
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent),
                    onPressed: () {
                      provider.removeAddress(index);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Address removed', style: TextStyle(color: Colors.white)), backgroundColor: Colors.redAccent),
                      );
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
