'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, LayoutDashboard, Building2, Users, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAdmin, clearAdminAuth, isAdminAuthenticated } from '@/lib/adminAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/labs', label: 'Lab Verification', icon: Building2 },
  { href: '/users', label: 'Users', icon: Users },
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-tight">Health Ocean</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
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
      {admin && (
        <div className="px-3 py-4 border-t border-gray-800 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 bg-gray-800 rounded-xl">
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
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gray-900 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} h-full flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 flex items-center justify-between px-4 h-14 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Health Ocean Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 hover:text-white p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 pt-14" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
