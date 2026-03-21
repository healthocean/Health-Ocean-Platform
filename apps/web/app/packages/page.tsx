'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, Package, MapPin, ShoppingCart, Trash2 } from 'lucide-react';
import { addToCart, removeFromCart, getCart } from '@/lib/cart';

interface LabPackage {
  id: string;
  packageId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  testsIncluded: string[];
  features: string[];
  labId: string;
  labName: string;
  labCity: string;
}

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<LabPackage[]>([]);
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
    fetchPackages(true);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (page > 1) fetchPackages(false);
  }, [page]);

  const fetchPackages = async (reset = false) => {
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

      const res = await fetch(`http://localhost:4000/api/packages?${params}`);
      const data = await res.json();
      setPackages(prev => reset ? (data.packages ?? []) : [...prev, ...(data.packages ?? [])]);
      setTotalPages(data.totalPages ?? 1);

      if (categories.length === 1) {
        const catRes = await fetch('http://localhost:4000/api/packages/meta/categories');
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Packages</h1>
          <p className="text-xl text-primary-100">Comprehensive health checkups from verified labs</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm transition ${selectedCategory === cat
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
        ) : packages.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No packages available yet.</p>
            <p className="text-gray-400 text-sm mt-1">Labs are adding packages — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const inCart = cart.includes(pkg.id);
              const discount = pkg.originalPrice
                ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                : 0;

              return (
                <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{pkg.name}</h3>

                    {/* Lab name */}
                    <p className="text-xs text-primary-600 font-medium mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pkg.labName}{pkg.labCity ? `, ${pkg.labCity}` : ''}
                    </p>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">₹{pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{pkg.originalPrice}</span>
                      )}
                      {discount > 0 && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 font-medium">
                      {pkg.testsIncluded?.length ?? 0} tests included
                    </p>

                    <div className="space-y-1 mb-4">
                      {(pkg.features ?? []).slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-green-600">✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                      {(pkg.features ?? []).length > 4 && (
                        <p className="text-sm text-primary-500">+{pkg.features.length - 4} more</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (inCart) {
                        removeFromCart(pkg.id);
                      } else {
                        addToCart({
                          id: pkg.id,
                          packageId: pkg.packageId,
                          name: pkg.name,
                          price: pkg.price,
                          originalPrice: pkg.originalPrice,
                          category: pkg.category,
                          sampleType: 'Package',
                          turnaroundTime: 'Multiple',
                        });
                      }
                    }}
                    className={`w-full py-2.5 mt-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2 ${
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
              {loadingMore ? 'Loading more packages...' : 'Load More Packages'}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
