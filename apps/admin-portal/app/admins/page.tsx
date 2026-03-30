'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Shield, Plus, Trash2, UserX, UserCheck,
  Mail, Phone, Calendar, X, AlertCircle,
  Users, CheckCircle, Eye, EyeOff
} from 'lucide-react';
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

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const admin = getAdmin();
    if (!isAdminAuthenticated() || admin?.role !== 'SuperAdmin') { router.push('/dashboard'); return; }
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API}/admin/admins`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { router.push('/dashboard'); return; }
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, role: 'Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchAdmins();
        showToast('Admin created successfully');
      } else {
        setFormError(data.message || 'Failed to create admin');
      }
    } catch {
      setFormError('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (adminId: string, current: string) => {
    const newStatus = current === 'Active' ? 'Inactive' : 'Active';
    const res = await fetch(`${API}/admin/admins/${adminId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setAdmins(prev => prev.map(a => a.adminId === adminId ? { ...a, status: newStatus as Admin['status'] } : a));
      showToast(`Admin ${newStatus.toLowerCase()} successfully`);
    }
  };

  const handleDelete = async (adminId: string) => {
    const res = await fetch(`${API}/admin/admins/${adminId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setAdmins(prev => prev.filter(a => a.adminId !== adminId));
      setDeleteConfirm(null);
      showToast('Admin deleted');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError('');
    setShowPassword(false);
    setFormData({ name: '', email: '', phone: '', password: '' });
  };

  const activeCount = admins.filter(a => a.status === 'Active').length;
  const inactiveCount = admins.filter(a => a.status === 'Inactive').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-full bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Management</h1>
                <p className="text-xs text-gray-400 mt-0.5">SuperAdmin access only</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Admin
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total Admins</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Active</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{inactiveCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Inactive</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {admins.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <Shield className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No admins yet</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-3.5 text-left">Admin</th>
                        <th className="px-6 py-3.5 text-left">Phone</th>
                        <th className="px-6 py-3.5 text-left">Role</th>
                        <th className="px-6 py-3.5 text-left">Joined</th>
                        <th className="px-6 py-3.5 text-left">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {admins.map(admin => (
                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                                admin.role === 'SuperAdmin'
                                  ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
                              }`}>
                                {admin.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{admin.name}</p>
                                <p className="text-xs text-gray-400">{admin.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{admin.phone}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                              admin.role === 'SuperAdmin'
                                ? 'bg-purple-50 text-purple-700 ring-purple-200'
                                : 'bg-blue-50 text-blue-700 ring-blue-200'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {admin.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                              admin.status === 'Active'
                                ? 'bg-green-50 text-green-700 ring-green-200'
                                : 'bg-gray-100 text-gray-500 ring-gray-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                              {admin.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {admin.role !== 'SuperAdmin' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggle(admin.adminId, admin.status)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    admin.status === 'Active'
                                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                                  }`}
                                >
                                  {admin.status === 'Active'
                                    ? <><UserX className="w-3.5 h-3.5" />Deactivate</>
                                    : <><UserCheck className="w-3.5 h-3.5" />Activate</>
                                  }
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(admin.adminId)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-50">
                  {admins.map(admin => (
                    <div key={admin._id} className="px-4 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                          admin.role === 'SuperAdmin'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{admin.name}</p>
                          <p className="text-xs text-gray-400 truncate">{admin.email}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          admin.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {admin.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{admin.phone}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      {admin.role !== 'SuperAdmin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggle(admin.adminId, admin.status)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                              admin.status === 'Active'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {admin.status === 'Active' ? <><UserX className="w-3.5 h-3.5" />Deactivate</> : <><UserCheck className="w-3.5 h-3.5" />Activate</>}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(admin.adminId)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Admin slide-in modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl z-10">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">Add New Admin</h2>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />{formError}
                </div>
              )}
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Rahul Sharma', icon: <Users className="w-4 h-4" /> },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'admin@example.com', icon: <Mail className="w-4 h-4" /> },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '10-digit mobile number', icon: <Phone className="w-4 h-4" /> },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{f.icon}</span>
                    <input
                      type={f.type}
                      value={formData[f.key as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      required
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all"
                    />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
                  {submitting ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full z-10">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Delete Admin?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
