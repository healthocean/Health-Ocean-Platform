import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

/// API Service with security best practices
/// - Uses HTTPS for all requests
/// - Includes security headers
/// - Validates response status codes
/// - Implements timeout for requests
class ApiService {
  static const Duration _timeout = Duration(seconds: 30);

  /// Get common headers with security enhancements
  static Map<String, String> _getHeaders({String? token}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> getTests({int page = 1, int limit = 10, String? search, String? category, String? sort}) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category != 'All') 'category': category,
      if (sort != null && sort != 'None') 'sort': sort,
    };
    
    final uri = Uri.parse(ApiConstants.tests).replace(queryParameters: queryParams);
    
    final response = await http
        .get(
          uri,
          headers: _getHeaders(),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load tests: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> getTestById(String id) async {
    final response = await http
        .get(
          Uri.parse('${ApiConstants.tests}/$id'),
          headers: _getHeaders(),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load test: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> getPackages({int page = 1, int limit = 10, String? search, String? category, String? sort}) async {
    final queryParams = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category != 'All') 'category': category,
      if (sort != null && sort != 'None') 'sort': sort,
    };

    final uri = Uri.parse(ApiConstants.packages).replace(queryParameters: queryParams);

    final response = await http
        .get(
          uri,
          headers: _getHeaders(),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load packages: ${response.statusCode}');
  }

  static Future<List<dynamic>> search(String query) async {
    final response = await http
        .get(Uri.parse('${ApiConstants.search}?q=${Uri.encodeComponent(query)}'), headers: _getHeaders())
        .timeout(_timeout);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['results'] ?? [];
    }
    throw Exception('Failed to search: ${response.statusCode}');
  }

  static Future<List<dynamic>> getBookings(String token) async {
    final response = await http
        .get(
          Uri.parse(ApiConstants.bookings),
          headers: _getHeaders(token: token),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['bookings'] ?? [];
    }
    throw Exception('Failed to load bookings: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> updateProfile(String token, Map<String, dynamic> data) async {
    final response = await http
        .put(
          Uri.parse(ApiConstants.profile),
          headers: _getHeaders(token: token),
          body: json.encode(data),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to update profile: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> createBooking(
    Map<String, dynamic> data,
    String? token,
  ) async {
    final response = await http
        .post(
          Uri.parse(ApiConstants.bookings),
          headers: _getHeaders(token: token),
          body: json.encode(data),
        )
        .timeout(_timeout);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    }
    throw Exception('Failed to create booking: ${response.statusCode}');
  }

  /// Login with credentials
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http
        .post(
          Uri.parse(ApiConstants.login),
          headers: _getHeaders(),
          body: json.encode({'email': email, 'password': password}),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Login failed: ${response.statusCode}');
  }

  /// Register new user
  static Future<Map<String, dynamic>> signup(Map<String, dynamic> userData) async {
    final response = await http
        .post(
          Uri.parse(ApiConstants.signup),
          headers: _getHeaders(),
          body: json.encode(userData),
        )
        .timeout(_timeout);

    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    }
    throw Exception('Signup failed: ${response.statusCode}');
  }
}
