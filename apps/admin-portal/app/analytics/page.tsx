'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  TrendingUp, Users, Building2, Package, Calendar,
  IndianRupee, Activity, CheckCircle, XCircle, Clock, BarChart3
} from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface Stats {
  totalLabs: number;
  pendingLabs: number;
  approvedLabs: number;
  totalUsers: number;
  totalBookings: number;
  totalTests: number;
  totalPackages: number;
  todayBookings: number;
  totalRevenue: number;
}

interface Booking {
  bookingId: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  city?: string;
  labId?: string;
}

const STATUS_COLOR: Record<string, string> = {
  Confirmed: 'bg-blue-500',
  Completed: 'bg-green-500',
  Pending: 'bg-yellow-400',
  Cancelled: 'bg-red-400',
};

const STATUS_LIGHT: Record<string, string> = {
  Confirmed: 'bg-blue-50 text-blue-700',
  Completed: 'bg-green-50 text-green-700',
  Pending: 'bg-yellow-50 text-yellow-700',
  Cancelled: 'bg-red-50 text-red-700',
};

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// Build last-7-days booking counts from raw bookings
function buildDailyData(bookings: Booking[]) {
  const days: { label: string; count: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayBookings = bookings.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    });
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      count: dayBookings.length,
      revenue: dayBookings.reduce((s, b) => s + (b.totalAmount || 0), 0),
    });
  }
  return days;
}

// Build last-6-months booking counts
function buildMonthlyData(bookings: Booking[]) {
  const months: { label: string; count: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setMonth(next.getMonth() + 1);
    const mb = bookings.filter((b) => {
      const t = new Date(b.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    });
    months.push({
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      count: mb.length,
      revenue: mb.reduce((s, b) => s + (b.totalAmount || 0), 0),
    });
  }
  return months;
}

function BarChart({
  data, valueKey, color, formatValue,
}: {
  data: { label: string; count: number; revenue: number }[];
  valueKey: 'count' | 'revenue';
  color: string;
  formatValue: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {data.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {formatValue(d[valueKey])}
            </div>
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max(pct, 4)}%`, background: color }} />
            <span className="text-xs text-gray-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'7d' | '6m'>('7d');
  const [metric, setMetric] = useState<'count' | 'revenue'>('count');

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:4000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:4000/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.status === 401 || bookingsRes.status === 401) { router.push('/login'); return; }
      const [sd, bd] = await Promise.all([statsRes.json(), bookingsRes.json()]);
      if (sd.success) setStats(sd.stats);
      if (bd.success) setBookings(bd.bookings);
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    fetchData();
  }, [fetchData, router]);

  // Derived data
  const chartData = view === '7d' ? buildDailyData(bookings) : buildMonthlyData(bookings);

  const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const totalForPie = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  // Top cities
  const cityCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    if (b.city) acc[b.city] = (acc[b.city] || 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCity = topCities[0]?.[1] || 1;

  // Recent bookings
  const recent = [...bookings].slice(0, 8);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Platform performance at a glance</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<IndianRupee className="w-6 h-6 text-green-600" />} label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="bg-green-50" />
          <StatCard icon={<Activity className="w-6 h-6 text-blue-600" />} label="Total Bookings" value={stats?.totalBookings || 0} sub={`${stats?.todayBookings || 0} today`} color="bg-blue-50" />
          <StatCard icon={<Users className="w-6 h-6 text-purple-600" />} label="Total Users" value={stats?.totalUsers || 0} color="bg-purple-50" />
          <StatCard icon={<Building2 className="w-6 h-6 text-orange-600" />} label="Active Labs" value={stats?.approvedLabs || 0} sub={`${stats?.pendingLabs || 0} pending`} color="bg-orange-50" />
        </div>

        {/* Chart + Status breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">Booking Trends</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {metric === 'count' ? 'Number of bookings' : 'Revenue generated'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Metric toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button onClick={() => setMetric('count')} className={`px-3 py-1.5 font-medium transition-colors ${metric === 'count' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Bookings</button>
                  <button onClick={() => setMetric('revenue')} className={`px-3 py-1.5 font-medium transition-colors ${metric === 'revenue' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Revenue</button>
                </div>
                {/* Period toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button onClick={() => setView('7d')} className={`px-3 py-1.5 font-medium transition-colors ${view === '7d' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>7D</button>
                  <button onClick={() => setView('6m')} className={`px-3 py-1.5 font-medium transition-colors ${view === '6m' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>6M</button>
                </div>
              </div>
            </div>
            {bookings.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-gray-300">
                <BarChart3 className="w-10 h-10" />
              </div>
            ) : (
              <BarChart
                data={chartData}
                valueKey={metric}
                color={metric === 'revenue' ? '#10b981' : '#3b82f6'}
                formatValue={(v) => metric === 'revenue' ? `₹${v.toLocaleString('en-IN')}` : `${v} bookings`}
              />
            )}
          </div>

          {/* Booking status breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Booking Status</h2>
            {Object.keys(statusCounts).length === 0 ? (
              <div className="flex items-center justify-center h-36 text-gray-300 text-sm">No data</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${STATUS_COLOR[status] ?? 'bg-gray-400'}`}
                        style={{ width: `${(count / totalForPie) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{((count / totalForPie) * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top cities + secondary stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top cities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Top Cities</h2>
            {topCities.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-300 text-sm">No data</div>
            ) : (
              <div className="space-y-3">
                {topCities.map(([city, count], i) => (
                  <div key={city} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">{city}</span>
                        <span className="text-xs font-semibold text-gray-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${(count / maxCity) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">Platform Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Tests', value: stats?.totalTests || 0, icon: <Activity className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
                { label: 'Total Packages', value: stats?.totalPackages || 0, icon: <Package className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50' },
                { label: 'Approved Labs', value: stats?.approvedLabs || 0, icon: <CheckCircle className="w-4 h-4 text-green-500" />, bg: 'bg-green-50' },
                { label: 'Pending Labs', value: stats?.pendingLabs || 0, icon: <Clock className="w-4 h-4 text-yellow-500" />, bg: 'bg-yellow-50' },
                { label: 'Cancelled', value: statusCounts['Cancelled'] || 0, icon: <XCircle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50' },
                { label: "Today's Bookings", value: stats?.todayBookings || 0, icon: <Calendar className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-50' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">{item.icon}<span className="text-xs text-gray-500">{item.label}</span></div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent bookings table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          {recent.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-300">
              <BarChart3 className="w-10 h-10" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Booking ID</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">City</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">#{b.bookingId}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">{b.city || '—'}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">₹{(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LIGHT[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
