'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Users, Mail, Phone, Lock, Building2, UserCircle } from 'lucide-react';

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    labId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

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
        localStorage.setItem('employeeToken', data.token);
        localStorage.setItem('employee', JSON.stringify(data.employee));
        router.push('/lab/dashboard');
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
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Registration</h1>
            <p className="text-gray-600">Join your laboratory team</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You need your Lab ID to register. Contact your lab administrator to get it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Lab ID
              </label>
              <input
                type="text"
                name="labId"
                value={formData.labId}
                onChange={handleChange}
                required
                className="input"
                placeholder="LAB1234567890"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the Lab ID provided by your administrator
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCircle className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
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
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {formData.role && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {roles.find(r => r.value === formData.role)?.label} Role
                </p>
                <p className="text-xs text-gray-600">
                  {roles.find(r => r.value === formData.role)?.description}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Registering...' : 'Register as Employee'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/lab/login" className="text-primary-500 hover:underline">
                Login here
              </a>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
