'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, MapPin, Building2, CheckCircle, Clock, XCircle, PauseCircle } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

// Dynamically import map (no SSR — Leaflet needs window)
const LabMap = dynamic(() => import('./LabMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  ),
});

interface Lab {
  labId: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  phone: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  location: { type: string; coordinates: number[] };
}

const LEGEND = [
  { status: 'Approved',  color: 'bg-green-500', icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" /> },
  { status: 'Pending',   color: 'bg-amber-400',  icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
  { status: 'Rejected',  color: 'bg-red-500',    icon: <XCircle className="w-3.5 h-3.5 text-red-500" /> },
  { status: 'Suspended', color: 'bg-gray-400',   icon: <PauseCircle className="w-3.5 h-3.5 text-gray-400" /> },
];

export default function LabMapPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchLabs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/labs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) setLabs(data.labs ?? []);
    } finally {
      setLoading(false);
    }
  }, [API, token, router]);

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    fetchLabs();
  }, [fetchLabs, router]);

  const filtered = statusFilter === 'All'
    ? labs
    : labs.filter(l => l.status === statusFilter);

  const withCoords = filtered.filter(l =>
    l.location?.coordinates?.[0] !== 0 || l.location?.coordinates?.[1] !== 0
  );

  const counts = {
    All: labs.length,
    Approved: labs.filter(l => l.status === 'Approved').length,
    Pending: labs.filter(l => l.status === 'Pending').length,
    Rejected: labs.filter(l => l.status === 'Rejected').length,
    Suspended: labs.filter(l => l.status === 'Suspended').length,
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full bg-gray-50">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap shrink-0">
          <button
            onClick={() => router.push('/labs')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Labs
          </button>

          <div className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <h1 className="text-base font-bold text-gray-900">Labs on Map</h1>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {(['All', 'Approved', 'Pending', 'Rejected', 'Suspended'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {s} ({counts[s as keyof typeof counts]})
              </button>
            ))}
          </div>
        </div>

        {/* Map + sidebar layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar — lab list */}
          <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 overflow-y-auto shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {withCoords.length} labs plotted
              </p>
              {filtered.length - withCoords.length > 0 && (
                <p className="text-xs text-gray-400">{filtered.length - withCoords.length} no location</p>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(lab => {
                const hasCoords = lab.location?.coordinates?.[0] !== 0 || lab.location?.coordinates?.[1] !== 0;
                return (
                  <div key={lab.labId} className={`px-4 py-3 ${!hasCoords ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {lab.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{lab.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />{lab.city}, {lab.state}
                        </p>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-auto ${
                        lab.status === 'Approved' ? 'bg-green-500' :
                        lab.status === 'Pending' ? 'bg-amber-400' :
                        lab.status === 'Rejected' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="absolute inset-0">
                <LabMap labs={withCoords} />
              </div>
            )}

            {/* Legend overlay */}
            <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Legend</p>
              {LEGEND.map(l => (
                <div key={l.status} className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${l.color} shrink-0`} />
                  <span className="text-xs text-gray-600 font-medium">{l.status}</span>
                </div>
              ))}
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-gray-900">{withCoords.length} labs on map</span>
              </div>
              <p className="text-xs text-gray-400">
                {statusFilter === 'All' ? 'All statuses' : statusFilter + ' only'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
