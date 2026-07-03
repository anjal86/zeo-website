import React from 'react';
import { Link } from 'react-router-dom';
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

type MenuKey = 'overview' | 'destinations' | 'tours' | 'activities' | 'sliders' | 'kailash-gallery' | 'enquiries' | 'leads' | 'testimonials' | 'settings' | 'users' | 'blog' | 'director' | 'team';

interface AdminSidebarProps {
  activeKey?: MenuKey;
  onSelect?: (key: MenuKey) => void;
  sidebarOpen?: boolean;
  user?: { name?: string; email?: string } | null;
  onLogout?: () => void;
  mode?: 'buttons' | 'links';
  linkBase?: string; // e.g. '/admin/dashboard'
}

const MENU_ITEMS: { id: MenuKey; label: string; icon: React.ComponentType<any>; pathQuery?: string }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3, pathQuery: '?tab=overview' },
  { id: 'destinations', label: 'Destinations', icon: Mountain, pathQuery: '?tab=destinations' },
  { id: 'tours', label: 'Tours', icon: Backpack, pathQuery: '?tab=tours' },
  { id: 'activities', label: 'Activities', icon: Compass, pathQuery: '?tab=activities' },
  { id: 'sliders', label: 'Sliders', icon: ImageIcon, pathQuery: '?tab=sliders' },
  { id: 'kailash-gallery', label: 'Gallery', icon: Camera, pathQuery: '?tab=kailash-gallery' },
  { id: 'enquiries', label: 'Enquiries', icon: Mail, pathQuery: '?tab=enquiries' },
  { id: 'leads', label: 'Leads', icon: Zap, pathQuery: '?tab=leads' },
  { id: 'testimonials', label: 'Reviews', icon: MessageSquare, pathQuery: '?tab=testimonials' },
  { id: 'blog', label: 'Blog', icon: ImageIcon, pathQuery: '?tab=blog' },
  { id: 'director', label: 'Director Msg', icon: User, pathQuery: '?tab=director' },
  { id: 'team', label: 'Team', icon: Briefcase, pathQuery: '?tab=team' },
  { id: 'settings', label: 'Settings', icon: Settings, pathQuery: '?tab=settings' },
  { id: 'users', label: 'Users', icon: Users, pathQuery: '?tab=users' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeKey,
  onSelect,
  sidebarOpen = false,
  user,
  onLogout,
  mode = 'buttons',
  linkBase = '/admin/dashboard'
}) => {
  return (
    <div className={`h-full flex flex-col text-white`}>
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
      <nav className="mt-4 px-2 flex-1">
        {MENU_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeKey === item.id;

          if (mode === 'links') {
            return (
              <Link
                key={item.id}
                to={`${linkBase}${item.pathQuery ?? ''}`}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 mb-1 text-left hover:bg-slate-700 rounded-lg transition-colors text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300'
                  }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelect && onSelect(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 mb-1 text-left hover:bg-slate-700 rounded-lg transition-colors text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300'
                }`}
            >
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium truncate">{item.label}</span>}
            </button>
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
            className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
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