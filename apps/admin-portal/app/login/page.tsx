'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginHeader from '@/components/layout/LoginHeader';
import Footer from '@/components/layout/Footer';
import { Shield, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { setAdminAuth } from '@/lib/adminAuth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = 'superadmin@healthocean.com';
  const DEMO_PASSWORD = 'superadmin123';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setAdminAuth(data.token, data.admin);
        window.dispatchEvent(new Event('admin-auth-change'));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutoFill = () => {
    setFormData({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-red-50">
      <LoginHeader />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
              <p className="text-gray-600">Access the administrative dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium mb-3">Demo Credentials:</p>
              <p className="text-xs text-blue-700 mb-3">SuperAdmin: superadmin@healthocean.com / superadmin123</p>
              <p className="text-xs text-blue-700 mb-4">Run: npm run create-superadmin (in apps/api)</p>
              
              <button
                type="button"
                onClick={handleAutoFill}
                className="w-full flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition-colors text-xs font-medium"
              >
                <LogIn className="w-4 h-4" />
                Auto Fill
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="admin@healthocean.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                <Lock className="w-4 h-4 inline mr-1" />
                Secure admin access only
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
