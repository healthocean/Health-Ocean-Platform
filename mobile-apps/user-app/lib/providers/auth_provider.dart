import 'package:flutter/foundation.dart';
import '../services/secure_storage_service.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = false;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;

  /// Load token and user from secure storage
  Future<void> loadToken() async {
    _token = await SecureStorageService.getToken();
    _user = await SecureStorageService.getUser();
    notifyListeners();
  }

  /// Login and save credentials securely
  Future<void> login(String token, Map<String, dynamic> user) async {
    _token = token;
    _user = user;
    
    // Save to secure storage
    await SecureStorageService.saveToken(token);
    await SecureStorageService.saveUser(user);
    
    notifyListeners();
  }

  /// Logout and clear all secure data
  Future<void> logout() async {
    _token = null;
    _user = null;
    
    // Clear secure storage
    await SecureStorageService.clearAll();
    
    notifyListeners();
  }

  Future<void> updateUser(Map<String, dynamic> user) async {
    _user = user;
    await SecureStorageService.saveUser(user);
    notifyListeners();
  }

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
