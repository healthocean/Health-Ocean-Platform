import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../utils/app_toast.dart';
import '../widgets/package_card.dart';
import '../utils/constants.dart';
import 'package_details_screen.dart';

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({super.key});

  @override
  State<PackagesScreen> createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen> {
  final List<dynamic> _packages = [];
  bool _isLoading = true;
  bool _isMoreLoading = false;
  int _currentPage = 1;
  int _totalPages = 1;
  final int _limit = 10;

  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  String _sortOption = 'None';
  String _selectedCategory = 'All';

  final List<String> _categories = ['All', 'Comprehensive', 'Basic', 'Men', 'Women', 'Senior'];
  final List<String> _sortOptions = ['None', 'Price: Low to High', 'Price: High to Low'];

  @override
  void initState() {
    super.initState();
    _loadInitialPackages();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200 &&
        !_isMoreLoading &&
        _currentPage < _totalPages) {
      _loadMorePackages();
    }
  }

  Future<void> _loadInitialPackages() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _currentPage = 1;
      _packages.clear();
    });
    try {
      final data = await ApiService.getPackages(
        page: _currentPage,
        limit: _limit,
        search: _searchController.text.trim(),
        category: _selectedCategory,
        sort: _sortOption,
      );
      if (mounted) {
        setState(() {
          _packages.addAll(data['packages'] ?? []);
          _totalPages = data['totalPages'] ?? 1;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadMorePackages() async {
    if (_isMoreLoading || !mounted) return;
    setState(() => _isMoreLoading = true);
    try {
      final data = await ApiService.getPackages(
        page: _currentPage + 1,
        limit: _limit,
        search: _searchController.text.trim(),
        category: _selectedCategory,
        sort: _sortOption,
      );
      if (mounted) {
        setState(() {
          _currentPage++;
          _packages.addAll(data['packages'] ?? []);
          _isMoreLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isMoreLoading = false);
    }
  }

  void _onSearch() {
    _loadInitialPackages();
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = Provider.of<CartProvider>(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16).copyWith(bottom: 8),
            child: TextField(
              controller: _searchController,
              onSubmitted: (_) => _onSearch(),
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Search packages...',
                hintStyle: const TextStyle(color: Colors.blueGrey, fontSize: 14),
                prefixIcon: const Icon(Icons.search, color: ApiConstants.oceanMid),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.grey, size: 20),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                          _onSearch();
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(32),
                  borderSide: BorderSide(color: ApiConstants.oceanMid.withOpacity(0.1)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(32),
                  borderSide: BorderSide(color: ApiConstants.oceanMid.withOpacity(0.1)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(32),
                  borderSide: const BorderSide(color: ApiConstants.oceanMid, width: 1.5),
                ),
              ),
            ),
          ),
          _buildFilters(context),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _packages.isEmpty
                    ? const Center(child: Text('No packages found', style: TextStyle(color: ApiConstants.oceanEnd)))
                    : RefreshIndicator(
                        onRefresh: _loadInitialPackages,
                        child: ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16).copyWith(bottom: 110),
                          itemCount: _packages.length + (_isMoreLoading ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == _packages.length) {
                              return const Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                              );
                            }
                            final pkg = _packages[index];
                            final String pkgId = (pkg['_id'] ?? pkg['id'] ?? pkg['testId'] ?? pkg['packageId'] ?? '').toString();
                            final bool isInCart = cartProvider.isInCart(pkgId);

                            return PackageCard(
                              package: pkg,
                              isInCart: isInCart,
                              onAddToCart: () {
                                cartProvider.addItem(pkg);
                                AppToast.show(context, '${pkg['name']} added to cart', type: ToastType.success);
                              },
                              onRemoveFromCart: () {
                                cartProvider.removeItem(pkgId);
                                AppToast.show(context, '${pkg['name']} removed from cart', type: ToastType.error);
                              },
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => PackageDetailsScreen(package: pkg)),
                                );
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters(BuildContext context) {
    return SizedBox(
      height: 42,
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 12),
            child: PopupMenuButton<String>(
              onSelected: (val) {
                String sortKey = 'None';
                if (val == 'Price: Low to High') sortKey = 'price_asc';
                if (val == 'Price: High to Low') sortKey = 'price_desc';

                setState(() => _sortOption = sortKey);
                _loadInitialPackages();
              },
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: ApiConstants.oceanLight.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: ApiConstants.oceanMid.withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.sort_rounded, size: 16, color: ApiConstants.oceanEnd),
                    const SizedBox(width: 6),
                    const Text(
                      'Sort',
                      style: TextStyle(color: ApiConstants.oceanEnd, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ],
                ),
              ),
              itemBuilder: (context) => _sortOptions.map((s) => PopupMenuItem(value: s, child: Text(s))).toList(),
            ),
          ),
          Expanded(
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(right: 16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat;

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() => _selectedCategory = cat);
                      _loadInitialPackages();
                    },
                    backgroundColor: ApiConstants.oceanLight.withOpacity(0.3),
                    selectedColor: ApiConstants.oceanMid,
                    checkmarkColor: Colors.white,
                    showCheckmark: false,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : ApiConstants.oceanEnd,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(color: isSelected ? Colors.transparent : ApiConstants.oceanMid.withOpacity(0.1)),
                    ),
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
