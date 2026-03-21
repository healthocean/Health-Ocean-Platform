'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Building2, CheckCircle, XCircle, Eye, Search, Filter, MapPin, Calendar, Shield } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface Lab {
  _id: string;
  labId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  nablCertificate: string;
  licenseNumber: string;
  establishedYear: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  createdAt: string;
}

export default function LabsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchLabs();
  }, [router]);

  useEffect(() => {
    filterLabs();
  }, [searchTerm, statusFilter, labs]);

  const fetchLabs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:4000/api/admin/labs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLabs(data.labs || []);
        }
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLabs = () => {
    let filtered = labs;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(lab => lab.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(lab =>
        lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.labId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLabs(filtered);
  };

  const handleStatusChange = async (labId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:4000/api/admin/labs/${labId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state
          setLabs(labs.map(lab =>
            lab.labId === labId ? { ...lab, status: newStatus } : lab
          ));
          alert(`Lab ${newStatus.toLowerCase()} successfully!`);
          setShowModal(false);
        }
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        alert('Failed to update lab status');
      }
    } catch (error) {
      console.error('Error updating lab status:', error);
      alert('Failed to update lab status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
      Suspended: 'bg-gray-100 text-gray-700',
    };
    return styles[status as keyof typeof styles] || styles.Pending;
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laboratory Verification</h1>
          <p className="text-gray-600">Review and approve laboratory registrations</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, city, or Lab ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Labs</p>
            <p className="text-2xl font-bold text-gray-900">{labs.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-4">
            <p className="text-sm text-yellow-700 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{labs.filter(l => l.status === 'Pending').length}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4">
            <p className="text-sm text-green-700 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-700">{labs.filter(l => l.status === 'Approved').length}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-4">
            <p className="text-sm text-red-700 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-700">{labs.filter(l => l.status === 'Rejected').length}</p>
          </div>
        </div>

        {/* Labs List */}
        <div className="space-y-4">
          {filteredLabs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No laboratories found</p>
            </div>
          ) : (
            filteredLabs.map((lab) => (
              <div key={lab._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{lab.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(lab.status)}`}>
                            {lab.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{lab.city}, {lab.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Est. {lab.establishedYear}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span>NABL: {lab.nablCertificate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">ID: {lab.labId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedLab(lab);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                    {lab.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(lab.labId, 'Approved')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(lab.labId, 'Rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedLab && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Laboratory Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Lab Name</p>
                    <p className="font-medium text-gray-900">{selectedLab.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Lab ID</p>
                    <p className="font-medium text-gray-900">{selectedLab.labId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedLab.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{selectedLab.phone}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">City</p>
                    <p className="font-medium text-gray-900">{selectedLab.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">State</p>
                    <p className="font-medium text-gray-900">{selectedLab.state}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Certifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">NABL Certificate</p>
                    <p className="font-medium text-gray-900">{selectedLab.nablCertificate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">License Number</p>
                    <p className="font-medium text-gray-900">{selectedLab.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Established Year</p>
                    <p className="font-medium text-gray-900">{selectedLab.establishedYear}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedLab.status)}`}>
                      {selectedLab.status}
                    </span>
                  </div>
                </div>
              </div>
              {selectedLab.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(selectedLab.labId, 'Approved')}
                    className="flex-1 btn btn-success"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve Lab
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedLab.labId, 'Rejected')}
                    className="flex-1 btn btn-danger"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Lab
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
