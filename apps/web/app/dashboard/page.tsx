'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { User, Calendar, FileText, Settings, Clock, MapPin } from 'lucide-react';
import { getUser, getToken, isAuthenticated } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = getUser();
    setUser(userData);

    // Fetch user's bookings
    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/bookings?email=${userData?.email}`);
        const data = await response.json();
        
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchBookings();
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-primary-100">Manage your health tests and bookings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold text-gray-900">{bookings.length}</span>
            </div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-secondary-500" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-sm text-gray-600">Reports</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <User className="w-8 h-8 text-accent-500" />
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-sm text-gray-600">Family Members</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Settings className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">Active</span>
            </div>
            <p className="text-sm text-gray-600">Account Status</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-medium text-gray-900">{user?.phone}</p>
                </div>
                <button className="btn btn-outline w-full mt-4">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <button 
                    onClick={() => router.push('/tests')}
                    className="btn btn-primary"
                  >
                    Book Your First Test
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Booking #{booking.bookingId}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.date).toLocaleDateString('en-IN', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{booking.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.city}</span>
                        </div>
                        {booking.testIds && booking.testIds.length > 0 && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{booking.testIds.length} test(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {bookings.length > 5 && (
                    <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                      View all bookings →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => router.push('/tests')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-3">🧪</div>
            <h3 className="font-semibold text-gray-900 mb-1">Browse Tests</h3>
            <p className="text-sm text-gray-600">Explore our test catalog</p>
          </button>

          <button 
            onClick={() => router.push('/booking')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition text-left"
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-1">Book a Test</h3>
            <p className="text-sm text-gray-600">Schedule home collection</p>
          </button>

          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition text-left">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold text-gray-900 mb-1">View Reports</h3>
            <p className="text-sm text-gray-600">Access your test results</p>
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
