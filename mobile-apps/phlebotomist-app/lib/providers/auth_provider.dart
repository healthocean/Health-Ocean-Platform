import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  String? _token;
  Map<String, dynamic>? _employee;
  bool _isLoading = false;

  String? get token => _token;
  Map<String, dynamic>? get employee => _employee;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  String? get employeeId => _employee?['employeeId'];
  String? get labId => _employee?['labId'];
  String? get name => _employee?['name'];

  Future<void> tryAutoLogin() async {
    _token = await _storage.read(key: 'token');
    final employeeStr = await _storage.read(key: 'employee');
    if (employeeStr != null) {
      _employee = json.decode(employeeStr);
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.login(email, password);
      _token = response['token'];
      _employee = response['employee'];

      await _storage.write(key: 'token', value: _token);
      await _storage.write(key: 'employee', value: json.encode(_employee));

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _employee = null;
    await _storage.deleteAll();
    notifyListeners();
  }
}
