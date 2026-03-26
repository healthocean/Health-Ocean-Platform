import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class HistoryService {
  static const String _key = 'browsing_history';
  static const int _maxItems = 8;

  static Future<void> addToHistory(Map<String, dynamic> item, String type) async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> historyJson = prefs.getStringList(_key) ?? [];
    
    // Create a complete version of the item for history to maintain lab/price integrity
    final historyItem = {
      ...item, // Preserve all original fields (lab, prices, etc.)
      'type': type,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };

    // Remove if already exists (same ID and type)
    historyJson.removeWhere((jsonStr) {
      final decoded = json.decode(jsonStr);
      final decodedId = decoded['_id'] ?? decoded['id'];
      final newItemId = item['_id'] ?? item['id'];
      return decodedId == newItemId && decoded['type'] == type;
    });

    // Add to front
    historyJson.insert(0, json.encode(historyItem));

    // Limit size
    if (historyJson.length > _maxItems) {
      historyJson.removeLast();
    }

    await prefs.setStringList(_key, historyJson);
  }

  static Future<List<Map<String, dynamic>>> getHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> historyJson = prefs.getStringList(_key) ?? [];
    return historyJson.map((s) => json.decode(s) as Map<String, dynamic>).toList();
  }
}
