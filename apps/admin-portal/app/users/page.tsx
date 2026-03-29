'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Users, Search, Mail, Phone, Calendar, Package, MapPin } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface UserDetails extends User {
  bookingsCount?: number;
  recentBookings?: any[];
}

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter email or phone number');
      return;
    }

    setSearching(true);
    setError('');
    setUserDetails(null);

    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(
        `${apiUrl}/admin/users/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserDetails(data.user);
        }
      } else if (response.status === 404) {
        setError('User not found');
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to search user');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to connect to server');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">User Search</h1>
          <p className="text-lg text-gray-500">Find users by email or phone number</p>
        </div>

        {/* Search Form */}
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter email or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-red-400 focus:ring-2 focus:ring-red-100 transition w-full"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="btn bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-3 rounded-lg text-base font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-base text-red-600 text-center">{error}</p>
          )}
        </div>

        {/* User Details */}
        {userDetails && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userDetails.name}</h2>
                <p className="text-gray-600">Customer Details</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">All User Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border rounded-lg">
                  <tbody>
                    {Object.entries(userDetails)
                      .filter(([key]) => !['createdAt', 'updatedAt', '__v', 'bookingsCount', 'recentBookings', '_id'].includes(key))
                      .map(([key, value]) => (
                        <tr key={key} className="border-b last:border-b-0">
                          <td className="px-4 py-2 font-semibold text-gray-700 whitespace-nowrap capitalize">{key}</td>
                          <td className="px-4 py-2 text-gray-900">
                            {Array.isArray(value)
                              ? JSON.stringify(value, null, 2)
                              : typeof value === 'object' && value !== null
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Bookings (kept for context) */}
            {userDetails.recentBookings && userDetails.recentBookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {userDetails.recentBookings.map((booking: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Booking #{booking.bookingId}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.appointmentDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{booking.totalAmount}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!userDetails && !error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for a User</h3>
            <p className="text-gray-600">Enter an email or phone number to view user details</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
