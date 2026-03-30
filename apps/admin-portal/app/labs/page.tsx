'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Building2, CheckCircle, XCircle, Search, MapPin,
  Calendar, Shield, X, Phone, Mail, Hash, Clock,
  AlertCircle, ChevronRight, FlaskConical, ChevronDown, Loader2, Map
} from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface Lab {
  _id: string;
  labId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address?: string;
  pincode?: string;
  nablCertificate: string;
  licenseNumber: string;
  establishedYear: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  testsCount?: number;
  packagesCount?: number;
  createdAt: string;
}

const STATUS_STYLE = {
  Pending:   { pill: 'bg-amber-50 text-amber-700 ring-amber-200',   dot: 'bg-amber-400' },
  Approved:  { pill: 'bg-green-50 text-green-700 ring-green-200',   dot: 'bg-green-500' },
  Rejected:  { pill: 'bg-red-50 text-red-700 ring-red-200',         dot: 'bg-red-500'   },
  Suspended: { pill: 'bg-gray-100 text-gray-600 ring-gray-200',     dot: 'bg-gray-400'  },
};

function StatusBadge({ status }: { status: Lab['status'] }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

const TABS = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended'] as const;
type TabType = typeof TABS[number];

const PAGE_SIZE = 20;

export default function LabsPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabType>('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [cityOpen, setCityOpen] = useState(false);
  const [selected, setSelected] = useState<Lab | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleStatus = async (labId: string, status: 'Approved' | 'Rejected' | 'Suspended') => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/admin/labs/${labId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLabs(prev => prev.map(l => l.labId === labId ? { ...l, status } : l));
        if (selected?.labId === labId) setSelected(prev => prev ? { ...prev, status } : prev);
        showToast(`Lab ${status.toLowerCase()} successfully`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'All' ? labs.length : labs.filter(l => l.status === t).length;
    return acc;
  }, {} as Record<TabType, number>);

  // Unique sorted cities
  const cities = ['All', ...Array.from(new Set(labs.map(l => l.city).filter(Boolean))).sort()];

  const filtered = labs.filter(l => {
    const matchTab = tab === 'All' || l.status === tab;
    const matchCity = cityFilter === 'All' || l.city === cityFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [l.name, l.email, l.city, l.labId].some(v => v?.toLowerCase().includes(q));
    return matchTab && matchCity && matchSearch;
  });

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, tab, cityFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <AdminLayout>
      <div className="min-h-full bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">All Labs</h1>
                <p className="text-xs text-gray-400 mt-0.5">Review and manage laboratory registrations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => router.push('/labs/map')}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Map className="w-4 h-4" />
                See all labs on map
              </button>
              {/* Stat chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: 'Total', val: labs.length, cls: 'bg-gray-100 text-gray-700' },
                  { label: 'Pending', val: counts.Pending, cls: 'bg-amber-50 text-amber-700' },
                  { label: 'Approved', val: counts.Approved, cls: 'bg-green-50 text-green-700' },
                  { label: 'Rejected', val: counts.Rejected, cls: 'bg-red-50 text-red-700' },
                ].map(s => (
                  <span key={s.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${s.cls}`}>
                    {s.val} {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-4">

          {/* Search + city dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, city or Lab ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
            {/* City dropdown */}
            <div className="relative">
              <button
                onClick={() => setCityOpen(o => !o)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-all whitespace-nowrap min-w-[140px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{cityFilter === 'All' ? 'All Cities' : cityFilter}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
              </button>
              {cityOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="max-h-60 overflow-y-auto py-1">
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => { setCityFilter(city); setCityOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                          cityFilter === city
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {city === 'All' ? 'All Cities' : city}
                        {cityFilter === city && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  tab === t
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {t}
                <span className={`ml-1.5 ${tab === t ? 'text-gray-400' : 'text-gray-400'}`}>
                  ({counts[t]})
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Building2 className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No labs found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3.5 text-left">Laboratory</th>
                        <th className="px-5 py-3.5 text-left">Location</th>
                        <th className="px-5 py-3.5 text-left">NABL / License</th>
                        <th className="px-5 py-3.5 text-left">Registered</th>
                        <th className="px-5 py-3.5 text-left">Status</th>
                        <th className="px-5 py-3.5 text-left">Actions</th>
                        <th className="px-5 py-3.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {visible.map(lab => (
                        <tr key={lab._id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {lab.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{lab.name}</p>
                                <p className="text-xs text-gray-400">{lab.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {lab.city}, {lab.state}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs text-gray-600 font-mono">{lab.nablCertificate || '—'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{lab.licenseNumber || '—'}</p>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500">
                            {new Date(lab.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={lab.status} /></td>
                          <td className="px-5 py-4">
                            {lab.status === 'Pending' && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStatus(lab.labId, 'Approved')}
                                  disabled={actionLoading}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />Approve
                                </button>
                                <button
                                  onClick={() => handleStatus(lab.labId, 'Rejected')}
                                  disabled={actionLoading}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />Reject
                                </button>
                              </div>
                            )}
                            {lab.status === 'Approved' && (
                              <button
                                onClick={() => handleStatus(lab.labId, 'Suspended')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            )}
                            {lab.status === 'Suspended' && (
                              <button
                                onClick={() => handleStatus(lab.labId, 'Approved')}
                                disabled={actionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />Reinstate
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => setSelected(lab)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-50">
                  {visible.map(lab => (
                    <div
                      key={lab._id}
                      onClick={() => setSelected(lab)}
                      className="px-4 py-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                        {lab.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{lab.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{lab.city}, {lab.state}
                        </p>
                      </div>
                      <StatusBadge status={lab.status} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Result count + Load More */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-xs text-gray-400">
                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} labs
              </p>
              {hasMore && (
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-all hover:shadow-sm"
                >
                  <Loader2 className="w-4 h-4 text-gray-400" />
                  Load 20 more
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail slide-out panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">

            {/* Panel header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">Lab Details</h2>
              <div className="ml-auto"><StatusBadge status={selected.status} /></div>
            </div>

            <div className="p-5 space-y-5">

              {/* Lab identity */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selected.labId}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</p>
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />{selected.email}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />{selected.phone}
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                <div className="flex items-start gap-2.5 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{[selected.address, selected.city, selected.state, selected.pincode].filter(Boolean).join(', ')}</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Certifications</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">NABL Certificate</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />{selected.nablCertificate || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">License No.</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />{selected.licenseNumber || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Est. Year</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />{selected.establishedYear || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Registered</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                {selected.status === 'Pending' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatus(selected.labId, 'Approved')}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />Approve
                    </button>
                    <button
                      onClick={() => handleStatus(selected.labId, 'Rejected')}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />Reject
                    </button>
                  </div>
                )}
                {selected.status === 'Approved' && (
                  <button
                    onClick={() => handleStatus(selected.labId, 'Suspended')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Suspend Lab
                  </button>
                )}
                {selected.status === 'Suspended' && (
                  <button
                    onClick={() => handleStatus(selected.labId, 'Approved')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />Reinstate Lab
                  </button>
                )}
                {selected.status === 'Rejected' && (
                  <button
                    onClick={() => handleStatus(selected.labId, 'Approved')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />Approve Anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <AlertCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
