'use client';

import Link from 'next/link';
import { Building2, Menu, X, LogOut, LayoutDashboard, TestTube, Package, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLab, clearLabAuth, isLabAuthenticated } from '@/lib/labAuth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lab, setLab] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (isLabAuthenticated()) {
        setLab(getLab());
      } else {
        setLab(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('lab-auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('lab-auth-change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    clearLabAuth();
    setLab(null);
    window.dispatchEvent(new Event('lab-auth-change'));
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
              <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg lg:text-xl font-bold text-gray-900">Health Ocean</span>
              <p className="text-xs text-gray-500">Lab Portal</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {lab && (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="/tests" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <TestTube className="w-4 h-4" />
                  <span className="font-medium">Tests</span>
                </Link>
                <Link href="/packages" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Packages</span>
                </Link>
                <Link href="/employees" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Employees</span>
                </Link>
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            {lab ? (
              <>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
                  <Building2 className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">{lab.name}</span>
                  {lab.status && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      lab.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      lab.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {lab.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-6 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary text-sm">
                  Register Lab
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-100">
            {lab ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="/tests" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <TestTube className="w-5 h-5" />
                  <span className="font-medium">Tests</span>
                </Link>
                <Link href="/packages" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Packages</span>
                </Link>
                <Link href="/employees" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  <span className="font-medium">Employees</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{lab.name}</p>
                    {lab.status && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        lab.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        lab.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {lab.status}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                    className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/login" className="block btn btn-outline w-full text-center" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block btn btn-primary w-full text-center" onClick={() => setIsMenuOpen(false)}>
                  Register Lab
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
