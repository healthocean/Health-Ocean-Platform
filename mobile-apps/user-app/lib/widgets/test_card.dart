import 'package:flutter/material.dart';
import '../utils/constants.dart';

class TestCard extends StatelessWidget {
  final Map<String, dynamic> test;
  final VoidCallback? onAddToCart;
  final VoidCallback? onRemoveFromCart;
  final bool isInCart;
  final VoidCallback? onTap;

  const TestCard({
    super.key,
    required this.test,
    this.onAddToCart,
    this.onRemoveFromCart,
    this.isInCart = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final price = test['price'];
    final originalPrice = test['originalPrice'];
    final discount = (originalPrice != null && originalPrice > 0 && price != null)
        ? (((originalPrice - price) / originalPrice) * 100).round()
        : 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE3F2FD), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D47A1).withOpacity(0.06),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: onTap,
          child: Stack(
            children: [
              // Subtle background pulse pattern
              Positioned(
                right: -20,
                bottom: -20,
                child: Opacity(
                  opacity: 0.03,
                  child: CustomPaint(
                    size: const Size(120, 120),
                    painter: _PulsePainter(),
                  ),
                ),
              ),
              
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            test['name'] ?? '',
                            style: const TextStyle(
                              fontSize: 18, 
                              fontWeight: FontWeight.w800, 
                              color: Color(0xFF012A4A),
                              letterSpacing: -0.5,
                              height: 1.2,
                            ),
                          ),
                        ),
                        if (discount > 0) ...[
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.green.shade50,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$discount% OFF',
                              style: TextStyle(
                                fontSize: 11, 
                                color: Colors.green.shade700, 
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    
                    if ((test['labName'] ?? '').isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Icon(Icons.business_rounded, size: 13, color: Colors.blueGrey.shade300),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              '${test['labName']}${test['labCity'] != null && test['labCity'].isNotEmpty ? ', ${test['labCity']}' : ''}',
                              style: TextStyle(
                                fontSize: 13, 
                                color: Colors.blueGrey.shade600, 
                                fontWeight: FontWeight.w600,
                                letterSpacing: -0.2
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, color: Colors.green, size: 14),
                        ],
                      ),
                    ],

                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _infoBit(Icons.water_drop_rounded, test['sampleType'] ?? 'Sample Req.'),
                        const SizedBox(width: 16),
                        _infoBit(Icons.timer_rounded, test['turnaroundTime'] ?? 'Quick Results'),
                      ],
                    ),

                    const SizedBox(height: 20),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '₹$price',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF0077B6),
                                    letterSpacing: -0.5
                                  ),
                                ),
                                if (originalPrice != null && originalPrice > price) ...[
                                  const SizedBox(width: 6),
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 3),
                                    child: Text(
                                      '₹$originalPrice',
                                      style: TextStyle(
                                        fontSize: 13,
                                        decoration: TextDecoration.lineThrough,
                                        color: Colors.grey.shade400,
                                        fontWeight: FontWeight.w500
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                          ],
                        ),
                        
                        InkWell(
                          onTap: isInCart ? onRemoveFromCart : onAddToCart,
                          borderRadius: BorderRadius.circular(16),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            decoration: BoxDecoration(
                              gradient: isInCart 
                                ? null 
                                : const LinearGradient(
                                    colors: [Color(0xFF00B4D8), Color(0xFF0077B6)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                              color: isInCart ? Colors.red.shade50 : null,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: isInCart ? [] : [
                                BoxShadow(
                                  color: const Color(0xFF00B4D8).withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                  Icon(
                                    isInCart ? Icons.remove_circle_outline_rounded : Icons.add_shopping_cart_rounded,
                                    size: 18,
                                    color: isInCart ? Colors.red.shade700 : Colors.white,
                                  ),
                                const SizedBox(width: 8),
                                Text(
                                  isInCart ? 'REMOVE' : 'ADD TO CART',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 13,
                                    color: isInCart ? Colors.red.shade700 : Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoBit(IconData icon, String label) {
    if (label.isEmpty) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: const Color(0xFF0077B6).withOpacity(0.7)),
        const SizedBox(width: 6),
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Colors.blueGrey.shade700,
            letterSpacing: 0.2
          ),
        ),
      ],
    );
  }

  IconData _getCategoryIcon(String? category) {
    switch (category?.toLowerCase()) {
      case 'blood': return Icons.water_drop_rounded;
      case 'urine': return Icons.science_rounded;
      case 'diabetes': return Icons.monitor_heart_rounded;
      case 'thyroid': return Icons.biotech_rounded;
      default: return Icons.analytics_rounded;
    }
  }
}

class _PulsePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF0077B6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final midY = size.height * 0.5;
    
    path.moveTo(0, midY);
    path.lineTo(size.width * 0.2, midY);
    path.lineTo(size.width * 0.25, midY - 15);
    path.lineTo(size.width * 0.35, midY + 15);
    path.lineTo(size.width * 0.4, midY);
    path.lineTo(size.width * 0.6, midY);
    path.lineTo(size.width * 0.65, midY - 30);
    path.lineTo(size.width * 0.75, midY + 30);
    path.lineTo(size.width * 0.8, midY);
    path.lineTo(size.width, midY);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
