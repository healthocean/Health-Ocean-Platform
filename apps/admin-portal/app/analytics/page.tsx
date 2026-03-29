'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  BarChart3, TrendingUp, Users, Building2,
  MapPin, TestTube, ArrowUpRight, RefreshCw, Package,
} from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie, Legend,
} from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = useCallback(async (range: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const days = RANGE_DAYS[range] || 30;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/analytics?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.ok) {
        const result = await res.json();
        if (result.success) setData(result.data);
      }
    } catch (e) {
      console.error('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    fetchAnalytics(timeRange);
  }, [router, timeRange, fetchAnalytics]);

  const avgOrderValue = data?.summary?.avgOrderValue ?? 0;
  const retentionRate = data?.retention?.rate ?? '0';
  const activeLabs = data?.labs?.length ?? 0;
  const totalTests = data?.totalTests ?? 0;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics & Insights</h1>
            <p className="text-gray-500 font-medium">Real-time performance metrics for Health Ocean</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
              {Object.keys(RANGE_DAYS).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === range ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchAnalytics(timeRange)}
              className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <RefreshCw className="w-10 h-10 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Crunching latest platform data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'User Retention', val: `${retentionRate}%`, sub: 'Repeat customers', icon: Users, color: 'blue' },
                { label: 'Avg Order Value', val: `₹${avgOrderValue.toLocaleString()}`, sub: `Last ${timeRange}`, icon: TrendingUp, color: 'green' },
                { label: 'Active Labs', val: activeLabs, sub: 'With bookings', icon: Building2, color: 'red' },
                { label: 'Active Tests', val: totalTests, sub: 'Listed on platform', icon: TestTube, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                      stat.color === 'green' ? 'bg-green-50 text-green-500' :
                      stat.color === 'red' ? 'bg-red-50 text-red-500' :
                      'bg-purple-50 text-purple-500'
                    }`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.val}</p>
                  <p className="text-xs font-bold text-gray-400 mt-2">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Orders Trend</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Last {timeRange}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-red-500" />
                  </div>
                </div>
                <div className="p-6 h-72">
                  {data?.trend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trend}>
                        <defs>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart label="No orders in this period" />}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Revenue Trend</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Last {timeRange}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <div className="p-6 h-72">
                  {data?.trend?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.trend}>
                        <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => [`₹${v?.toLocaleString()}`, 'Revenue']} />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <EmptyChart label="No revenue in this period" />}
                </div>
              </div>
            </div>

            {/* Test Popularity + Booking Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900">Test Popularity</h3>
                  <span className="text-xs font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">Top Booked</span>
                </div>
                {data?.tests?.length > 0 ? (
                  <div style={{ height: data.tests.length * 44 + 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.tests.map((t: any) => ({ ...t, shortName: t.name.length > 22 ? t.name.slice(0, 22) + '…' : t.name }))} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="shortName"
                          type="category"
                          width={160}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }}
                        />
                        <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v: any) => [v, 'Bookings']} labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.name ?? ''} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                          {data.tests.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyChart label="No test bookings in this period" />}
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  Booking Status
                </h3>
                {data?.statusBreakdown?.length > 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={data.statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {data.statusBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any, n: any) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2 w-full">
                      {data.statusBreakdown.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="font-bold text-gray-600">{s.status}</span>
                          </div>
                          <span className="font-black text-gray-900">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <EmptyChart label="No bookings in this period" />}
              </div>
            </div>

            {/* Funnel + City + Lab Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Funnel */}
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6">User Funnel</h3>
                {data?.funnel?.length > 0 ? (
                  <div className="space-y-5">
                    {data.funnel.map((step: any, i: number) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                          <span>{step.step}</span>
                          <span className="text-gray-900">{step.count.toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${data.funnel[0].count > 0 ? (step.count / data.funnel[0].count) * 100 : 0}%`,
                              background: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {data.funnel[0]?.count > 0 && (
                      <div className="pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs font-bold text-gray-400">Booking Conversion</p>
                        <p className="text-2xl font-black text-green-500 mt-1">
                          {((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : <EmptyChart label="No data available" />}
              </div>

              {/* City Performance */}
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  City Performance
                </h3>
                {data?.cities?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <th className="pb-3">City</th>
                          <th className="pb-3 text-center">Orders</th>
                          <th className="pb-3 text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.cities.map((city: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 font-bold text-gray-700 text-sm">{city.name || '—'}</td>
                            <td className="py-3 text-center font-bold text-gray-500 text-sm">{city.orders}</td>
                            <td className="py-3 text-right font-black text-gray-900 text-sm">₹{(city.revenue || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyChart label="No city data in this period" />}
              </div>

              {/* Lab Leaderboard */}
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Lab Leaderboard
                </h3>
                {data?.labs?.length > 0 ? (
                  <div className="space-y-4">
                    {data.labs.map((lab: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 text-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm tracking-tight">{lab.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lab.orders} bookings</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900 text-sm">₹{(lab.revenue || 0).toLocaleString()}</p>
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-blue-500" style={{ width: `${data.labs[0]?.revenue > 0 ? (lab.revenue / data.labs[0].revenue) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <EmptyChart label="No lab data in this period" />}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-300">
      <BarChart3 className="w-10 h-10 mb-2" />
      <p className="text-sm font-bold text-gray-400">{label}</p>
    </div>
  );
}
