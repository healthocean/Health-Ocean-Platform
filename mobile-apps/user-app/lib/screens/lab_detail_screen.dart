import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../services/api_service.dart';

class LabDetailScreen extends StatefulWidget {
  final Map<String, dynamic> lab;

  const LabDetailScreen({super.key, required this.lab});

  @override
  State<LabDetailScreen> createState() => _LabDetailScreenState();
}

class _LabDetailScreenState extends State<LabDetailScreen> {
  bool _isLoading = true;
  List<dynamic> _tests = [];
  List<dynamic> _packages = [];

  @override
  void initState() {
    super.initState();
    _fetchLabContent();
  }

  Future<void> _fetchLabContent() async {
    try {
      final labId = widget.lab['labId'] ?? widget.lab['_id'];
      final results = await Future.wait([
        ApiService.getTests(labId: labId),
        ApiService.getPackages(labId: labId),
      ]);
      
      setState(() {
        _tests = (results[0]['tests'] as List?) ?? [];
        _packages = (results[1]['packages'] as List?) ?? [];
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching lab content: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lab = widget.lab;
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            iconTheme: const IconThemeData(color: Colors.white),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [ApiConstants.oceanMid, ApiConstants.oceanEnd],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(Icons.local_hospital_rounded, size: 100, color: Colors.white.withOpacity(0.15)),
                    Positioned(
                      bottom: 40,
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                        ),
                        child: const Icon(Icons.business_rounded, color: ApiConstants.oceanEnd, size: 40),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(lab['name'] ?? '', style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
                  const SizedBox(height: 12),
                  _infoRow(Icons.location_on_rounded, '${lab['address']}, ${lab['city']}'),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.verified, color: Colors.green, size: 18),
                      const SizedBox(width: 8),
                      Text('Verified Medical Facility • NABL Accredited', style: TextStyle(color: Colors.blueGrey[600], fontSize: 14)),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  const Text('Services & Offerings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  
                  if (_isLoading)
                     const Padding(
                      padding: EdgeInsets.symmetric(vertical: 60),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (_tests.isEmpty && _packages.isEmpty)
                    _emptyState()
                  else ...[
                    if (_tests.isNotEmpty) ...[
                      _sectionTitle('Tests Available (${_tests.length})'),
                      ..._tests.map((t) => _itemCard(t)).toList(),
                    ],
                    if (_packages.isNotEmpty) ...[
                      const SizedBox(height: 32),
                      _sectionTitle('Health Packages (${_packages.length})'),
                      ..._packages.map((p) => _itemCard(p)).toList(),
                    ],
                  ],
                  const SizedBox(height: 60),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.blueGrey[300]),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: TextStyle(color: Colors.blueGrey[600], fontSize: 14))),
      ],
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, top: 8),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: ApiConstants.oceanEnd)),
    );
  }

  Widget _itemCard(dynamic item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(item['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Report in ${item['turnaroundTime'] ?? '24 hrs'}', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('₹${item['price']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
            const Icon(Icons.chevron_right, size: 16, color: Colors.grey),
          ],
        ),
        onTap: () {},
      ),
    );
  }

  Widget _emptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 60),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('No medical tests or packages\nfound for this lab.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[400])),
          ],
        ),
      ),
    );
  }
}
