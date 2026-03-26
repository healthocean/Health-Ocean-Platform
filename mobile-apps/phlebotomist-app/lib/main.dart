import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'utils/constants.dart';
import 'providers/auth_provider.dart';
import 'providers/booking_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
      ],
      child: const HealthOceanPhlebotomistApp(),
    ),
  );
}

class HealthOceanPhlebotomistApp extends StatefulWidget {
  const HealthOceanPhlebotomistApp({super.key});

  @override
  State<HealthOceanPhlebotomistApp> createState() => _HealthOceanPhlebotomistAppState();
}

class _HealthOceanPhlebotomistAppState extends State<HealthOceanPhlebotomistApp> {
  late Future<void> _authFuture;

  @override
  void initState() {
    super.initState();
    _authFuture = _initAuth();
  }

  Future<void> _initAuth() async {
    return Provider.of<AuthProvider>(context, listen: false).tryAutoLogin();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Health Ocean Phlebotomist',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: ApiConstants.oceanEnd,
        colorScheme: ColorScheme.fromSeed(
          seedColor: ApiConstants.oceanEnd,
          primary: ApiConstants.oceanEnd,
          secondary: ApiConstants.oceanMid,
          tertiary: ApiConstants.oceanStart,
          surface: Colors.white,
          background: ApiConstants.paleCyan,
        ),
        fontFamily: 'Inter',
        appBarTheme: const AppBarTheme(
          elevation: 0,
          centerTitle: true,
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
        ),
      ),
      home: FutureBuilder(
        future: _authFuture,
        builder: (ctx, authResult) {
          if (authResult.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.health_and_safety, size: 80, color: ApiConstants.oceanEnd),
                    SizedBox(height: 20),
                    CircularProgressIndicator(),
                  ],
                ),
              ),
            );
          }
          
          return Consumer<AuthProvider>(
            builder: (ctx, auth, _) {
              return auth.isAuthenticated
                  ? const DashboardScreen()
                  : const LoginScreen();
            },
          );
        },
      ),
    );
  }
}
