'use client';

import { MapPin, ArrowRight, Loader2, Star, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Lab {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
}

export default function NearbyLabs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchNearbyLabs = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/labs/nearby/search?lat=${lat}&lng=${lng}&radiusKm=50`);
      const data = await res.json();
      if (data.success) {
        setLabs(data.labs);
      } else {
        setError(data.message || 'Failed to fetch labs');
      }
    } catch (err) {
      setError('Connection to server failed. Please ensure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setPermissionDenied(false);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchNearbyLabs(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
        } else {
          setError('Failed to detect your location. Please check your system settings.');
        }
      },
      { timeout: 10000 }
    );
  };

  return (
    <section id="nearby-labs" className="py-16 bg-gradient-to-b from-white to-sky-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-100/20 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
              <Star className="w-4 h-4 fill-primary-600" />
              <span>NABL Certified Labs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Labs Near You
            </h2>
            <p className="text-slate-600 mt-3 text-lg">
              We've partnered with the best diagnostic centers. Discover certified labs within a <span className="text-primary-600 font-bold">50km</span> radius of your current location.
            </p>
          </div>
          
          <button 
            onClick={handleGetLocation}
            disabled={loading}
            className="group relative flex items-center justify-center gap-3 bg-white border-2 border-primary-100 hover:border-primary-500 text-primary-600 px-6 py-3.5 rounded-2xl font-bold shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            )}
            <span>{labs.length > 0 ? 'Update Location' : 'Locate Nearby Labs'}</span>
          </button>
        </div>

        {permissionDenied && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold mb-1 font-inter">Location Access Denied</p>
              <p className="text-sm opacity-90 leading-relaxed font-inter">
                Please allow browser location permissions to see laboratories in your immediate vicinity. You can also manually search for labs in the search bar above.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4">
             <div className="p-2 bg-rose-100 rounded-lg">
              <Star className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="font-bold mb-1 font-inter">Oops! Something went wrong</p>
              <p className="text-sm opacity-90 leading-relaxed font-inter">{error}</p>
            </div>
          </div>
        )}

        {labs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {labs.map((lab, index) => (
              <div 
                key={lab._id} 
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-in fade-in slide-in-from-bottom-8 duration-500 bg-white rounded-3xl border border-slate-100 p-7 hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-500/5 transition-all group cursor-default"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-sky-400 p-0.5 shadow-lg group-hover:scale-110 transition-transform">
                    <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-primary-600 to-sky-500">
                        {lab.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{lab.rating > 0 ? lab.rating.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2 truncate">
                  {lab.name}
                </h3>
                
                <div className="flex items-start gap-2.5 text-slate-500 mb-6">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-slate-400" />
                  <p className="text-sm line-clamp-2 leading-relaxed font-inter">
                    {lab.address}, {lab.city}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">ESTIMATED</span>
                    <span className="text-sm font-bold text-slate-700">Open 08:00 - 20:00</span>
                  </div>
                  <button className="h-10 w-10 rounded-full bg-slate-50 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && !permissionDenied && !error && (
          <div className="relative group text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 hover:border-primary-300 transition-colors shadow-inner overflow-hidden">
            {/* Visual background for empty state */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-50/50 rounded-full blur-[100px] -z-10" />
            
            <div className="relative z-10">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 font-inter">Ready to discover nearby labs?</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-inter">
                Allow us to see your location and we'll show you certified labs within a 50km radius for faster home sample collection.
              </p>
              <button 
                onClick={handleGetLocation}
                className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto"
              >
                <Navigation className="w-5 h-5" />
                Find My Location
              </button>
            </div>
          </div>
        )}

        {loading && labs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <div className="relative mb-8">
              <div className="h-16 w-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-500 animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900 animate-pulse font-inter">Scanning the area...</p>
            <p className="text-slate-500 mt-2 font-inter">Seeking certified partners near you</p>
          </div>
        )}
      </div>
    </section>
  );
}
