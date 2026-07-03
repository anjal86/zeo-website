import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

interface LogoData {
  header: string;
  footer: string;
  lastUpdated: string;
}

const LogoManager: React.FC = () => {
  const [logos, setLogos] = useState<LogoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch logos data
  const fetchLogos = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/logos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logos');
      }

      const data = await response.json();
      setLogos(data);
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'header' | 'footer') => {
    try {
      setUploading(type);
      setMessage(null);

      const formData = new FormData();
      formData.append('logo', file);
      formData.append('type', type);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/logos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload logo');
      }

      const result = await response.json();
      setLogos(result.logos);
      setMessage({ type: 'success', text: result.message });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error uploading logo:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload logo'
      });
    } finally {
      setUploading(null);
    }
  };


  // Handle reset to default
  const handleReset = async (type: 'header' | 'footer') => {
    if (!confirm(`Are you sure you want to reset the ${type} logo to default?`)) {
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/logos/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset logo');
      }

      const result = await response.json();
      setLogos(result.logos);
      setMessage({ type: 'success', text: result.message });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error resetting logo:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reset logo'
      });
    } finally {
      setLoading(false);
    }
  };

  // File input handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      handleFileUpload(file, type);
    }
  };

  if (loading && !logos) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error && !logos) {
    return <ErrorMessage message={error} className="py-20" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logo Management</h2>
          <p className="text-gray-600 mt-1">Upload and manage logos for header and footer</p>
        </div>
        <button
          onClick={fetchLogos}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </motion.div>
      )}

      {logos && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Header Logo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Header Logo
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="flex items-center justify-center h-16">
                  <img
                    src={logos.header}
                    alt="Header Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/zeo-logo.png';
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'header')}
                    className="hidden"
                    disabled={uploading === 'header'}
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    {uploading === 'header' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading === 'header' ? 'Uploading...' : 'Upload'}
                  </div>
                </label>
                <button
                  onClick={() => handleReset('header')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Logo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Footer Logo
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-900">
                <div className="flex items-center justify-center h-16">
                  <img
                    src={logos.footer}
                    alt="Footer Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/zeo-logo-white.png';
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'footer')}
                    className="hidden"
                    disabled={uploading === 'footer'}
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                    {uploading === 'footer' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading === 'footer' ? 'Uploading...' : 'Upload'}
                  </div>
                </label>
                <button
                  onClick={() => handleReset('footer')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoManager;