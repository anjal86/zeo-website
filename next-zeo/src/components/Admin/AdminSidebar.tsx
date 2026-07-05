'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Mountain,
  Backpack,
  Settings,
  LogOut,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Camera,
  Users,
  Compass,
  User,
  Briefcase,
  Zap
} from 'lucide-react';

export type MenuKey = 'overview' | 'destinations' | 'tours' | 'activities' | 'sliders' | 'kailash-gallery' | 'enquiries' | 'leads' | 'testimonials' | 'settings' | 'users' | 'blog' | 'director' | 'team';

interface AdminSidebarProps {
  sidebarOpen?: boolean;
  user?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin/dashboard' },
  { id: 'destinations', label: 'Destinations', icon: Mountain, path: '/admin/destinations' },
  { id: 'tours', label: 'Tours', icon: Backpack, path: '/admin/tours' },
  { id: 'activities', label: 'Activities', icon: Compass, path: '/admin/activities' },
  { id: 'sliders', label: 'Sliders', icon: ImageIcon, path: '/admin/sliders' },
  { id: 'kailash-gallery', label: 'Gallery', icon: Camera, path: '/admin/kailash-gallery' },
  { id: 'enquiries', label: 'Enquiries', icon: Mail, path: '/admin/enquiries' },
  { id: 'leads', label: 'Leads', icon: Zap, path: '/admin/leads' },
  { id: 'testimonials', label: 'Reviews', icon: MessageSquare, path: '/admin/testimonials' },
  { id: 'blog', label: 'Blog', icon: ImageIcon, path: '/admin/blog' },
  { id: 'director', label: 'Director Msg', icon: User, path: '/admin/director' },
  { id: 'team', label: 'Team', icon: Briefcase, path: '/admin/team' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  sidebarOpen = true,
  user,
  onLogout,
}) => {
  const pathname = usePathname();

  return (
    <div className={`h-full flex flex-col text-white bg-slate-800`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg">Zeo Admin</h1>
              <p className="text-slate-400 text-xs">Content Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 flex-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 mb-1 text-left hover:bg-slate-700 rounded-lg transition-colors text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300'
                }`}
            >
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{(user?.name?.charAt(0) || 'A')}</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@zeotreks.com'}</p>
            </div>
          )}
        </div>
        {sidebarOpen && onLogout && (
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
