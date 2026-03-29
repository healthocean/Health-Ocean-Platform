'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { CalendarCheck, Search, MapPin, Clock, User, Filter } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface Booking {
  _id: string;
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  date: string;
  timeSlot: string;
  status: string;
  totalAmount: number;
  total: number;
  labId: string;
  createdAt: string;
  testIds: string[];
  packageIds: string[];
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-yellow-50 text-yellow-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    fetchBookings();
  }, [router]);

  useEffect(() => {
    let result = bookings;
    if (statusFilter !== 'All') result = result.filter(b => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.bookingId?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setFiltered(data.bookings);
      }
    } catch (e) {
      console.error('Fetch bookings error:', e);
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    All: bookings.length,
    Confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    'In Progress': bookings.filter(b => b.status === 'In Progress').length,
    Completed: bookings.filter(b => b.status === 'Completed').length,
    Cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h1>
          <p className="text-gray-600">Platform-wide booking management</p>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                statusFilter === status
                  ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
              }`}
            >
              {status} <span className="ml-1 opacity-70">({count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, booking ID, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <CalendarCheck className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No bookings found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left">Booking ID</th>
                    <th className="px-6 py-4 text-left">Patient</th>
                    <th className="px-6 py-4 text-left">Date & Slot</th>
                    <th className="px-6 py-4 text-left">City</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{b.bookingId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{b.name}</p>
                            <p className="text-xs text-gray-400">{b.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{b.date}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />{b.timeSlot}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />{b.city}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        ₹{(b.totalAmount ?? b.total ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map(b => (
                <div key={b._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{b.bookingId}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{b.city}</span>
                    <span className="font-bold text-gray-900">₹{(b.totalAmount ?? b.total ?? 0).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{b.date} · {b.timeSlot}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
