'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { TestTube, Plus, Search, Filter, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { getLab, isLabAuthenticated } from '@/lib/labAuth';
import Link from 'next/link';

interface Test {
  _id: string;
  testId: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  status: string;
  sampleType: string;
  turnaroundTime: string;
}

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [lab, setLab] = useState<any>(null);

  useEffect(() => {
    if (!isLabAuthenticated()) {
      router.push('/login');
      return;
    }
    const labData = getLab();
    setLab(labData);
    if (labData?.labId) {
      fetchTests(labData.labId);
    }
  }, [router]);

  const fetchTests = async (labId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/tests`);
      const data = await res.json();
      if (data.success) {
        setTests(data.tests);
      } else {
        setError(data.message || 'Failed to fetch tests');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (test: Test) => {
    const newStatus = test.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/tests/${test._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTests(prev => prev.map(t => t._id === test._id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredTests = tests.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.testId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Tests</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your diagnostic test listings</p>
          </div>
          <Link href="/tests/add" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Test
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, or ID..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-4 text-left font-semibold">Test Details</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Price</th>
                  <th className="px-6 py-4 text-left font-semibold">Sample/TAT</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4"><div className="h-12 bg-gray-100 rounded-lg w-full"></div></td>
                    </tr>
                  ))
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <TestTube className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No tests found</p>
                      <p className="text-xs mt-1">Try a different search or add a new test.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{test.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{test.testId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                          {test.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">₹{test.price}</span>
                          {test.originalPrice && test.originalPrice > test.price && (
                            <span className="text-xs text-gray-400 line-through">₹{test.originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>🧪 {test.sampleType}</p>
                          <p>⏱️ {test.turnaroundTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(test)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            test.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {test.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {test.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
