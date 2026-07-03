import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  MessageSquare,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import DeleteModal from '../UI/DeleteModal';
import { useDeleteModal } from '../../hooks/useDeleteModal';
import LoadingSpinner from '../UI/LoadingSpinner';

// API base URL helper function
const getApiBaseUrl = (): string => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  return '/api';
};

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string;
  tour_name: string;
  number_of_people: string;
  travel_date: string;
  message: string;
  assigned_to: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  source: string;
}

const ContactEnquiryManager: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch enquiries
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/enquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enquiries');
      }

      const data = await response.json();
      setEnquiries(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Delete enquiry function for modal
  const deleteEnquiry = async (enquiry: Enquiry) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${getApiBaseUrl()}/admin/enquiries/${enquiry.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete enquiry');
    }

    await fetchEnquiries();
  };

  const deleteModal = useDeleteModal<Enquiry>({
    onDelete: deleteEnquiry,
    getItemName: (enquiry) => `enquiry from ${enquiry.name}`,
    getItemId: (enquiry) => enquiry.id
  });

  const handleDeleteClick = async (enquiry: Enquiry) => {
    try {
      deleteModal.openModal(enquiry);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete enquiry');
    }
  };

  // Filter and paginate enquiries
  const allFilteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = searchTerm === '' ||
      enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.tour_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination calculations
  const totalItems = allFilteredEnquiries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredEnquiries = allFilteredEnquiries.slice(startIndex, endIndex);

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

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading enquiries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Enquiries</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => fetchEnquiries()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Contact Enquiries</h3>
          <p className="text-slate-600 text-sm sm:text-base">Manage customer enquiries and tour requests</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search enquiries by name, email, destination, or tour..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
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

      {/* Enquiries Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Customer
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Contact
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Tour
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Travelers
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Submitted
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnquiries.map((enquiry: Enquiry) => (
                <tr
                  key={enquiry.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEnquiry(enquiry);
                    setIsViewModalOpen(true);
                  }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={enquiry.name}>
                          {enquiry.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900 truncate" title={enquiry.email}>
                      {enquiry.email}
                    </div>
                    {enquiry.phone && (
                      <div className="text-xs text-gray-500 truncate" title={enquiry.phone}>
                        {enquiry.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate" title={enquiry.tour_name}>
                      {enquiry.tour_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate capitalize" title={enquiry.destination}>
                      {enquiry.destination}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center min-w-0">
                      <Users className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate">{enquiry.number_of_people || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center min-w-0">
                      <Calendar className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="truncate">{enquiry.travel_date || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => {
                          setSelectedEnquiry(enquiry);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(enquiry)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1"
                        title="Delete enquiry"
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

      {/* Enquiries Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredEnquiries.map((enquiry: Enquiry) => (
          <div
            key={enquiry.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedEnquiry(enquiry);
              setIsViewModalOpen(true);
            }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {enquiry.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {enquiry.source || 'Website'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setIsViewModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(enquiry)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1"
                      title="Delete enquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    <span className="truncate">{enquiry.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    <span className="truncate">{enquiry.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {enquiry.tour_name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {enquiry.destination} • {enquiry.number_of_people || 'Unknown'} travelers
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {enquiry.travel_date ? `Preferred: ${enquiry.travel_date}` : 'No date specified'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(totalItems > itemsPerPage || filteredEnquiries.length >= itemsPerPage) && (
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

      {filteredEnquiries.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No Enquiries Match Your Search' : 'No Enquiries Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `No enquiries found matching your search. Try adjusting your search terms.`
                : 'No customer enquiries have been submitted yet.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={handleClearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        {...deleteModal.modalProps}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This will permanently remove the enquiry and all its associated data."
        confirmText="Delete Enquiry"
        variant="danger"
      />

      {/* View Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedEnquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Enquiry Details</h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedEnquiry.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${selectedEnquiry.email}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                            {selectedEnquiry.email}
                          </a>
                        </div>
                        {selectedEnquiry.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${selectedEnquiry.phone}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                              {selectedEnquiry.phone}
                            </a>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                          <a
                            href={`mailto:${selectedEnquiry.email}`}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                          {selectedEnquiry.phone && (
                            <a
                              href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                            >
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Trip Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{selectedEnquiry.tour_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">{selectedEnquiry.destination}</span>
                        </div>
                        {selectedEnquiry.number_of_people && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedEnquiry.number_of_people} travelers</span>
                          </div>
                        )}
                        {selectedEnquiry.travel_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{selectedEnquiry.travel_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEnquiry.message}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submission Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Submitted: {new Date(selectedEnquiry.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEnquiry.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notes</h4>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedEnquiry.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactEnquiryManager;