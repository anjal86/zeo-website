import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Image,
  Users,
  MapPin,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import SliderManager from '../components/Admin/SliderManager';
import TestimonialManager from '../components/Admin/TestimonialManager';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sliders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'sliders', label: 'Hero Sliders', icon: Image, component: SliderManager },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare, component: TestimonialManager },
    { id: 'tours', label: 'Tours', icon: MapPin, component: () => <div className="p-8 text-center text-gray-500">Tours management coming soon...</div> },
    { id: 'destinations', label: 'Destinations', icon: MapPin, component: () => <div className="p-8 text-center text-gray-500">Destinations management coming soon...</div> },
    { id: 'users', label: 'Users', icon: Users, component: () => <div className="p-8 text-center text-gray-500">User management coming soon...</div> },
    { id: 'content', label: 'Content', icon: FileText, component: () => <div className="p-8 text-center text-gray-500">Content management coming soon...</div> },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: () => <div className="p-8 text-center text-gray-500">Analytics coming soon...</div> },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SliderManager;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:shadow-none border-r border-gray-200 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-600">Manage your website content and settings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]"
            >
              <ActiveComponent />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;