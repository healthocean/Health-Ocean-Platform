import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

/// Secure storage service for sensitive data like tokens
/// Uses platform-specific secure storage (Keychain on iOS, KeyStore on Android)
class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  // Keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  /// Save authentication token securely
  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  /// Retrieve authentication token
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Save user data securely
  static Future<void> saveUser(Map<String, dynamic> user) async {
    await _storage.write(key: _userKey, value: json.encode(user));
  }

  /// Retrieve user data
  static Future<Map<String, dynamic>?> getUser() async {
    final userJson = await _storage.read(key: _userKey);
    if (userJson != null) {
      return json.decode(userJson);
    }
    return null;
  }

  /// Clear all secure data (logout)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  /// Delete specific key
  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }
}
