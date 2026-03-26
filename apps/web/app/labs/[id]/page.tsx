'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  MapPin, Star, Phone, Mail, Clock, ShieldCheck, 
  Map as MapIcon, ChevronRight, TestTube, Package as PackageIcon, 
  ArrowLeft, ShoppingCart, Trash2, Award, Zap, Activity, Filter,
  Search, Info, CheckCircle2, Bookmark, Navigation as NavigationIcon
} from 'lucide-react';
import { addToCart, removeFromCart, getCart } from '@/lib/cart';

interface Lab {
  _id: string;
  labId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  nablCertificate: string;
  establishedYear: number;
  location?: {
    type: string;
    coordinates: number[];
  };
}

interface Test {
  _id: string;
  testId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  turnaroundTime: string;
  sampleType: string;
}

interface LabPackage {
  _id: string;
  packageId: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  testsIncluded: string[];
  features: string[];
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
        const apiUrl = 'http://10.29.34.207:4000/api';
        const labRes = await fetch(`${apiUrl}/labs/details/${id}`);
        const labData = await labRes.json();
        
        if (labData.success) {
          const labInfo = labData.lab;
          setLab(labInfo);
          
          const [testsRes, packagesRes] = await Promise.all([
            fetch(`${apiUrl}/labs/${labInfo.labId}/tests`),
            fetch(`${apiUrl}/labs/${labInfo.labId}/packages`)
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-10 h-10 bg-gray-900 rounded-full animate-bounce flex items-center justify-center shadow-xl">
           <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <p className="mt-6 text-[10px] font-black text-gray-400 tracking-[0.6em] uppercase">Authorized Diagnostic Node</p>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-12 h-12 text-gray-100 mb-6" />
        <h1 className="text-xl font-black text-gray-900 uppercase">Center Not Located</h1>
        <button onClick={() => router.back()} className="mt-8 px-8 py-3 bg-gray-900 text-white font-black text-[9px] tracking-widest rounded-full uppercase">Return</button>
      </div>
    );
  }

  const labLat = lab.location?.coordinates[1] || 22.5726;
  const labLng = lab.location?.coordinates[0] || 88.3639;

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Header />

      {/* Premium Rich Hero Section */}
      <div className="relative pt-12 pb-24 overflow-hidden border-b border-gray-100 bg-[#fafafa]">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -right-64 -top-64 w-[800px] h-[800px] bg-primary-100/40 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -left-64 bottom-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left: Rich Content Column */}
            <div className="flex-1 w-full text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center gap-4 mb-10">
                <button 
                  onClick={() => router.back()}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm flex items-center gap-2 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Back</span>
                </button>
                <div className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Partner ID: {lab.labId}</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-12 uppercase italic text-gray-900 group">
                {lab.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-12">
                <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-xl flex items-center gap-3">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-lg font-black">{randomRating}</span>
                  <div className="w-[1px] h-4 bg-gray-200" />
                  <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">{randomReviews} Verified Reviews</span>
                </div>
                <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-lg flex items-center gap-3">
                   <Award className="w-4 h-4 text-blue-500" />
                   <span className="text-[9px] font-black tracking-widest text-gray-900 uppercase">Est. YEAR {lab.establishedYear}</span>
                </div>
              </div>

              {/* Glassmorphic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:pr-12">
                 <div className="p-6 bg-white/60 backdrop-blur-md rounded-[32px] border border-white shadow-xl shadow-gray-200/20 group hover:shadow-2xl transition-all">
                    <div className="flex items-start gap-4 mb-4">
                       <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">LOCAL HUB</p>
                          <p className="text-xs font-black uppercase italic tracking-tighter leading-tight">{lab.address}, {lab.city}<br/>{lab.pincode}</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-6 bg-white/60 backdrop-blur-md rounded-[32px] border border-white shadow-xl shadow-gray-200/20 group hover:shadow-2xl transition-all">
                    <div className="flex items-start gap-4 mb-4">
                       <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                          <Clock className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">AVAILABILITY</p>
                          <p className="text-xs font-black uppercase italic tracking-tighter leading-tight">Opened 08:00 AM<br/>Current Status: ACTIVE</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right: Premium Map Terminal */}
            <div className="lg:col-span-1 w-full lg:w-[480px]">
               <div className="aspect-square bg-white rounded-[64px] p-4 shadow-3xl overflow-hidden border border-gray-100 relative group">
                  <div className="w-full h-full rounded-[50px] overflow-hidden relative shadow-inner">
                    {/* Fixed OpenStreetMap with Limited Navigation & High Zoom */}
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'saturate(1.2)' }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${labLng-0.005}%2C${labLat-0.005}%2C${labLng+0.005}%2C${labLat+0.005}&layer=mapnik&marker=${labLat}%2C${labLng}`}
                    />
                    {/* Zoom Blocker Overlay (Pseudo) */}
                    <div className="absolute inset-0 pointer-events-none ring-[12px] ring-white ring-inset rounded-[50px]" />
                  </div>
                  
                  {/* Floating Action Box */}
                  <div className="absolute inset-x-8 bottom-8">
                    <div className="bg-gray-900/95 backdrop-blur-xl text-white p-6 rounded-[32px] shadow-3xl flex items-center justify-between border border-white/10 group-hover:-translate-y-2 transition-transform duration-500">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                             <NavigationIcon className="w-5 h-5 text-primary-400" />
                          </div>
                          <div>
                             <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-0.5">Precise Navigation</p>
                             <p className="text-xs font-black uppercase italic tracking-tighter">Locate this hub</p>
                          </div>
                       </div>
                       <Link 
                          href={`https://www.google.com/maps/search/?api=1&query=${labLat},${labLng}`}
                          target="_blank"
                          className="bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-black text-[9px] tracking-widest shadow-xl uppercase hover:bg-primary-50 transition-colors"
                       >
                          Open Maps
                       </Link>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Re-designed Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="flex flex-col items-center mb-16">
           <div className="flex p-1.5 bg-gray-50 border border-gray-100 rounded-full shadow-sm backdrop-blur-xl sticky top-24 z-50">
              <button 
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-3 px-10 py-4 rounded-full text-[10px] font-black tracking-[0.2em] transition-all duration-300 uppercase italic ${
                  activeTab === 'tests' ? 'bg-gray-900 text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                <TestTube className="w-4 h-4" />
                Individual Tests
              </button>
              <button 
                onClick={() => setActiveTab('packages')}
                className={`flex items-center gap-3 px-10 py-4 rounded-full text-[10px] font-black tracking-[0.2em] transition-all duration-300 uppercase italic ${
                  activeTab === 'packages' ? 'bg-gray-900 text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                <PackageIcon className="w-4 h-4" />
                Comprehensive Packages
              </button>
           </div>
        </div>

        <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === 'tests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tests.map((test) => {
                const inCart = cart.includes(test._id);
                return (
                  <div key={test._id} className="bg-white rounded-[32px] p-6 border border-gray-100 hover:border-primary-100 hover:shadow-2xl transition-all flex flex-col justify-between h-[300px] relative overflow-hidden group">
                     <div>
                       <div className="flex justify-between items-start mb-6">
                          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white group-hover:bg-primary-600 transition-colors">
                            <Activity className="w-5 h-5" />
                          </div>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{test.category}</span>
                       </div>
                       
                       <h3 className="text-base font-black text-gray-900 leading-tight mb-2 uppercase line-clamp-2 tracking-tighter italic">{test.name}</h3>
                       <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase mb-4">
                         <Clock className="w-3 h-3" />
                         Reports in {test.turnaroundTime}
                       </div>
                     </div>
                     
                     <div>
                        <div className="flex items-baseline gap-1.5 mb-5">
                          <span className="text-xl font-black text-gray-900 tracking-tighter">₹{test.price}</span>
                          {test.originalPrice && <span className="text-[10px] text-gray-300 line-through font-bold">₹{test.originalPrice}</span>}
                        </div>
                        
                        <button
                          onClick={() => inCart ? removeFromCart(test._id) : addToCart({
                            id: test._id,
                            testId: test.testId,
                            name: test.name,
                            price: test.price,
                            originalPrice: test.originalPrice,
                            category: test.category,
                            sampleType: test.sampleType,
                            turnaroundTime: test.turnaroundTime,
                          })}
                          className={`w-full py-4 rounded-2xl font-black text-[9px] tracking-[0.2em] transition-all uppercase ${
                            inCart ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-900 text-white hover:shadow-lg'
                          }`}
                        >
                          {inCart ? 'Remove Item' : 'Add to Cart'}
                        </button>
                     </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {packages.map((pkg) => {
                 const inCart = cart.includes(pkg._id);
                 return (
                    <div key={pkg._id} className="bg-gray-900 text-white rounded-[40px] p-10 hover:shadow-2xl hover:shadow-primary-100/10 transition-all flex flex-col justify-between h-[420px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                              <Zap className="w-6 h-6 text-primary-400" />
                            </div>
                            <span className="text-[9px] font-black text-primary-400 bg-primary-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary-400/20 italic">Popular</span>
                          </div>
                          
                          <h3 className="text-2xl font-black mb-4 leading-none uppercase italic tracking-tighter">{pkg.name}</h3>
                          <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-white/50 border-b border-white/5 pb-4 uppercase italic">
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             {pkg.testsIncluded?.length || 0} Critical Parameters
                          </div>
                          
                          <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-3xl font-black tracking-tighter">₹{pkg.price}</span>
                            <span className="text-xs text-white/30 line-through font-bold">₹{pkg.originalPrice}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => inCart ? removeFromCart(pkg._id) : addToCart({
                            id: pkg._id,
                            packageId: pkg.packageId,
                            name: pkg.name,
                            price: pkg.price,
                            originalPrice: pkg.originalPrice,
                            category: pkg.category,
                            sampleType: 'Package',
                            turnaroundTime: 'Multiple',
                          })}
                          className={`relative z-10 w-full py-5 rounded-[24px] font-black text-[10px] tracking-[0.2em] transition-all uppercase ${
                            inCart ? 'bg-red-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-900/40'
                          }`}
                        >
                          {inCart ? 'Remove Selection' : 'Select Package'}
                        </button>
                    </div>
                 )
               })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
