'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, ShoppingCart, TestTube, MapPin, Trash2 } from 'lucide-react';
import { addToCart, removeFromCart, getCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';

interface Test {
  id: string;
  testId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  turnaroundTime: string;
  sampleType: string;
  labId: string;
  labName: string;
  labCity: string;
}

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    setCart(getCart().map(item => item.id));
    const handleCartChange = () => setCart(getCart().map(item => item.id));
    window.addEventListener('cart-change', handleCartChange);
    return () => window.removeEventListener('cart-change', handleCartChange);
  }, []);

  useEffect(() => {
    fetchTests(true);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (page > 1) fetchTests(false);
  }, [page]);

  const fetchTests = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      params.set('page', reset ? '1' : page.toString());
      params.set('limit', '10');

      const res = await fetch(`http://localhost:4000/api/tests?${params}`);
      const data = await res.json();
      setTests(prev => reset ? (data.tests ?? []) : [...prev, ...(data.tests ?? [])]);
      setTotalPages(data.totalPages ?? 1);

      // Build category list from results if not yet loaded
      if (categories.length === 1) {
        const catRes = await fetch('http://localhost:4000/api/tests/meta/categories');
        const catData = await catRes.json();
        setCategories(['All', ...(catData.categories ?? [])]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const handleAddToCart = (test: Test) => {
    addToCart({
      id: test.id,
      testId: test.testId,
      name: test.name,
      price: test.price,
      originalPrice: test.originalPrice,
      category: test.category,
      sampleType: test.sampleType,
      turnaroundTime: test.turnaroundTime,
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm transition ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>


        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20">
            <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tests available yet.</p>
            <p className="text-gray-400 text-sm mt-1">Labs are adding tests — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const inCart = cart.includes(test.id);
              const discount = test.originalPrice
                ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
                : 0;

              return (
                <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900 leading-snug">{test.name}</h3>
                      {discount > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Lab name */}
                    <p className="text-xs text-primary-600 font-medium mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {test.labName}{test.labCity ? `, ${test.labCity}` : ''}
                    </p>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{test.description}</p>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">₹{test.price}</span>
                      {test.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{test.originalPrice}</span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Sample:</span>
                        <span className="font-medium">{test.sampleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Report in:</span>
                        <span className="font-medium">{test.turnaroundTime}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => inCart ? removeFromCart(test.id) : handleAddToCart(test)}
                    className={`w-full py-2.5 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2 ${
                      inCart
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {inCart ? <Trash2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {inCart ? 'Remove from Cart' : 'Add to Cart'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && page < totalPages && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loadingMore}
              className="px-8 py-3 border-2 border-primary-500 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading more tests...' : 'Load More Tests'}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
