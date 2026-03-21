import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Building2, TestTube, Package, Users, ArrowRight, CheckCircle, TrendingUp, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-blue-900 text-white">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">NABL Certified Partner Network</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Health Ocean
                  <span className="block text-blue-200">Lab Portal</span>
                </h1>
                <p className="text-lg sm:text-xl mb-8 text-blue-100 leading-relaxed">
                  Streamline your laboratory operations with our comprehensive management platform. Join India's fastest-growing diagnostic network.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register" className="group btn bg-white text-primary-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
                    <span>Register Your Lab</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/login" className="btn bg-transparent text-white border-2 border-white hover:bg-white/10 backdrop-blur-sm">
                    Lab Login
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Free Registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Instant Setup</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <TestTube className="w-10 h-10 mb-3 text-blue-200" />
                        <div className="text-3xl font-bold mb-1">500+</div>
                        <div className="text-sm text-blue-200">Partner Labs</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <TrendingUp className="w-10 h-10 mb-3 text-green-200" />
                        <div className="text-3xl font-bold mb-1">1M+</div>
                        <div className="text-sm text-blue-200">Tests Processed</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <Users className="w-10 h-10 mb-3 text-purple-200" />
                        <div className="text-3xl font-bold mb-1">50K+</div>
                        <div className="text-sm text-blue-200">Happy Customers</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <Clock className="w-10 h-10 mb-3 text-yellow-200" />
                        <div className="text-3xl font-bold mb-1">24hrs</div>
                        <div className="text-sm text-blue-200">Avg. TAT</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Manage Your Lab
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful tools designed specifically for diagnostic laboratories
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lab Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Complete profile management with certifications, licenses, and compliance tracking
                </p>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TestTube className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Test Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Add, edit, and manage your entire test catalog with dynamic pricing
                </p>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Package Creation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bundle multiple tests into attractive health packages with discounts
                </p>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Team Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Register and manage staff with role-based access control
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-white to-blue-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-lg text-gray-600">
                Join our network and start receiving bookings today
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl">
                      1
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Register Your Lab</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Fill out a simple form with your lab details, certifications, and services offered
                  </p>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent"></div>
              </div>

              <div className="relative">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl">
                      2
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Setup Your Catalog</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Add your tests and create attractive health packages with competitive pricing
                  </p>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent"></div>
              </div>

              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl">
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Receiving Orders</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get instant access to bookings and manage your operations seamlessly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-blue-700 rounded-3xl shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
              <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Lab?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of laboratories already using Health Ocean to grow their business
                </p>
                <Link href="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
                  Register Your Laboratory
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="mt-6 text-sm text-blue-200">
                  No credit card required • Free forever • Setup in 5 minutes
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
