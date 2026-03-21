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
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade100, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(1, 10),
          ),
          BoxShadow(
            color: const Color(0xFF0077B6).withOpacity(0.03),
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
              right: -65,
              top: -65,
              child: Container(
                width: 170,
                height: 170,
                decoration: BoxDecoration(
                  color: const Color(0xFF0077B6).withOpacity(0.04),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Package Header Image / Label
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF03045E).withOpacity(0.05),
                        const Color(0xFF0077B6).withOpacity(0.05),
                      ],
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.inventory_2_rounded, size: 14, color: Color(0xFF0077B6)),
                          const SizedBox(width: 8),
                          const Text(
                            'PREMIUM PACKAGE',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0077B6),
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                      if (discount > 0)
                        Text(
                          'SAVE $discount%',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: Colors.green,
                          ),
                        ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        package['name'] ?? '',
                        style: const TextStyle(
                          fontSize: 18, 
                          fontWeight: FontWeight.bold, 
                          color: Colors.black,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.fact_check_rounded, size: 14, color: Colors.grey.shade400),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              '${(package['testsIncluded'] as List?)?.length ?? package['testCount'] ?? 0} Global Standard Tests',
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
                      if ((package['labName'] ?? '').isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Icon(Icons.business_rounded, size: 14, color: Colors.grey.shade400),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '${package['labName']}',
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
          ],
        ),
      ),
    ),
  );
}
}
