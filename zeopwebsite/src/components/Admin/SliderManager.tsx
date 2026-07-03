import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  Save,
  X,
  MapPin,
  AlertCircle,
  Play,
  Image as ImageIcon,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import Toggle from '../UI/Toggle';
import LoadingSpinner from '../UI/LoadingSpinner';

// API base URL helper function
const getApiBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  // Development environment
  return '/api';
};

interface Slider {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  image: string;
  video?: string;
  video_start_time?: number;
  order_index: number;
  is_active: boolean;
  button_text?: string;
  button_url?: string;
  button_style?: 'primary' | 'secondary' | 'outline';
  show_button?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SliderFormData extends Slider {
  mediaFile?: File;
  mediaType?: 'image' | 'video';
}

// Sortable Item Component
const SortableSliderItem: React.FC<{
  slider: Slider;
  index: number;
  onEdit: (slider: Slider) => void;
  onDelete: (id: number) => void;
  onToggleActive: (slider: Slider) => void;
}> = ({ slider, index, onEdit, onDelete, onToggleActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slider.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer ${!slider.is_active ? 'opacity-60' : ''
        } ${isDragging ? 'shadow-lg z-50' : ''}`}
      onClick={() => onEdit(slider)}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Order Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {index + 1}
          </span>
        </div>

        {/* Preview */}
        <div className="relative w-20 h-12 flex-shrink-0">
          {slider.video ? (
            <>
              <img
                src={slider.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400'}
                alt={slider.title}
                className="w-full h-full object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                }}
              />
              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white drop-shadow-lg" />
              </div>
            </>
          ) : (
            <img
              src={slider.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400'}
              alt={slider.title}
              className="w-full h-full object-cover rounded-lg border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
              }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">
            {slider.title}
          </h4>
          {slider.subtitle && (
            <p className="text-gray-600 text-sm truncate mt-1">{slider.subtitle}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            {slider.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                {slider.location}
              </div>
            )}
            {slider.button_text && slider.show_button && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                {slider.button_text}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex items-center gap-3 ml-6">
          {/* Badges */}
          <div className="flex items-center gap-2">
            {/* Type Badge */}
            {slider.video ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Play className="w-3 h-3" />
                Video
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                <ImageIcon className="w-3 h-3" />
                Image
              </span>
            )}

            {/* Status Badge */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(slider);
              }}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${slider.is_active
                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {slider.is_active ? (
                <>
                  <Eye className="w-3 h-3" />
                  Active
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3" />
                  Inactive
                </>
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(slider.id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete slider"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SliderManager: React.FC = () => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isReordering] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [formData, setFormData] = useState<SliderFormData>({
    id: 0,
    title: '',
    subtitle: '',
    location: '',
    image: '',
    video: '',
    video_start_time: 0,
    order_index: 1,
    is_active: true,
    button_text: 'Explore Adventures',
    button_url: '#tours',
    button_style: 'primary',
    show_button: true
  });

  // Fetch all sliders (including inactive ones) for admin management
  const fetchSliders = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, fetch from public endpoint since auth might not be set up
      const response = await fetch(`${getApiBaseUrl()}/sliders`);
      if (!response.ok) {
        throw new Error('Failed to fetch sliders');
      }

      const data = await response.json();
      setSliders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sliders');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSliders();
  }, []);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = () => {
    // Clean up any existing blob URLs
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setMediaType('image');

    setFormData({
      id: 0,
      title: '',
      subtitle: '',
      location: '',
      image: '',
      video: '',
      video_start_time: 0,
      order_index: sliders ? Math.max(...sliders.map(s => s.order_index)) + 1 : 1,
      is_active: true,
      button_text: 'Explore Adventures',
      button_url: '#tours',
      button_style: 'primary',
      show_button: true
    });
    setEditingSlider(null);
    setSubmitError(null);
  };

  const openModal = (slider?: Slider) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData(slider);
      setMediaType(slider.video ? 'video' : 'image');
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
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2GB limit)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        alert(`File size is too large (${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB). Maximum allowed size is 2GB.`);
        e.target.value = ''; // Clear the input
        return;
      }

      // Clean up previous blob URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      // Determine if it's an image or video
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        alert('Please select an image or video file');
        e.target.value = ''; // Clear the input
        return;
      }


      setMediaType(isVideo ? 'video' : 'image');
      setFormData(prev => ({ ...prev, mediaFile: file }));

      // Create a temporary object URL for preview
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);

      if (isVideo) {
        // Clear the image and video URLs since we'll be uploading a new file
        setFormData(prev => ({
          ...prev,
          video: '', // Will be set by server after upload
          image: prev.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1920&h=1080&fit=crop' // Keep existing image as thumbnail or use default
        }));
      } else {
        // For images, clear the URLs since we'll be uploading a new file
        setFormData(prev => ({
          ...prev,
          image: '', // Will be set by server after upload
          video: '' // Clear video when image is selected
        }));
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      // Create a fake event object to reuse existing logic
      const fakeEvent = {
        target: {
          files: [file]
        }
      } as any;

      handleMediaChange(fakeEvent);
    }
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video timeline handlers
  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoDuration(video.duration);
    setIsVideoLoaded(true);
    if (formData.video_start_time) {
      video.currentTime = formData.video_start_time;
    }
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setFormData(prev => ({ ...prev, video_start_time: newTime }));

    // Update video preview time
    const video = document.querySelector('.video-timeline-preview') as HTMLVideoElement;
    if (video) {
      video.currentTime = newTime;
    }
  };

  const handleVideoSeek = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setFormData(prev => ({ ...prev, video_start_time: video.currentTime }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('adminToken');

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add the slider data as JSON string
      const sliderData = {
        title: formData.title,
        subtitle: formData.subtitle,
        location: formData.location,
        image: formData.image,
        video: formData.video,
        video_start_time: formData.video_start_time,
        order_index: formData.order_index,
        is_active: formData.is_active,
        button_text: formData.button_text,
        button_url: formData.button_url,
        button_style: formData.button_style,
        show_button: formData.show_button
      };

      formDataToSend.append('sliderData', JSON.stringify(sliderData));

      // Add the media file if one was selected
      if (formData.mediaFile) {
        formDataToSend.append('mediaFile', formData.mediaFile);
      }

      const url = editingSlider
        ? `${getApiBaseUrl()}/admin/sliders/${editingSlider.id}`
        : `${getApiBaseUrl()}/admin/sliders`;

      const method = editingSlider ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header - let the browser set it with boundary for FormData
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save slider');
      }

      // Refresh the sliders list
      await fetchSliders();
      closeModal();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save slider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slider? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/sliders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete slider');
      }

      // Refresh the sliders list
      await fetchSliders();
    } catch (error) {
      alert('Failed to delete slider: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleToggleActive = async (slider: Slider) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${getApiBaseUrl()}/admin/sliders/${slider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...slider,
          is_active: !slider.is_active
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update slider');
      }

      // Refresh the sliders list
      await fetchSliders();
    } catch (error) {
      alert('Failed to update slider: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedSliders.findIndex((slider) => slider.id === active.id);
      const newIndex = sortedSliders.findIndex((slider) => slider.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(sortedSliders, oldIndex, newIndex);
        setSliders(newOrder);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading sliders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Sliders</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => fetchSliders()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const sortedSliders = sliders ? [...sliders].sort((a, b) => a.order_index - b.order_index) : [];

  return (
    <div className="slider-manager">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Hero Sliders</h3>
          <p className="text-gray-600">Manage your homepage hero section slides</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Slider
        </button>
      </div>

      {/* Drag and Drop Sliders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Slider Management</h4>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {sortedSliders.length} slider{sortedSliders.length !== 1 ? 's' : ''} total
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <GripVertical className="w-3 h-3" />
                Drag to reorder
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSliders.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sortedSliders.map((slider, index) => (
                  <SortableSliderItem
                    key={slider.id}
                    slider={slider}
                    index={index}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {isReordering && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <LoadingSpinner size="sm" />
                Updating order...
              </div>
            </div>
          )}
        </div>
      </div>

      {sortedSliders.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sliders Found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first hero slider.</p>
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create First Slider
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
                  {editingSlider ? 'Edit Slider' : 'Add New Slider'}
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

                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                          <p className="text-sm text-gray-500">Set the main content and details for this slider</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
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
                            placeholder="Enter slider title (e.g., Kailash Mansarovar Yatra)"
                          />
                          <p className="text-xs text-gray-500 mt-1">This will be the main heading displayed on the slider</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter subtitle (e.g., Sacred Journey to Mount Kailash and Lake Mansarovar)"
                          />
                          <p className="text-xs text-gray-500 mt-1">Optional descriptive text that appears below the title</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="e.g., Tibet, China"
                            />
                            <p className="text-xs text-gray-500 mt-1">Geographic location for this destination</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Display Order *
                            </label>
                            <input
                              type="number"
                              name="order_index"
                              value={formData.order_index}
                              onChange={handleInputChange}
                              required
                              min="1"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-1">Order in which this slider appears (1 = first)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Media Upload - First Priority */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Media Upload</h4>
                            <p className="text-sm text-gray-600">Upload your slider background</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Enhanced Minimal Upload Zone */}
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 scale-[1.02] shadow-lg'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                            }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center gap-4">
                            {/* Animated Icon */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragOver
                              ? 'bg-blue-200 scale-110 rotate-3'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-50 hover:to-blue-100'
                              }`}>
                              {isDragOver ? (
                                <svg className="w-8 h-8 text-blue-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              ) : (
                                <ImageIcon className="w-8 h-8 text-gray-600" />
                              )}
                            </div>

                            {/* Upload Text */}
                            <div className="space-y-2">
                              <h4 className={`text-lg font-semibold transition-colors ${isDragOver ? 'text-blue-700' : 'text-gray-800'
                                }`}>
                                {isDragOver ? 'Drop your file here!' : 'Upload Media'}
                              </h4>

                              <p className="text-sm text-gray-500">
                                Drag & drop or click to browse
                              </p>
                            </div>

                            {/* File Input Button */}
                            <label className="relative cursor-pointer">
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                Choose File
                              </div>
                              <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleMediaChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>

                            {/* File Type Indicators */}
                            <div className="flex items-center gap-6 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ImageIcon className="w-4 h-4" />
                                <span>Images</span>
                              </div>
                              <div className="w-px h-4 bg-gray-300"></div>
                              <div className="flex items-center gap-1">
                                <Play className="w-4 h-4" />
                                <span>Videos</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Simple Media Preview with Timeline */}
                        {(formData.image || formData.video || previewUrl) && (
                          <div className="mt-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="relative">
                                {mediaType === 'video' ? (
                                  <div className="space-y-4">
                                    <video
                                      src={previewUrl || formData.video}
                                      className="video-timeline-preview w-full h-48 object-cover rounded-lg border bg-black"
                                      controls
                                      onLoadedMetadata={handleVideoLoadedMetadata}
                                      onSeeked={handleVideoSeek}
                                      onError={() => {
                                        // Video preview error
                                      }}
                                    />

                                    {/* Simple Timeline Control */}
                                    {isVideoLoaded && videoDuration > 0 && (
                                      <div className="space-y-3 bg-white p-4 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-gray-700">Video Start Time:</span>
                                          <span className="text-sm text-blue-600 font-semibold">
                                            {formatTime(formData.video_start_time || 0)} / {formatTime(videoDuration)}
                                          </span>
                                        </div>

                                        <input
                                          type="range"
                                          min="0"
                                          max={videoDuration}
                                          step="0.5"
                                          value={formData.video_start_time || 0}
                                          onChange={handleTimelineChange}
                                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-timeline"
                                          style={{
                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((formData.video_start_time || 0) / videoDuration) * 100}%, #e5e7eb ${((formData.video_start_time || 0) / videoDuration) * 100}%, #e5e7eb 100%)`
                                          }}
                                        />
                                        <p className="text-xs text-gray-500 text-center">Drag to set where the video should start</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <img
                                    src={previewUrl || formData.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400'}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                                    }}
                                  />
                                )}

                                {/* Simple Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (previewUrl && previewUrl.startsWith('blob:')) {
                                      URL.revokeObjectURL(previewUrl);
                                    }
                                    setFormData(prev => ({ ...prev, image: '', video: '', mediaFile: undefined, video_start_time: 0 }));
                                    setPreviewUrl(null);
                                    setMediaType('image');
                                    setIsVideoLoaded(false);
                                    setVideoDuration(0);
                                  }}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                                  title="Remove"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Button Configuration */}
                    <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Call-to-Action Button</h4>
                          <p className="text-sm text-gray-500">Configure the action button that appears on this slider</p>
                        </div>
                      </div>

                      {/* Show Button Toggle */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-900 cursor-pointer">
                              Display action button
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              Show a clickable button on this slider to guide user actions
                            </p>
                          </div>
                          <div className="ml-4">
                            <Toggle
                              checked={formData.show_button || false}
                              onChange={(checked: boolean) => setFormData(prev => ({ ...prev, show_button: checked }))}
                              size="md"
                            />
                          </div>
                        </div>
                      </div>

                      {formData.show_button && (
                        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Button Text
                              </label>
                              <input
                                type="text"
                                name="button_text"
                                value={formData.button_text}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter button text (e.g., Explore Adventures)"
                              />
                              <p className="text-xs text-gray-500 mt-1">This text will appear on the button</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Button Link
                              </label>
                              <input
                                type="text"
                                name="button_url"
                                value={formData.button_url}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter destination URL (e.g., #tours, /tours, https://example.com)"
                              />
                              <p className="text-xs text-gray-500 mt-1">Where users will go when they click the button</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Button Style
                              </label>
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-3">
                                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                      type="radio"
                                      name="button_style"
                                      value="primary"
                                      checked={formData.button_style === 'primary'}
                                      onChange={handleInputChange}
                                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div className="ml-3 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Primary</span>
                                        <div className="w-16 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded text-white text-xs flex items-center justify-center">
                                          Button
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500">Orange gradient - most prominent</p>
                                    </div>
                                  </label>

                                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                      type="radio"
                                      name="button_style"
                                      value="secondary"
                                      checked={formData.button_style === 'secondary'}
                                      onChange={handleInputChange}
                                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-3 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Secondary</span>
                                        <div className="w-16 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-xs flex items-center justify-center">
                                          Button
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500">Blue gradient - secondary action</p>
                                    </div>
                                  </label>

                                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                      type="radio"
                                      name="button_style"
                                      value="outline"
                                      checked={formData.button_style === 'outline'}
                                      onChange={handleInputChange}
                                      className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                                    />
                                    <div className="ml-3 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Outline</span>
                                        <div className="w-16 h-6 border-2 border-white rounded text-white text-xs flex items-center justify-center bg-gray-800">
                                          Button
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500">Transparent with border - subtle</p>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Toggle */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-900 cursor-pointer">
                              Publish this slider
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              When enabled, this slider will be visible on the website homepage
                            </p>
                          </div>
                          <div className="ml-4">
                            <Toggle
                              checked={formData.is_active}
                              onChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_active: checked }))}
                              size="md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer with Action Buttons */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 sticky bottom-0">
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
                        {formData.mediaFile ? 'Compressing & Saving...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingSlider ? 'Update' : 'Create'} Slider
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SliderManager;