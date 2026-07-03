import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Globe,
  AlertCircle,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdminApi } from '../../hooks/useApi';
import SearchableSelect from '../UI/SearchableSelect';
import DeleteModal from '../UI/DeleteModal';
import { useDeleteModal } from '../../hooks/useDeleteModal';
import Toggle from '../UI/Toggle';
import LoadingSpinner from '../UI/LoadingSpinner';
// @ts-ignore
import { getData } from 'country-list';

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

// Image base URL helper function
const getImageBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '';
};

interface ContentDestination {
  id?: number;
  slug?: string;
  title?: string;
  name?: string;
  country: string;
  region?: string;
  image: string;
  href?: string;
  type?: string;
  description?: string;
  featured?: boolean;
}

interface DestinationFormData extends ContentDestination {
  imageFile?: File;
  listed?: boolean;
}

const DestinationManager: React.FC = () => {
  const { data: destinations, loading, error } = useAdminApi<ContentDestination[]>('/api/admin/destinations');
  const [destList, setDestList] = useState<ContentDestination[]>([]);
  useEffect(() => {
    setDestList(destinations || []);
  }, [destinations]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<ContentDestination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nepal' | 'international'>('nepal');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state and helpers (to align with TourManager)
  const [sortBy, setSortBy] = useState<{ field: 'name' | 'country' | 'listed' | 'featured' | 'tourCount'; direction: 'asc' | 'desc' }>({ field: 'name', direction: 'asc' });

  // Status filter (client-side)
  const [statusFilter, setStatusFilter] = useState('');
  const toggleSort = (field: 'name' | 'country' | 'listed' | 'featured' | 'tourCount') => {
    setSortBy(prev => prev.field === field ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { field, direction: 'asc' });
  };

  const getComparableValue = (destination: ContentDestination, field: 'name' | 'country' | 'listed' | 'featured' | 'tourCount') => {
    switch (field) {
      case 'name':
        return (((destination as any).name || (destination as any).title || '') as string).toLowerCase();
      case 'country':
        return (((destination as any).country || '') as string).toLowerCase();
      case 'listed':
        return (destination as any).listed === false ? 0 : 1;
      case 'featured':
        return (destination as any).featured ? 1 : 0;
      case 'tourCount':
        return Number((destination as any).tourCount || 0);
      default:
        return 0;
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState<DestinationFormData>({
    slug: '',
    title: '',
    country: 'Nepal',
    image: '',
    featured: false,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = () => {
    // Clean up any existing blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);

    setFormData({
      slug: '',
      title: '',
      country: 'Nepal',
      image: '',
      featured: false,
    });
    setEditingDestination(null);
    setSubmitError(null);
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const openModal = (destination?: ContentDestination) => {
    if (destination) {
      setEditingDestination(destination);
      // Map the destination data to form structure
      const mappedData: DestinationFormData = {
        slug: (destination as any).slug || generateSlug((destination as any).name || ''),
        title: (destination as any).title || (destination as any).name || '',
        country: destination.country || 'Nepal',
        image: destination.image || '',
        listed: (destination as any).listed !== false, // Default to true if not set
        featured: destination.featured || false,
      };
      setFormData(mappedData);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };








  const deleteDestination = async (destination: ContentDestination) => {
    const token = localStorage.getItem('adminToken');
    const slug = (destination as any).slug || (destination as any).id?.toString() || destination.name || '';

    // Validate that we have a proper identifier
    if (!slug || slug === 'undefined' || slug === 'null') {
      throw new Error('Invalid destination identifier. Cannot delete destination without proper ID or slug.');
    }

    // Log the deletion attempt for debugging
    console.log('Attempting to delete destination:', {
      slug,
      id: (destination as any).id,
      name: destination.name,
      title: (destination as any).title
    });

    const response = await fetch(`${getApiBaseUrl()}/admin/destinations/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete destination failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        slug
      });

      // Provide more specific error messages
      if (response.status === 404) {
        throw new Error(`Destination "${slug}" not found. It may have already been deleted or the identifier is invalid.`);
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else {
        throw new Error(errorData.error || `Failed to delete destination (${response.status})`);
      }
    }

    // Update local list without reloading the page
    setDestList(prev => prev.filter(d => {
      const idOrSlug = (d as any).slug || (d as any).id?.toString() || d.name || '';
      return idOrSlug !== slug;
    }));

    // Notify other components
    window.dispatchEvent(new CustomEvent('destinationUpdated', {
      detail: {
        destinationId: (destination as any).id,
        timestamp: Date.now()
      }
    }));
  };

  // Enhanced filtering with search - moved before early returns to fix hook order
  const allFilteredDestinations = React.useMemo(() => {
    return (destList || [])?.filter(destination => {
      const country = (destination as any).country || '';
      const type = (destination as any).type || '';
      const name = (destination as any).name || (destination as any).title || '';
      const region = (destination as any).region || '';

      // Tab filter
      let tabMatch = false;
      if (activeTab === 'nepal') {
        tabMatch = country === 'Nepal' || type === 'nepal';
      } else {
        tabMatch = country !== 'Nepal' && type === 'international';
      }

      // Search filter
      const searchMatch = searchTerm === '' ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const isListed = (destination as any).listed !== false;
      const statusMatch = statusFilter === '' || (statusFilter === 'listed' ? isListed : statusFilter === 'unlisted' ? !isListed : true);

      return tabMatch && searchMatch && statusMatch;
    }) || [];
  }, [destList, activeTab, searchTerm, statusFilter]);

  // Apply sorting before pagination
  const sortedDestinations = React.useMemo(() => {
    const list = [...allFilteredDestinations];
    list.sort((a, b) => {
      const aVal = getComparableValue(a, sortBy.field);
      const bVal = getComparableValue(b, sortBy.field);
      let cmp = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortBy.direction === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [allFilteredDestinations, sortBy]);

  const deleteModal = useDeleteModal<ContentDestination>({
    onDelete: deleteDestination,
    getItemName: (destination) => (destination as any).title || (destination as any).name || 'Unnamed Destination',
    getItemId: (destination) => (destination as any).slug || (destination as any).id || destination.name
  });

  const handleDeleteClick = async (destination: ContentDestination) => {
    try {
      deleteModal.openModal(destination);
    } catch (error) {
      alert('Failed to delete destination: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleListToggle = async (destination: ContentDestination) => {
    try {
      const slug = (destination as any).slug || (destination as any).id?.toString() || destination.name || '';
      const currentListed = (destination as any).listed !== false;
      const newListed = !currentListed;

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/destinations/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          listed: newListed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update destination listing status');
      }

      // Update local list without reloading
      setDestList(prev => prev.map(d => {
        const idOrSlug = (d as any).slug || (d as any).id?.toString() || d.name || '';
        if (idOrSlug === slug) {
          return { ...d, listed: newListed } as ContentDestination;
        }
        return d;
      }));

      // Trigger a global refresh event for other components
      window.dispatchEvent(new CustomEvent('destinationUpdated', {
        detail: {
          destinationId: (destination as any).id,
          timestamp: Date.now()
        }
      }));

    } catch (error) {
      alert('Failed to update listing status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleFeaturedToggle = async (destination: ContentDestination) => {
    try {
      const slug = (destination as any).slug || (destination as any).id?.toString() || destination.name || '';
      const currentFeatured = (destination as any).featured || false;
      const newFeatured = !currentFeatured;

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/destinations/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          featured: newFeatured
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update destination featured status');
      }

      // Update local list without reloading
      setDestList(prev => prev.map(d => {
        const idOrSlug = (d as any).slug || (d as any).id?.toString() || d.name || '';
        if (idOrSlug === slug) {
          return { ...d, featured: newFeatured } as ContentDestination;
        }
        return d;
      }));

      // Trigger a global refresh event
      window.dispatchEvent(new CustomEvent('destinationUpdated', {
        detail: {
          destinationId: (destination as any).id,
          timestamp: Date.now()
        }
      }));

    } catch (error) {
      alert('Failed to update featured status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading destinations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Destinations</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Pagination calculations
  const totalItems = sortedDestinations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredDestinations = sortedDestinations.slice(startIndex, endIndex);

  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, totalItems);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: 'nepal' | 'international') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="destination-manager">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Destinations</h3>
          <p className="text-gray-600">Manage your destination content and information</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Destination
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Tab Filter */}
          <div>
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value as 'nepal' | 'international')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="nepal">Nepal Destinations</option>
              <option value="international">International</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="listed">Listed</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1">
                    <span>Destination</span>
                    <span className="text-gray-400">
                      {sortBy.field === 'name' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
                <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('country')} className="flex items-center gap-1">
                    <span>Country</span>
                    <span className="text-gray-400">
                      {sortBy.field === 'country' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
                <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('listed')} className="flex items-center gap-1">
                    <span>Listed</span>
                    <span className="text-gray-400">
                      {sortBy.field === 'listed' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
                <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('featured')} className="flex items-center gap-1">
                    <span>Featured</span>
                    <span className="text-gray-400">
                      {sortBy.field === 'featured' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
                <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('tourCount')} className="flex items-center gap-1">
                    <span>Tours</span>
                    <span className="text-gray-400">
                      {sortBy.field === 'tourCount' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
                <th className="w-16 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDestinations.map((destination: ContentDestination) => (
                <tr
                  key={(destination as any).slug || (destination as any).name || (destination as any).id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openModal(destination)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={
                            destination.image
                              ? (destination.image.startsWith('http')
                                ? destination.image
                                : `${getImageBaseUrl()}${destination.image}`)
                              : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400'
                          }
                          alt={(destination as any).title || (destination as any).name || 'Destination'}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                          }}
                        />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={(destination as any).title || (destination as any).name}>
                          {(destination as any).title || (destination as any).name || 'Unnamed Destination'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center min-w-0">
                      <Globe className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate" title={destination.country}>{destination.country}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === 'nepal'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {activeTab === 'nepal' ? 'Nepal' : 'International'}
                    </span>
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <Toggle
                        checked={(destination as any).listed !== false}
                        onChange={() => handleListToggle(destination)}
                        size="sm"
                      />
                      <span className="ml-2 text-xs text-gray-600 hidden xl:block">
                        {(destination as any).listed !== false ? (
                          <span className="flex items-center text-green-600">
                            <Eye className="w-3 h-3 mr-1" />
                            Listed
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Unlisted
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center">
                      <Toggle
                        checked={(destination as any).featured || false}
                        onChange={() => handleFeaturedToggle(destination)}
                        size="sm"
                      />
                      <span className="ml-2 text-xs text-gray-600 hidden xl:block">
                        {(destination as any).featured ? (
                          <span className="flex items-center text-yellow-600">
                            Featured
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500">
                            Standard
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {(destination as any).tourCount || 0} Tours
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openModal(destination)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                        title="Edit destination"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(destination)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1"
                        title="Delete destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Destinations Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredDestinations.map((destination: ContentDestination) => (
          <div
            key={(destination as any).slug || (destination as any).name || (destination as any).id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openModal(destination)}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  className="h-16 w-16 rounded-lg object-cover"
                  src={
                    destination.image
                      ? (destination.image.startsWith('http')
                        ? destination.image
                        : `${getImageBaseUrl()}${destination.image}`)
                      : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400'
                  }
                  alt={(destination as any).title || (destination as any).name || 'Destination'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {(destination as any).title || (destination as any).name || 'Unnamed Destination'}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${activeTab === 'nepal'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {activeTab === 'nepal' ? 'Nepal' : 'International'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openModal(destination)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                      title="Edit destination"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(destination)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1"
                      title="Delete destination"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    <span className="truncate">{destination.country}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center">
                    <Toggle
                      checked={(destination as any).listed !== false}
                      onChange={() => handleListToggle(destination)}
                      size="sm"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                      {(destination as any).listed !== false ? (
                        <span className="flex items-center text-green-600">
                          <Eye className="w-3 h-3 mr-1" />
                          Listed
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Unlisted
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Toggle
                      checked={(destination as any).featured || false}
                      onChange={() => handleFeaturedToggle(destination)}
                      size="sm"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                      {(destination as any).featured ? (
                        <span className="text-yellow-600">Featured</span>
                      ) : (
                        <span className="text-gray-500">Standard</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(totalItems > itemsPerPage || filteredDestinations.length >= itemsPerPage) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center text-xs sm:text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`
                  inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium
                  ${currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`
                        inline-flex items-center px-2 sm:px-3 py-2 border text-xs sm:text-sm font-medium rounded-md
                        ${currentPage === pageNumber
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`
                  inline-flex items-center px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium
                  ${currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                  }
                `}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredDestinations.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No Destinations Match Your Filters' : 'No Destinations Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `No destinations found matching your search. Try adjusting your search terms.`
                : 'Get started by creating your first destination.'
              }
            </p>
            {searchTerm ? (
              <button
                onClick={handleClearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => openModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Destination
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        {...deleteModal.modalProps}
        title="Delete Destination"
        message="Are you sure you want to delete this destination? This will permanently remove the destination and all its associated data."
        confirmText="Delete Destination"
        variant="danger"
      />

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
                  {editingDestination ? 'Edit Destination' : 'Add New Destination'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-auto">
                {/* Form */}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitError(null);

                  try {
                    const token = localStorage.getItem('adminToken');

                    let imagePath = formData.image || '';

                    // If a new image file was selected, upload it
                    if ((formData as any).imageFile) {
                      try {
                        const formDataObj = new FormData();
                        formDataObj.append('image', (formData as any).imageFile);
                        formDataObj.append('destinationSlug', formData.slug || '');

                        console.log('Uploading image to:', `${getApiBaseUrl()}/admin/upload`);
                        console.log('File details:', {
                          name: (formData as any).imageFile.name,
                          size: (formData as any).imageFile.size,
                          type: (formData as any).imageFile.type
                        });

                        const uploadResponse = await fetch(`${getApiBaseUrl()}/admin/upload`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`
                          },
                          body: formDataObj
                        });

                        console.log('Upload response status:', uploadResponse.status);
                        console.log('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

                        if (!uploadResponse.ok) {
                          let errorMessage = 'Image upload failed';
                          try {
                            const errorData = await uploadResponse.json();
                            errorMessage = errorData.error || errorMessage;
                            console.error('Upload error data:', errorData);
                          } catch (parseError) {
                            const errorText = await uploadResponse.text();
                            console.error('Upload error text:', errorText);
                            errorMessage = `HTTP ${uploadResponse.status}: ${errorText || uploadResponse.statusText}`;
                          }
                          throw new Error(errorMessage);
                        }

                        const uploadData = await uploadResponse.json();
                        console.log('Upload success data:', uploadData);
                        imagePath = uploadData.path || uploadData.url || imagePath;
                      } catch (uploadError) {
                        console.error('Image upload error:', uploadError);
                        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
                        throw new Error(`Image upload failed: ${errorMessage}`);
                      }
                    }

                    const payload = {
                      slug: formData.slug,
                      title: formData.title,
                      country: formData.country,
                      image: imagePath,
                      listed: (formData as any).listed !== false,
                      featured: (formData as any).featured || false,
                      ...(formData.description ? { description: formData.description } : {})
                    };

                    // Construct the correct URL based on whether we're creating or updating
                    const url = editingDestination
                      ? `${getApiBaseUrl()}/admin/destinations/${(editingDestination as any)?.slug || (editingDestination as any)?.id || ''}`
                      : `${getApiBaseUrl()}/admin/destinations`;

                    const response = await fetch(url, {
                      method: editingDestination ? 'PUT' : 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to save destination');
                    }

                    const savedData = await response.json();

                    // Update local list
                    setDestList(prev => {
                      const existsIndex = prev.findIndex(d => {
                        const idOrSlug = (d as any).slug || (d as any).id?.toString() || d.name || '';
                        return idOrSlug === (editingDestination as any)?.slug || idOrSlug === (editingDestination as any)?.id?.toString();
                      });
                      if (existsIndex >= 0) {
                        const newList = [...prev];
                        newList[existsIndex] = savedData;
                        return newList;
                      }
                      return [savedData, ...prev];
                    });

                    // Close modal
                    closeModal();

                  } catch (error) {
                    setSubmitError(error instanceof Error ? error.message : 'Failed to save destination');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}>
                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setFormData(prev => ({ ...prev, title: newTitle, slug: generateSlug(newTitle) }));
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <SearchableSelect
                        options={getData().map((country: any) => ({ label: country.name, value: country.name }))}
                        value={formData.country}
                        onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Image</label>
                      <div className="mt-1">
                        {previewUrl ? (
                          <div className="relative">
                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-md border" />
                            <button
                              type="button"
                              onClick={() => {
                                if (previewUrl && previewUrl.startsWith('blob:')) {
                                  URL.revokeObjectURL(previewUrl);
                                }
                                setPreviewUrl(null);
                                setFormData(prev => ({ ...prev, image: '' }));
                              }}
                              className="absolute top-2 right-2 bg-white rounded-md p-2 shadow hover:bg-gray-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center w-full h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                              <span className="text-sm text-gray-600">Click to upload image</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = URL.createObjectURL(file);
                                  setPreviewUrl(url);
                                  setFormData(prev => ({ ...prev, imageFile: file } as DestinationFormData));
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Toggle
                          checked={(formData as any).listed !== false}
                          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, listed: checked }))}
                          size="sm"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {(formData as any).listed !== false ? (
                            <span className="flex items-center text-green-600">
                              <Eye className="w-4 h-4 mr-1" />
                              Listed
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              <EyeOff className="w-4 h-4 mr-1" />
                              Unlisted
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Toggle
                          checked={(formData as any).featured || false}
                          onChange={(checked: boolean) => setFormData(prev => ({ ...prev, featured: checked }))}
                          size="sm"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {(formData as any).featured ? (
                            <span className="text-yellow-600 font-medium">Featured</span>
                          ) : (
                            <span className="text-gray-500">Standard</span>
                          )}
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Saving...' : (editingDestination ? 'Update Destination' : 'Create Destination')}
                      </button>
                    </div>

                    {submitError && (
                      <div className="mt-4 text-red-600 text-sm">
                        {submitError}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div >
        )}
      </AnimatePresence >
    </div >
  );
};

export default DestinationManager;
