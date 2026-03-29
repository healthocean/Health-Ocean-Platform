'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const scootyIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

const userIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1239/1239525.png', // Modern Pin icon
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, {
      duration: 1.5,
    });
  }, [center, map]);
  return null;
}

interface LiveTrackingMapProps {
  bookingId: string;
}

export default function LiveTrackingMap({ bookingId }: LiveTrackingMapProps) {
  const [booking, setBooking] = useState<any>(null);
  const [phlebPos, setPhlebPos] = useState<[number, number] | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        setRoute(coords);
      }
    } catch (e) {
      console.error('OSRM Error:', e);
    }
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`);
        const data = await response.json();
        if (data.success) {
          setBooking(data.booking);

          let uPos: [number, number] | null = null;
          let pPos: [number, number] | null = null;

          if (data.booking.userLocation?.coordinates) {
            uPos = [data.booking.userLocation.coordinates[1], data.booking.userLocation.coordinates[0]];
            setUserPos(uPos);
          }

          if (data.booking.phlebotomistLocation?.coordinates) {
            pPos = [data.booking.phlebotomistLocation.coordinates[1], data.booking.phlebotomistLocation.coordinates[0]];
            setPhlebPos(pPos);
          }

          if (uPos && pPos) {
            fetchRoute(pPos, uPos);
          }
        }
      } catch (error) {
        console.error('Error fetching booking tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
    const interval = setInterval(fetchBooking, 5000); // Poll every 5 seconds for live tracking

    return () => clearInterval(interval);
  }, [bookingId]);

  if (loading || !userPos) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-900 font-black uppercase tracking-widest text-xs">Syncing Satellite Data...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = phlebPos || userPos;

  return (
    <div className="h-full w-full relative">
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Route Path */}
        {route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: '#0ea5e9', weight: 6, opacity: 0.8, lineJoin: 'round' }} />
        )}

        {/* Phlebotomist Marker */}
        {phlebPos && (
          <Marker position={phlebPos} icon={scootyIcon}>
            <Popup>
              <div className="font-bold">Technician</div>
            </Popup>
            <ChangeView center={phlebPos} />
          </Marker>
        )}

        {/* User Destination Marker */}
        <Marker position={userPos} icon={userIcon}>
          <Popup>
            <div className="font-bold font-black text-primary-600 uppercase tracking-widest text-[10px]">Your Location</div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Compact Info Card */}
      <div className="absolute bottom-10 left-10 z-[1000] bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-2xl p-6 border border-white/50 min-w-[340px] transition-all">
        <div className="flex items-center gap-5">
          <div className="bg-primary-50 p-4 rounded-[20px]">
            <img src="https://cdn-icons-png.flaticon.com/512/3198/3198336.png" className="w-9 h-9" alt="scooty" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1">Live Update</p>
            <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none">
              {booking?.status === 'Arrived' ? 'Arrived at your door' : 'Technician Approaching'}
            </h3>
          </div>
          <div className="text-right pl-5 border-l border-gray-100 flex flex-col justify-center">
            <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
              {phlebPos ? '4' : '??'}
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">mins away</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Healthy Connection</span>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 rounded-full">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none">REF: #{bookingId.slice(-6)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
