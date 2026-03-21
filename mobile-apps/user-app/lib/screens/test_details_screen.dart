import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../utils/app_toast.dart';

import '../utils/history_service.dart';

const _gradStart = Color(0xFF90E0EF);
const _gradMid   = Color(0xFF00B4D8);
const _gradEnd   = Color(0xFF0077B6);

class TestDetailsScreen extends StatelessWidget {
  final Map<String, dynamic> test;

  const TestDetailsScreen({super.key, required this.test});

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      HistoryService.addToHistory(test, 'test');
    });
    final price = test['price'] ?? 0;
    final originalPrice = test['originalPrice'];
    final discount = (originalPrice != null && originalPrice > 0)
        ? (((originalPrice - price) / originalPrice) * 100).round()
        : 0;
    final parameters = (test['parameters'] as List?)?.cast<String>() ?? [];
    final lab = test['lab'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          // Premium Sliver AppBar
          SliverAppBar(
            expandedHeight: 210,
            floating: false,
            pinned: true,
            elevation: 0,
            backgroundColor: _gradEnd,
            iconTheme: const IconThemeData(color: Colors.white), // Force back button to white
            flexibleSpace: FlexibleSpaceBar(
              centerTitle: true,
              title: LayoutBuilder(
                builder: (context, constraints) {
                  // Only show title when the AppBar is collapsed
                  final isCollapsed = constraints.biggest.height <= kToolbarHeight + (MediaQuery.of(context).padding.top);
                  return isCollapsed
                      ? Text(
                          test['name'] ?? '',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        )
                      : const SizedBox.shrink();
                },
              ),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_gradStart, _gradMid, _gradEnd],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      right: -30,
                      top: -20,
                      child: Icon(Icons.science_outlined, size: 200, color: Colors.white.withOpacity(0.1)),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if ((test['category'] ?? '').isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                test['category'].toString().toUpperCase(),
                                style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                              ),
                            ),
                          const SizedBox(height: 8),
                          Text(
                            test['name'] ?? '',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price Card
                  _premiumSection(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Best Price', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '₹$price',
                                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: _gradEnd),
                                ),
                                if (originalPrice != null) ...[
                                  const SizedBox(width: 8),
                                  Text(
                                    '₹$originalPrice',
                                    style: const TextStyle(fontSize: 16, decoration: TextDecoration.lineThrough, color: Colors.grey),
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                        if (discount > 0)
                          _DiscountBadge(discount: discount),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Info Grid
                  Row(
                    children: [
                      Expanded(child: _modernInfoCard(Icons.biotech_outlined, 'Sample', test['sampleType'] ?? 'Blood')),
                      const SizedBox(width: 12),
                      Expanded(child: _modernInfoCard(Icons.timer_outlined, 'Reports', test['turnaroundTime'] ?? '24 hrs')),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Preparation section
                  _sectionHeader('Guidelines & Prep'),
                  const SizedBox(height: 12),
                  _premiumSection(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: (test['preparationRequired'] == true ? Colors.orange : Colors.green).withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            test['preparationRequired'] == true ? Icons.fastfood_outlined : Icons.check_circle_outline,
                            color: test['preparationRequired'] == true ? Colors.orange : Colors.green,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                test['preparationRequired'] == true ? 'Preparation Required' : 'No Prep Needed',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                test['preparationRequired'] == true
                                    ? (test['preparationInstructions'] ?? 'Special preparation required')
                                    : 'You don\'t need to follow any special instructions for this test.',
                                style: TextStyle(fontSize: 13, color: Colors.grey.shade700, height: 1.4),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Test Details
                  _sectionHeader('About This Test'),
                  const SizedBox(height: 12),
                  _premiumSection(
                    child: Text(
                      test['description'] ?? 'No description available for this test.',
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade800, height: 1.6),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Parameters
                  if (parameters.isNotEmpty) ...[
                    _sectionHeader('Parameters Measured'),
                    const SizedBox(height: 12),
                    _premiumSection(
                      padding: const EdgeInsets.all(12),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: parameters.map((p) => Chip(
                          labelPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                          label: Text(p, style: TextStyle(fontSize: 12, color: _gradEnd, fontWeight: FontWeight.w500)),
                          backgroundColor: _gradEnd.withOpacity(0.05),
                          side: BorderSide(color: _gradEnd.withOpacity(0.1)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        )).toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Lab Section - RECONFIGURED FOR PREMIUM LOOK
                  if (lab != null) ...[
                    _sectionHeader('About the Lab'),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5)),
                        ],
                      ),
                      child: Column(
                        children: [
                          // Lab Header
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: _gradEnd.withOpacity(0.03),
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(15),
                                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                                  ),
                                  child: Icon(Icons.business_outlined, color: _gradEnd, size: 30),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        lab['name'] ?? 'Trusted Lab',
                                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Icon(Icons.stars, color: Colors.amber.shade600, size: 14),
                                          const SizedBox(width: 4),
                                          const Text('Top Rated Laboratory', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          
                          // Lab Details List
                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              children: [
                                _premiumLabRow(Icons.pin_drop_outlined, 'Location', '${lab['address']}, ${lab['city']}'),
                                const Divider(height: 24),
                                if (lab['operatingHours'] != null)
                                  _premiumLabRow(Icons.access_time, 'Timing', '${lab['operatingHours']['open']} – ${lab['operatingHours']['close']}'),
                                if ((lab['phone'] ?? '').isNotEmpty) ...[
                                  const Divider(height: 24),
                                  _premiumLabRow(Icons.call_outlined, 'Contact', lab['phone']),
                                ],
                                if ((lab['nablCertificate'] ?? '').isNotEmpty) ...[
                                  const Divider(height: 24),
                                  _premiumLabRow(Icons.verified_user_outlined, 'Accreditation', 'NABL Certified (${lab['nablCertificate']})'),
                                ],
                              ],
                            ),
                          ),
                          
                          // Accreditation Badge
                          if ((lab['nablCertificate'] ?? '').isNotEmpty)
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50.withOpacity(0.5),
                                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.shield_outlined, size: 16, color: Colors.blue.shade700),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Verified & Accredited Medical Facility',
                                    style: TextStyle(fontSize: 11, color: Colors.blue.shade700, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 40), // Reduced empty space
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomAction(context),
      floatingActionButton: _buildChatbotFab(context),
    );
  }

  Widget _buildChatbotFab(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                _gradStart.withOpacity(0.4),
                _gradMid.withOpacity(0.4),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _gradMid.withOpacity(0.6), width: 1.5),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                AppToast.show(context, 'Ask me about this test!', type: ToastType.success);
              },
              child: const Icon(Icons.support_agent_rounded, color: _gradEnd, size: 28),
            ),
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
      ),
    );
  }

  Widget _premiumSection({required Widget child, EdgeInsets padding = const EdgeInsets.all(20)}) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: child,
    );
  }

  Widget _modernInfoCard(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.01), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 24, color: _gradEnd),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _premiumLabRow(IconData icon, String label, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: _gradEnd.withOpacity(0.6)),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              Text(text, style: const TextStyle(fontSize: 14, color: Colors.black87, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomAction(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cart, _) {
        final itemId = (test['_id'] ?? test['id'] ?? '').toString();
        final inCart = cart.items.any((i) => (i['_id'] ?? i['id'] ?? '').toString() == itemId);
        
        return Container(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5)),
            ],
          ),
          child: inCart
              ? ElevatedButton(
                  onPressed: () {
                    cart.removeItem(itemId);
                    AppToast.show(context, '${test['name']} removed from cart', type: ToastType.error);
                  },
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 56),
                    backgroundColor: Colors.red.shade50,
                    foregroundColor: Colors.red,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.remove_circle_outline),
                      SizedBox(width: 8),
                      Text('Remove from Cart', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                )
              : Container(
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [_gradStart, _gradMid, _gradEnd]),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: _gradEnd.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8)),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      cart.addItem(test);
                      AppToast.show(context, '${test['name']} added to cart', type: ToastType.success);
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 56),
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_bag_outlined, color: Colors.white),
                        SizedBox(width: 8),
                        Text('Book This Test', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                  ),
                ),
        );
      },
    );
  }
}

class _DiscountBadge extends StatelessWidget {
  final int discount;
  const _DiscountBadge({required this.discount});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        CustomPaint(
          size: const Size(66, 66),
          painter: _StarburstPainter(
            fillColor: Colors.green.shade50.withOpacity(0.7),
            strokeColor: Colors.green.shade600,
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$discount%',
              style: TextStyle(color: Colors.green.shade800, fontSize: 17, fontWeight: FontWeight.w900),
            ),
            Text(
              'OFF',
              style: TextStyle(color: Colors.green.shade700, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
          ],
        ),
      ],
    );
  }
}

class _StarburstPainter extends CustomPainter {
  final Color fillColor;
  final Color strokeColor;
  _StarburstPainter({required this.fillColor, required this.strokeColor});

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    final double centerX = size.width / 2;
    final double centerY = size.height / 2;
    final double outerRadius = size.width / 2 - 2; // Offset for stroke
    final double innerRadius = outerRadius * 0.85;

    const int points = 24;
    const double angleStep = (math.pi * 2) / points;

    path.moveTo(centerX + outerRadius, centerY);

    for (int i = 1; i <= points; i++) {
      final double radius = i % 2 == 0 ? outerRadius : innerRadius;
      final double angle = i * angleStep;
      path.lineTo(centerX + radius * math.cos(angle), centerY + radius * math.sin(angle));
    }
    path.close();

    // Draw Fill
    final paintFill = Paint()
      ..color = fillColor
      ..style = PaintingStyle.fill;
    canvas.drawPath(path, paintFill);

    // Draw Stroke
    final paintStroke = Paint()
      ..color = strokeColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, paintStroke);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
