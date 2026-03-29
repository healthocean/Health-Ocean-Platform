'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { User, Calendar, FileText, Settings, Clock, MapPin, Navigation } from 'lucide-react';
import { getUser, getToken, isAuthenticated } from '@/lib/auth';

export default function ProfilePage() {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings?email=${userData?.email}`);
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
    <main className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-gray-900 rounded-[40px] p-12 text-white mb-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-5xl font-black mb-4 tracking-tighter leading-none">Your Health Profile</h1>
            <p className="text-gray-400 text-xl font-medium max-w-lg">Welcome back, {user?.name}! Manage your medical journey and view reports from one secure place.</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
          <User className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 text-white/5 rotate-12" />
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
                    <div
                      key={booking._id}
                      className="group relative bg-white border border-gray-100 rounded-[32px] p-6 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500 overflow-hidden"
                    >
                      {/* Status Background Accent */}
                      <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] transition-opacity group-hover:opacity-[0.08] ${booking.status === 'Completed' ? 'bg-green-500' :
                        booking.status === 'Cancelled' ? 'bg-red-500' :
                          'bg-primary-500'
                        }`} style={{ borderRadius: '0 0 0 100%' }}></div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 flex gap-6 items-start">
                          <div className={`p-4 rounded-2xl ${booking.status === 'Completed' ? 'bg-green-50 text-green-600' :
                            booking.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                              'bg-primary-50 text-primary-600'
                            }`}>
                            <Calendar className="w-8 h-8" />
                          </div>

                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-black text-gray-900 tracking-tighter">
                                #{booking.bookingId}
                              </h3>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                booking.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                                  booking.status === 'Completed' ? 'bg-sky-100 text-sky-700' :
                                    booking.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                      'bg-gray-100 text-gray-700'
                                }`}>
                                {booking.status}
                              </span>
                            </div>

                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                              {new Date(booking.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>

                            <div className="flex flex-wrap gap-y-2 gap-x-6">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm font-bold text-gray-600">{booking.timeSlot}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm font-bold text-gray-600">{booking.city}</span>
                              </div>
                              {booking.testIds && booking.testIds.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <span className="text-sm font-bold text-gray-600">{booking.testIds.length} Test(s)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end gap-4 min-w-[140px]">
                          {booking.status !== 'Completed' && booking.status !== 'Cancelled' && booking.collectionOtp && (
                            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100 rounded-[20px] p-4 text-center min-w-[120px] shadow-sm">
                              <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Collection OTP</p>
                              <p className="text-2xl font-black text-primary-600 tracking-[0.15em] leading-none">{booking.collectionOtp}</p>
                            </div>
                          )}

                          {(booking.status === 'In Progress' || booking.status === 'On My Way' || booking.status === 'Arrived' || (booking.journeyStarted && booking.status === 'Confirmed')) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/track/${booking.bookingId}`);
                              }}
                              className="group/btn flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-100 hover:shadow-primary-200 active:scale-95"
                            >
                              <Navigation className="w-4 h-4 group-hover/btn:animate-pulse" />
                              Track Live
                            </button>
                          )}
                        </div>
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
