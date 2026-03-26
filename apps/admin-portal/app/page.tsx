import Link from 'next/link';
import { Shield, Lock, BarChart3, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50">
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Health Ocean
            <span className="block text-red-600 mt-2">Admin Portal</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Secure administrative dashboard for managing laboratories, users, and platform analytics
          </p>
          
          <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-red-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
            <Lock className="w-5 h-5" />
            Admin Login
          </Link>
          
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Access</h3>
              <p className="text-sm text-gray-600">Role-based authentication and authorization</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Real-time insights and reporting</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lab Verification</h3>
              <p className="text-sm text-gray-600">Approve and manage laboratory partners</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
