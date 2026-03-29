'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { User, Plus, Search, Filter, Edit2, Trash2, Mail, Phone, BadgeCheck, ShieldCheck, Microscope, UserSquare2 } from 'lucide-react';
import { getLab, isLabAuthenticated } from '@/lib/labAuth';
import Link from 'next/link';

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Technician' | 'Receptionist';
  createdAt: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  Admin: <ShieldCheck className="w-4 h-4 text-red-600" />,
  Manager: <BadgeCheck className="w-4 h-4 text-blue-600" />,
  Technician: <Microscope className="w-4 h-4 text-purple-600" />,
  Receptionist: <UserSquare2 className="w-4 h-4 text-green-600" />,
};

const ROLE_STYLES: Record<string, string> = {
  Admin: 'bg-red-50 text-red-700 border-red-100',
  Manager: 'bg-blue-50 text-blue-700 border-blue-100',
  Technician: 'bg-purple-50 text-purple-700 border-purple-100',
  Receptionist: 'bg-green-50 text-green-700 border-green-100',
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
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
      fetchEmployees(labData.labId);
    }
  }, [router]);

  const fetchEmployees = async (labId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/employees`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-primary-600" />
              Lab Employees
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage staff access and roles for your laboratory</p>
          </div>
          <Link href="/employees/register" className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
            <Plus className="w-4 h-4" /> Create New Employee
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter By Role
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-4 text-left font-semibold">Employee</th>
                  <th className="px-6 py-4 text-left font-semibold">Contact Info</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-left font-semibold">Joined Date</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4"><div className="h-14 bg-gray-100 rounded-lg w-full"></div></td>
                    </tr>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No employees found</p>
                      <p className="text-xs mt-1">Add your lab staff to manage different modules.</p>
                      <Link href="/employees/register" className="mt-4 inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-200 transition-colors">
                        Register Employee
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-100 group-hover:from-primary-100 group-hover:to-blue-100 group-hover:text-primary-700 transition-colors">
                             {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{emp.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3 h-3 text-gray-400" />{emp.email}</div>
                          <div className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3 h-3 text-gray-400" />{emp.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${ROLE_STYLES[emp.role]}`}>
                           {ROLE_ICONS[emp.role]}
                           {emp.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(emp.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
