import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../providers/cart_provider.dart';
import '../utils/app_toast.dart';
import '../widgets/test_card.dart';
import '../utils/constants.dart';
import 'test_details_screen.dart';

class TestsScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialGender;
  final String? initialOrgan;

  const TestsScreen({
    super.key,
    this.initialCategory,
    this.initialGender,
    this.initialOrgan,
  });

  @override
  State<TestsScreen> createState() => _TestsScreenState();
}

class _TestsScreenState extends State<TestsScreen> {
  final List<dynamic> _tests = [];
  bool _isLoading = true;
  bool _isMoreLoading = false;
  int _currentPage = 1;
  int _totalPages = 1;
  final int _limit = 10;
  
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  
  String _sortOption = 'None';
  late String _selectedCategory;
  late String? _selectedGender;
  late String? _selectedOrgan;

  final List<String> _categories = [
    'All', 
    'Full Body Checkups', 
    'Fever', 
    'Thyroid', 
    'Diabetes', 
    'Heart Health', 
    'Allergy Tests', 
    'Hair & Skin',
    'Men', 
    'Women'
  ];
  final List<String> _sortOptions = ['None', 'Price: Low to High', 'Price: High to Low'];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
    _selectedGender = widget.initialGender;
    _selectedOrgan = widget.initialOrgan;
    _loadInitialTests();
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
      _loadMoreTests();
    }
  }

  Future<void> _loadInitialTests() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _currentPage = 1;
      _tests.clear();
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final lat = prefs.getDouble('cached_lat')?.toString();
      final lng = prefs.getDouble('cached_lng')?.toString();
      final pincode = prefs.getString('cached_pincode');

      final data = await ApiService.getTests(
        page: _currentPage,
        limit: _limit,
        search: _searchController.text.trim(),
        category: _selectedCategory,
        sort: _sortOption,
        gender: _selectedGender,
        organ: _selectedOrgan,
        lat: lat,
        lng: lng,
        pincode: pincode,
      );
      if (mounted) {
        setState(() {
          _tests.addAll(data['tests'] ?? []);
          _totalPages = data['totalPages'] ?? 1;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _loadMoreTests() async {
    if (_isMoreLoading || !mounted) return;
    setState(() => _isMoreLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final lat = prefs.getDouble('cached_lat')?.toString();
      final lng = prefs.getDouble('cached_lng')?.toString();
      final pincode = prefs.getString('cached_pincode');

      final data = await ApiService.getTests(
        page: _currentPage + 1,
        limit: _limit,
        search: _searchController.text.trim(),
        category: _selectedCategory,
        sort: _sortOption,
        gender: _selectedGender,
        organ: _selectedOrgan,
        lat: lat,
        lng: lng,
        pincode: pincode,
      );
      if (mounted) {
        setState(() {
          _currentPage++;
          _tests.addAll(data['tests'] ?? []);
          _isMoreLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isMoreLoading = false);
    }
  }

  void _onSearch() {
    _loadInitialTests();
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
                hintText: 'Search tests...',
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
                : _tests.isEmpty
                    ? const Center(child: Text('No tests found', style: TextStyle(color: ApiConstants.oceanEnd)))
                    : RefreshIndicator(
                        onRefresh: _loadInitialTests,
                        child: ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16).copyWith(bottom: 110),
                          itemCount: _tests.length + (_isMoreLoading ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == _tests.length) {
                              return const Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                              );
                            }
                            final test = _tests[index];
                            final String testId = (test['_id'] ?? test['id'] ?? test['testId'] ?? test['packageId'] ?? '').toString();
                            final bool isInCart = cartProvider.isInCart(testId);

                            return TestCard(
                              test: test,
                              isInCart: isInCart,
                              onAddToCart: () {
                                cartProvider.addItem(test);
                                AppToast.show(context, '${test['name']} added to cart', type: ToastType.success);
                              },
                              onRemoveFromCart: () {
                                cartProvider.removeItem(testId);
                                AppToast.show(context, '${test['name']} removed from cart', type: ToastType.error);
                              },
                              onTap: () async {
                                final id = test['id']?.toString() ?? test['_id']?.toString() ?? '';
                                if (id.isEmpty) return;
                                try {
                                  final full = await ApiService.getTestById(id);
                                  if (!context.mounted) return;
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => TestDetailsScreen(test: full)),
                                  );
                                } catch (_) {
                                  if (!context.mounted) return;
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => TestDetailsScreen(test: test)),
                                  );
                                }
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
                _loadInitialTests();
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
                    Text(
                      _sortOption == 'None' || _sortOption == 'price_asc' || _sortOption == 'price_desc' ? 'Sort' : 'Sorted',
                      style: const TextStyle(color: ApiConstants.oceanEnd, fontWeight: FontWeight.bold, fontSize: 12),
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
                      _loadInitialTests();
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
