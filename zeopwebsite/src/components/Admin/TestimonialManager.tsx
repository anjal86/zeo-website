
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  MessageSquare,
  Star,
  AlertCircle,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import Toggle from '../UI/Toggle';
import DeleteModal from '../UI/DeleteModal';
import { useDeleteModal } from '../../hooks/useDeleteModal';
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

interface Testimonial {
  id: number;
  name: string;
  email: string;
  country: string;
  tour: string;
  rating: number;
  title: string;
  message: string;
  image: string;
  date: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface TestimonialFormData {
  name: string;
  email: string;
  country: string;
  tour: string;
  rating: number;
  title: string;
  message: string;
  image: string;
  is_featured: boolean;
  is_approved: boolean;
}

const TestimonialManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  const [formData, setFormData] = useState<TestimonialFormData>({
    name: '',
    email: '',
    country: '',
    tour: '',
    rating: 5,
    title: '',
    message: '',
    image: '',
    is_featured: false,
    is_approved: true,
  });

  // Delete testimonial function for the hook
  const deleteTestimonial = async (testimonial: Testimonial) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${getApiBaseUrl()}/admin/testimonials/${testimonial.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete testimonial');
    }

    await fetchTestimonials();
  };

  // Delete modal hook
  const deleteModal = useDeleteModal<Testimonial>({
    onDelete: deleteTestimonial,
    getItemName: (testimonial) => testimonial.title,
    getItemId: (testimonial) => testimonial.id
  });

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      country: '',
      tour: '',
      rating: 5,
      title: '',
      message: '',
      image: '',
      is_featured: false,
      is_approved: true,
    });
    setEditingTestimonial(null);
    setSubmitError(null);
  };

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        email: testimonial.email,
        country: testimonial.country,
        tour: testimonial.tour,
        rating: testimonial.rating,
        title: testimonial.title,
        message: testimonial.message,
        image: testimonial.image,
        is_featured: testimonial.is_featured,
        is_approved: testimonial.is_approved,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'rating') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingTestimonial
        ? `${getApiBaseUrl()}/admin/testimonials/${editingTestimonial.id}`
        : `${getApiBaseUrl()}/admin/testimonials`;

      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save testimonial');
      }

      await fetchTestimonials();
      closeModal();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (testimonial: Testimonial) => {
    try {
      deleteModal.openModal(testimonial);
    } catch (error) {
      alert('Failed to delete testimonial: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/testimonials/${id}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle featured status');
      }

      await fetchTestimonials();
    } catch (error) {
      alert('Failed to toggle featured status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading testimonials...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Testimonials</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchTestimonials}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter testimonials based on active tab
  const filteredTestimonials = testimonials.filter(testimonial => {
    if (activeTab === 'featured') return testimonial.is_featured;
    return true; // 'all'
  });

  return (
    <div className="testimonial-manager">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Testimonials</h3>
          <p className="text-gray-600">Manage customer testimonials and reviews</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeTab === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-500'
              }`}
          >
            All ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${activeTab === 'featured'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-yellow-500'
              }`}
          >
            Featured ({testimonials.filter(t => t.is_featured).length})
          </button>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' ? 'All' : 'Featured'} Testimonials
            </h4>
            <div className="text-sm text-gray-500">
              {filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-semibold text-gray-900">{testimonial.name}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {testimonial.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testimonial.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating and Title */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <span className="text-sm text-gray-500">({testimonial.rating}/5)</span>
                  </div>
                  <h6 className="font-medium text-gray-900">{testimonial.title}</h6>
                </div>

                {/* Message */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {testimonial.message}
                </p>

                {/* Tour and Date */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Tour: {testimonial.tour}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(testimonial.date).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(testimonial)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(testimonial.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${testimonial.is_featured
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    title={testimonial.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(testimonial)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                    title="Delete testimonial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredTestimonials.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Testimonials Found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all'
              ? 'Get started by adding your first testimonial.'
              : 'No featured testimonials found.'}
          </p>
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add First Testimonial
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="overflow-y-auto flex-1 p-6">
                  <div className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Error</span>
                        </div>
                        <p className="text-red-700 mt-1">{submitError}</p>
                      </div>
                    )}

                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Customer Information</h4>
                          <p className="text-sm text-gray-500">Basic details about the customer</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Customer name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="customer@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="e.g., United States"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Tour *
                            </label>
                            <input
                              type="text"
                              name="tour"
                              value={formData.tour}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="e.g., Everest Base Camp Trek"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Profile Image URL
                          </label>
                          <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="https://example.com/profile.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Testimonial Content</h4>
                          <p className="text-sm text-gray-500">The testimonial message and rating</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Title *
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="e.g., Amazing Experience"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Rating *
                            </label>
                            <select
                              name="rating"
                              value={formData.rating}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value={5}>5 Stars - Excellent</option>
                              <option value={4}>4 Stars - Very Good</option>
                              <option value={3}>3 Stars - Good</option>
                              <option value={2}>2 Stars - Fair</option>
                              <option value={1}>1 Star - Poor</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Message *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                            placeholder="Write the testimonial message..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-900 cursor-pointer">
                                Featured
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                Whether this testimonial should be featured prominently
                              </p>
                            </div>
                            <Toggle
                              checked={formData.is_featured}
                              onChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                              size="md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer with Action Buttons */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingTestimonial ? 'Update' : 'Create'} Testimonial
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <DeleteModal
        {...deleteModal.modalProps}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This will permanently remove the testimonial and cannot be undone."
        confirmText="Delete Testimonial"
        variant="danger"
      />
    </div>
  );
};

export default TestimonialManager;