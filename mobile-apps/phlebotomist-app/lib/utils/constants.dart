import 'package:flutter/material.dart';

class ApiConstants {
  static const String baseUrl = 'http://10.49.253.207:4000/api';

  static const String login = '$baseUrl/labs/employees/login';
  static const String labInfo = '$baseUrl/labs'; // GET /api/labs/:id
  static const String employeeBookings = '$baseUrl/labs/employees'; // GET /api/labs/employees/:id/bookings
  static const String updateBookingStatus = '$baseUrl/labs/bookings'; // PATCH /api/labs/bookings/:id/status
  static const String uploadReport = '$baseUrl/labs/bookings'; // POST /api/labs/bookings/:id/report

  // Ocean palette
  static const Color oceanStart = Color(0xFF90E0EF);
  static const Color oceanMid = Color(0xFF00B4D8);
  static const Color oceanEnd = Color(0xFF0077B6);
  static const Color oceanLight = Color(0xFFE0F7FA);
  static const Color oceanDark = Color(0xFF01579B);
  static const Color deepNavy = Color(0xFF03045E);
  static const Color paleCyan = Color(0xFFCAF0F8);
}
