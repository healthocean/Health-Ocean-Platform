'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import {
  TestTube, Package, CalendarCheck, TrendingUp,
  Plus, Activity, Star, AlertCircle, CheckCircle2,
  Clock, BarChart3, User, MapPin, Calendar, UploadCloud, FileText, X, ChevronRight
} from 'lucide-react';
import { getLab, isLabAuthenticated } from '@/lib/labAuth';

interface Stats {
  totalTests: number;
  totalPackages: number;
  activeTests: number;
  activePackages: number;
  totalBookings: number;
  totalRevenue: number;
  topTests: { testId: string; name: string; category: string; price: number; sales: number }[];
  topPackages: { packageId: string; name: string; category: string; price: number; sales: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

interface Booking {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  date: string;
  timeSlot: string;
  status: string;
  total: number;
  createdAt: string;
  tests: string[];
  packages: string[];
  reportUrl?: string;
  phlebotomistAssigned: boolean;
  assignedTo?: string;
}

interface Employee {
  employeeId: string;
  name: string;
  role: string;
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-yellow-50 text-yellow-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-red-50 text-red-700',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lab, setLab] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!isLabAuthenticated()) { router.push('/login'); return; }
    const labData = getLab();
    setLab(labData);
    if (labData?.labId) {
      fetchStats(labData.labId);
      fetchBookings(labData.labId);
      fetchEmployees(labData.labId);
    }
  }, [router]);

  const fetchEmployees = async (labId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/employees`);
      const data = await res.json();
      if (data.success) {
        // Filter for technicians/phlebotomists
        setEmployees(data.employees.filter((e: any) => e.role === 'Technician' || e.role === 'Admin' || e.role === 'Manager'));
      }
    } catch (e) {}
  };

  const handleAssign = async (employeeId: string) => {
    if (!selectedBooking) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/bookings/${selectedBooking}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => b.bookingId === selectedBooking ? { ...b, phlebotomistAssigned: true, assignedTo: employeeId, status: 'In Progress' } : b));
        setIsAssignModalOpen(false);
        setSelectedBooking(null);
        alert(`Assigned to ${employees.find(e => e.employeeId === employeeId)?.name}`);
      }
    } catch (e) {
      alert('Error assigning phlebotomist');
    }
  };

  const fetchStats = async (labId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/stats`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setError('Failed to load stats');
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (labId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/bookings`);
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch {
      // silently fail — stats error already shown
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleFileUpload = async (bookingId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('report', file);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/bookings/${bookingId}/report`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, reportUrl: data.reportUrl, status: 'Completed' } : b));
        alert('Report uploaded successfully. Booking marked as Completed.');
      } else {
        alert(data.message || 'Failed to upload report');
      }
    } catch (e) {
      alert('Error uploading file');
    }
  };

  const maxRevenue = stats ? Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1) : 1;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {lab?.name ?? 'Lab'} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Here's what's happening with your lab today.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/tests/add" className="btn btn-outline flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Test
            </Link>
            <Link href="/packages/add" className="btn btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Package
            </Link>
          </div>
        </div>

        {/* Status banners */}
        {lab?.status === 'Pending' && (
          <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">Approval Pending</p>
              <p className="text-sm text-yellow-700 mt-0.5">Your lab is under review. Tests and packages go live once approved.</p>
            </div>
          </div>
        )}
        {lab?.status === 'Approved' && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm font-medium text-green-800">Your lab is approved and live on Health Ocean.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl p-6 animate-pulse h-28 border border-gray-100" />)}
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<TestTube className="w-5 h-5" />} label="Total Tests" value={stats.totalTests} sub={`${stats.activeTests} active`} color="blue" />
              <StatCard icon={<Package className="w-5 h-5" />} label="Total Packages" value={stats.totalPackages} sub={`${stats.activePackages} active`} color="purple" />
              <StatCard icon={<CalendarCheck className="w-5 h-5" />} label="Bookings" value={stats.totalBookings} sub="all time" color="green" />
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} sub="all time" color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Revenue chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <h2 className="font-semibold text-gray-900">Revenue — Last 6 Months</h2>
                </div>
                {stats.totalRevenue === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Activity className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No revenue data yet</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-3 h-40">
                    {stats.monthlyRevenue.map((m) => (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500">{m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(1)}k` : ''}</span>
                        <div className="w-full rounded-t-md bg-primary-500 transition-all"
                          style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: m.revenue > 0 ? '4px' : '2px', opacity: m.revenue > 0 ? 1 : 0.15 }} />
                        <span className="text-xs text-gray-400">{m.month}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {[
                    { href: '/tests/add', icon: <TestTube className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100 group-hover:bg-blue-200', title: 'Add New Test', sub: 'List a diagnostic test' },
                    { href: '/packages/add', icon: <Package className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-100 group-hover:bg-purple-200', title: 'Add New Package', sub: 'Bundle tests together' },
                    { href: '/employees/register', icon: <Plus className="w-4 h-4 text-green-600" />, bg: 'bg-green-100 group-hover:bg-green-200', title: 'Register Employee', sub: 'Add staff to your lab' },
                  ].map(a => (
                    <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${a.bg}`}>{a.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Top tests & packages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TopList title="Top Tests" icon={<TestTube className="w-4 h-4 text-blue-600" />} items={stats.topTests} emptyMsg="No tests added yet" addLink="/tests/add" />
              <TopList title="Top Packages" icon={<Package className="w-4 h-4 text-purple-600" />} items={stats.topPackages} emptyMsg="No packages added yet" addLink="/packages/add" />
            </div>
          </>
        )}

        {/* Bookings table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
              {!bookingsLoading && <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{bookings.length}</span>}
            </div>
          </div>

          {bookingsLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CalendarCheck className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">No bookings yet</p>
              <p className="text-xs mt-1">Bookings for your tests and packages will appear here</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-6 py-3 text-left">Patient</th>
                      <th className="px-6 py-3 text-left">Tests / Packages</th>
                      <th className="px-6 py-3 text-left">Date & Slot</th>
                      <th className="px-6 py-3 text-left">City</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Phlebotomist</th>
                      <th className="px-6 py-3 text-left">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map(b => (
                      <tr key={b.bookingId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{b.name}</p>
                              <p className="text-xs text-gray-400">{b.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {[...b.tests, ...b.packages].map((item, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{item}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{b.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{b.timeSlot}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {b.city}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.phlebotomistAssigned ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-900">{employees.find(e => e.employeeId === b.assignedTo)?.name || 'Assigned'}</p>
                                <p className="text-[10px] text-gray-400 leading-none">Technician</p>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setSelectedBooking(b.bookingId); setIsAssignModalOpen(true); }}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200"
                            >
                              Assign
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {b.reportUrl ? (
                            <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${b.reportUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                              <FileText className="w-3.5 h-3.5" /> View
                            </a>
                          ) : (
                            <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 cursor-pointer transition-colors">
                              <UploadCloud className="w-3.5 h-3.5" /> Upload
                              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) handleFileUpload(b.bookingId, e.target.files[0]);
                              }} />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {bookings.map(b => (
                  <div key={b.bookingId} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{b.name}</p>
                        <p className="text-xs text-gray-400">{b.phone}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[...b.tests, ...b.packages].map((item, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{item}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date} · {b.timeSlot}</span>
                      <span className="font-semibold text-gray-900">₹{b.total}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-50 mt-2">
                       {b.reportUrl ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${b.reportUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                            <FileText className="w-4 h-4" /> View Report
                          </a>
                        ) : (
                          <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium cursor-pointer">
                            <UploadCloud className="w-4 h-4" /> Upload Report
                            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
                              if (e.target.files && e.target.files[0]) handleFileUpload(b.bookingId, e.target.files[0]);
                            }} />
                          </label>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Assignment Modal */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
              <div className="p-6 bg-gradient-to-br from-primary-600 to-blue-700 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Assign Phlebotomist</h3>
                  <button onClick={() => setIsAssignModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-primary-100 text-sm mt-1 opacity-90 leading-relaxed">Choose a technician for sample collection of Booking ID: <span className="font-mono font-bold">{selectedBooking}</span></p>
              </div>
              <div className="p-6">
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {employees.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                       <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                       <p className="text-sm font-medium text-gray-500">No technicians found.</p>
                       <Link href="/employees/register" onClick={() => setIsAssignModalOpen(false)} className="mt-3 inline-block text-primary-600 text-xs font-bold hover:underline">Register staff first →</Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {employees.map((emp) => (
                        <button
                          key={emp.employeeId}
                          onClick={() => handleAssign(emp.employeeId)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all group text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-gray-100 group-hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors">
                              <User className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-primary-900">{emp.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                 <p className="text-[10px] font-bold text-gray-400 group-hover:text-primary-600 uppercase tracking-wider">{emp.role}</p>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600', orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function TopList({ title, icon, items, emptyMsg, addLink }: {
  title: string; icon: React.ReactNode;
  items: { name: string; category: string; price: number; sales: number }[];
  emptyMsg: string; addLink: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">{icon}<h2 className="font-semibold text-gray-900">{title}</h2></div>
        <Link href={addLink} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</Link>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <Star className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">{emptyMsg}</p>
          <Link href={addLink} className="mt-3 text-xs text-primary-600 hover:underline">Add one now →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-900">₹{item.price}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{item.sales} bookings</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
