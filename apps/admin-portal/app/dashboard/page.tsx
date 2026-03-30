'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Building2, Users, Package, TestTube, IndianRupee,
  CalendarCheck, Clock, CheckCircle, XCircle,
  ArrowRight, MapPin, TrendingUp, Activity, ShieldCheck,
  Layers, BarChart2, Percent, AlertTriangle, Database,
  Server, AlertCircle, RefreshCw, Key,
} from 'lucide-react';
import { isAdminAuthenticated, getAdmin } from '@/lib/adminAuth';

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

interface HealthService {
  name: string;
  status: string;
  latency?: number;
  details?: string;
  error?: string;
  pending?: number;
  oldestDays?: number;
  last24h?: number;
  failureRate?: string;
  used?: string;
  total?: string;
  percent?: string;
  issues?: number;
}

interface HealthData {
  overall: string;
  timestamp: string;
  services: HealthService[];
}

function StatCard({
  icon, label, value, sub, subColor = 'text-gray-400', accent,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; subColor?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        {sub && <span className={`text-xs font-semibold ${subColor}`}>{sub}</span>}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalLabs: 0, pendingLabs: 0, approvedLabs: 0,
    totalUsers: 0, totalBookings: 0, totalTests: 0,
    totalPackages: 0, todayBookings: 0, totalRevenue: 0,
  });
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthError, setHealthError] = useState(false);
  const admin = typeof window !== 'undefined' ? getAdmin() : null;

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(false);
    try {
      const token = localStorage.getItem('adminToken');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(`${API}/admin/health`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success) setHealth(data.health);
      } else {
        setHealthError(true);
      }
    } catch (e: any) {
      console.error('Health check failed:', e);
      setHealthError(true);
      // Set fallback degraded state
      setHealth({
        overall: 'critical',
        timestamp: new Date().toISOString(),
        services: [
          { name: 'API Server', status: 'down', error: e.name === 'AbortError' ? 'Timeout' : 'Unreachable' },
        ],
      });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API}/admin/stats`, { headers })
      .then(r => r.json())
      .then(data => { if (data.success) setStats(data.stats); })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchHealth();

    // Refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [router, API]);

  const labApprovalRate = stats.totalLabs > 0
    ? Math.round((stats.approvedLabs / stats.totalLabs) * 100)
    : 0;

  const formatRevenue = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'normal') return { text: 'text-green-600', bg: 'bg-green-500', dot: 'bg-green-500' };
    if (status === 'degraded' || status === 'warning' || status === 'slow') return { text: 'text-amber-600', bg: 'bg-amber-400', dot: 'bg-amber-400' };
    if (status === 'critical' || status === 'down' || status === 'error') return { text: 'text-red-600', bg: 'bg-red-500', dot: 'bg-red-500' };
    return { text: 'text-gray-500', bg: 'bg-gray-400', dot: 'bg-gray-400' };
  };

  const getOverallStatus = () => {
    if (healthError || !health) return { label: 'Unknown', color: 'text-gray-500', icon: <AlertCircle className="w-4 h-4" /> };
    if (health.overall === 'healthy') return { label: 'Operational', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4 text-green-500" /> };
    if (health.overall === 'degraded') return { label: 'Degraded', color: 'text-amber-600', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> };
    return { label: 'Critical', color: 'text-red-600', icon: <XCircle className="w-4 h-4 text-red-500" /> };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-red-500" />
            <p className="text-sm text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {admin?.name?.split(' ')[0] ?? 'Admin'} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className={`flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 shadow-sm ${
            overallStatus.color === 'text-green-600' ? 'border-green-100' :
            overallStatus.color === 'text-amber-600' ? 'border-amber-100' : 'border-red-100'
          }`}>
            {overallStatus.icon}
            <span className={`text-sm font-medium ${overallStatus.color}`}>{overallStatus.label}</span>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Key Metrics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Building2 className="w-5 h-5 text-blue-600" />}
            label="Total Labs"
            value={stats.totalLabs}
            sub={`${stats.pendingLabs} pending`}
            subColor={stats.pendingLabs > 0 ? 'text-amber-500' : 'text-gray-400'}
            accent="bg-blue-50"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-violet-600" />}
            label="Registered Users"
            value={stats.totalUsers.toLocaleString()}
            accent="bg-violet-50"
          />
          <StatCard
            icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
            label="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            sub={`+${stats.todayBookings} today`}
            subColor="text-emerald-500"
            accent="bg-emerald-50"
          />
          <StatCard
            icon={<IndianRupee className="w-5 h-5 text-orange-600" />}
            label="Total Revenue"
            value={formatRevenue(stats.totalRevenue)}
            accent="bg-orange-50"
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Operations Overview</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            label="Approved Labs"
            value={stats.approvedLabs}
            sub={`${labApprovalRate}% rate`}
            subColor="text-green-500"
            accent="bg-green-50"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            label="Pending Review"
            value={stats.pendingLabs}
            sub={stats.pendingLabs > 0 ? 'Needs action' : 'All clear'}
            subColor={stats.pendingLabs > 0 ? 'text-amber-500' : 'text-green-500'}
            accent="bg-amber-50"
          />
          <StatCard
            icon={<TestTube className="w-5 h-5 text-cyan-600" />}
            label="Active Tests"
            value={stats.totalTests}
            accent="bg-cyan-50"
          />
          <StatCard
            icon={<Package className="w-5 h-5 text-pink-600" />}
            label="Packages"
            value={stats.totalPackages}
            accent="bg-pink-50"
          />
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Platform Overview — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Today's snapshot */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">Today's Snapshot</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Today's Bookings",
                    value: stats.todayBookings,
                    icon: <CalendarCheck className="w-5 h-5 text-emerald-600" />,
                    bg: 'bg-emerald-50',
                    note: stats.todayBookings > 0 ? 'Active today' : 'None yet',
                    noteColor: stats.todayBookings > 0 ? 'text-emerald-500' : 'text-gray-400',
                  },
                  {
                    label: 'Pending Labs',
                    value: stats.pendingLabs,
                    icon: <Clock className="w-5 h-5 text-amber-600" />,
                    bg: 'bg-amber-50',
                    note: stats.pendingLabs > 0 ? 'Needs review' : 'All clear',
                    noteColor: stats.pendingLabs > 0 ? 'text-amber-500' : 'text-green-500',
                  },
                  {
                    label: 'Approval Rate',
                    value: `${labApprovalRate}%`,
                    icon: <Percent className="w-5 h-5 text-violet-600" />,
                    bg: 'bg-violet-50',
                    note: labApprovalRate >= 70 ? 'Healthy' : 'Low',
                    noteColor: labApprovalRate >= 70 ? 'text-green-500' : 'text-red-400',
                  },
                ].map(({ label, value, icon, bg, note, noteColor }) => (
                  <div key={label} className={`rounded-xl p-4 ${bg} flex flex-col gap-2`}>
                    <div className="flex items-center justify-between">
                      {icon}
                      <span className={`text-xs font-semibold ${noteColor}`}>{note}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content inventory */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">Content Inventory</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Lab Tests', value: stats.totalTests, icon: <TestTube className="w-4 h-4 text-cyan-600" />, bg: 'bg-cyan-50', desc: 'Across all labs' },
                  { label: 'Packages', value: stats.totalPackages, icon: <Package className="w-4 h-4 text-pink-600" />, bg: 'bg-pink-50', desc: 'Bundled offerings' },
                  { label: 'Total Labs', value: stats.totalLabs, icon: <Building2 className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50', desc: `${stats.approvedLabs} approved` },
                  { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: <Users className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50', desc: 'Registered accounts' },
                ].map(({ label, value, icon, bg, desc }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{value}</p>
                      <p className="text-xs font-medium text-gray-500">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue summary */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold">Revenue Summary</h2>
                </div>
                <button
                  onClick={() => router.push('/analytics')}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Full analytics <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-xl font-bold">{formatRevenue(stats.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Bookings</p>
                  <p className="text-xl font-bold">{stats.totalBookings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Avg. per Booking</p>
                  <p className="text-xl font-bold">
                    {stats.totalBookings > 0
                      ? formatRevenue(Math.round(stats.totalRevenue / stats.totalBookings))
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Pending Labs CTA */}
            <div className={`rounded-2xl border p-5 ${stats.pendingLabs > 0 ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stats.pendingLabs > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                  {stats.pendingLabs > 0
                    ? <Clock className="w-4 h-4 text-amber-600" />
                    : <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lab Approvals</p>
                  <p className={`text-xs ${stats.pendingLabs > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                    {stats.pendingLabs > 0 ? `${stats.pendingLabs} awaiting review` : 'All caught up'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/labs?status=Pending')}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                  stats.pendingLabs > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {stats.pendingLabs > 0 ? 'Review Pending Labs' : 'View All Labs'}
              </button>
            </div>

            {/* Lab breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-gray-400" />
                Lab Status Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Approved', count: stats.approvedLabs, color: 'bg-green-500' },
                  { label: 'Pending',  count: stats.pendingLabs,  color: 'bg-amber-400' },
                  { label: 'Other',    count: Math.max(0, stats.totalLabs - stats.approvedLabs - stats.pendingLabs), color: 'bg-gray-300' },
                ].map(({ label, count, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">{label}</span>
                      <span className="text-gray-700 font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: stats.totalLabs > 0 ? `${(count / stats.totalLabs) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'View Labs on Map', icon: <MapPin className="w-4 h-4" />, href: '/labs/map' },
                  { label: 'Analytics', icon: <TrendingUp className="w-4 h-4" />, href: '/analytics' },
                  { label: 'Search Users', icon: <Users className="w-4 h-4" />, href: '/search' },
                ].map(({ label, icon, href }) => (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
                  >
                    <span className="text-gray-400">{icon}</span>
                    {label}
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Platform Health Section */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Platform Health Monitor</h2>
              {health && (
                <span className="text-xs text-gray-400">
                  Updated {new Date(health.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <button
              onClick={fetchHealth}
              disabled={healthLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {healthLoading && !health ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500" />
                <p className="text-xs text-gray-400">Running health checks...</p>
              </div>
            </div>
          ) : healthError && !health ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <XCircle className="w-10 h-10 mb-2" />
              <p className="text-sm font-medium">Unable to fetch health data</p>
              <p className="text-xs text-gray-400 mt-1">API may be unreachable</p>
            </div>
          ) : health ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {health.services.map((service, idx) => {
                  const colors = getStatusColor(service.status);
                  const isHealthy = service.status === 'healthy' || service.status === 'normal';
                  const isWarning = service.status === 'degraded' || service.status === 'warning' || service.status === 'slow';
                  const isCritical = service.status === 'critical' || service.status === 'down' || service.status === 'error';

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 transition-all ${
                        isCritical ? 'bg-red-50 border-red-200' :
                        isWarning ? 'bg-amber-50 border-amber-200' :
                        'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {service.name === 'Database' && <Database className="w-4 h-4 text-gray-500" />}
                          {service.name === 'API Server' && <Server className="w-4 h-4 text-gray-500" />}
                          {service.name === 'Data Integrity' && <ShieldCheck className="w-4 h-4 text-gray-500" />}
                          {service.name === 'Lab Approval Queue' && <Clock className="w-4 h-4 text-gray-500" />}
                          {service.name === 'Booking System' && <CalendarCheck className="w-4 h-4 text-gray-500" />}
                          {service.name === 'Authentication System' && <Key className="w-4 h-4 text-gray-500" />}
                          <span className="text-xs font-semibold text-gray-700">{service.name}</span>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-bold ${colors.text}`}>
                          <span className={`w-2 h-2 rounded-full ${colors.dot} ${isHealthy ? 'animate-pulse' : ''}`} />
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                      </div>

                      {/* Service-specific details */}
                      <div className="space-y-1.5">
                        {service.latency !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Response Time</span>
                            <span className={`font-semibold ${
                              service.latency < 100 ? 'text-green-600' :
                              service.latency < 500 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {service.latency}ms
                            </span>
                          </div>
                        )}
                        {service.details && (
                          <p className="text-xs text-gray-500">{service.details}</p>
                        )}
                        {service.error && (
                          <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {service.error}
                          </p>
                        )}
                        {service.pending !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Pending Items</span>
                            <span className="font-semibold text-gray-700">{service.pending}</span>
                          </div>
                        )}
                        {service.oldestDays !== undefined && service.oldestDays > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Oldest Pending</span>
                            <span className={`font-semibold ${service.oldestDays > 7 ? 'text-red-600' : 'text-gray-700'}`}>
                              {service.oldestDays}d ago
                            </span>
                          </div>
                        )}
                        {service.last24h !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last 24h</span>
                            <span className="font-semibold text-gray-700">{service.last24h} bookings</span>
                          </div>
                        )}
                        {service.failureRate && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Failure Rate</span>
                            <span className={`font-semibold ${
                              parseFloat(service.failureRate) < 5 ? 'text-green-600' :
                              parseFloat(service.failureRate) < 15 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {service.failureRate}
                            </span>
                          </div>
                        )}
                        {service.used && service.total && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Active Logins (24h)</span>
                            <span className="font-semibold text-gray-700">{service.last24h}</span>
                          </div>
                        )}
                        {service.issues !== undefined && service.issues > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {service.issues} data integrity issue{service.issues !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall health summary */}
              {health.overall && (
                <div className={`mt-4 p-4 rounded-xl border ${
                  health.overall === 'healthy' ? 'bg-green-50 border-green-200' :
                  health.overall === 'degraded' ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {health.overall === 'healthy' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {health.overall === 'degraded' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {health.overall === 'critical' && <XCircle className="w-4 h-4 text-red-600" />}
                    <span className={`text-sm font-semibold ${
                      health.overall === 'healthy' ? 'text-green-700' :
                      health.overall === 'degraded' ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {health.overall === 'healthy' && 'All systems operational'}
                      {health.overall === 'degraded' && 'Some services degraded - monitoring'}
                      {health.overall === 'critical' && 'Critical issues detected - immediate attention required'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </AdminLayout>
  );
}
