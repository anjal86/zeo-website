import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    ChevronLeft,
    ChevronRight,
    AlertCircle
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



interface Activity {
    id: number;
    name: string;
    description: string;
    tourCount: number;
    href: string;
}

interface ActivityFormData {
    id: number;
    name: string;
    description: string;
}

const ActivityManager: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [formData, setFormData] = useState<ActivityFormData>({
        id: 0,
        name: '',
        description: ''
    });

    const fetchActivities = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${getApiBaseUrl()}/admin/activities`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }
            const data = await response.json();
            setActivities(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch activities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const resetForm = () => {
        setFormData({
            id: 0,
            name: '',
            description: ''
        });
        setEditingActivity(null);
        setSubmitError(null);
    };

    const openModal = (activity?: Activity) => {
        if (activity) {
            setEditingActivity(activity);
            setFormData({
                id: activity.id,
                name: activity.name,
                description: activity.description
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const token = localStorage.getItem('adminToken');
            const formDataToSend = new FormData();

            const activityData = {
                name: formData.name,
                description: formData.description
            };

            formDataToSend.append('activityData', JSON.stringify(activityData));

            const url = editingActivity
                ? `${getApiBaseUrl()}/admin/activities/${editingActivity.id}`
                : `${getApiBaseUrl()}/admin/activities`;

            const method = editingActivity ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save activity');
            }

            // Refresh data
            await fetchActivities();
            closeModal();
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Failed to save activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteActivity = async (activity: Activity) => {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${getApiBaseUrl()}/admin/activities/${activity.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete activity');
        }

        await fetchActivities();
    };

    const deleteModal = useDeleteModal<Activity>({
        onDelete: deleteActivity,
        getItemName: (item) => item.name,
        getItemId: (item) => item.id
    });

    // Filter activities
    const filteredActivities = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalItems = filteredActivities.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentActivities = filteredActivities.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading activities...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Activities</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button onClick={() => fetchActivities()} className="btn-primary">Try Again</button>
            </div>
        );
    }

    return (
        <div className="activity-manager">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Activities</h3>
                    <p className="text-gray-600">Manage activity categories</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Activity
                </button>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
                <div className="relative max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Activities Table - Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                            <th className="w-1/3 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="w-20 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentActivities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal(activity)}>
                                <td className="px-4 py-4">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                                            <div className="text-xs text-gray-500">{activity.tourCount || 0} Tours</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500 truncate max-w-xs" title={activity.description}>
                                    {activity.description}
                                </td>
                                <td className="px-3 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => openModal(activity)} className="text-blue-600 hover:text-blue-900 p-1">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteModal.openModal(activity)} className="text-red-600 hover:text-red-900 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {currentActivities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" onClick={() => openModal(activity)}>
                        <div className="flex items-start space-x-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-900">{activity.name}</h3>
                                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => openModal(activity)} className="text-blue-600 p-1"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => deleteModal.openModal(activity)} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{activity.tourCount || 0} Tours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {(totalItems > itemsPerPage) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mt-4 flex items-center justify-between">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.modalProps.isOpen}
                onClose={deleteModal.closeModal}
                onConfirm={deleteModal.confirmDelete}
                title="Delete Activity"
                message={`Are you sure you want to delete "${deleteModal.selectedItem?.name}"? This action cannot be undone.`}
                isLoading={deleteModal.isDeleting}
            />

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingActivity ? 'Edit Activity' : 'New Activity'}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {submitError && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {submitError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. Paragliding"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Short description..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save Activity'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActivityManager;
