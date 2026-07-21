"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { useContact } from '../../hooks/useApi';

const inputClass =
  'w-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10';
const labelClass = 'mb-2 block text-sm font-semibold text-gray-800';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  destination: '',
  travelers: '',
  date: '',
  message: '',
  honeypot: '',
};

type SubmissionState =
  | { type: 'idle'; message: '' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export default function Contact() {
  const { data: contactInfo, loading: contactLoading, error: contactError } = useContact();
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionState>({ type: 'idle', message: '' });

  const phone = contactInfo?.contact?.phone?.primary || '+9779813641003';
  const email = contactInfo?.contact?.email?.primary || 'nepal@zeotourism.com';
  const address = contactInfo?.contact?.address?.full || 'Baluwatar-4, Kathmandu, Nepal';
  const cleanPhone = phone.replace(/\s/g, '');
  const whatsappHref = contactInfo?.social?.whatsapp || `https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}`;
  const responseTime = contactInfo?.business?.support?.response_time
    ? `We usually reply ${contactInfo.business.support.response_time.toLowerCase()}`
    : 'We usually reply within 24 hours';
  const location = contactInfo?.contact?.location as { maps_url?: string } | undefined;
  const mapsUrl = location?.maps_url || 'https://maps.app.goo.gl/6ee4i6HGNKX9qdar8';

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.honeypot) {
      setSubmission({ type: 'success', message: 'Your enquiry was received.' });
      return;
    }

    setIsSubmitting(true);
    setSubmission({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/contact/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit enquiry');
      }

      setFormData(emptyForm);
      setSubmission({
        type: 'success',
        message: 'Your enquiry was sent. Our team will contact you with the next step soon.',
      });
    } catch (error) {
      setSubmission({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit enquiry. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call the office',
      subtitle: phone,
      helper: 'For urgent route questions',
      href: `tel:${cleanPhone}`,
      tone: 'bg-primary text-white',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp the team',
      subtitle: 'Chat with us directly',
      helper: 'Fastest for quick clarification',
      href: whatsappHref,
      tone: 'bg-green-500 text-white',
      external: true,
      recommended: true,
    },
    {
      icon: Mail,
      title: 'Email your plan',
      subtitle: email,
      helper: 'For detailed itineraries',
      href: `mailto:${email}`,
      tone: 'bg-secondary text-white',
    },
  ];

  const planningSteps = [
    { title: 'Share dates', text: 'Preferred month or exact travel date.' },
    { title: 'Share group size', text: 'Solo, family, group or private trip.' },
    { title: 'Get route clarity', text: 'Timing, route, support and next step.' },
  ];

  return (
    <section id="contact" className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
      <div className="container-xl">
        <div className="mb-8 grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-secondary">Contact Zeo Tourism</p>
            <h2 className="max-w-xl font-serif text-3xl font-bold leading-[1.08] tracking-tight text-gray-950 md:text-4xl">
              Tell us what you need. We’ll shape the route.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 md:text-base lg:max-w-xl lg:justify-self-end">
            Not sure where to start? That’s okay. Send what you know, and our Kathmandu team will guide the route, timing and next step.
          </p>
        </div>

        {contactLoading && (
          <div role="status" className="mb-6 border border-gray-200 bg-white p-4 text-sm text-gray-500">
            Loading contact information…
          </div>
        )}
        {contactError && (
          <div role="alert" className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Contact information could not be refreshed. The fallback phone and email remain available.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <aside className="space-y-4" aria-label="Contact options">
            <div className="relative overflow-hidden border border-gray-200 bg-white p-5 text-gray-950 shadow-sm md:p-6">
              <div className="absolute -right-12 -top-12 h-32 w-32 border border-gray-100 bg-gray-50/60" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">Best first step</p>
              <h3 className="mt-3 font-serif text-xl font-bold leading-tight md:text-2xl">Ask before you book.</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                No pressure. We help you understand the practical next step before you commit.
              </p>
              <ol className="mt-5 grid gap-2.5">
                {planningSteps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[auto_1fr] gap-3 border border-gray-200 bg-gray-50 p-3.5">
                    <span className="text-xs font-bold leading-6 text-primary" aria-hidden="true">0{index + 1}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">{step.title}</h4>
                      <p className="mt-0.5 text-sm leading-6 text-gray-600">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-2.5">
              {contactMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    target={method.external ? '_blank' : undefined}
                    rel={method.external ? 'nofollow noopener noreferrer' : undefined}
                    className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 border bg-white p-3.5 transition-colors hover:border-primary/40 ${method.recommended ? 'border-green-200' : 'border-gray-200'}`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center ${method.tone}`} aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2 font-bold text-gray-950 group-hover:text-primary">
                        {method.title}
                        {method.recommended && (
                          <span className="bg-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-green-700">Fastest</span>
                        )}
                      </span>
                      <span className="mt-0.5 block break-all text-sm text-gray-600">{method.subtitle}</span>
                      <span className="mt-0.5 block text-xs text-gray-400">{method.helper}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary" aria-hidden="true" />
                  </a>
                );
              })}
            </div>

            <div className="border border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-gray-950 text-white" aria-hidden="true">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-gray-950">Kathmandu office</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{address}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">Local planning support</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="border border-gray-200 bg-white shadow-xl shadow-gray-900/5">
            <div className="border-b border-gray-100 p-6 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">Trip request form</p>
              <h3 className="mt-3 font-serif text-2xl font-bold text-gray-950 md:text-3xl">Get a route recommendation</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                You do not need a perfect plan. A few details help us suggest the right itinerary, timing and support level.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8" aria-busy={isSubmitting}>
              {submission.type === 'success' && (
                <div role="status" aria-live="polite" className="flex items-start gap-3 border border-green-200 bg-green-50 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" aria-hidden="true" />
                  <p className="text-sm font-medium text-green-800">{submission.message}</p>
                </div>
              )}
              {submission.type === 'error' && (
                <div role="alert" className="flex items-start gap-3 border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" aria-hidden="true" />
                  <p className="text-sm text-red-800">{submission.message}</p>
                </div>
              )}

              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input
                  id="contact-company"
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <p className="border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                <span className="font-semibold text-gray-950">Quick guide:</span> Share your contact details, travel interest, approximate date and anything you are unsure about.
              </p>

              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Your details</legend>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="contact-name">Your name <span aria-hidden="true">*</span></label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Trip basics</legend>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="contact-phone">Phone or WhatsApp</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="contact-destination">Trip interest <span aria-hidden="true">*</span></label>
                    <select
                      id="contact-destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled>Select a trip interest</option>
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
                  <div>
                    <label className={labelClass} htmlFor="contact-travelers">Number of travelers</label>
                    <input
                      id="contact-travelers"
                      type="number"
                      name="travelers"
                      value={formData.travelers}
                      onChange={handleChange}
                      min="1"
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="contact-date">Preferred travel date</label>
                    <input
                      id="contact-date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </fieldset>

              <div>
                <label className={labelClass} htmlFor="contact-message">Travel note</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us your plan, preferred route, budget range or special requirements."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="text-sm leading-6 text-gray-500">
                  <span className="font-semibold text-gray-900">No pressure.</span> {responseTime}. We’ll guide the next step clearly.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 items-center justify-center bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin border-2 border-white/40 border-t-white" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                      Send trip request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden border border-gray-200 bg-white shadow-sm lg:grid-cols-[0.75fr_1.25fr]">
          <div className="border-b border-gray-100 p-6 md:p-8 lg:border-b-0 lg:border-r">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">Find us here</p>
            <h3 className="mt-3 font-serif text-2xl font-bold text-gray-950">Zeo Tourism office</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">{address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="mt-5 inline-flex items-center text-sm font-bold uppercase tracking-wider text-primary hover:text-primary-dark"
            >
              Open in Google Maps <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="relative h-[320px] md:h-[420px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2738.8293499738834!2d85.33145348661431!3d27.72530994398019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19f625c6408f%3A0xa14006f9fceeea6a!2sZeo%20Tourism%20Pvt.Ltd!5e0!3m2!1sen!2snp!4v1758183095926!5m2!1sen!2snp"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Zeo Tourism office location"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
