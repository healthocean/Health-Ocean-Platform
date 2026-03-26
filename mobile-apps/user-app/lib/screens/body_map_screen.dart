import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/constants.dart';
import '../widgets/package_card.dart'; // Reuse for tests if needed or create simple one
import 'test_details_screen.dart';
import 'test_comparison_screen.dart';

class BodyMapScreen extends StatefulWidget {
  const BodyMapScreen({super.key});

  @override
  State<BodyMapScreen> createState() => _BodyMapScreenState();
}

class _BodyMapScreenState extends State<BodyMapScreen> {
  String? _selectedOrgan;
  Map<String, List<dynamic>> _groupedItems = {};
  List<String> _uniqueList = [];
  bool _isLoading = false;

  final List<Map<String, dynamic>> _bodyRegions = [
    {'id': 'Brain', 'label': 'Brain', 'top': 0.05, 'left': 0.45, 'width': 0.12, 'height': 0.08, 'organ': 'Brain'},
    {'id': 'Thyroid', 'label': 'Thyroid', 'top': 0.18, 'left': 0.47, 'width': 0.06, 'height': 0.04, 'organ': 'Thyroid'},
    {'id': 'LungR', 'label': 'Lungs', 'top': 0.24, 'left': 0.42, 'width': 0.08, 'height': 0.12, 'organ': 'Lung'},
    {'id': 'LungL', 'label': 'Lungs', 'top': 0.24, 'left': 0.52, 'width': 0.08, 'height': 0.12, 'organ': 'Lung'},
    {'id': 'Heart', 'label': 'Heart', 'top': 0.27, 'left': 0.48, 'width': 0.06, 'height': 0.08, 'organ': 'Heart'},
    {'id': 'Liver', 'label': 'Liver', 'top': 0.35, 'left': 0.43, 'width': 0.10, 'height': 0.06, 'organ': 'Liver'},
    {'id': 'Stomach', 'label': 'Stomach', 'top': 0.37, 'left': 0.50, 'width': 0.08, 'height': 0.08, 'organ': 'Stomach'},
    {'id': 'Kidney', 'label': 'Kidney', 'top': 0.46, 'left': 0.45, 'width': 0.12, 'height': 0.08, 'organ': 'Kidney'},
    {'id': 'KneeR', 'label': 'Joints', 'top': 0.68, 'left': 0.42, 'width': 0.08, 'height': 0.08, 'organ': 'Joint'},
    {'id': 'KneeL', 'label': 'Joints', 'top': 0.68, 'left': 0.52, 'width': 0.08, 'height': 0.08, 'organ': 'Joint'},
    {'id': 'General', 'label': 'Full Body', 'top': 0.85, 'left': 0.35, 'width': 0.30, 'height': 0.10, 'organ': 'General'},
  ];

  Future<void> _fetchTests(String organ) async {
    setState(() {
      _selectedOrgan = organ;
      _isLoading = true;
      _groupedItems = {};
      _uniqueList = [];
    });

    try {
      final response = await http.get(Uri.parse('${ApiConstants.baseUrl}/search?query=$organ'));
      final data = json.decode(response.body);
      if (data['success']) {
        final List<dynamic> allItems = (data['tests'] as List? ?? []) + (data['packages'] as List? ?? []);
        Map<String, List<dynamic>> grouped = {};
        for (var item in allItems) {
          final name = item['name'] as String;
          if (!grouped.containsKey(name)) grouped[name] = [];
          grouped[name]!.add(item);
        }
        setState(() {
          _groupedItems = grouped;
          _uniqueList = grouped.keys.toList();
        });
      }
    } catch (e) {
      debugPrint('Error fetching tests: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const gradStart = Color(0xFF90E0EF);
    const gradMid = Color(0xFF00B4D8);
    const gradEnd = Color(0xFF0077B6);
    const deepNavy = Color(0xFF03045E);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Test Explorer', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [gradStart, gradMid, gradEnd]),
          ),
        ),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          const Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              children: [
                Text(
                  'Explore Your Health',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: deepNavy),
                ),
                SizedBox(height: 8),
                Text(
                  'Tap a body part to discover recommended diagnostic tests',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey, fontSize: 14),
                ),
              ],
            ),
          ),
          
          // Body Map Section
          Expanded(
            flex: 3,
            child: LayoutBuilder(
              builder: (context, constraints) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    // Main Silhouette
                    Opacity(
                      opacity: 0.9,
                      child: Image.asset(
                        'assets/body_map_silhouette.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                    
                    // Invisible Touch Targets
                    ..._bodyRegions.map((region) {
                      final isSelected = _selectedOrgan == region['organ'];
                      return Positioned(
                        top: constraints.maxHeight * region['top'],
                        left: constraints.maxWidth * region['left'],
                        width: constraints.maxWidth * region['width'],
                        height: constraints.maxHeight * region['height'],
                        child: GestureDetector(
                          onTap: () => _fetchTests(region['organ']),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            alignment: Alignment.center,
                            decoration: const BoxDecoration(
                              color: Colors.transparent,
                            ),
                        child: isSelected 
                          ? Center(
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Modern Scan/Target indicator
                                  Icon(Icons.gps_fixed_rounded, color: Colors.white, size: 30, shadows: [
                                    Shadow(color: Colors.cyan.shade300, blurRadius: 15)
                                  ]),
                                ],
                              ),
                            )
                          : const SizedBox.shrink(),
                          ),
                        ),
                      );
                    }).toList(),
                    
                    // Labels (Optional/Static)
                    if (_selectedOrgan == null) 
                      const Positioned(
                        bottom: 20,
                        child: Text(
                          'Tap the regions highlighted in the silhouette',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF0077B6)),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
          
          // Results Section
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _selectedOrgan == null ? 'Select a Region' : 'Tests for $_selectedOrgan',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: deepNavy),
                      ),
                      if (_isLoading)
                        const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: _selectedOrgan == null
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.touch_app_outlined, size: 48, color: Colors.grey.shade400),
                                const SizedBox(height: 12),
                                Text('Start exploring by tapping the body map', style: TextStyle(color: Colors.grey.shade500)),
                              ],
                            ),
                          )
                        : _uniqueList.isEmpty && !_isLoading
                            ? const Center(child: Text('No specific tests found for this region.'))
                            : ListView.builder(
                                padding: const EdgeInsets.only(bottom: 20),
                                itemCount: _uniqueList.length,
                                itemBuilder: (context, index) {
                                  final name = _uniqueList[index];
                                  final providers = _groupedItems[name]!;
                                  final firstItem = providers.first;
                                  final isTest = firstItem['type'] == 'test';
                                  
                                  return Card(
                                    margin: const EdgeInsets.all(8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                    elevation: 2,
                                    child: ListTile(
                                      contentPadding: const EdgeInsets.all(16),
                                      leading: Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: (isTest ? gradEnd : Colors.orange).withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Icon(
                                          isTest ? Icons.biotech_rounded : Icons.medical_services_rounded,
                                          color: isTest ? gradEnd : Colors.orange,
                                        ),
                                      ),
                                      title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      subtitle: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const SizedBox(height: 4),
                                          Text(
                                            'Diagnostic • ${firstItem['category']}',
                                            style: const TextStyle(fontSize: 12),
                                          ),
                                          const SizedBox(height: 4),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: gradEnd.withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              'Available at ${providers.length} Labs',
                                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: gradEnd),
                                            ),
                                          ),
                                        ],
                                      ),
                                      trailing: const Icon(Icons.compare_arrows_rounded, color: gradEnd),
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => TestComparisonScreen(testName: name, providers: providers),
                                          ),
                                        );
                                      },
                                    ),
                                  );
                                },
                              ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
