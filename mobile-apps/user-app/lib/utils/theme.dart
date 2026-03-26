import 'package:flutter/material.dart';

class AppTheme {
  // Ocean Breeze Palette
  static const Color deepTwilight  = Color(0xFF03045E); // Deep Twilight
  static const Color brightTealBlue = Color(0xFF0077B6); // Bright Teal Blue
  static const Color turquoiseSurf  = Color(0xFF00B4D8); // Turquoise Surf
  static const Color frostedBlue    = Color(0xFF90E0EF); // Frosted Blue
  static const Color lightCyan      = Color(0xFFCAF0F8); // Light Cyan

  // Semantic aliases
  static const Color primaryColor   = brightTealBlue;
  static const Color secondaryColor = turquoiseSurf;
  static const Color accentColor    = Color(0xFFFF5C5C);

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      primary: primaryColor,
      secondary: secondaryColor,
      error: accentColor,
      surface: Colors.white,
      onPrimary: Colors.white,
    ),
    scaffoldBackgroundColor: const Color(0xFFF0FAFF), // very light cyan tint
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: deepTwilight,
      elevation: 0,
      centerTitle: false,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        elevation: 0,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: const BorderSide(color: primaryColor, width: 2),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: frostedBlue),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: frostedBlue),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: lightCyan),
      ),
      color: Colors.white,
    ),
  );
}
