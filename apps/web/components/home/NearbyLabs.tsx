'use client';

import { MapPin, ArrowRight, Loader2, Star, Navigation as NavigationIcon, Map as MapIcon } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from '@/contexts/LocationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Lab {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
}

export default function NearbyLabs() {
  const router = useRouter();
  const { location, detectLocation, isLoading: isDetecting } = useLocation();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchNearbyLabs = useCallback(async (lat?: number, lng?: number, pincode?: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const params = new URLSearchParams();
      if (lat && lng) {
        params.set('lat', lat.toString());
        params.set('lng', lng.toString());
      } else if (pincode) {
        params.set('pincode', pincode);
      }
      params.set('radiusKm', '50');

      const res = await fetch(`${apiUrl}/labs/nearby/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setLabs(data.labs || []);
      } else {
        setError(data.message || 'No labs found in this area');
        setLabs([]);
      }
    } catch (err) {
      setError('Connection to server failed. Please ensure the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyLabs(location.lat, location.lng, location.pincode);
    }
  }, [location, fetchNearbyLabs]);

  return (
    <section id="nearby-labs" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-primary-100">
              <MapIcon className="w-3 h-3" />
              <span>DIAGNOSTIC NETWORK</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#03045e] tracking-tight leading-tight">
              Labs Near <span className="text-[#0077b6] underline decoration-[#90e0ef] underline-offset-4 decoration-4">{location?.city || 'You'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={detectLocation}
              disabled={isDetecting || loading}
              className="p-3 bg-[#caf0f8] hover:bg-[#90e0ef] rounded-xl text-[#0077b6] transition-all border border-[#90e0ef] disabled:opacity-50"
              title="Detect Location"
            >
              <NavigationIcon className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/tests"
              className="flex items-center gap-2 bg-[#0077b6] text-white px-6 py-3 rounded-[16px] font-black text-[10px] tracking-widest shadow-lg hover:bg-[#03045e] transition-all"
            >
              EXPLORE ALL
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-6 rounded-[28px] bg-red-50 border border-red-100 text-red-800 flex items-center gap-4 max-w-xl mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-black text-[10px] tracking-tighter uppercase mb-0.5">Location Note</p>
              <p className="text-[11px] opacity-70 font-bold">{error}</p>
            </div>
          </div>
        )}

        {/* Horizontal Scroll Layout - Compact */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-1 -mx-1"
          >
            {labs.length > 0 ? (
              labs.slice(0, 10).map((lab) => (
                <div
                  key={lab._id}
                  onClick={() => router.push(`/labs/${lab._id}`)}
                  className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-[32px] border border-gray-100 p-6 hover:shadow-xl hover:border-primary-100 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-[280px] cursor-pointer"
                >
                  {/* Local Group Item Decoration */}
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 -z-0 pointer-events-none group-hover:scale-150" />

                  <div className="relative z-10 w-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-[#0077b6] p-0.5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <div className="h-full w-full bg-[#caf0f8] rounded-[14px] flex items-center justify-center">
                          <span className="text-xl font-black text-[#03045e]">
                            {lab.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-[#caf0f8] text-[#0077b6] text-[9px] font-semibold shadow-sm group-hover:border-[#90e0ef] transition-all">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{lab.rating > 0 ? lab.rating.toFixed(1) : '4.5'}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-[#03045e] group-hover:text-[#0077b6] transition-colors mb-2 truncate tracking-tight">
                      {lab.name}
                    </h3>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#00b4d8]" />
                      <p className="text-[11px] font-medium text-[#0077b6]/70 line-clamp-2 leading-relaxed uppercase tracking-tight">
                        {lab.address}, {lab.city}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 w-full flex items-center justify-between pt-6 border-t border-[#caf0f8] mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-[#00b4d8] font-black mb-0.5">STATUS</span>
                      <span className="text-[10px] font-black text-[#0077b6] uppercase italic">Open until 8pm</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#caf0f8] group-hover:bg-[#0077b6] group-hover:text-white text-[#0077b6] flex items-center justify-center transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : !loading && !isDetecting && !error && (
              <div className="w-full text-center py-16 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center">
                <MapPin className="w-10 h-10 text-gray-200 mb-4" />
                <h3 className="text-xl font-semibold text-[#03045e] mb-2 tracking-tight">Locate Certified Partners</h3>
                <button
                  onClick={detectLocation}
                  className="mt-4 bg-[#0077b6] hover:bg-[#03045e] text-white px-8 py-3 rounded-xl font-black text-[10px] tracking-widest shadow-lg transition-all"
                >
                  SCAN MY AREA
                </button>
              </div>
            )}

            {/* Skeleton / Loading */}
            {(loading || isDetecting) && [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[280px] md:min-w-[320px] h-[280px] bg-white rounded-[32px] border border-gray-100 p-6 animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 bg-gray-100 rounded-2xl mb-6" />
                  <div className="h-5 w-3/4 bg-gray-100 rounded-full mb-3" />
                  <div className="h-4 w-1/2 bg-gray-50 rounded-full" />
                </div>
                <div className="h-10 w-full bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>

          {/* Fades */}
          <div className="absolute top-0 right-0 bottom-6 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
          <div className="absolute top-0 left-0 bottom-6 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none hidden md:block" />
        </div>
      </div>
    </section>
  );
}
