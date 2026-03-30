'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, Building2, BarChart3, LogOut, Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAdmin, clearAdminAuth, isAdminAuthenticated } from '@/lib/adminAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/labs',      label: 'All Labs', icon: Building2 },
  { href: '/search',    label: 'Search', icon: Search },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sync = () => setAdmin(isAdminAuthenticated() ? getAdmin() : null);
    sync();
    window.addEventListener('admin-auth-change', sync);
    return () => window.removeEventListener('admin-auth-change', sync);
  }, []);

  const handleLogout = () => {
    clearAdminAuth();
    window.dispatchEvent(new Event('admin-auth-change'));
    router.push('/login');
  };

  const items = admin?.role === 'SuperAdmin'
    ? [...navItems, { href: '/admins', label: 'Admins', icon: Shield }]
    : navItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
        <img
          src="/healthoceanlogo.png"
          alt="Health Ocean Logo"
          className="w-10 h-10 object-contain rounded-xl flex-shrink-0 bg-white"
        />
        {!collapsed && (
          <div>
            <p className="text-sm font-black text-white tracking-tighter uppercase">Health Ocean</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        {admin && !collapsed && (
          <div className="px-3 py-2 bg-gray-800 rounded-xl mb-2">
            <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
            <span className="text-xs text-red-400">{admin.role}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 hover:bg-gray-800 hover:text-red-400 rounded-xl transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gray-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} fixed top-0 left-0 h-screen flex-shrink-0 z-30`}>
        <SidebarContent />
      </aside>
      {/* Spacer to offset fixed sidebar */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`} />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 flex items-center justify-between px-4 h-14 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <img src="/healthoceanlogo.png" alt="Health Ocean Logo" className="w-8 h-8 object-contain rounded-lg bg-white" />
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 hover:text-white p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 pt-14" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
