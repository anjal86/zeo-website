import React, { useState, useEffect } from 'react';
import { AnimatePresence, Reorder } from 'framer-motion';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Users,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    GripVertical
} from 'lucide-react';
import DeleteModal from '../UI/DeleteModal';
import { useDeleteModal } from '../../hooks/useDeleteModal';
import LoadingSpinner from '../UI/LoadingSpinner';
import api, { type TeamMember } from '../../services/api';

const TeamManager: React.FC = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        image: '',
        bio: '',
        order_index: 0,
        social: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
        }
    });

    // Fetch team members
    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.team.getAll();
            // Sort by order_index
            setMembers(data.sort((a, b) => a.order_index - b.order_index));
        } catch (err) {
            setError('Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Delete modal hook
    const deleteModal = useDeleteModal<TeamMember>({
        onDelete: async (member) => {
            await api.team.delete(member.id);
            fetchMembers();
        },
        getItemName: (member) => member.name,
        getItemId: (member) => member.id
    });

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            image: '',
            bio: '',
            order_index: members.length, // Default to end of list
            social: {
                linkedin: '',
                twitter: '',
                facebook: '',
                instagram: ''
            }
        });
        setEditingMember(null);
    };

    const openModal = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                role: member.role,
                image: member.image,
                bio: member.bio || '',
                order_index: member.order_index,
                social: {
                    linkedin: member.social?.linkedin || '',
                    twitter: member.social?.twitter || '',
                    facebook: member.social?.facebook || '',
                    instagram: member.social?.instagram || ''
                }
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const socialKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                social: {
                    ...prev.social,
                    [socialKey]: value
                }
            }));
        } else if (name === 'order_index') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingMember) {
                await api.team.update(editingMember.id, formData);
            } else {
                await api.team.create(formData);
            }
            setIsModalOpen(false);
            fetchMembers();
        } catch (err) {
            alert('Failed to save team member');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle reordering
    const handleReorder = (newOrder: TeamMember[]) => {
        setMembers(newOrder);
    };

    const saveOrder = async () => {
        try {
            const updates = members.map((member, index) => ({
                id: member.id,
                order_index: index
            }));
            await api.team.updateOrder(updates);
            // alert('Order saved!');
        } catch (err) {
            console.error('Failed to save order');
        }
    };

    // Debounced save order
    useEffect(() => {
        const timer = setTimeout(() => {
            if (members.length > 0) saveOrder();
        }, 1000);
        return () => clearTimeout(timer);
    }, [members]);


    if (loading) return <div className="p-12 text-center"><LoadingSpinner /></div>;

    return (
        <div className="team-manager">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Team Members</h3>
                    <p className="text-gray-600">Manage your team profiles</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border-b border-red-200 text-sm">
                        {error}
                    </div>
                )}
                <div className="p-6">
                    {members.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No team members yet. Add one to get started.</p>
                        </div>
                    ) : (
                        <Reorder.Group axis="y" values={members} onReorder={handleReorder} className="space-y-3">
                            {members.map((member) => (
                                <Reorder.Item key={member.id} value={member}>
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-move group">
                                        <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-5 h-5" />
                                        </div>

                                        <img
                                            src={member.image || 'https://via.placeholder.com/150'}
                                            alt={member.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                            <p className="text-sm text-gray-500">{member.role}</p>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteModal.openModal(member)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold">{editingMember ? 'Edit Member' : 'Add Team Member'}</h3>
                                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name *</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Role/Title *</label>
                                        <input
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <input
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Bio (Optional)</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Social Links (Optional)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Linkedin className="w-4 h-4 text-blue-700" />
                                            <input
                                                name="social.linkedin"
                                                value={formData.social.linkedin}
                                                onChange={handleInputChange}
                                                placeholder="LinkedIn URL"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Twitter className="w-4 h-4 text-blue-400" />
                                            <input
                                                name="social.twitter"
                                                value={formData.social.twitter}
                                                onChange={handleInputChange}
                                                placeholder="Twitter URL"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Facebook className="w-4 h-4 text-blue-600" />
                                            <input
                                                name="social.facebook"
                                                value={formData.social.facebook}
                                                onChange={handleInputChange}
                                                placeholder="Facebook URL"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Instagram className="w-4 h-4 text-pink-600" />
                                            <input
                                                name="social.instagram"
                                                value={formData.social.instagram}
                                                onChange={handleInputChange}
                                                placeholder="Instagram URL"
                                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary px-6 py-2"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteModal
                {...deleteModal.modalProps}
                title="Delete Team Member"
                message={`Are you sure you want to delete ${deleteModal.selectedItem?.name}?`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default TeamManager;
