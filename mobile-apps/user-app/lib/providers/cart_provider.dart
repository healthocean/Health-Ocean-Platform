import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class CartProvider with ChangeNotifier {
  List<Map<String, dynamic>> _items = [];

  List<Map<String, dynamic>> get items => _items;
  int get itemCount => _items.length;
  
  bool isInCart(String id) {
    if (id.isEmpty) return false;
    return _items.any((item) {
      final itemId = (item['_id'] ?? item['id'] ?? item['testId'] ?? item['packageId'] ?? '').toString();
      return itemId == id;
    });
  }

  double get total {
    return _items.fold(0, (sum, item) => sum + (item['price'] as num).toDouble());
  }

  Future<void> loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = prefs.getString('cart');
    if (cartJson != null) {
      _items = List<Map<String, dynamic>>.from(json.decode(cartJson));
      notifyListeners();
    }
  }

  Future<void> addItem(Map<String, dynamic> item) async {
    // Normalize id field — API can return _id, id, testId, or packageId
    final id = (item['_id'] ?? item['id'] ?? item['testId'] ?? item['packageId'] ?? '').toString();
    if (id.isEmpty) return;
    
    final existingIndex = _items.indexWhere(
      (i) => (i['_id'] ?? i['id'] ?? i['testId'] ?? i['packageId'] ?? '').toString() == id,
    );
    if (existingIndex == -1) {
      _items.add({...item, 'id': id});
      await _saveCart();
      notifyListeners();
    }
  }

  Future<void> removeItem(String id) async {
    if (id.isEmpty) return;
    _items.removeWhere(
      (item) => (item['_id'] ?? item['id'] ?? item['testId'] ?? item['packageId'] ?? '').toString() == id,
    );
    await _saveCart();
    notifyListeners();
  }

  Future<void> clearCart() async {
    _items.clear();
    await _saveCart();
    notifyListeners();
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cart', json.encode(_items));
  }
}
