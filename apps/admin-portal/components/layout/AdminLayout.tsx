'use client';

import Sidebar from './Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:min-h-screen pt-14 lg:pt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
