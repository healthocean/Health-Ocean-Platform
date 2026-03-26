'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Users, Search, Mail, Phone, Calendar, Package,
  MapPin, X, ChevronRight, Clock, TrendingUp, AlertCircle
} from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface User {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Booking {
  bookingId: string;
  appointmentDate: string;
  location: string;
  totalAmount: number;
  status: string;
}

interface UserDetails extends User {
  bookingsCount?: number;
  recentBookings?: Booking[];
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setFiltered(data.users);
      }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.push('/login'); return; }
    fetchUsers();
  }, [fetchUsers, router]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
      )
    );
  }, [searchQuery, users]);

  const openUserDetail = async (user: User) => {
    setSelectedUser(user as UserDetails);
    setDetailLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/users/search?query=${encodeURIComponent(user.email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setSelectedUser(data.user);
    } catch {
      // keep basic info already set
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Loading...' : `${users.length} registered users`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{users.length} total</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users className="w-14 h-14 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">No users found</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Phone</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => openUserDetail(user)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-500">Registered user</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.bookingsCount ?? 0}</p>
                    <p className="text-xs text-blue-600 mt-1">Total Bookings</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedUser.recentBookings?.filter(b => b.status === 'Completed').length ?? 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Completed</p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</p>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 break-all">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700">
                      Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Recent bookings */}
                {selectedUser.recentBookings && selectedUser.recentBookings.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Recent Bookings
                    </p>
                    <div className="space-y-3">
                      {selectedUser.recentBookings.map((booking, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                #{booking.bookingId}
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {new Date(booking.appointmentDate).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                })}
                              </div>
                              {booking.location && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{booking.location}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-gray-900">₹{booking.totalAmount}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No bookings yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
