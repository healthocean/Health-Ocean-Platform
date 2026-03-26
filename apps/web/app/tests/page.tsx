'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, ShoppingCart, TestTube, MapPin, Trash2 } from 'lucide-react';
import { addToCart, removeFromCart, getCart } from '@/lib/cart';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/contexts/LocationContext';

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
  const { location: currentLocation } = useLocation();
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
  }, [searchQuery, selectedCategory, currentLocation]);

  useEffect(() => {
    if (page > 1) fetchTests(false);
  }, [page, currentLocation]);

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
      
      // Location Filtering
      if (currentLocation?.lat && currentLocation?.lng) {
        params.set('lat', currentLocation.lat.toString());
        params.set('lng', currentLocation.lng.toString());
      } else if (currentLocation?.pincode) {
        params.set('pincode', currentLocation.pincode);
      }
      params.set('radius', '50');

      params.set('page', reset ? '1' : page.toString());
      params.set('limit', '10');

      const res = await fetch(`http://10.29.34.207:4000/api/tests?${params}`);
      const data = await res.json();
      setTests(prev => reset ? (data.tests ?? []) : [...prev, ...(data.tests ?? [])]);
      setTotalPages(data.totalPages ?? 1);

      // Build category list from results if not yet loaded
      if (categories.length === 1) {
        const catRes = await fetch('http://10.29.34.207:4000/api/tests/meta/categories');
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
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 font-bold text-gray-900"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>


        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12">
            <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-900 text-xl font-black">No Tests Found in Your Area</p>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Try changing your location or increasing the search radius to find nearby labs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const inCart = cart.includes(test.id);
              const discount = test.originalPrice
                ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
                : 0;

              return (
                <div key={test.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 flex flex-col group">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-primary-50 text-primary-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        {test.category}
                      </div>
                      {discount > 0 && (
                        <span className="flex-shrink-0 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">{test.name}</h3>

                    {/* Lab name */}
                    <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-none">Provided by</p>
                        <p className="text-xs text-gray-900 font-black">{test.labName}{test.labCity ? `, ${test.labCity}` : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{test.price}</span>
                      {test.originalPrice && (
                        <span className="text-sm text-gray-400 line-through font-bold">₹{test.originalPrice}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Sample</p>
                        <p className="text-xs font-black text-gray-700 truncate">{test.sampleType}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Report</p>
                        <p className="text-xs font-black text-gray-700 truncate">{test.turnaroundTime}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => inCart ? removeFromCart(test.id) : handleAddToCart(test)}
                    className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                      inCart
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                        : 'bg-gray-900 text-white hover:bg-black hover:shadow-lg'
                    }`}
                  >
                    {inCart ? <Trash2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {inCart ? 'REMOVE FROM CART' : 'ADD TO CART'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && page < totalPages && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loadingMore}
              className="px-10 py-4 bg-white border-2 border-gray-100 text-gray-900 font-black text-xs tracking-widest rounded-2xl hover:border-gray-900 transition-all disabled:opacity-50"
            >
              {loadingMore ? 'LOADING...' : 'LOAD MORE TESTS'}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
