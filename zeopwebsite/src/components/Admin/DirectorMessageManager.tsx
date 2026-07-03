import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, RefreshCw, MessageSquare, Upload } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import api, { type DirectorMessage } from '../../services/api';

const DirectorMessageManager: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [formData, setFormData] = useState<DirectorMessage>({
        id: 1,
        name: '',
        title: '',
        message: '',
        image: '',
    });

    const fetchDirectorMessage = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.directorMessage.get();
            if (data) {
                setFormData(data);
                if (data.image) {
                    setPreviewUrl(data.image.startsWith('http') ? data.image : `http://localhost:3000${data.image}`);
                }
            } else {
                // Initialize with defaults if no data exists
                setFormData({
                    id: 1,
                    name: '',
                    title: 'Managing Director',
                    message: '',
                    image: '',
                });
            }
        } catch (err) {
            setError('Failed to fetch director message');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectorMessage();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSubmitSuccess(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create local preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitSuccess(false);
        setError(null);

        try {
            const data = new FormData();
            // Append explicit fields
            data.append('name', formData.name);
            data.append('title', formData.title);
            data.append('message', formData.message);
            // Also append JSON data for potential complex objects (server logic compatibility)
            data.append('directorData', JSON.stringify(formData));

            if (selectedFile) {
                data.append('image', selectedFile);
            }

            const response = await api.directorMessage.update(data);
            setFormData(response);
            if (response.image) {
                setPreviewUrl(response.image.startsWith('http') ? response.image : `http://localhost:3000${response.image}`);
            }

            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save changes');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Message from Director</h3>
                    <p className="text-gray-600">Update the director's profile and welcome message</p>
                </div>
                <button
                    onClick={fetchDirectorMessage}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {submitSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
                            <Save className="w-5 h-5" />
                            <span>Changes saved successfully!</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Personal Info & Image */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <LoadingSpinner size="sm" className="opacity-0" /> {/* Spacer */}
                                    Personal Details
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. Managing Director"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-4">Profile Image</h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Upload Image
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="cursor-pointer bg-white px-4 py-2 border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                <span>Choose File</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            <span className="text-sm text-gray-500">
                                                {selectedFile ? selectedFile.name : 'No file chosen'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                                        <div className="relative w-32 h-32 rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-gray-100">
                                            {previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Director Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    <MessageSquare className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Message */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 h-full">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Message Content
                                </h4>

                                <div className="h-[calc(100%-3rem)]">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full h-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        placeholder="Write the director's message here..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        {formData.message.length} characters
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex items-center gap-2 px-8 py-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DirectorMessageManager;
