import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../utils/app_toast.dart';
import '../widgets/test_card.dart';
import '../widgets/package_card.dart';
import 'test_details_screen.dart';
import 'package_details_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  List<dynamic> _searchResults = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch() {
    final query = _searchController.text.toLowerCase().trim();
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _hasSearched = false;
        _isLoading = false;
      });
      return;
    }

    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      setState(() {
        _hasSearched = true;
        _isLoading = true;
      });
      try {
        final prefs = await SharedPreferences.getInstance();
        final lat = prefs.getDouble('cached_lat')?.toString();
        final lng = prefs.getDouble('cached_lng')?.toString();
        final pincode = prefs.getString('cached_pincode');
        
        final results = await ApiService.search(query, lat: lat, lng: lng, pincode: pincode);
        if (mounted) {
          setState(() {
            _searchResults = results;
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) setState(() => _isLoading = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search tests...',
            border: InputBorder.none,
          ),
          onChanged: (_) => _performSearch(),
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                _performSearch();
              },
            ),
        ],
      ),
      body: !_hasSearched
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.search, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  const Text('Search for lab tests and packages', style: TextStyle(fontSize: 16, color: Colors.grey)),
                ],
              ),
            )
          : _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _searchResults.isEmpty
                  ? const Center(child: Text('No results found'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final item = _searchResults[index];
                        final isPackage = item['type'] == 'package';
                        final itemId = (item['_id'] ?? item['id'] ?? item['testId'] ?? item['packageId'] ?? '').toString();
                        final isInCart = cartProvider.isInCart(itemId);
                        
                        return isPackage 
                            ? PackageCard(
                                package: item,
                                isInCart: isInCart,
                                onAddToCart: () {
                                  cartProvider.addItem(item);
                                  AppToast.show(context, '${item['name']} added to cart', type: ToastType.success);
                                },
                                onRemoveFromCart: () {
                                  cartProvider.removeItem(itemId);
                                  AppToast.show(context, 'Removed from cart', type: ToastType.info);
                                },
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PackageDetailsScreen(package: item))),
                              )
                            : TestCard(
                                test: item,
                                isInCart: isInCart,
                                onAddToCart: () {
                                  cartProvider.addItem(item);
                                  AppToast.show(context, '${item['name']} added to cart', type: ToastType.success);
                                },
                                onRemoveFromCart: () {
                                  cartProvider.removeItem(itemId);
                                  AppToast.show(context, 'Removed from cart', type: ToastType.info);
                                },
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TestDetailsScreen(test: item))),
                              );
                      },
                    ),
    );
  }
}
