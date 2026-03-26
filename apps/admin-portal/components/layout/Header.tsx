'use client';

import Link from 'next/link';
import { Shield, Menu, X, LogOut, LayoutDashboard, Building2, Users, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdmin, clearAdminAuth, isAdminAuthenticated } from '@/lib/adminAuth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (isAdminAuthenticated()) {
        setAdmin(getAdmin());
      } else {
        setAdmin(null);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('admin-auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('admin-auth-change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    clearAdminAuth();
    setAdmin(null);
    window.dispatchEvent(new Event('admin-auth-change'));
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg lg:text-xl font-bold text-gray-900">Health Ocean</span>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {admin && (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="/labs" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">Lab Verification</span>
                </Link>
                <Link href="/users" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Users</span>
                </Link>
                {admin.role === 'SuperAdmin' && (
                  <Link href="/admins" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Admins</span>
                  </Link>
                )}
                <Link href="/analytics" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Analytics</span>
                </Link>
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            {admin ? (
              <>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-gray-900">{admin.name}</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    {admin.role}
                  </span>
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
              <Link href="/login" className="btn bg-gradient-to-r from-red-500 to-red-600 text-white text-sm">
                Admin Login
              </Link>
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
            {admin ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="/labs" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">Lab Verification</span>
                </Link>
                <Link href="/users" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Users</span>
                </Link>
                {admin.role === 'SuperAdmin' && (
                  <Link href="/admins" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admins</span>
                  </Link>
                )}
                <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{admin.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {admin.role}
                    </span>
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
              <Link href="/login" className="block btn bg-gradient-to-r from-red-500 to-red-600 text-white w-full text-center" onClick={() => setIsMenuOpen(false)}>
                Admin Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
