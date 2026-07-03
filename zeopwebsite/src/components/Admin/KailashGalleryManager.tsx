import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

interface GalleryPhoto {
  id: number;
  title: string;
  image: string;
  uploadedAt: string;
}

const KailashGalleryManager: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/kailash-gallery', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gallery data');
      }

      const data = await response.json();
      setPhotos(data.gallery || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Clean up previous blob URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setError(null);
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

      handleFileChange(fakeEvent);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();

      // Use generic title based on timestamp
      const title = `Kailash Gallery Photo ${new Date().toISOString().split('T')[0]}`;

      formData.append('photoData', JSON.stringify({
        title: title,
        alt: title
      }));
      formData.append('image', selectedFile);

      const response = await fetch('/api/admin/kailash-gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      // Reset form and refresh data
      setSelectedFile(null);
      setPreviewUrl(null);
      await fetchGalleryData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/kailash-gallery/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setPhotos(photos.filter(p => p.id !== photoId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const clearSelection = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading gallery...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kailash Gallery</h2>
          <p className="text-gray-600 mt-1">Upload and manage gallery photos</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Upload Section - Inspired by SliderManager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Photo Upload</h4>
              <p className="text-sm text-gray-600">Add new photos to the Kailash gallery</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
                ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 scale-[1.02] shadow-lg'
                : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Animated Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragOver
                  ? 'bg-orange-200 scale-110 rotate-3'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-orange-50 hover:to-orange-100'
                }`}>
                {isDragOver ? (
                  <svg className="w-8 h-8 text-orange-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                )}
              </div>

              {/* Upload Text */}
              <div className="space-y-2">
                <h4 className={`text-lg font-semibold transition-colors ${isDragOver ? 'text-orange-700' : 'text-gray-800'
                  }`}>
                  {isDragOver ? 'Drop your image here!' : 'Upload Photo'}
                </h4>

                <p className="text-sm text-gray-500">
                  Drag & drop or click to browse
                </p>
              </div>

              {/* File Input Button */}
              <label className="relative cursor-pointer">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Choose Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={uploading || !selectedFile}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-white">
                        <LoadingSpinner size="sm" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos List - Inspired by SliderManager */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Gallery Photos</h4>
            <div className="text-sm text-gray-500">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </div>

        <div className="p-4">
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Found</h3>
              <p className="text-gray-600 mb-4">Upload your first photo to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}
                      </span>
                    </div>

                    {/* Preview */}
                    <div className="relative w-20 h-12 flex-shrink-0">
                      <img
                        src={photo.image}
                        alt={photo.title}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {photo.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KailashGalleryManager;