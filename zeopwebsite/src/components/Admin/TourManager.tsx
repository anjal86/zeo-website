import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Download
} from 'lucide-react';
import DeleteModal from '../UI/DeleteModal';
import Toggle from '../UI/Toggle';
import { useDeleteModal } from '../../hooks/useDeleteModal';
import { toursApi, type Tour } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';

// API base URL helper function
const getApiBaseUrl = (): string => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  return '/api';
};

const TourManager: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destinationsMap, setDestinationsMap] = useState<Map<number, string>>(new Map());
  const [updatingTours, setUpdatingTours] = useState<Set<number>>(new Set());
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'id', direction: 'desc' });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(destinationFilter && { destination: destinationFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(regionFilter && { region: regionFilter })
      });

      const response = await fetch(`${getApiBaseUrl()}/admin/tours?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }

      const data = await response.json();

      if (data.tours && data.pagination) {
        setTours(data.tours);
        setTotalItems(data.pagination.totalItems);
      } else {
        const toursArray = Array.isArray(data) ? data : (data.tours || []);
        setTours(toursArray);
        setTotalItems(toursArray.length);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, destinationFilter, statusFilter, regionFilter]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/destinations?includeUnlisted=true`);
        if (response.ok) {
          const data = await response.json();
          const uniqueLocations = [...new Set(data.map((dest: any) => dest.name || dest.title).filter(Boolean))] as string[];
          setDestinations(uniqueLocations);

          const destMap = new Map<number, string>();
          data.forEach((dest: any) => {
            const name = dest.name || dest.title;
            destMap.set(dest.id, name);
          });
          setDestinationsMap(destMap);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };
    fetchDestinations();
  }, []);

  const deleteTour = async (tour: Tour) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${getApiBaseUrl()}/admin/tours/${tour.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete tour');
    }

    await fetchTours();
  };

  const handleExportSingleTour = async (tour: Tour) => {
    try {
      setExportingId(tour.id);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/tours/${tour.id}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tour.slug ? `${tour.slug}.json` : `tour_${tour.id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export tour');
    } finally {
      setExportingId(null);
    }
  };



  const deleteModal = useDeleteModal<Tour>({
    onDelete: deleteTour,
    getItemName: (tour) => tour.title,
    getItemId: (tour) => tour.id
  });

  const handleDeleteClick = (tour: Tour) => {
    deleteModal.openModal(tour);
  };

  const handleToggleListing = async (tour: Tour) => {
    const newListedStatus = !tour.listed;
    setUpdatingTours(prev => new Set(prev).add(tour.id));
    try {
      await toursApi.updateListingStatus(tour.id, newListedStatus);
      setTours(prevTours =>
        prevTours.map(t =>
          t.id === tour.id ? { ...t, listed: newListedStatus } : t
        )
      );
    } catch (error) {
      alert('Failed to update tour listing status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUpdatingTours(prev => {
        const newSet = new Set(prev);
        newSet.delete(tour.id);
        return newSet;
      });
    }
  };

  const toggleSort = (field: string) => {
    setSortBy(prev => prev.field === field ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { field, direction: 'asc' });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDestinationFilter('');
    setStatusFilter('');
    setRegionFilter('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (loading && tours.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600">Loading tours...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">Error Loading Tours</h3>
        <p className="text-slate-500 mb-4">{error}</p>
        <button
          onClick={fetchTours}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Tours</h3>
          <p className="text-slate-600 text-sm sm:text-base">Manage your tour packages and itineraries</p>
        </div>

        <button
          onClick={() => navigate('/admin/tours/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Tour</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <select
              value={destinationFilter}
              onChange={(e) => { setDestinationFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-medium"
            >
              <option value="">All Destinations</option>
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <select
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-medium"
            >
              <option value="">All Regions</option>
              <option value="nepal">Nepal</option>
              <option value="international">International</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white font-medium"
            >
              <option value="">All Status</option>
              <option value="listed">Listed</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
        </div>

        {(searchTerm || destinationFilter || statusFilter || regionFilter) && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Found {totalItems} tours matching your filters
            </div>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('title')} className="flex items-center gap-1">
                    <span>Tour</span>
                    <span className="text-gray-400">{sortBy.field === 'title' ? (sortBy.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No tours found matching your search.
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/tours/${tour.slug}`)}>
                    <td className="px-4 py-4 truncate font-medium text-gray-900" title={tour.title}>{tour.title}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{tour.category}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{destinationsMap.get(tour.primary_destination_id || 0) || tour.location}</td>
                    <td className="px-3 py-4 text-sm font-semibold text-green-600">${tour.price}</td>
                    <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                      <Toggle
                        checked={tour.listed !== false}
                        onChange={() => handleToggleListing(tour)}
                        disabled={updatingTours.has(tour.id)}
                        size="sm"
                      />
                    </td>
                    <td className="px-3 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/admin/tours/${tour.slug}`)} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportSingleTour(tour)}
                          disabled={exportingId === tour.id}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          title="Export JSON"
                        >
                          {exportingId === tour.id ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDeleteClick(tour)} className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalItems > itemsPerPage && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startItem} to {endItem} of {totalItems} results
            </div>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-white transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-white transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {tours.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">
            No tours found matching your search.
          </div>
        ) : (
          tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/admin/tours/${tour.slug}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900 truncate flex-1 mr-2">{tour.title}</div>
                <div className="text-sm font-semibold text-green-600">${tour.price}</div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{tour.category}</span>
                <span className="text-xs text-gray-500">{destinationsMap.get(tour.primary_destination_id || 0) || tour.location}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <Toggle
                    checked={tour.listed !== false}
                    onChange={() => handleToggleListing(tour)}
                    disabled={updatingTours.has(tour.id)}
                    size="sm"
                  />
                  <span className="ml-2 text-xs text-gray-500">Listed</span>
                </div>
                <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => navigate(`/admin/tours/${tour.slug}`)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button
                    onClick={() => handleExportSingleTour(tour)}
                    disabled={exportingId === tour.id}
                    className="text-gray-600"
                  >
                    {exportingId === tour.id ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDeleteClick(tour)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteModal
        {...deleteModal.modalProps}
        title="Delete Tour"
        message="Are you sure you want to delete this tour?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default TourManager;