'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User as UserIcon, ShoppingCart, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { getCartCount } from '@/lib/cart';
import LocationPicker from './LocationPicker';

const NAV_LINKS = [
  { href: '/',         label: 'Home' },
  { href: '/tests',    label: 'Tests' },
  { href: '/packages', label: 'Packages' },
  { href: '/about',    label: 'About' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => setUser(isAuthenticated() ? getUser() : null);
    const updateCart = () => setCartCount(getCartCount());
    const onScroll = () => setScrolled(window.scrollY > 8);

    checkAuth(); updateCart();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('cart-change', updateCart);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('cart-change', updateCart);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearAuth();
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,119,182,0.08)] border-b border-[#caf0f8]' : 'border-b border-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">

          {/* Logo & Location */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex flex-shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Health Ocean"
                width={95}
                height={95}
                className="rounded-2xl"
                style={{ height: 'auto' }}
              />
            </Link>
            <div className="hidden md:block h-7 w-px bg-[#caf0f8]" />
            <LocationPicker />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                    active
                      ? 'text-[#0077b6]'
                      : 'text-[#03045e]/70 hover:text-[#0077b6] hover:bg-[#caf0f8]/40'
                  }`}
                >
                  {label}
                  {/* Active indicator */}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-[#0077b6] transition-all duration-300 ${
                    active ? 'w-5' : 'w-0 group-hover:w-4 group-hover:bg-[#00b4d8]'
                  }`} />
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 rounded-xl bg-[#caf0f8]/40 hover:bg-[#caf0f8]/70 transition-all group">
              <ShoppingCart className="w-5 h-5 text-[#0077b6] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#0077b6] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-[#03045e] text-white rounded-2xl hover:bg-[#0077b6] transition-all shadow-md group"
                >
                  <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                    <UserIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none mb-0.5">Profile</p>
                    <span className="text-xs font-semibold tracking-tight leading-none">{user.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#0077b6] hover:bg-[#caf0f8]/50 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-[#0077b6] text-white text-sm font-semibold rounded-xl hover:bg-[#03045e] transition-all shadow-md shadow-[#0077b6]/20"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-[#03045e] hover:bg-[#caf0f8]/50 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 pt-2 border-t border-[#caf0f8] animate-in slide-in-from-top duration-200">
            <div className="space-y-1 mb-6">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      active
                        ? 'bg-[#caf0f8]/60 text-[#0077b6]'
                        : 'text-[#03045e]/70 hover:bg-[#caf0f8]/30 hover:text-[#0077b6]'
                    }`}
                  >
                    {label}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6]" />}
                  </Link>
                );
              })}
            </div>

            {user ? (
              <div className="space-y-2 pt-4 border-t border-[#caf0f8]">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-4 bg-[#03045e] text-white rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">My Account</p>
                      <p className="text-sm font-semibold">{user.name}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </Link>
                <button
                  onClick={(e) => { handleLogout(e); setIsMenuOpen(false); }}
                  className="w-full py-3.5 bg-red-50 text-red-500 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-[#caf0f8]">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3.5 border border-[#90e0ef] text-[#0077b6] rounded-2xl text-center font-semibold text-sm hover:bg-[#caf0f8]/40 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3.5 bg-[#0077b6] text-white rounded-2xl text-center font-semibold text-sm hover:bg-[#03045e] transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
