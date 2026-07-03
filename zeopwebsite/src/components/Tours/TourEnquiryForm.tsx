import React, { useState } from 'react';
import {
  User,
  Mail,
  Send,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  destination: string;
  tour_title: string;
  travelers: string;
  date: string;
  message: string;
}

interface TourEnquiryFormProps {
  tourTitle: string;
  destination: string;
  onSubmit?: (formData: EnquiryFormData) => Promise<void>;
  onClose?: () => void;
}

const TourEnquiryForm: React.FC<TourEnquiryFormProps> = ({
  tourTitle,
  destination,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    email: '',
    phone: '',
    destination: destination,
    tour_title: tourTitle,
    travelers: '2',
    date: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    setShowError(false);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default API submission
        const response = await fetch('/api/contact/enquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit enquiry');
        }
      }

      // Success
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-none shadow-lg border border-gray-200 overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 relative">
        <div className="text-center">
          <h3 className="text-lg font-bold">Send Enquiry</h3>
          <p className="text-sky-100 text-sm">for {tourTitle}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-none flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <p className="text-green-800 text-sm">Enquiry sent successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-none flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">Please fill in required fields.</p>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Your name"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Your phone number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Travelers Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. of Pax
            </label>
            <input
              type="number"
              min="1"
              value={formData.travelers}
              onChange={(e) => setFormData(prev => ({ ...prev, travelers: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="2"
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travel Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Tell us about your travel plans..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-none font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Enquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TourEnquiryForm;
export type { EnquiryFormData };