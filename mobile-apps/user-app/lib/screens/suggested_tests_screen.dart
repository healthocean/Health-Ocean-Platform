import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import '../widgets/test_card.dart';
import '../providers/cart_provider.dart';
import 'test_details_screen.dart';

class SuggestedTestsScreen extends StatefulWidget {
  final List<String> tests;
  final String query;

  const SuggestedTestsScreen({super.key, required this.tests, required this.query});

  @override
  State<SuggestedTestsScreen> createState() => _SuggestedTestsScreenState();
}

class _SuggestedTestsScreenState extends State<SuggestedTestsScreen> {
  List<dynamic> _matchingTests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMatchingTests();
  }

  Future<void> _fetchMatchingTests() async {
    try {
      Set<String> seenIds = {};
      List<dynamic> combined = [];

      for (String testName in widget.tests) {
        // Search 1: Try exact or full name from AI
        bool found = await _performSingleSearch(testName, seenIds, combined);
        
        // Search 2: Fallback to the first two keywords if the full name yielded nothing
        if (!found) {
          final words = testName.split(' ');
          if (words.length > 1) {
             final shortName = '${words[0]} ${words[1]}';
             await _performSingleSearch(shortName, seenIds, combined);
          } else if (words.isNotEmpty) {
             await _performSingleSearch(words[0], seenIds, combined);
          }
        }
      }

      if (mounted) {
        setState(() {
          _matchingTests = combined;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<bool> _performSingleSearch(String query, Set<String> seenIds, List<dynamic> combined) async {
    final uri = Uri.parse('${ApiConstants.search}?q=${Uri.encodeComponent(query)}');
    final response = await http.get(uri);
    bool foundSomething = false;
    
    if (response.statusCode == 200) {
      final List<dynamic> results = json.decode(response.body);
      for (var test in results) {
        final id = (test['_id'] ?? test['testId'] ?? '').toString();
        if (id.isNotEmpty && !seenIds.contains(id)) {
          combined.add(test);
          seenIds.add(id);
          foundSomething = true;
        }
      }
    }
    return foundSomething;
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    
    return Scaffold(
      backgroundColor: const Color(0xFFF0FAFF),
      appBar: AppBar(
        title: const Text('Suggested Tests', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: ApiConstants.oceanEnd,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _matchingTests.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _matchingTests.length,
                  itemBuilder: (context, index) {
                    final test = _matchingTests[index];
                    final testId = test['_id'] ?? test['testId'];
                    return TestCard(
                      test: test,
                      isInCart: cart.isInCart(testId),
                      onAddToCart: () => cart.addItem(test),
                      onRemoveFromCart: () => cart.removeItem(testId),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => TestDetailsScreen(test: test),
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off_rounded, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            const Text(
              'No direct matches found in our lab network for the suggested tests.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
            const SizedBox(height: 8),
            const Text(
              'Try searching manually for alternative names or general categories.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
