"use client";

import React, { useState } from 'react';
import { Send, MessageCircle, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useContact } from '../../hooks/useApi';

interface TourEnquiryButtonProps {
  price: number;
  hasDiscount?: boolean;
  discountPercentage?: number;
  priceAvailable?: boolean;
  onEnquiryClick?: () => void;
  tourTitle?: string;
}

const TourEnquiryButton: React.FC<TourEnquiryButtonProps> = ({
  price,
  hasDiscount,
  discountPercentage,
  priceAvailable = true,
  tourTitle
}) => {
  const { data: contactInfo } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: tourTitle?.toLowerCase().includes('everest') ? 'everest' :
      tourTitle?.toLowerCase().includes('annapurna') ? 'annapurna' :
        tourTitle?.toLowerCase().includes('kailash') ? 'kailash' :
          tourTitle?.toLowerCase().includes('langtang') ? 'langtang' : 'other',
    tour_title: tourTitle || '',
    travelers: '',
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

    if (!formData.name || !formData.email) {
      setErrorMessage('Name and email are required');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsSubmitting(true);
    setShowError(false);
    setErrorMessage('');

    try {
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

      // Success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        destination: formData.destination,
        tour_title: tourTitle || '',
        travelers: '',
        date: '',
        message: ''
      });

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit enquiry. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    const customerInfo = formData.name ? `Name: ${formData.name}
` : '';
    const emailInfo = formData.email ? `Email: ${formData.email}
` : '';
    const phoneInfo = formData.phone ? `Phone: ${formData.phone}
` : '';
    const travelersInfo = formData.travelers ? `Travelers: ${formData.travelers}
` : '';
    const dateInfo = formData.date ? `Preferred Date: ${formData.date}
` : '';
    const messageInfo = formData.message ? `Message: ${formData.message}
` : '';

    const message = `Hi! I'm interested in the ${tourTitle || 'tour'}.

${customerInfo}${emailInfo}${phoneInfo}${travelersInfo}${dateInfo}${messageInfo}
Could you please provide more details?`;
    const whatsappNumber = contactInfo?.contact?.phone?.whatsapp?.replace('+', '') || '9779851234567';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    const customerInfo = formData.name ? `Name: ${formData.name}
` : '';
    const phoneInfo = formData.phone ? `Phone: ${formData.phone}
` : '';
    const travelersInfo = formData.travelers ? `Travelers: ${formData.travelers}
` : '';
    const dateInfo = formData.date ? `Preferred Date: ${formData.date}
` : '';
    const messageInfo = formData.message ? `Message: ${formData.message}
` : '';

    const subject = `Enquiry about ${tourTitle || 'Tour'}`;
    const body = `Hi,

I'm interested in the ${tourTitle || 'tour'}.

${customerInfo}${phoneInfo}${travelersInfo}${dateInfo}${messageInfo}
Could you please provide more details?

Thank you!`;
    const emailUrl = `mailto:${contactInfo?.contact?.email?.primary || 'info@zeotourism.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-slate-100">
        {/* Price Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 text-center">
          {priceAvailable ? (
            <>
              {hasDiscount && discountPercentage && (
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold mb-2 inline-block">
                  {discountPercentage}% OFF
                </div>
              )}
              <div className="flex items-center justify-center space-x-2">
                {hasDiscount && discountPercentage ? (
                  <>
                    <div className="text-2xl font-bold">${Math.round(price * (1 - discountPercentage / 100))}</div>
                    <div className="text-lg text-sky-200 line-through">${price}</div>
                  </>
                ) : (
                  <div className="text-2xl font-bold">${price}</div>
                )}
              </div>
              <div className="text-sky-100 text-sm">per person</div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">Request Price</div>
              <div className="text-sky-100 text-sm">Contact for pricing</div>
            </>
          )}
        </div>

        {/* Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Success Message */}
            {showSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-2xl flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <p className="text-green-700 text-sm">Thank you! We'll contact you soon.</p>
              </div>
            )}

            {/* Error Message */}
            {showError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              placeholder="Your Name *"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              placeholder="Email Address *"
              required
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              placeholder="Phone Number"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="travelers"
                value={formData.travelers}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                placeholder="No. of Travelers"
              />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
            </div>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
              placeholder="Tell us about your travel plans..."
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          {/* WhatsApp and Email Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 text-white py-3 rounded-2xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </button>

            <button
              onClick={handleEmailClick}
              className="bg-gray-600 text-white py-3 rounded-2xl font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
          </div>

          {/* Contact Info */}
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Quick response guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourEnquiryButton;