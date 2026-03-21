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
      const response = await fetch(
        `http://localhost:4000/api/admin/users/search?query=${encodeURIComponent(searchQuery)}`,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Search</h1>
          <p className="text-gray-600">Search for users by email or phone number</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter email or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="btn bg-gradient-to-r from-red-500 to-red-600 text-white px-8"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{userDetails.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{userDetails.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Registered</p>
                      <p className="font-medium text-gray-900">
                        {new Date(userDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Booking Statistics</h3>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{userDetails.bookingsCount || 0}</p>
                      <p className="text-sm text-blue-700">Total Bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
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
