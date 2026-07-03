import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  AlertCircle
} from 'lucide-react';
import { useContact } from '../../hooks/useApi';
import LoadingSpinner from '../UI/LoadingSpinner';

// API base URL helper function
const getApiBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '/api';
};

interface ContactFormData {
  company: {
    name: string;
    tagline: string;
    description: string;
  };
  contact: {
    phone: {
      primary: string;
      secondary: string;
      whatsapp: string;
    };
    email: {
      primary: string;
      booking: string;
      admin: string;
      support: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
      full: string;
    };
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      timezone: string;
      display: string;
      maps_url?: string;
      embed_url?: string;
    };
  };
  business: {
    hours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
      display: string;
    };
    support: {
      availability: string;
      emergency: string;
      response_time: string;
    };
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    whatsapp: string;
  };
  legal: {
    registration: string;
    tax_id: string;
    established: string;
    certifications: string[];
  };
}

const ContactManager: React.FC = () => {
  const { data: contactInfo, loading, error, refetch } = useContact();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    company: {
      name: 'Zeo Tourism',
      tagline: 'Embrace the Journey',
      description: 'Your trusted partner for authentic Himalayan adventures and spiritual journeys'
    },
    contact: {
      phone: {
        primary: '+97714500064',
        secondary: '+97714500064',
        whatsapp: '+9779705246799'
      },
      email: {
        primary: 'sales@zeotourism.com',
        booking: 'sales@zeotourism.com',
        admin: 'admin@zeotourism.com',
        support: 'sales@zeotourism.com'
      },
      address: {
        street: 'Baluwatar-4, Kathmandu',
        city: 'Kathmandu',
        state: 'Bagmati Province',
        country: 'Nepal',
        postal_code: '44600',
        full: 'Baluwatar-4, Kathmandu, Nepal'
      },
      location: {
        coordinates: {
          latitude: 27.725415,
          longitude: 85.3314607
        },
        timezone: 'Asia/Katmandu',
        display: 'Kathmandu, Nepal',
        maps_url: 'https://maps.app.goo.gl/vYt97pRgnnN9CVXS8',
        embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2738.8293499738834!2d85.33145348661431!3d27.72530994398019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19f625c6408f%3A0xa14006f9fceeea6a!2sZeo%20Tourism%20Pvt.Ltd!5e0!3m2!1sen!2snp!4v1758183095926!5m2!1sen!2snp'
      }
    },
    business: {
      hours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: '10:00 AM - 4:00 PM',
        display: 'Mon-Fri: 9:00 AM - 6:00 PM'
      },
      support: {
        availability: '24/7 Support Available',
        emergency: '+9779705246799',
        response_time: 'Within 2 hours'
      }
    },
    social: {
      facebook: 'https://facebook.com/zeotourism',
      instagram: 'https://instagram.com/zeotourism',
      twitter: 'https://twitter.com/zeotourism',
      youtube: 'https://youtube.com/@zeotourism',
      linkedin: 'https://linkedin.com/company/zeotourism',
      whatsapp: 'https://wa.me/9779705246799'
    },
    legal: {
      registration: 'Tourism License: 1234/078-79',
      tax_id: '600123456',
      established: '2018',
      certifications: ['Nepal Tourism Board Certified', 'TAAN Member', 'NMA Affiliated']
    }
  });

  // Load contact data when available
  useEffect(() => {
    if (contactInfo) {
      setFormData(contactInfo);
    }
  }, [contactInfo]);

  // Debounce utility function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: number;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  }, []);

  // Auto-save function without page refresh
  const autoSave = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save contact information');
      }

      // Don't refetch - just show success
      setLastSaved(new Date());
      setSubmitError(null);

      // Show save notification
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save contact information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debounced auto-save
  const debouncedAutoSave = useCallback(
    debounce((data: ContactFormData) => autoSave(data), 1000),
    [debounce]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Auto-save after change
      debouncedAutoSave(newData);

      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading contact information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Contact Information</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="contact-manager">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
          <p className="text-gray-600">Edit any field - changes are saved automatically</p>
        </div>
        <div className="flex items-center gap-3">
          {isSubmitting && (
            <div className="flex items-center text-blue-600">
              <LoadingSpinner size="sm" className="mr-2" />
              <span className="text-sm">Saving...</span>
            </div>
          )}
          {lastSaved && !isSubmitting && (
            <div className="text-sm text-green-600">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          {submitError && (
            <div className="text-sm text-red-600">
              Save failed
            </div>
          )}
        </div>
      </div>

      {/* Save Notification Toast */}
      {showSaveNotification && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slide-in-right">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
              <Save className="w-3 h-3 text-green-500" />
            </div>
            <div>
              <p className="font-medium">Contact information saved!</p>
              <p className="text-green-100 text-sm">Changes updated successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Save Contact Information Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{submitError}</p>
            </div>
          )}

          {/* Essential Contact Information */}
          <div className="space-y-6">
            {/* Company Info */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="company.name"
                  value={formData.company.name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="text"
                  name="company.tagline"
                  value={formData.company.tagline}
                  onChange={handleInputChange}
                  placeholder="Company Tagline"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Description</h4>
              <textarea
                name="company.description"
                value={formData.company.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Company Description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Additional Email Addresses */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Email Addresses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="contact.email.admin"
                  value={formData.contact.email.admin}
                  onChange={handleInputChange}
                  placeholder="Admin Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="email"
                  name="contact.email.support"
                  value={formData.contact.email.support}
                  onChange={handleInputChange}
                  placeholder="Support Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Additional Address Fields */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="contact.address.state"
                  value={formData.contact.address.state}
                  onChange={handleInputChange}
                  placeholder="State/Province"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="text"
                  name="contact.address.country"
                  value={formData.contact.address.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="business.support.availability"
                  value={formData.business.support.availability}
                  onChange={handleInputChange}
                  placeholder="Support Availability"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="text"
                  name="business.support.response_time"
                  value={formData.business.support.response_time}
                  onChange={handleInputChange}
                  placeholder="Response Time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  name="social.facebook"
                  value={formData.social.facebook}
                  onChange={handleInputChange}
                  placeholder="Facebook URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="url"
                  name="social.instagram"
                  value={formData.social.instagram}
                  onChange={handleInputChange}
                  placeholder="Instagram URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="url"
                  name="social.whatsapp"
                  value={formData.social.whatsapp}
                  onChange={handleInputChange}
                  placeholder="WhatsApp URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="url"
                  name="social.youtube"
                  value={formData.social.youtube}
                  onChange={handleInputChange}
                  placeholder="YouTube URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Contact Numbers */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Phone Numbers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="tel"
                  name="contact.phone.primary"
                  value={formData.contact.phone.primary}
                  onChange={handleInputChange}
                  placeholder="Primary Phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="tel"
                  name="contact.phone.secondary"
                  value={formData.contact.phone.secondary}
                  onChange={handleInputChange}
                  placeholder="Secondary Phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="tel"
                  name="contact.phone.whatsapp"
                  value={formData.contact.phone.whatsapp}
                  onChange={handleInputChange}
                  placeholder="WhatsApp Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Email Addresses */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Addresses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="contact.email.primary"
                  value={formData.contact.email.primary}
                  onChange={handleInputChange}
                  placeholder="Primary Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="email"
                  name="contact.email.booking"
                  value={formData.contact.email.booking}
                  onChange={handleInputChange}
                  placeholder="Booking Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="contact.address.street"
                  value={formData.contact.address.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input
                  type="text"
                  name="contact.address.city"
                  value={formData.contact.address.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Location & Maps */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Location & Maps</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="contact.location.coordinates.latitude"
                    value={formData.contact.location.coordinates.latitude}
                    onChange={handleInputChange}
                    step="any"
                    placeholder="Latitude"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="number"
                    name="contact.location.coordinates.longitude"
                    value={formData.contact.location.coordinates.longitude}
                    onChange={handleInputChange}
                    step="any"
                    placeholder="Longitude"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    name="contact.location.maps_url"
                    value={formData.contact.location.maps_url || ''}
                    onChange={handleInputChange}
                    placeholder="Google Maps URL (e.g., https://maps.app.goo.gl/...)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <input
                    type="text"
                    name="contact.location.display"
                    value={formData.contact.location.display}
                    onChange={handleInputChange}
                    placeholder="Location Display Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <textarea
                  name="contact.location.embed_url"
                  value={formData.contact.location.embed_url || ''}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Google Maps Embed URL (iframe src)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>How to get Google Maps URLs:</strong><br />
                    1. <strong>Maps URL:</strong> Go to Google Maps, find your location, click "Share" → "Copy link"<br />
                    2. <strong>Embed URL:</strong> Click "Share" → "Embed a map" → Copy the src URL from the iframe code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;