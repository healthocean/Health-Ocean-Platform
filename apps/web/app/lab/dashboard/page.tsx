'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Building2, TestTube, Package, Users, Plus, Edit, Trash2, EyeIcon } from 'lucide-react';

interface Lab {
  labId: string;
  name: string;
  email: string;
  status: string;
  city: string;
}

interface Test {
  _id: string;
  testId: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  status: string;
}

interface LabPackage {
  _id: string;
  packageId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  status: string;
}

export default function LabDashboardPage() {
  const router = useRouter();
  const [lab, setLab] = useState<Lab | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'packages' | 'employees'>('overview');

  useEffect(() => {
    const labData = localStorage.getItem('lab');
    if (!labData) {
      router.push('/lab/login');
      return;
    }

    const parsedLab = JSON.parse(labData);
    setLab(parsedLab);
    loadData(parsedLab.labId);
  }, [router]);

  const loadData = async (labId: string) => {
    try {
      const [testsRes, packagesRes] = await Promise.all([
        fetch(`http://localhost:4000/api/labs/${labId}/tests`),
        fetch(`http://localhost:4000/api/labs/${labId}/packages`),
      ]);

      const testsData = await testsRes.json();
      const packagesData = await packagesRes.json();

      if (testsData.success) setTests(testsData.tests);
      if (packagesData.success) setPackages(packagesData.packages);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('labToken');
    localStorage.removeItem('lab');
    router.push('/lab/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!lab) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="w-12 h-12 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lab.name}</h1>
                <p className="text-gray-600">{lab.email} • {lab.city}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                  lab.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  lab.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {lab.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/lab/employees/register')}
                className="btn btn-secondary"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Employee
              </button>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: Building2 },
                { id: 'tests', label: 'Tests', icon: TestTube },
                { id: 'packages', label: 'Packages', icon: Package },
                { id: 'employees', label: 'Employees', icon: Users },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <TestTube className="w-8 h-8 text-blue-500 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Total Tests</p>
                    <p className="text-3xl font-bold text-gray-900">{tests.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <Package className="w-8 h-8 text-green-500 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Total Packages</p>
                    <p className="text-3xl font-bold text-gray-900">{packages.length}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <Users className="w-8 h-8 text-purple-500 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">Lab ID</p>
                    <p className="text-lg font-bold text-gray-900">{lab.labId}</p>
                  </div>
                </div>

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Lab ID for Employee Registration:</strong> {lab.labId}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Share this ID with your employees so they can register and join your laboratory.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Tests Management</h2>
                  <button
                    onClick={() => router.push('/lab/tests/add')}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test
                  </button>
                </div>

                {tests.length === 0 ? (
                  <div className="text-center py-12">
                    <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No tests added yet</p>
                    <button
                      onClick={() => router.push('/lab/tests/add')}
                      className="btn btn-primary"
                    >
                      Add Your First Test
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tests.map(test => (
                      <div key={test._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{test.name}</h3>
                            <p className="text-sm text-gray-600">{test.category}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-lg font-bold text-primary-600">₹{test.price}</span>
                              {test.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">₹{test.originalPrice}</span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                test.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {test.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'packages' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Packages Management</h2>
                  <button
                    onClick={() => router.push('/lab/packages/add')}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </button>
                </div>

                {packages.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No packages added yet</p>
                    <button
                      onClick={() => router.push('/lab/packages/add')}
                      className="btn btn-primary"
                    >
                      Add Your First Package
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packages.map(pkg => (
                      <div key={pkg._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                            <p className="text-sm text-gray-600">{pkg.category}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-lg font-bold text-primary-600">₹{pkg.price}</span>
                              <span className="text-sm text-gray-400 line-through">₹{pkg.originalPrice}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pkg.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {pkg.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'employees' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Employee Management</h2>
                  <button
                    onClick={() => router.push('/lab/employees/register')}
                    className="btn btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Your Lab ID:</strong> {lab.labId}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Employees need this ID to register. Share it securely with your staff.
                  </p>
                </div>

                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Employee list coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
