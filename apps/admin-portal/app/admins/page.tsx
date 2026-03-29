'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Shield, Plus, Trash2, UserX, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { isAdminAuthenticated, getAdmin } from '@/lib/adminAuth';

interface Admin {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  phone: string;
  role: 'SuperAdmin' | 'Admin';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export default function AdminsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const admin = getAdmin();
    if (!isAdminAuthenticated() || admin?.role !== 'SuperAdmin') {
      router.push('/dashboard');
      return;
    }
    setCurrentAdmin(admin);
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdmins(data.admins);
        }
      } else if (response.status === 401 || response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, role: 'Admin' }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Admin created successfully!');
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', password: '' });
        fetchAdmins();
      } else {
        setError(data.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setError('Failed to connect to server');
    }
  };

  const handleToggleStatus = async (adminId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins/${adminId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAdmins();
        alert(`Admin ${newStatus.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAdmins();
        alert('Admin deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
            <p className="text-gray-600">Manage platform administrators (SuperAdmin Only)</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Admin
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Admins</p>
            <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
            <p className="text-sm text-green-700 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-700">
              {admins.filter(a => a.status === 'Active').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4">
            <p className="text-sm text-red-700 mb-1">Inactive</p>
            <p className="text-2xl font-bold text-red-700">
              {admins.filter(a => a.status === 'Inactive').length}
            </p>
          </div>
        </div>

        {/* Admins List */}
        <div className="space-y-4">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    admin.role === 'SuperAdmin' 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{admin.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'SuperAdmin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {admin.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {admin.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {admin.role !== 'SuperAdmin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(admin.adminId, admin.status)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        admin.status === 'Active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {admin.status === 'Active' ? (
                        <>
                          <UserX className="w-4 h-4" />
                          <span className="text-sm font-medium">Deactivate</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Activate</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.adminId)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Admin</h2>
            </div>
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input"
                  placeholder="Admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="input"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="input"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setFormData({ name: '', email: '', phone: '', password: '' });
                  }}
                  className="flex-1 btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn bg-gradient-to-r from-red-500 to-red-600 text-white">
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
