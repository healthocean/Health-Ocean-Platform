'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Package, Plus, Search, Filter, Edit2, Trash2, CheckCircle2, XCircle, Star, Sparkles } from 'lucide-react';
import { getLab, isLabAuthenticated } from '@/lib/labAuth';
import Link from 'next/link';

interface PackageItem {
  _id: string;
  packageId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  status: string;
  testsIncluded: string[];
  features: string[];
}

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
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
      fetchPackages(labData.labId);
    }
  }, [router]);

  const fetchPackages = async (labId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/packages`);
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages);
      } else {
        setError(data.message || 'Failed to fetch packages');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (pkg: PackageItem) => {
    const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/packages/${pkg._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages(prev => prev.map(p => p._id === pkg._id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredPackages = packages.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.packageId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Manage Health Packages
            </h1>
            <p className="text-sm text-gray-500 mt-1">Bundle your tests into attractive health packages</p>
          </div>
          <Link href="/packages/add" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Package
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search packages by name or category..."
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
                  <th className="px-6 py-4 text-left font-semibold">Package Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Included Tests</th>
                  <th className="px-6 py-4 text-left font-semibold">Pricing</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4"><div className="h-16 bg-gray-100 rounded-lg w-full"></div></td>
                    </tr>
                  ))
                ) : filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No packages found</p>
                      <p className="text-xs mt-1">Create your first bundled health package today.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{pkg.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold uppercase tracking-wider">{pkg.category}</span>
                             <span className="text-xs text-gray-400 underline">{pkg.packageId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {pkg.testsIncluded.map((test, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs truncate max-w-[120px]">{test}</span>
                          ))}
                          {pkg.testsIncluded.length === 0 && <span className="text-xs text-gray-400 italic">No tests selected</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-gray-900">₹{pkg.price}</span>
                            <span className="text-xs text-gray-400 line-through">₹{pkg.originalPrice}</span>
                          </div>
                          <span className="text-[10px] font-bold text-green-600">
                             SAVE {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(pkg)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            pkg.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {pkg.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {pkg.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button className="p-2 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
