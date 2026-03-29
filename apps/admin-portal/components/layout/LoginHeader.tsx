'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LoginHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/healthoceanlogo.png"
                alt="Health Ocean"
                width={48}
                height={48}
                className="rounded-xl"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg lg:text-xl font-bold text-gray-900">Health Ocean</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
