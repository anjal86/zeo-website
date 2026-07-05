"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Clock3,
  Users,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { useContact } from '../../hooks/useApi';

const inputClass = "w-full border border-gray-200 bg-white px-4 py-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10";

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
    honeypot: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const phone = contactInfo?.contact?.phone?.primary || '+9779813641003';
  const email = contactInfo?.contact?.email?.primary || 'nepal@zeotourism.com';
  const address = contactInfo?.contact?.address?.full || 'Baluwatar-4, Kathmandu, Nepal';
  const cleanPhone = phone.replace(/\s/g, '');
  const whatsappHref = contactInfo?.social?.whatsapp || `https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}`;
  const responseTime = contactInfo?.business?.support?.response_time
    ? `We usually reply ${contactInfo.business.support.response_time.toLowerCase()}`
    : "We usually reply within 24 hours";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      console.warn('Bot detected via honeypot.');
      setIsSubmitting(false);
      setShowSuccess(true);
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

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

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
      title: 'Call the office',
      subtitle: phone,
      helper: 'Fastest for urgent questions',
      href: `tel:${cleanPhone}`,
      tone: 'bg-primary text-white',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp the team',
      subtitle: 'Chat with us directly',
      helper: 'Best for quick trip clarification',
      href: whatsappHref,
      tone: 'bg-green-500 text-white',
      external: true,
    },
    {
      icon: Mail,
      title: 'Email your plan',
      subtitle: email,
      helper: 'Best for detailed itineraries',
      href: `mailto:${email}`,
      tone: 'bg-secondary text-white',
    },
  ];

  const planningSteps = [
    { icon: CalendarDays, title: 'Share dates', text: 'Tell us your preferred month or exact travel date.' },
    { icon: Users, title: 'Share group size', text: 'Solo, family, group or private trip — we plan around it.' },
    { icon: MapPin, title: 'Get route clarity', text: 'We guide timing, route, support and next step before booking.' },
  ];

  return (
    <section id="contact" className="bg-gradient-to-b from-white to-gray-50 py-14 md:py-18 border-t border-gray-100">
      <div className="container-xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-[0.22em] mb-3 block">
              Contact Zeo Tourism
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-950 leading-[1.05] tracking-tight max-w-2xl">
              Tell us what you need. We’ll help shape the route.
            </h2>
          </div>
          <div className="lg:max-w-xl lg:justify-self-end">
            <p className="text-sm md:text-base leading-relaxed text-gray-600">
              Use the form for a guided trip request, or contact the Kathmandu team directly if you need quick clarity on Kailash Yatra, Nepal tours, activities or private travel.
            </p>
          </div>
        </div>

        {contactLoading && (
          <div className="mb-6 border border-gray-200 bg-white p-4 text-sm text-gray-500">Loading contact information...</div>
        )}
        {contactError && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-600">Error loading contact info: {contactError}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-5"
          >
            <div className="border border-gray-200 bg-gray-950 p-6 md:p-7 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-36 w-36 border border-white/10" />
              <span className="text-primary text-[10px] font-bold uppercase tracking-[0.22em]">Best first step</span>
              <h3 className="mt-4 text-2xl md:text-3xl font-serif font-bold leading-tight">
                Ask before you book.
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                No pressure. Share what you know — destination, date, group size, budget or confusion — and we will point you toward the right next step.
              </p>

              <div className="mt-6 grid gap-3">
                {planningSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex gap-4 border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-white/10 bg-black/20 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary text-xs font-bold">0{index + 1}</span>
                          <h4 className="text-sm font-bold text-white">{step.title}</h4>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-gray-400">{step.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    target={method.external ? '_blank' : undefined}
                    rel={method.external ? 'nofollow noopener noreferrer' : undefined}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border border-gray-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-gray-900/5"
                  >
                    <span className={`flex h-12 w-12 items-center justify-center ${method.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-gray-950 group-hover:text-primary transition-colors">{method.title}</span>
                      <span className="mt-1 block text-sm text-gray-600 break-all">{method.subtitle}</span>
                      <span className="mt-1 block text-xs text-gray-400">{method.helper}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </a>
                );
              })}
            </div>

            <div className="border border-gray-200 bg-white p-5">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-gray-950 text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-950">Kathmandu office</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{address}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-400">Local planning support</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="border border-gray-200 bg-white shadow-xl shadow-gray-900/5">
              <div className="border-b border-gray-100 p-6 md:p-8">
                <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.22em]">Trip request form</span>
                <h3 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-gray-950">
                  Get a route recommendation
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  A few details help us suggest the right itinerary, timing and support level.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-green-200 bg-green-50 p-4 flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Your enquiry was sent.</p>
                      <p className="mt-1 text-sm text-green-700">Our team will contact you with the next step soon.</p>
                    </div>
                  </motion.div>
                )}

                {showError && (
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-red-200 bg-red-50 p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-red-800 text-sm">{errorMessage}</p>
                  </motion.div>
                )}

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

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name *"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email address *"
                    className={inputClass}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone / WhatsApp"
                    className={inputClass}
                  />
                  <select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    className={`${inputClass} appearance-none`}
                  >
                    <option value="">Trip interest *</option>
                    <option value="kailash">Kailash Mansarovar</option>
                    <option value="nepal-tour">Nepal Tour Packages</option>
                    <option value="everest">Everest Region</option>
                    <option value="muktinath">Muktinath / Mustang</option>
                    <option value="helicopter">Helicopter / Aerial Darshan</option>
                    <option value="international">International Tours</option>
                    <option value="custom">Custom / Private Trip</option>
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
                    placeholder="No. of travelers"
                    className={inputClass}
                  />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us your plan, confusion, preferred route, budget range or special requirements..."
                  className={`${inputClass} resize-none`}
                />

                <div className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-sm leading-6 text-gray-500">
                    <span className="font-semibold text-gray-900">No pressure.</span> {responseTime}. We’ll guide the next step clearly.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center justify-center bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-primary-dark hover:shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin border-2 border-white/40 border-t-white" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send trip request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-10"
        >
          <div className="grid overflow-hidden border border-gray-200 bg-white shadow-sm lg:grid-cols-[0.75fr_1.25fr]">
            <div className="p-6 md:p-8 border-b border-gray-100 lg:border-b-0 lg:border-r">
              <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.22em]">Find us here</span>
              <h3 className="mt-3 text-2xl font-serif font-bold text-gray-950">Zeo Tourism office</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{address}</p>
              <a
                href={(contactInfo?.contact?.location as any)?.maps_url || 'https://maps.app.goo.gl/6ee4i6HGNKX9qdar8'}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-5 inline-flex items-center text-sm font-bold uppercase tracking-wider text-primary hover:text-primary-dark"
              >
                Open in Google Maps <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </a>
            </div>
            <div className="h-[320px] md:h-[420px] relative">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
