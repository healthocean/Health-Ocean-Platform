import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../utils/app_toast.dart';
import 'test_details_screen.dart';
import 'cart_screen.dart';

class TestComparisonScreen extends StatelessWidget {
  final String testName;
  final List<dynamic> providers;

  const TestComparisonScreen({
    super.key,
    required this.testName,
    required this.providers,
  });

  @override
  Widget build(BuildContext context) {
    const deepNavy = Color(0xFF03045E);
    const gradStart = Color(0xFF90E0EF);
    const gradEnd = Color(0xFF0077B6);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(testName, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [gradStart, gradEnd]),
          ),
        ),
        actions: [
          Consumer<CartProvider>(
            builder: (context, cart, _) => Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen())),
                ),
                if (cart.itemCount > 0)
                  Positioned(
                    right: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        cart.itemCount.toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
        ],
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Choose Provider',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0077B6)),
                ),
                Text(
                  'Showing ${providers.length} labs providing this test',
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: providers.length,
              itemBuilder: (context, index) {
                final provider = providers[index];
                final bool isTest = provider['type'] == 'test';
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                    border: Border.all(color: Colors.grey.shade100),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor: gradStart.withOpacity(0.2),
                          child: Icon(Icons.business_rounded, color: gradEnd),
                        ),
                        title: Text(
                          provider['labName'],
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0077B6)),
                        ),
                        subtitle: Row(
                          children: [
                            const Icon(Icons.location_on, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(provider['labCity'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(width: 12),
                            const Icon(Icons.star, size: 14, color: Colors.amber),
                            const SizedBox(width: 4),
                            Text(provider['labRating'].toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        onTap: () {
                          if (isTest) {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => TestDetailsScreen(test: provider)));
                          }
                        },
                      ),
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Starts from', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                Text(
                                  '₹${provider['price']}',
                                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0077B6)),
                                ),
                              ],
                            ),
                            Consumer<CartProvider>(
                              builder: (context, cart, _) {
                                final itemId = (isTest ? provider['testId'] : provider['packageId']).toString();
                                final isInCart = cart.isInCart(itemId);
                                
                                return ElevatedButton(
                                  onPressed: () {
                                    if (isInCart) {
                                      cart.removeItem(itemId);
                                      AppToast.show(context, 'Removed from cart', type: ToastType.info);
                                    } else {
                                      cart.addItem({
                                        'id': itemId,
                                        'name': provider['name'],
                                        'price': provider['price'],
                                        'type': isTest ? 'test' : 'package',
                                        'labId': provider['labId'],
                                        'labName': provider['labName']
                                      });
                                      AppToast.show(context, 'Added to cart!', type: ToastType.success);
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: isInCart ? Colors.red.shade50 : const Color(0xFF00B4D8),
                                    foregroundColor: isInCart ? Colors.red : Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                      side: BorderSide(color: isInCart ? Colors.red : Colors.transparent),
                                    ),
                                    elevation: isInCart ? 0 : 2,
                                  ),
                                  child: Text(isInCart ? 'Remove' : 'Add to Cart'),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
