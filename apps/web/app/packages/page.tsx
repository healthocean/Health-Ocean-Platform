'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, Package, MapPin, ShoppingCart, Trash2, PackageCheck, Info } from 'lucide-react';
import { addToCart, removeFromCart, getCart } from '@/lib/cart';
import { useLocation } from '@/contexts/LocationContext';

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
  const { location: currentLocation } = useLocation();
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cart, setCart] = useState<string[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCart(getCart().map(item => item.id));
    const handleCartChange = () => setCart(getCart().map(item => item.id));
    window.addEventListener('cart-change', handleCartChange);
    return () => window.removeEventListener('cart-change', handleCartChange);
  }, []);

  const fetchPackages = useCallback(async (reset = false, overridePage?: number) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (currentLocation?.lat && currentLocation?.lng) {
        params.set('lat', currentLocation.lat.toString());
        params.set('lng', currentLocation.lng.toString());
      } else if (currentLocation?.pincode) {
        params.set('pincode', currentLocation.pincode);
      }
      params.set('radius', '50');
      params.set('page', reset ? '1' : (overridePage ?? page).toString());
      params.set('limit', '12');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages?${params}`);
      const data = await res.json();
      setPackages(prev => reset ? (data.packages ?? []) : [...prev, ...(data.packages ?? [])]);
      setTotalPages(data.totalPages ?? 1);

      if (categories.length === 1) {
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/meta/categories`);
        const catData = await catRes.json();
        setCategories(['All', ...(catData.categories ?? [])]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, currentLocation, page, categories.length]);

  // Reset on filter/location change
  useEffect(() => {
    setPage(1);
    fetchPackages(true);
  }, [searchQuery, selectedCategory, currentLocation]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPackages(false, nextPage);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadingMore, loading, page, totalPages]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#03045e] to-[#0077b6] rounded-[40px] p-10 text-white mb-10 group shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-black tracking-widest uppercase mb-4">
              <PackageCheck className="w-3.5 h-3.5 text-primary-400" />
              Verified Health Packages
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter leading-[0.9]">
              Comprehensive <br />
              <span className="text-primary-400">Health Checkups</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8">
              Full body profiles and specialized packages from certified laboratories nearby, delivered at your doorstep.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
          <Package className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
        </div>

        {/* Search & Location Info */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
            <input
              type="text"
              placeholder="Search for health packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-3xl shadow-sm focus:ring-4 focus:ring-primary-100 transition-all font-black text-gray-900 placeholder:text-gray-300 text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-full whitespace-nowrap text-sm font-black tracking-wider transition-all duration-300 ${selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-primary-600" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-sm border-2 border-dashed border-gray-100 p-12">
            <Package className="w-20 h-20 text-gray-100 mx-auto mb-6" />
            <p className="text-gray-900 text-2xl font-black tracking-tight">No Packages Found</p>
            <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">We couldn't find any health packages within 50km of your current location. Please try a different area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const inCart = cart.includes(pkg.id);
              const discount = pkg.originalPrice
                ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                : 0;

              return (
                <div key={pkg.id} className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 flex flex-col group relative overflow-hidden">
                  {discount > 0 && (
                    <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-[40px] pointer-events-none">
                      <div className="absolute top-4 right-[-22px] w-28 bg-green-500 text-white text-[10px] font-bold py-1.5 text-center rotate-45 shadow-md tracking-wider">
                        {discount}% OFF
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-primary-600 font-black text-[10px] tracking-widest uppercase mb-4">
                      <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                      {pkg.category}
                    </div>

                    <h3 title={pkg.name} className="text-xl font-black text-gray-900 mb-2 leading-[1.1] group-hover:text-primary-600 transition-colors line-clamp-2 overflow-hidden cursor-default">{pkg.name}</h3>

                    <div className="flex items-center gap-2 mb-6 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-bold truncate tracking-tight">{pkg.labName}{pkg.labCity ? `, ${pkg.labCity}` : ''}</span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-black text-gray-900 tracking-tighter underline decoration-primary-200 decoration-4 underline-offset-4">₹{pkg.price}</span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-300 line-through font-bold italic">₹{pkg.originalPrice}</span>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-3xl p-5 mb-8">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        Tests Included
                        <span className="bg-white text-gray-900 px-2.5 py-1 rounded-full text-[12px] shadow-sm">{pkg.testsIncluded?.length ?? 0}</span>
                      </p>
                      <div className="space-y-2">
                        {(pkg.features ?? []).slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-gray-600 group-hover:translate-x-1 transition-transform">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-[10px]">✓</div>
                            <span className="font-bold text-xs truncate uppercase tracking-tighter opacity-80">{f}</span>
                          </div>
                        ))}
                      </div>
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
                    className={`w-full py-5 rounded-[24px] font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-sm ${inCart
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-100'
                        : 'bg-[#0077b6] text-white hover:bg-[#03045e] hover:shadow-xl hover:translate-y-[-2px]'
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

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-10 mt-8 flex items-center justify-center">
          {loadingMore && (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#caf0f8] border-t-[#0077b6]" />
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-20 flex items-center gap-6 p-8 bg-blue-50/50 rounded-[40px] border-2 border-dashed border-blue-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-black text-blue-900 mb-1">Personalized Laboratory Network</h4>
            <p className="text-sm text-blue-700 font-medium opacity-80 max-w-2xl">
              Results are filtered within a 50km radius of your current location to ensure rapid home sample collection and timely report generation. Change your location above to explore labs in different areas.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
