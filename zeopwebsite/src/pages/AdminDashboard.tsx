import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Mountain,
  Backpack,
  Settings,
  Menu,
  X,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Zap
} from 'lucide-react';
import { useApi, useAdminApi } from '../hooks/useApi';
import DestinationManager from '../components/Admin/DestinationManager';
import TourManager from '../components/Admin/TourManager';
import SliderManager from '../components/Admin/SliderManager';
import ContactManager from '../components/Admin/ContactManager';
import ContactEnquiryManager from '../components/Admin/ContactEnquiryManager';
import TestimonialManager from '../components/Admin/TestimonialManager';
import KailashGalleryManager from '../components/Admin/KailashGalleryManager';
import LogoManager from '../components/Admin/LogoManager';
import AdminSidebar from '../components/Admin/AdminSidebar';
import ActivityManager from '../components/Admin/ActivityManager';
import BlogManager from '../components/Admin/BlogManager';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import DirectorMessageManager from '../components/Admin/DirectorMessageManager';
import TeamManager from '../components/Admin/TeamManager';
import LeadsManager from '../components/Admin/LeadsManager';

// ... (lines 28-35)
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

type ActiveTab = 'overview' | 'destinations' | 'tours' | 'activities' | 'sliders' | 'kailash-gallery' | 'enquiries' | 'testimonials' | 'settings' | 'blog' | 'director' | 'team' | 'leads';

// ... (lines 37-101)


const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  // Add responsive detection for animation behavior
  const [isMobile, setIsMobile] = useState(false);

  // Get active tab from URL or default to 'overview'
  const activeTab = (searchParams.get('tab') as ActiveTab) || 'overview';

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      navigate('/admin/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Track viewport width to decide slide behavior
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Function to handle tab changes and update URL
  const handleTabChange = (tab: ActiveTab) => {
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent onTabChange={handleTabChange} />;
      case 'destinations':
        return <DestinationManager />;
      case 'tours':
        return <TourManager />;
      case 'activities':
        return <ActivityManager />;
      case 'sliders':
        return <SliderManager />;
      case 'kailash-gallery':
        return <KailashGalleryManager />;
      case 'enquiries':
        return <ContactEnquiryManager />;
      case 'testimonials':
        return <TestimonialManager />;
      case 'blog':
        return <BlogManager />;
      case 'director':
        return <DirectorMessageManager />;
      case 'team':
        return <TeamManager />;
      case 'leads':
        return <LeadsManager />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <OverviewContent onTabChange={handleTabChange} />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`bg-slate-800 text-white fixed left-0 top-0 h-full z-30 ${sidebarOpen ? 'md:w-64' : 'md:w-16'}`}
        initial={false}
        animate={{ x: isMobile && !sidebarOpen ? '-100%' : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        aria-expanded={sidebarOpen}
      >
        <AdminSidebar
          activeKey={activeTab}
          onSelect={(key) => {
            handleTabChange(key as ActiveTab);
            setSidebarOpen(false);
          }}
          sidebarOpen={sidebarOpen}
          user={user}
          onLogout={handleLogout}
          mode={'buttons'}
        />
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600 hidden sm:block">
                Welcome back, <span className="font-medium">{user.name}</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center sm:hidden">
                <span className="text-white text-sm font-bold">{user.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="grid grid-cols-4 gap-0">
          {/* Overview */}
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'overview'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600'
              }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Overview</span>
          </button>

          {/* Tours */}
          <button
            onClick={() => handleTabChange('tours')}
            className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'tours'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600'
              }`}
          >
            <Backpack className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Tours</span>
          </button>

          {/* Destinations */}
          <button
            onClick={() => handleTabChange('destinations')}
            className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'destinations'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600'
              }`}
          >
            <Mountain className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Destinations</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex flex-col items-center justify-center py-3 transition-colors ${activeTab === 'settings'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600'
              }`}
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Overview Content Component
const OverviewContent: React.FC<{ onTabChange: (tab: ActiveTab) => void }> = ({ onTabChange }) => {
  const { data: destinations } = useApi('/api/destinations?includeUnlisted=true');
  const { data: tours } = useApi('/api/tours');
  const { data: enquiries } = useAdminApi('/api/admin/enquiries');
  const { data: testimonials } = useApi('/api/testimonials');
  const { data: leadsData } = useAdminApi('/api/admin/leads');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Destinations</p>
              <p className="text-2xl font-bold text-slate-900">
                {destinations ? destinations.length : '...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mountain className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Tours</p>
              <p className="text-2xl font-bold text-slate-900">
                {tours ? tours.length : '...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Backpack className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Contact Enquiries</p>
              <p className="text-2xl font-bold text-slate-900">
                {enquiries ? enquiries.length : '...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Testimonials</p>
              <p className="text-2xl font-bold text-slate-900">
                {testimonials ? testimonials.length : '...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Conversion Leads stat card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => onTabChange('leads')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conversion Leads</p>
              <p className="text-2xl font-bold text-slate-900">
                {leadsData ? leadsData.length : '...'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onTabChange('destinations')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
          >
            <div className="mb-2">
              <Mountain className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">Manage Destinations</h4>
            <p className="text-sm text-slate-600">Add or edit travel destinations</p>
          </button>

          <button
            onClick={() => onTabChange('tours')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group"
          >
            <div className="mb-2">
              <Backpack className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">Manage Tours</h4>
            <p className="text-sm text-slate-600">Add or edit tour packages</p>
          </button>

          <button
            onClick={() => onTabChange('sliders')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left group"
          >
            <div className="mb-2">
              <ImageIcon className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">Manage Sliders</h4>
            <p className="text-sm text-slate-600">Update hero section sliders</p>
          </button>

          <button
            onClick={() => onTabChange('leads')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
          >
            <div className="mb-2">
              <Zap className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">View Leads</h4>
            <p className="text-sm text-slate-600">Conversion tool lead captures</p>
          </button>

          <button
            onClick={() => onTabChange('enquiries')}
            className="p-4 border border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-left group"
          >
            <div className="mb-2">
              <Mail className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="font-medium text-slate-900">View Enquiries</h4>
            <p className="text-sm text-slate-600">Check customer enquiries</p>
          </button>
        </div>
      </div>
    </div>
  );
};


// Settings Content Component
const SettingsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Logo Management Section */}
      <div>
        <LogoManager />
      </div>

      {/* Contact Information Section */}
      <div>
        <ContactManager />
      </div>
    </div>
  );
};

export default AdminDashboard;