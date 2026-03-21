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
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: const Color(0xFF00B4D8).withOpacity(0.03),
            blurRadius: 10,
            spreadRadius: -2,
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          child: Stack(
            children: [
              // Single Professional Designer Circle (Top Right - Refined Accent)
              Positioned(
                right: -55,
                top: -55,
                child: Container(
                  width: 150,
                  height: 150,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0077B6).withOpacity(0.04),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
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
                              fontSize: 17, 
                              fontWeight: FontWeight.bold, 
                              color: Colors.black,
                              letterSpacing: -0.4,
                            ),
                          ),
                        ),
                        if (discount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
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
                    ),
                    if ((test['labName'] ?? '').isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.business_rounded, size: 14, color: Colors.grey.shade400),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              '${test['labName']}',
                              style: TextStyle(
                                fontSize: 12, 
                                color: Colors.grey.shade600, 
                                fontWeight: FontWeight.w500
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 16),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            if ((test['category'] ?? '').isNotEmpty)
                              _chip(test['category'] as String, Icons.biotech_rounded, const Color(0xFF0077B6)),
                            const SizedBox(width: 8),
                            if ((test['sampleType'] ?? '').isNotEmpty)
                              _chip(test['sampleType'] as String, Icons.water_drop_rounded, const Color(0xFF0077B6)),
                            const SizedBox(width: 8),
                            if ((test['turnaroundTime'] ?? '').isNotEmpty)
                              _chip(test['turnaroundTime'] as String, Icons.timer_rounded, const Color(0xFF0077B6)),
                          ],
                        ),
                      ),
                    const SizedBox(height: 17),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '₹$price',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF0077B6),
                              ),
                            ),
                            if (originalPrice != null) ...[
                              const SizedBox(width: 8),
                              Text(
                                '₹$originalPrice',
                                style: TextStyle(
                                  fontSize: 14,
                                  decoration: TextDecoration.lineThrough,
                                  color: Colors.grey.shade400,
                                ),
                              ),
                            ],
                          ],
                        ),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          child: isInCart
                              ? OutlinedButton.icon(
                                  onPressed: onRemoveFromCart,
                                  icon: const Icon(Icons.remove_circle_outline, size: 18),
                                  label: const Text('Remove', style: TextStyle(fontWeight: FontWeight.bold)),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.red,
                                    side: const BorderSide(color: Colors.red),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                )
                              : ElevatedButton.icon(
                                  onPressed: onAddToCart,
                                  icon: const Icon(Icons.add_shopping_cart_rounded, size: 18),
                                  label: const Text('Add to Cart', style: TextStyle(fontWeight: FontWeight.bold)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF00B4D8),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    elevation: 0,
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

  Widget _chip(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label, 
            style: TextStyle(
              fontSize: 11, 
              color: color, 
              fontWeight: FontWeight.bold
            )
          ),
        ],
      ),
    );
  }
}
