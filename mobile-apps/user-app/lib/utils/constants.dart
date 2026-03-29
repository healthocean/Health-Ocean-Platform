import 'package:flutter/material.dart';

class ApiConstants {
  static const String baseUrl = 'http://10.49.253.207:4000/api';

  static const String login = '$baseUrl/users/login';
  static const String signup = '$baseUrl/users/register';
  static const String tests = '$baseUrl/tests';
  static const String packages = '$baseUrl/packages';
  static const String search = '$baseUrl/search';
  static const String bookings = '$baseUrl/bookings';
  static const String profile = '$baseUrl/users/profile';
  static const String chatbot = 'https://tejas0041-sanmare-assist.hf.space/api/chat';

  // Ocean palette
  static const Color oceanStart = Color(0xFF90E0EF);
  static const Color oceanMid = Color(0xFF00B4D8);
  static const Color oceanEnd = Color(0xFF0077B6);
  static const Color oceanLight = Color(0xFFE0F7FA);
  static const Color oceanDark = Color(0xFF01579B);
}
