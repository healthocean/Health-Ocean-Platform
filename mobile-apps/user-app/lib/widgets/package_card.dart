import 'package:flutter/material.dart';
import '../utils/constants.dart';

class PackageCard extends StatelessWidget {
  final Map<String, dynamic> package;
  final VoidCallback? onAddToCart;
  final VoidCallback? onRemoveFromCart;
  final bool isInCart;
  final VoidCallback? onTap;

  const PackageCard({
    super.key,
    required this.package,
    this.onAddToCart,
    this.onRemoveFromCart,
    this.isInCart = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final price = package['price'];
    final originalPrice = package['originalPrice'];
    final discount = (originalPrice != null && originalPrice > 0 && price != null)
        ? (((originalPrice - price) / originalPrice) * 100).round()
        : 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFE3F2FD), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D47A1).withOpacity(0.08),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(28),
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              
              Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                package['name'] ?? '',
                                style: const TextStyle(
                                  fontSize: 19, 
                                  fontWeight: FontWeight.w800, 
                                  color: Color(0xFF012A4A),
                                  letterSpacing: -0.5,
                                  height: 1.2
                                ),
                              ),
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.fact_check_rounded, size: 14, color: Color(0xFF334155)),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${(package['testsIncluded'] as List?)?.length ?? package['testCount'] ?? 0} Parameters Tested',
                                      style: const TextStyle(
                                        fontSize: 12, 
                                        color: Color(0xFF334155), 
                                        fontWeight: FontWeight.w700
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
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

                    if ((package['labName'] ?? '').isNotEmpty) ...[
                      const SizedBox(height: 18),
                      Row(
                        children: [
                          Icon(Icons.business_rounded, size: 13, color: Colors.blueGrey.shade300),
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              '${package['labName']}${package['labCity'] != null && package['labCity'].isNotEmpty ? ', ${package['labCity']}' : ''}',
                              style: TextStyle(
                                fontSize: 13, 
                                color: Colors.blueGrey.shade600, 
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified, color: Colors.green, size: 16),
                        ],
                      ),
                    ],

                    const SizedBox(height: 24),

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
                                    fontSize: 26,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF0077B6),
                                    letterSpacing: -0.5
                                  ),
                                ),
                                if (originalPrice != null && originalPrice > price) ...[
                                  const SizedBox(width: 8),
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 4),
                                    child: Text(
                                      '₹$originalPrice',
                                      style: TextStyle(
                                        fontSize: 14,
                                        decoration: TextDecoration.lineThrough,
                                        color: Colors.grey.shade400,
                                        fontWeight: FontWeight.w500
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const Text(
                              'ALL TAXES INCLUDED',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: Colors.blueGrey,
                                letterSpacing: 0.5
                              ),
                            ),
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
}
