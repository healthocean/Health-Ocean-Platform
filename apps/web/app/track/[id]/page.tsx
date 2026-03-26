'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, MapPin, Navigation } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Dynamically import the map component to avoid SSR issues with Leaflet
const LiveTrackingMap = dynamic(() => import('@/components/map/LiveTrackingMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading map engine...</p>
        </div>
    </div>
  )
});

export default function TrackPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const bookingId = params.id;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="w-full h-[calc(100vh-80px)] relative overflow-hidden">
         {/* Map Header Overlay */}
         <div className="absolute top-8 left-8 right-8 z-[1000] flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-4 pointer-events-auto">
               <button 
                 onClick={() => router.back()}
                 className="p-4 rounded-3xl bg-white shadow-2xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
               >
                 <ChevronLeft className="w-6 h-6 text-gray-900" />
               </button>
               <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-gray-100/50">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Live Tracking</h1>
                  <p className="text-sm font-bold text-primary-500 mt-1 uppercase tracking-widest leading-none">Booking #{bookingId}</p>
               </div>
            </div>
         </div>

         {/* Full Screen Map Container */}
         <div className="w-full h-full relative">
             <div className="absolute top-40 left-8 z-[1000] flex flex-col gap-3">
                 <button className="bg-white p-4 rounded-3xl shadow-2xl hover:bg-gray-50 border border-white transition-all active:scale-95" onClick={() => window.location.reload()}>
                     <Navigation className="w-6 h-6 text-gray-900" />
                 </button>
                 <button className="bg-white p-4 rounded-3xl shadow-2xl hover:bg-gray-50 border border-white transition-all active:scale-95" onClick={() => router.push('/profile')}>
                     <MapPin className="w-6 h-6 text-gray-900" />
                 </button>
             </div>
             
             {/* Live Map */}
             <LiveTrackingMap bookingId={bookingId} />
         </div>
      </div>
    </main>
  );
}
