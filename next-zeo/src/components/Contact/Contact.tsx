"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useContact } from '../../hooks/useApi';

const Contact: React.FC = () => {
  const { data: contactInfo, loading: contactLoading, error: contactError } = useContact();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    travelers: '',
    date: '',
    message: '',
    honeypot: '' // Anti-bot field
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

    // Honeypot check: If the hidden field is filled, it's likely a bot.
    if (formData.honeypot) {
      console.warn("Bot detected via honeypot.");
      setIsSubmitting(false);
      setShowSuccess(true); // Silent fail: show success but don't actually submit
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
        destination: '',
        travelers: '',
        date: '',
        message: '',
        honeypot: ''
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit enquiry. Please try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      primary: contactInfo?.contact.phone.primary || '+9779851234567',
      color: 'bg-primary',
      action: () => window.location.href = `tel:${contactInfo?.contact.phone.primary || '+9779851234567'}`
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      primary: 'Chat with us',
      color: 'bg-green-500',
      action: () => window.open(contactInfo?.social.whatsapp || 'https://wa.me/9779851234567', '_blank')
    },
    {
      icon: Mail,
      title: 'Email Us',
      primary: contactInfo?.contact.email.primary || 'info@zeotourism.com',
      color: 'bg-orange-500',
      action: () => window.location.href = `mailto:${contactInfo?.contact.email.primary || 'info@zeotourism.com'}`
    }
  ];

  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

          {/* Left Column - Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-2">
                Contact Us
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Let's Plan Your Adventure
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Ready to explore Nepal? Get in touch with our travel experts.
              </p>
              {contactLoading && (
                <div className="text-sm text-gray-500 mb-4">Loading contact information...</div>
              )}
              {contactError && (
                <div className="text-sm text-red-500 mb-4">Error loading contact info: {contactError}</div>
              )}
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={method.action}
                  className="flex items-center p-4 bg-white rounded-none shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className={`${method.color} text-white p-3 rounded-none mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{method.primary}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Office Info */}
            <div className="bg-white rounded-none p-6 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="bg-primary text-white p-3 rounded-none mr-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Visit Our Office</h3>
                  <p className="text-gray-600 text-sm">
                    {contactInfo?.contact.address.full || 'Baluwatar-4, Kathmandu, Nepal'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-none shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Success Message */}
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-none flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <p className="text-green-800">
                      Thank you for your message! We'll contact you soon.
                    </p>
                  </motion.div>
                )}

                {/* Error Message */}
                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-none flex items-center"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <p className="text-red-800">
                      {errorMessage}
                    </p>
                  </motion.div>
                )}

                {/* Honeypot field (hidden from humans) */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your Name *"
                      className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Email Address *"
                      className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />

                    <select
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 appearance-none bg-white"
                    >
                      <option value="">Select Destination *</option>
                      <option value="everest">Everest Base Camp</option>
                      <option value="kailash">Kailash Mansarovar</option>
                      <option value="annapurna">Annapurna Circuit</option>
                      <option value="kathmandu">Kathmandu Valley</option>
                      <option value="langtang">Langtang Valley</option>
                      <option value="pokhara">Pokhara</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="travelers"
                      value={formData.travelers}
                      onChange={handleChange}
                      min="1"
                      placeholder="No. of Travelers"
                      className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />

                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      placeholder="Preferred Date"
                      className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your travel plans..."
                    className="w-full px-4 py-3 rounded-none border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <p className="text-sm text-gray-500">
                    {contactInfo?.business.support.response_time ? `We'll get back to you ${contactInfo.business.support.response_time.toLowerCase()}` : "We'll get back to you within 24 hours"}
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-none font-semibold hover:shadow-lg transition-all duration-300 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Map */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 text-primary mr-2" />
                Find Us Here
              </h3>
            </div>
            <div className="h-[500px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2738.8293499738834!2d85.33145348661431!3d27.72530994398019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19f625c6408f%3A0xa14006f9fceeea6a!2sZeo%20Tourism%20Pvt.Ltd!5e0!3m2!1sen!2snp!4v1758183095926!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zeo Tourism Office Location"
                className="w-full h-full"
              />
            </div>
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>{contactInfo?.company.name || 'Zeo Tourism'}</strong> - {contactInfo?.contact.address.full || 'Baluwatar-4, Kathmandu, Nepal'}
                </div>
                <a
                  href={(contactInfo?.contact.location as any)?.maps_url || "https://maps.app.goo.gl/6ee4i6HGNKX9qdar8"}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
