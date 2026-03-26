import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';

class ApiService {
  static const Duration _timeout = Duration(seconds: 30);

  static Map<String, String> _getHeaders({String? token}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

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
    throw Exception('Login failed: ${json.decode(response.body)['message'] ?? response.statusCode}');
  }

  static Future<List<dynamic>> getAssignedBookings(String token, String employeeId) async {
    final response = await http
        .get(
          Uri.parse('${ApiConstants.employeeBookings}/$employeeId/bookings'),
          headers: _getHeaders(token: token),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['bookings'] ?? [];
    }
    throw Exception('Failed to load assigned bookings: ${response.statusCode}');
  }

  static Future<Map<String, dynamic>> updateBookingStatus(String token, String bookingId, String status) async {
    final response = await http
        .patch(
          Uri.parse('${ApiConstants.updateBookingStatus}/$bookingId/status'),
          headers: _getHeaders(token: token),
          body: json.encode({'status': status}),
        )
        .timeout(_timeout);

    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to update status: ${response.statusCode}');
  }
}
