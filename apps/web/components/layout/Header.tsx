'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User as UserIcon, ShoppingCart, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { getCartCount } from '@/lib/cart';
import LocationPicker from './LocationPicker';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setUser(getUser());
      } else {
        setUser(null);
      }
    };

    const updateCart = () => {
      setCartCount(getCartCount());
    };

    checkAuth();
    updateCart();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('cart-change', updateCart);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('cart-change', updateCart);
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Location */}
          <div className="flex items-center space-x-6">
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

            <div className="hidden md:block h-8 w-[1px] bg-gray-100 mx-2" />
            
            <LocationPicker />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            <Link href="/tests" className="text-gray-900 hover:text-primary-600 transition font-black text-xs tracking-[0.2em] uppercase">
              Tests
            </Link>
            <Link href="/packages" className="text-gray-900 hover:text-primary-600 transition font-black text-xs tracking-[0.2em] uppercase">
              Packages
            </Link>
            <Link href="/about" className="text-gray-900 hover:text-primary-600 transition font-black text-xs tracking-[0.2em] uppercase">
              About
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/cart" className="relative p-2.5 bg-gray-50 rounded-2xl text-gray-900 hover:bg-gray-100 transition shadow-sm border border-gray-100">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/profile"
                  className="flex items-center space-x-3 px-4 py-2 bg-gray-900 text-white rounded-[20px] hover:bg-black transition-all shadow-lg group"
                >
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5">Profile</p>
                    <span className="text-xs font-black tracking-tight">{user.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition border border-red-100 group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-6 py-3 text-sm font-black text-gray-900 hover:bg-gray-50 rounded-2xl transition tracking-widest uppercase">
                  Login
                </Link>
                <Link href="/signup" className="px-8 py-3.5 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition shadow-xl tracking-widest uppercase">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-3 bg-gray-50 rounded-2xl border border-gray-100 text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-8 space-y-6 border-t border-gray-50 animate-in slide-in-from-top duration-300">
            <Link
              href="/tests"
              className="block text-xl font-black text-gray-900 hover:text-primary-600 transition tracking-tighter"
              onClick={() => setIsMenuOpen(false)}
            >
              TESTS
            </Link>
            <Link
              href="/packages"
              className="block text-xl font-black text-gray-900 hover:text-primary-600 transition tracking-tighter"
              onClick={() => setIsMenuOpen(false)}
            >
              PACKAGES
            </Link>
            <Link
              href="/about"
              className="block text-xl font-black text-gray-900 hover:text-primary-600 transition tracking-tighter"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT US
            </Link>
            
            {user ? (
              <div className="pt-8 space-y-4 border-t border-gray-100">
                <Link 
                  href="/profile"
                  className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-3xl shadow-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white/50 uppercase tracking-widest leading-none mb-1">My Account</p>
                      <p className="text-lg font-black tracking-tight">{user.name}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/20" />
                </Link>
                
                <button
                  onClick={(e) => {
                    handleLogout(e);
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-5 bg-red-50 text-red-600 rounded-3xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 border border-red-100 shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  LOGOUT FROM ACCOUNT
                </button>
              </div>
            ) : (
              <div className="pt-8 space-y-3">
                <Link 
                  href="/login" 
                  className="block w-full py-5 border-2 border-gray-100 rounded-[32px] text-center font-black text-xs tracking-widest uppercase"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="block w-full py-5 bg-gray-900 text-white rounded-[32px] text-center font-black text-xs tracking-widest uppercase"
                  onClick={() => setIsMenuOpen(false)}
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