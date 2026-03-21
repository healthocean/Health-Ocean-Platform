import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class BookingProvider with ChangeNotifier {
  List<dynamic> _assignedBookings = [];
  bool _isLoading = false;

  List<dynamic> get assignedBookings => _assignedBookings;
  bool get isLoading => _isLoading;

  Future<void> fetchAssignedBookings(String token, String employeeId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _assignedBookings = await ApiService.getAssignedBookings(token, employeeId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> updateBookingStatus(String token, String bookingId, String status) async {
    try {
      await ApiService.updateBookingStatus(token, bookingId, status);
      // Update local state if needed
      final index = _assignedBookings.indexWhere((b) => b['bookingId'] == bookingId || b['_id'] == bookingId);
      if (index != -1) {
        _assignedBookings[index]['status'] = status;
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }
}
