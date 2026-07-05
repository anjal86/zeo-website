'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLayoutClient({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string } | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <AdminSidebar 
          sidebarOpen={true} 
          user={user} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-800 text-white p-4 flex items-center justify-between z-10 shadow-md flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <h1 className="font-bold text-lg">Zeo Admin</h1>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 cursor-pointer">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 min-h-0 w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
