"use client";

import React, { useState } from 'react';
import {
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';

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

interface TourEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle: string;
  onSubmit?: (formData: EnquiryFormData) => Promise<void>;
}

const TourEnquiryModal: React.FC<TourEnquiryModalProps> = ({
  isOpen,
  onClose,
  tourTitle,
  onSubmit
}) => {
  const getDestinationFromTitle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('everest')) return 'everest';
    if (lowerTitle.includes('annapurna')) return 'annapurna';
    if (lowerTitle.includes('kailash')) return 'kailash';
    if (lowerTitle.includes('langtang')) return 'langtang';
    if (lowerTitle.includes('kathmandu')) return 'kathmandu';
    if (lowerTitle.includes('pokhara')) return 'pokhara';
    return 'other';
  };

  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    email: '',
    phone: '',
    destination: getDestinationFromTitle(tourTitle),
    tour_title: tourTitle || '',
    travelers: '2',
    date: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.destination) {
      setErrorMessage('Name, email, and destination are required');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    setShowError(false);
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const response = await fetch('/api/contact/enquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit enquiry');
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit enquiry. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = (
    <div>
      <h3 className="text-lg font-bold text-white">Send Enquiry</h3>
      <p className="text-sky-100 text-sm font-normal">for {tourTitle}</p>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={modalTitle}
      headerClassName="bg-gradient-to-r from-primary to-primary-dark"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Success Message */}
        {showSuccess && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-none flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <p className="text-green-800 text-sm">Thank you for your enquiry! We'll contact you soon.</p>
          </div>
        )}

        {/* Error Message */}
        {showError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-none flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Name Field */}
        <Input
          label="Your Name *"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
        />

        {/* Email Field */}
        <Input
          label="Email Address *"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
        />

        {/* Phone Field */}
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
        />

        {/* Travelers and Date */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Travelers"
            type="number"
            name="travelers"
            value={formData.travelers}
            onChange={handleChange}
            min="1"
            placeholder="Number of Travelers"
          />

          <Input
            label="Preferred Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="Tell us about your dream trip..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Enquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TourEnquiryModal;
export type { EnquiryFormData };