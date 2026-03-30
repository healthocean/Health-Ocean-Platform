'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  MapPin, Star, Clock, ShieldCheck, TestTube, Package as PackageIcon,
  ArrowLeft, ShoppingCart, Trash2, Award, Activity, CheckCircle2,
  Navigation as NavigationIcon, Phone,
} from 'lucide-react';
import { addToCart, removeFromCart, getCart } from '@/lib/cart';

interface Lab {
  _id: string; labId: string; name: string; email: string; phone: string;
  address: string; city: string; state: string; pincode: string; status: string;
  nablCertificate: string; establishedYear: number;
  location?: { type: string; coordinates: number[] };
}
interface Test {
  _id: string; testId: string; name: string; description: string;
  price: number; originalPrice?: number; category: string;
  turnaroundTime: string; sampleType: string;
}
interface LabPackage {
  _id: string; packageId: string; name: string; description: string;
  price: number; originalPrice: number; category: string;
  testsIncluded: string[]; features: string[];
}

export default function LabProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [lab, setLab] = useState<Lab | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'packages'>('tests');
  const [cart, setCart] = useState<string[]>([]);
  const [randomRating] = useState((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1));
  const [randomReviews] = useState(Math.floor(Math.random() * (1200 - 400) + 400));

  useEffect(() => {
    setCart(getCart().map(item => item.id));
    const handleCartChange = () => setCart(getCart().map(item => item.id));
    window.addEventListener('cart-change', handleCartChange);
    return () => window.removeEventListener('cart-change', handleCartChange);
  }, []);

  useEffect(() => {
    const fetchLabData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const labRes = await fetch(`${apiUrl}/labs/details/${id}`);
        const labData = await labRes.json();
        if (labData.success) {
          const labInfo = labData.lab;
          setLab(labInfo);
          const [testsRes, packagesRes] = await Promise.all([
            fetch(`${apiUrl}/labs/${labInfo.labId}/tests`),
            fetch(`${apiUrl}/labs/${labInfo.labId}/packages`),
          ]);
          const testsData = await testsRes.json();
          const packagesData = await packagesRes.json();
          setTests(testsData.tests || []);
          setPackages(packagesData.packages || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLabData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#caf0f8] to-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#caf0f8] border-t-[#0077b6] animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#0077b6]">Loading lab details...</p>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#caf0f8] to-white flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-12 h-12 text-[#90e0ef] mb-4" />
        <h1 className="text-xl font-bold text-[#03045e]">Lab Not Found</h1>
        <button onClick={() => router.back()} className="mt-6 px-6 py-2.5 bg-[#0077b6] text-white font-semibold rounded-xl hover:bg-[#03045e] transition-all">
          Go Back
        </button>
      </div>
    );
  }

  const labLat = lab.location?.coordinates[1] || 22.5726;
  const labLng = lab.location?.coordinates[0] || 88.3639;

  return (
    <main className="min-h-screen bg-[#f0fbff]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] pt-10 pb-20 px-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#90e0ef]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#caf0f8]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Back + badge */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-xs font-semibold transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#90e0ef]" />
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{lab.labId}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
                {lab.name}
              </h1>

              {/* Rating + Est */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-bold">{randomRating}</span>
                  <span className="text-white/50 text-xs">({randomReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl">
                  <Award className="w-4 h-4 text-[#90e0ef]" />
                  <span className="text-white text-xs font-semibold">Est. {lab.establishedYear}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-300 text-xs font-semibold">Open Now</span>
                </div>
              </div>

              {/* Info cards — glassmorphism */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#0077b6] rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Address</p>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed">{lab.address}, {lab.city}, {lab.pincode}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#00b4d8] rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Contact</p>
                  </div>
                  <p className="text-sm text-white font-medium">{lab.phone}</p>
                  <p className="text-xs text-white/50 mt-0.5">{lab.email}</p>
                </div>
              </div>
            </div>

            {/* Right — Map */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 shadow-2xl">
              <div className="rounded-2xl overflow-hidden h-72 relative">
                <iframe
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${labLng - 0.005}%2C${labLat - 0.005}%2C${labLng + 0.005}%2C${labLat + 0.005}&layer=mapnik&marker=${labLat}%2C${labLng}`}
                />
              </div>
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <div className="flex items-center gap-2">
                  <NavigationIcon className="w-4 h-4 text-[#90e0ef]" />
                  <span className="text-xs font-semibold text-white/70">{lab.city}, {lab.state}</span>
                </div>
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${labLat},${labLng}`}
                  target="_blank"
                  className="px-4 py-2 bg-white text-[#0077b6] text-xs font-bold rounded-xl hover:bg-[#caf0f8] transition-all"
                >
                  Open Maps
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-white border border-[#caf0f8] rounded-2xl shadow-sm gap-1">
            {(['tests', 'packages'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-[#0077b6] text-white shadow-md shadow-[#0077b6]/20'
                    : 'text-[#0077b6]/60 hover:text-[#0077b6] hover:bg-[#caf0f8]/40'
                }`}
              >
                {tab === 'tests' ? <TestTube className="w-4 h-4" /> : <PackageIcon className="w-4 h-4" />}
                {tab === 'tests' ? 'Individual Tests' : 'Health Packages'}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab ? 'bg-white/20' : 'bg-[#caf0f8]'
                }`}>
                  {tab === 'tests' ? tests.length : packages.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tests grid */}
        {activeTab === 'tests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tests.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-[#0077b6]/40">
                <TestTube className="w-10 h-10 mx-auto mb-3" />
                <p className="font-semibold">No tests available</p>
              </div>
            ) : tests.map((test) => {
              const inCart = cart.includes(test._id);
              const discount = test.originalPrice
                ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
                : 0;
              return (
                <div key={test._id} className="bg-white rounded-2xl border border-[#caf0f8] p-5 hover:shadow-lg hover:border-[#90e0ef] transition-all flex flex-col relative overflow-hidden group">
                  {discount > 0 && (
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl pointer-events-none">
                      <div className="absolute top-3 right-[-18px] w-24 bg-green-500 text-white text-[9px] font-bold py-1 text-center rotate-45 shadow-sm">
                        {discount}% OFF
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#0077b6] bg-[#caf0f8] px-2.5 py-1 rounded-full uppercase tracking-wider">{test.category}</span>
                    <div className="flex items-center gap-1 text-[10px] text-[#00b4d8] font-semibold">
                      <Clock className="w-3 h-3" /> {test.turnaroundTime}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#03045e] mb-1 leading-snug group-hover:text-[#0077b6] transition-colors line-clamp-2">{test.name}</h3>
                  <p className="text-xs text-[#0077b6]/50 mb-4 font-medium">Sample: {test.sampleType}</p>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#03045e]">₹{test.price}</span>
                      {test.originalPrice && <span className="text-sm text-gray-300 line-through">₹{test.originalPrice}</span>}
                    </div>
                    <button
                      onClick={() => inCart ? removeFromCart(test._id) : addToCart({
                        id: test._id, testId: test.testId, name: test.name,
                        price: test.price, originalPrice: test.originalPrice,
                        category: test.category, sampleType: test.sampleType,
                        turnaroundTime: test.turnaroundTime,
                      })}
                      className={`w-full py-3 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 ${
                        inCart
                          ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100'
                          : 'bg-[#0077b6] text-white hover:bg-[#03045e] shadow-md shadow-[#0077b6]/20'
                      }`}
                    >
                      {inCart ? <><Trash2 className="w-3.5 h-3.5" /> Remove</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Packages grid */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-[#0077b6]/40">
                <PackageIcon className="w-10 h-10 mx-auto mb-3" />
                <p className="font-semibold">No packages available</p>
              </div>
            ) : packages.map((pkg) => {
              const inCart = cart.includes(pkg._id);
              const discount = pkg.originalPrice
                ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                : 0;
              return (
                <div key={pkg._id} className="bg-gradient-to-br from-[#03045e] to-[#0077b6] rounded-2xl p-6 text-white flex flex-col relative overflow-hidden group hover:shadow-2xl hover:shadow-[#0077b6]/30 transition-all">
                  {discount > 0 && (
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl pointer-events-none">
                      <div className="absolute top-3 right-[-18px] w-24 bg-green-400 text-white text-[9px] font-bold py-1 text-center rotate-45 shadow-sm">
                        {discount}% OFF
                      </div>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-[#90e0ef] bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">{pkg.category}</span>
                  </div>
                  <h3 title={pkg.name} className="text-lg font-bold mb-2 leading-snug line-clamp-2">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#90e0ef]" />
                    {pkg.testsIncluded?.length || 0} tests included
                  </div>
                  {pkg.features?.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-3 mb-5 space-y-1.5">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                          <span className="w-4 h-4 bg-green-400/20 rounded-full flex items-center justify-center text-green-300 text-[9px]">✓</span>
                          {f}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold">₹{pkg.price}</span>
                      {pkg.originalPrice && <span className="text-sm text-white/30 line-through">₹{pkg.originalPrice}</span>}
                    </div>
                    <button
                      onClick={() => inCart ? removeFromCart(pkg._id) : addToCart({
                        id: pkg._id, packageId: pkg.packageId, name: pkg.name,
                        price: pkg.price, originalPrice: pkg.originalPrice,
                        category: pkg.category, sampleType: 'Package', turnaroundTime: 'Multiple',
                      })}
                      className={`w-full py-3 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 ${
                        inCart
                          ? 'bg-red-400/20 text-red-300 border border-red-400/30 hover:bg-red-400/30'
                          : 'bg-white text-[#0077b6] hover:bg-[#caf0f8] shadow-lg'
                      }`}
                    >
                      {inCart ? <><Trash2 className="w-3.5 h-3.5" /> Remove</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
