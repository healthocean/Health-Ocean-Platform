'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Search, Mail, Phone, Calendar, MapPin, Clock,
  User, Package, CheckCircle, XCircle, AlertCircle,
  Loader2, Hash, IndianRupee, FileSearch
} from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

type Tab = 'user' | 'booking';

interface UserBooking {
  bookingId: string;
  appointmentDate?: string;
  date?: string;
  timeSlot?: string;
  location?: string;
  city?: string;
  totalAmount: number;
  total?: number;
  status: string;
}

interface UserResult {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  bookingsCount?: number;
  recentBookings?: UserBooking[];
}

interface BookingResult {
  _id: string;
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  date?: string;
  appointmentDate?: string;
  timeSlot?: string;
  address?: string;
  status: string;
  totalAmount: number;
  total?: number;
  labId?: string;
  testIds?: string[];
  packageIds?: string[];
  createdAt?: string;
  // enriched
  testNames?: string[];
  packageNames?: string[];
}

const STATUS: Record<string, { bg: string; ring: string; text: string; dot: string }> = {
  Confirmed:    { bg: 'bg-blue-50',   ring: 'ring-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  Completed:    { bg: 'bg-green-50',  ring: 'ring-green-200',  text: 'text-green-700',  dot: 'bg-green-500' },
  'In Progress':{ bg: 'bg-amber-50',  ring: 'ring-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  Pending:      { bg: 'bg-amber-50',  ring: 'ring-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  Cancelled:    { bg: 'bg-red-50',    ring: 'ring-red-200',    text: 'text-red-700',    dot: 'bg-red-500' },
};

function Badge({ status }: { status: string }) {
  const s = STATUS[status] ?? { bg: 'bg-gray-50', ring: 'ring-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.ring} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function InfoChip({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 min-w-0">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <span className="text-xs text-gray-600 truncate">{value}</span>
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('user');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [userResult, setUserResult] = useState<UserResult | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
  }, [router]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setQuery('');
    setError('');
    setHasSearched(false);
    setUserResult(null);
    setBookingResult(null);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) {
      setError(tab === 'user' ? 'Please enter an email or phone number.' : 'Please enter a booking ID.');
      return;
    }
    setSearching(true);
    setError('');
    setUserResult(null);
    setBookingResult(null);
    setHasSearched(false);

    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (tab === 'user') {
        const res = await fetch(`${API}/admin/users/search?query=${encodeURIComponent(q)}`, { headers });
        if (res.status === 401) { router.push('/login'); return; }
        if (res.status === 404) { setError('No user found with that email or phone number.'); return; }
        if (!res.ok) { setError('Something went wrong. Please try again.'); return; }
        const data = await res.json();
        if (data.success) setUserResult(data.user);
      } else {
        const res = await fetch(`${API}/bookings/${encodeURIComponent(q)}`, { headers });
        if (res.status === 401) { router.push('/login'); return; }
        if (res.status === 404) { setError('No booking found with that ID.'); return; }
        if (!res.ok) { setError('Something went wrong. Please try again.'); return; }
        const data = await res.json();
        if (data.success) {
          const booking: BookingResult = data.booking;

          // Resolve test names
          if (booking.testIds && booking.testIds.length > 0) {
            const names = await Promise.all(
              booking.testIds.map(async (id) => {
                try {
                  const r = await fetch(`${API}/tests/by-test-id/${encodeURIComponent(id)}`);
                  if (!r.ok) return id;
                  const d = await r.json();
                  return d.name ?? id;
                } catch { return id; }
              })
            );
            booking.testNames = names;
          }

          // Resolve package names
          if (booking.packageIds && booking.packageIds.length > 0) {
            const names = await Promise.all(
              booking.packageIds.map(async (id) => {
                try {
                  const r = await fetch(`${API}/packages/by-package-id/${encodeURIComponent(id)}`);
                  if (!r.ok) return id;
                  const d = await r.json();
                  return d.name ?? id;
                } catch { return id; }
              })
            );
            booking.packageNames = names;
          }

          setBookingResult(booking);
        }
      }
    } catch {
      setError('Failed to connect to server. Is the API running?');
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  };

  const completedCount = userResult?.recentBookings?.filter(b => b.status === 'Completed').length ?? 0;
  const totalSpend = userResult?.recentBookings?.reduce((s, b) => s + (b.totalAmount || b.total || 0), 0) ?? 0;

  return (
    <AdminLayout>
      <div className="min-h-full bg-gray-50">

        {/* Page header */}
        <div className="bg-white border-b border-gray-100 px-6 sm:px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <FileSearch className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Search</h1>
              <p className="text-xs text-gray-400 mt-0.5">Look up users or bookings instantly</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Segmented control */}
          <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex shadow-sm">
            {([
              { key: 'user',    label: 'User Search',   icon: <User className="w-4 h-4" />,        hint: 'by email or phone' },
              { key: 'booking', label: 'Booking Search', icon: <Hash className="w-4 h-4" />, hint: 'by booking ID' },
            ] as const).map(({ key, label, icon, hint }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  tab === key
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {icon}
                <span>{label}</span>
                <span className={`hidden sm:inline text-xs font-normal ${tab === key ? 'text-gray-400' : 'text-gray-400'}`}>
                  — {hint}
                </span>
              </button>
            ))}
          </div>

          {/* Search input */}
          <form onSubmit={handleSearch} className="space-y-3">
            <div className={`flex items-center bg-white rounded-2xl border-2 transition-all overflow-hidden shadow-sm ${
              error ? 'border-red-300' : 'border-gray-200 focus-within:border-red-400 focus-within:shadow-md focus-within:shadow-red-50'
            }`}>
              <div className="pl-4 pr-2 text-gray-400 shrink-0">
                {tab === 'user' ? <Mail className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={
                  tab === 'user'
                    ? 'Enter email address or phone number...'
                    : 'Enter booking ID (e.g. BK1234567890)...'
                }
                className="flex-1 px-2 py-4 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={searching}
                className="m-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0"
              >
                {searching
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Searching...</>
                  : <><Search className="w-4 h-4" />Search</>
                }
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </form>

          {/* Empty / idle state */}
          {!userResult && !bookingResult && !error && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                tab === 'user' ? 'bg-blue-50' : 'bg-purple-50'
              }`}>
                {tab === 'user'
                  ? <User className="w-7 h-7 text-blue-400" />
                  : <Hash className="w-7 h-7 text-purple-400" />
                }
              </div>
              <p className="text-gray-700 font-semibold text-base">
                {hasSearched ? 'No results found' : tab === 'user' ? 'Search for a user' : 'Search for a booking'}
              </p>
              <p className="text-sm text-gray-400 mt-1.5 max-w-xs">
                {hasSearched
                  ? 'Try a different search term or check for typos.'
                  : tab === 'user'
                    ? 'Enter an email address or phone number to find a user and their booking history.'
                    : 'Enter a booking ID to view full booking details.'
                }
              </p>
            </div>
          )}

          {/* ── USER RESULT ── */}
          {userResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold shrink-0">
                      {userResult.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">{userResult.name}</h2>
                      <p className="text-blue-200 text-sm">Registered User</p>
                    </div>
                    <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">Active</span>
                  </div>
                </div>
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoChip icon={<Mail className="w-3.5 h-3.5" />} value={userResult.email} />
                  <InfoChip icon={<Phone className="w-3.5 h-3.5" />} value={userResult.phone} />
                  <InfoChip icon={<Calendar className="w-3.5 h-3.5" />} value={`Joined ${new Date(userResult.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`} />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Bookings', value: userResult.bookingsCount ?? 0, color: 'text-gray-900' },
                  { label: 'Completed',      value: completedCount,                color: 'text-green-600' },
                  { label: 'Total Spend',    value: `₹${totalSpend.toLocaleString('en-IN')}`, color: 'text-blue-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Bookings table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-800">Booking History</h3>
                  </div>
                  <span className="text-xs text-gray-400">{userResult.recentBookings?.length ?? 0} records</span>
                </div>

                {userResult.recentBookings && userResult.recentBookings.length > 0 ? (
                  <>
                    {/* Desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                            <th className="px-5 py-3 text-left">Booking ID</th>
                            <th className="px-5 py-3 text-left">Date</th>
                            <th className="px-5 py-3 text-left">Location</th>
                            <th className="px-5 py-3 text-left">Status</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {userResult.recentBookings.map((b, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3.5 font-mono text-xs text-gray-600">#{b.bookingId}</td>
                              <td className="px-5 py-3.5 text-gray-600 text-xs">
                                {b.appointmentDate
                                  ? new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : b.date ?? '—'}
                              </td>
                              <td className="px-5 py-3.5 text-gray-500 text-xs">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {b.location || b.city || '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5"><Badge status={b.status} /></td>
                              <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                                ₹{(b.totalAmount || b.total || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile */}
                    <div className="sm:hidden divide-y divide-gray-50">
                      {userResult.recentBookings.map((b, i) => (
                        <div key={i} className="px-5 py-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-mono text-gray-600">#{b.bookingId}</p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : b.date ?? '—'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-bold text-gray-900">₹{(b.totalAmount || b.total || 0).toLocaleString('en-IN')}</span>
                            <Badge status={b.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-12 text-gray-300">
                    <Package className="w-10 h-10 mb-2" />
                    <p className="text-sm text-gray-400">No bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BOOKING RESULT ── */}
          {bookingResult && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Header banner */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="text-xl font-bold text-white font-mono">#{bookingResult.bookingId}</p>
                </div>
                <Badge status={bookingResult.status} />
              </div>

              {/* Patient row */}
              <div className="px-6 py-5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Patient</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {bookingResult.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bookingResult.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />{bookingResult.email}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />{bookingResult.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="px-6 py-5 border-b border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Date</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {(() => {
                        const raw = bookingResult.date || bookingResult.appointmentDate;
                        if (!raw) return '—';
                        return new Date(raw).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
                      })()}
                    </p>
                  </div>
                  {/* City */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">City</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {bookingResult.city || '—'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Time Slot */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Time Slot</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {bookingResult.timeSlot ? bookingResult.timeSlot.replace(/\s*-\s*/g, ' – ').trim() : '—'}
                    </p>
                  </div>
                  {/* Amount */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Amount</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      ₹{(bookingResult.totalAmount || bookingResult.total || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tests / Packages */}
              {((bookingResult.testIds?.length ?? 0) > 0 || (bookingResult.packageIds?.length ?? 0) > 0) && (
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(bookingResult.testIds?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Tests ({bookingResult.testIds!.length})
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {(bookingResult.testNames ?? bookingResult.testIds!).map((name, i) => (
                          <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                            <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-sm text-blue-800 font-medium">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(bookingResult.packageIds?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Packages ({bookingResult.packageIds!.length})
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {(bookingResult.packageNames ?? bookingResult.packageIds!).map((name, i) => (
                          <div key={i} className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2">
                            <Package className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-sm text-purple-800 font-medium">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Address */}
              {bookingResult.address && (
                <div className="px-6 pb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Address</p>
                  <p className="text-sm text-gray-600">{bookingResult.address}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
