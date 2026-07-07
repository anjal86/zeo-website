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

const fieldClass = "w-full border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary";

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit enquiry');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
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
    const customerInfo = formData.name ? `Name: ${formData.name}\n` : '';
    const emailInfo = formData.email ? `Email: ${formData.email}\n` : '';
    const phoneInfo = formData.phone ? `Phone: ${formData.phone}\n` : '';
    const travelersInfo = formData.travelers ? `Travelers: ${formData.travelers}\n` : '';
    const dateInfo = formData.date ? `Preferred Date: ${formData.date}\n` : '';
    const messageInfo = formData.message ? `Message: ${formData.message}\n` : '';
    const message = `Hi! I'm interested in the ${tourTitle || 'tour'}.\n\n${customerInfo}${emailInfo}${phoneInfo}${travelersInfo}${dateInfo}${messageInfo}Could you please provide more details?`;
    const whatsappNumber = contactInfo?.contact?.phone?.whatsapp?.replace('+', '') || '9779851234567';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmailClick = () => {
    const customerInfo = formData.name ? `Name: ${formData.name}\n` : '';
    const phoneInfo = formData.phone ? `Phone: ${formData.phone}\n` : '';
    const travelersInfo = formData.travelers ? `Travelers: ${formData.travelers}\n` : '';
    const dateInfo = formData.date ? `Preferred Date: ${formData.date}\n` : '';
    const messageInfo = formData.message ? `Message: ${formData.message}\n` : '';
    const subject = `Enquiry about ${tourTitle || 'Tour'}`;
    const body = `Hi,\n\nI'm interested in the ${tourTitle || 'tour'}.\n\n${customerInfo}${phoneInfo}${travelersInfo}${dateInfo}${messageInfo}Could you please provide more details?\n\nThank you!`;
    window.location.href = `mailto:${contactInfo?.contact?.email?.primary || 'info@zeotourism.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const discountedPrice = hasDiscount && discountPercentage ? Math.round(price * (1 - discountPercentage / 100)) : price;

  return (
    <div className="bg-white border border-gray-200">
      <div className="border-b border-gray-200 bg-primary p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Start planning</p>
        {priceAvailable ? (
          <div className="mt-3">
            {hasDiscount && discountPercentage && (
              <span className="mb-2 inline-block bg-secondary px-2 py-1 text-xs font-bold text-white">
                {discountPercentage}% OFF
              </span>
            )}
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold">${discountedPrice}</span>
              {hasDiscount && discountPercentage && <span className="pb-1 text-base text-white/50 line-through">${price}</span>}
            </div>
            <p className="text-sm text-white/70">per person</p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-2xl font-extrabold">Request Price</div>
            <p className="text-sm text-white/70">Contact for current pricing</p>
          </div>
        )}
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          {showSuccess && (
            <div className="flex items-center border border-green-200 bg-green-50 p-3">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">Thank you! We will contact you soon.</p>
            </div>
          )}

          {showError && (
            <div className="flex items-center border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <input type="text" name="name" value={formData.name} onChange={handleChange} className={fieldClass} placeholder="Your Name *" required />
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} placeholder="Email Address *" required />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={fieldClass} placeholder="Phone Number" />

          <div className="grid grid-cols-2 gap-3">
            <input type="number" name="travelers" value={formData.travelers} onChange={handleChange} min="1" className={fieldClass} placeholder="Travelers" />
            <input type="date" name="date" value={formData.date} onChange={handleChange} className={fieldClass} />
          </div>

          <textarea name="message" value={formData.message} onChange={handleChange} rows={3} className={`${fieldClass} resize-none`} placeholder="Tell us about your travel plans..." />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center bg-primary px-4 py-3 font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Enquiry
              </>
            )}
          </button>
        </form>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={handleWhatsAppClick} className="flex items-center justify-center bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </button>
          <button onClick={handleEmailClick} className="flex items-center justify-center border border-gray-300 py-3 font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </button>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
          No payment required. Ask questions first.
        </div>
      </div>
    </div>
  );
};

export default TourEnquiryButton;
