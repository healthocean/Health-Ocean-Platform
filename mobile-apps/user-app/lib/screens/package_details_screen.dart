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

class PackageDetailsScreen extends StatelessWidget {
  final Map<String, dynamic> package;

  const PackageDetailsScreen({super.key, required this.package});

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      HistoryService.addToHistory(package, 'package');
    });
    final tests = package['tests'] as List<dynamic>? ?? [];
    final price = package['price'] ?? 0;
    final originalPrice = package['originalPrice'];
    final discount = (originalPrice != null && originalPrice > 0)
        ? (((originalPrice - price) / originalPrice) * 100).round()
        : 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 210,
            pinned: true,
            elevation: 0,
            backgroundColor: _gradEnd,
            flexibleSpace: FlexibleSpaceBar(
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
                      right: -20,
                      top: -10,
                      child: Icon(Icons.inventory_2_outlined, size: 180, color: Colors.white.withOpacity(0.1)),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text('HEALTH PACKAGE', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            package['name'] ?? '',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
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
                            const Text('Package Price', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 4),
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('₹$price', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: _gradEnd)),
                                    if (originalPrice != null) ...[
                                      const SizedBox(width: 8),
                                      Text('₹$originalPrice', style: const TextStyle(fontSize: 16, decoration: TextDecoration.lineThrough, color: Colors.grey)),
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

                  const SizedBox(height: 24),
                  
                  _sectionHeader('Description'),
                  const SizedBox(height: 12),
                  _premiumSection(
                    child: Text(package['description'] ?? 'No description available', style: TextStyle(fontSize: 14, color: Colors.grey.shade800, height: 1.6)),
                  ),

                  const SizedBox(height: 24),
                  
                  _sectionHeader('Tests Included (${tests.length})'),
                  const SizedBox(height: 12),
                  ...tests.map((test) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: _gradEnd.withOpacity(0.1), shape: BoxShape.circle),
                        child: Icon(Icons.check, color: _gradEnd, size: 18),
                      ),
                      title: Text(test['name'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      trailing: Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 20),
                    ),
                  )),
                  
                  const SizedBox(height: 120),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomAction(context, tests),
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
                AppToast.show(context, 'Ask me about this package!', type: ToastType.success);
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
      child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87)),
    );
  }

  Widget _premiumSection({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: child,
    );
  }

  Widget _buildBottomAction(BuildContext context, List<dynamic> tests) {
    final cartProvider = Provider.of<CartProvider>(context);
    final pkgId = (package['_id'] ?? package['id'] ?? '').toString();
    final isInCart = cartProvider.items.any((i) => (i['_id'] ?? i['id'] ?? '').toString() == pkgId);

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -5))]),
      child: isInCart
          ? ElevatedButton(
              onPressed: () {
                cartProvider.removeItem(pkgId);
                AppToast.show(context, 'Package removed', type: ToastType.error);
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
                boxShadow: [BoxShadow(color: _gradEnd.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
              ),
              child: ElevatedButton(
                onPressed: () {
                  cartProvider.addItem(package);
                  AppToast.show(context, 'Package added to cart', type: ToastType.success);
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
                    Text('Add to Cart', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
              ),
            ),
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
