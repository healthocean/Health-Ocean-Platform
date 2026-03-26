'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Building2, Users, TestTube, TrendingUp, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLabs: 0,
    pendingLabs: 0,
    approvedLabs: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalTests: 0,
    totalRevenue: 0,
    todayBookings: 0,
  });

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/login');
      return;
    }

    // Fetch stats from API
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:4000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
        {/* Page Header */}
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
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                +{stats.pendingLabs} pending
              </span>
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
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% this month</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Today: {stats.todayBookings}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2">↑ 8% this week</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                Revenue
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
            <p className="text-xs text-green-600 mt-2">↑ 15% this month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Pending Lab Approvals
            </h2>
            <p className="text-gray-600 mb-4">
              {stats.pendingLabs} laboratories waiting for verification
            </p>
            <button
              onClick={() => router.push('/labs')}
              className="btn bg-gradient-to-r from-red-500 to-red-600 text-white w-full"
            >
              Review Pending Labs
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">New lab registered: ABC Diagnostics</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">234 bookings today</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">15 new users registered</span>
              </div>
            </div>
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
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
              <p className="text-lg font-semibold text-green-600">+12%</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
