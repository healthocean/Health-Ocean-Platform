import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AddressProvider with ChangeNotifier {
  List<Map<String, dynamic>> _addresses = [];

  List<Map<String, dynamic>> get addresses => _addresses;

  Future<void> loadAddresses() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString('saved_addresses');
    if (data != null) {
      _addresses = List<Map<String, dynamic>>.from(json.decode(data));
      notifyListeners();
    }
  }

  Future<void> addAddress(Map<String, dynamic> address) async {
    // Check if duplicate
    final existingIndex = _addresses.indexWhere((a) => a['address'] == address['address'] && a['pincode'] == address['pincode']);
    if (existingIndex == -1) {
      _addresses.add(address);
      await _saveAddresses();
      notifyListeners();
    }
  }

  Future<void> removeAddress(int index) async {
    if (index >= 0 && index < _addresses.length) {
      _addresses.removeAt(index);
      await _saveAddresses();
      notifyListeners();
    }
  }

  Future<void> _saveAddresses() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_addresses', json.encode(_addresses));
  }
}
