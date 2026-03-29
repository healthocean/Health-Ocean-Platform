'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Building2, Users, TestTube, TrendingUp, Clock, CheckCircle, AlertCircle, Package, CalendarCheck } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLabs: 0, pendingLabs: 0, approvedLabs: 0,
    totalUsers: 0, totalBookings: 0, totalTests: 0,
    totalRevenue: 0, todayBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    fetchStats();
    fetchRecentBookings();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) {
      console.error('Stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRecentBookings(data.bookings.slice(0, 5));
    } catch (e) {}
  };

  const STATUS_DOT: Record<string, string> = {
    Confirmed: 'bg-blue-500', 'In Progress': 'bg-yellow-500',
    Completed: 'bg-green-500', Cancelled: 'bg-red-500',
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor platform performance and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+{stats.pendingLabs} pending</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Laboratories</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLabs}</p>
            <p className="text-xs text-green-600 mt-2">↑ {stats.approvedLabs} approved</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Registered</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Today: {stats.todayBookings}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Revenue</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
          </div>
        </div>

        {/* Quick Actions + Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Pending Lab Approvals
            </h2>
            <p className="text-gray-600 mb-4">{stats.pendingLabs} laboratories waiting for verification</p>
            <button onClick={() => router.push('/labs')} className="btn bg-gradient-to-r from-red-500 to-red-600 text-white w-full">
              Review Pending Labs
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Bookings
            </h2>
            {recentBookings.length === 0 ? (
              <p className="text-gray-400 text-sm">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[b.status] ?? 'bg-gray-400'}`} />
                    <span className="text-gray-700 font-medium truncate">{b.name}</span>
                    <span className="text-gray-400 text-xs ml-auto shrink-0">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => router.push('/bookings')} className="mt-4 text-xs text-red-500 font-bold hover:underline flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5" /> View all bookings →
            </button>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">System Status</p>
              <p className="text-lg font-semibold text-green-600">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TestTube className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Tests</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalTests}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Today's Bookings</p>
              <p className="text-lg font-semibold text-gray-900">{stats.todayBookings}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
