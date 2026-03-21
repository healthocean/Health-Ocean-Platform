'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Users, Mail, Phone, Lock, Building2, UserCircle, ShieldCheck } from 'lucide-react';
import { getLab, isLabAuthenticated } from '@/lib/labAuth';

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lab, setLab] = useState<any>(null);
  const [formData, setFormData] = useState({
    labId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  useEffect(() => {
    if (!isLabAuthenticated()) {
      router.push('/login');
      return;
    }
    const labData = getLab();
    setLab(labData);
    if (labData?.labId) {
      setFormData(prev => ({ ...prev, labId: labData.labId }));
    }
  }, [router]);

  const roles = [
    { value: 'Admin', label: 'Admin', description: 'Full access to lab dashboard' },
    { value: 'Manager', label: 'Manager', description: 'Manage tests, packages, bookings' },
    { value: 'Technician', label: 'Technician', description: 'Process samples, upload reports' },
    { value: 'Receptionist', label: 'Receptionist', description: 'View bookings, customer support' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/labs/employees/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          labId: formData.labId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Employee registered successfully!');
        router.push('/employees');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-8 py-10 text-white text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
               <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Register New Employee</h1>
            <p className="text-primary-100/80">Add a new staff member to {lab?.name || 'your laboratory'}</p>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 text-sm animate-pulse">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Lab ID (Auto-filled & Read-only) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Laboratory ID (Auto-filled)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="labId"
                      value={formData.labId}
                      readOnly
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-mono font-bold cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Employee Full Name
                  </label>
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="rahul@lab.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Assign Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a Role</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Set Login Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {formData.role && (
                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary-900 uppercase tracking-wide">
                      {roles.find(r => r.value === formData.role)?.label} Permissions
                    </p>
                    <p className="text-sm text-primary-700 mt-0.5 leading-relaxed">
                      {roles.find(r => r.value === formData.role)?.description}. They will be able to log in using their email and the password set above.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col md:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 transition-all active:scale-[0.98]"
                >
                  {loading ? 'Creating Account...' : 'Create Employee Account'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
