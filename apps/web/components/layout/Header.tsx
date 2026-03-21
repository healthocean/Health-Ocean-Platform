'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User as UserIcon, ShoppingCart, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { getCartCount } from '@/lib/cart';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check authentication on mount and when localStorage changes
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

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab updates
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('cart-change', updateCart);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('cart-change', updateCart);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.jpeg" 
              alt="Health Ocean Logo" 
              width={40} 
              height={40} 
              className="rounded-lg"
            />
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">Health Ocean</span>
              <p className="text-xs text-gray-500">Dive into better health</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/tests" className="text-gray-700 hover:text-primary-500 transition">
              Tests
            </Link>
            <Link href="/packages" className="text-gray-700 hover:text-primary-500 transition">
              Health Packages
            </Link>
            {user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-500 transition">
                Dashboard
              </Link>
            )}
            <Link href="/about" className="text-gray-700 hover:text-primary-500 transition">
              About
            </Link>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-500 transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-700 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline text-sm">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/tests"
              className="block text-gray-700 hover:text-primary-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Tests
            </Link>
            <Link
              href="/packages"
              className="block text-gray-700 hover:text-primary-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Health Packages
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="block text-gray-700 hover:text-primary-500 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/about"
              className="block text-gray-700 hover:text-primary-500 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {user ? (
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-gray-900">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 space-y-2">
                <Link 
                  href="/login" 
                  className="block btn btn-outline w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="block btn btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}