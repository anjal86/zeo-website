"use client";


import { createOrganizationSchema, createBreadcrumbSchema } from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Globe, Cookie, FileText, Scale, UserCheck } from 'lucide-react';
import { useContact } from '../../src/hooks/useApi';


const PrivacyPolicy: React.FC = () => {
  const { data: contactInfo } = useContact();

  const companyName = contactInfo?.company?.name || 'Zeo Tourism';
  const address = contactInfo?.contact?.address?.full || 'Baluwatar-4, Kathmandu, Nepal';
  const phone = contactInfo?.contact?.phone?.primary || '+977 985 123 4567';
  const email = contactInfo?.contact?.email?.primary || 'info@zeotourism.com';
  const lastUpdated = 'July 2, 2026';
  const structuredData = [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: 'https://www.zeotourism.com' },
      { name: 'Privacy Policy', url: 'https://www.zeotourism.com/privacy-policy' }
    ])
  ];

  const toc = [
    { id: 'intro', label: 'Introduction' },
    { id: 'collection', label: 'Information We Collect' },
    { id: 'use', label: 'How We Use Information' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'sharing', label: 'Data Sharing' },
    { id: 'security', label: 'Data Security' },
    { id: 'legal-basis', label: 'Legal Basis (GDPR/EU)' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'international', label: 'International Transfers' },
    { id: 'children', label: "Children's Privacy" },
    { id: 'links', label: 'Third‑Party Links' },
    { id: 'changes', label: 'Changes to This Policy' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <>
      <JsonLd data={structuredData} />
      
      <section className="bg-gray-50 py-16">
      {/* Hero / Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary/10 via-white to-secondary/10 border border-gray-200 rounded-none p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <span className="text-sm text-gray-600">Last updated: {lastUpdated}</span>
          </div>
          <p className="mt-3 text-gray-600 max-w-3xl">
            We respect your privacy and are committed to protecting your personal information while delivering
            exceptional travel services.
          </p>
        </div>
      </div>

      {/* Two‑column layout with sticky ToC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-9 xl:col-span-9 lg:order-1 bg-white rounded-none shadow-sm border border-gray-200 p-6 sm:p-8"
          >
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <section id="intro">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Introduction</h2>
                <p>
                  This Privacy Policy explains how {companyName} collects, uses, shares, and protects your personal
                  information when you use our website, services, and communicate with us. By using our services,
                  you agree to the terms of this policy.
                </p>
              </section>

              <section id="collection">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Information We Collect</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact details such as name, email address, phone number, and mailing address.</li>
                  <li>Booking and enquiry details including travel preferences, dates, destinations, and payment information.</li>
                  <li>Account and interaction data such as messages, feedback, and support requests.</li>
                  <li>Usage data like pages visited, device information, browser type, and IP address.</li>
                  <li>Cookies and similar technologies to remember preferences and improve website performance.</li>
                </ul>
                <div className="mt-3 text-sm bg-gray-50 border rounded-none p-4">
                  <div className="flex items-center gap-2 font-medium text-gray-800"><Cookie className="w-4 h-4" /> Cookie categories</div>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Essential (required for site to function)</li>
                    <li>Analytics (to improve performance and experience)</li>
                    <li>Marketing (only with consent; you can opt out)</li>
                  </ul>
                </div>
              </section>

              <section id="use">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and personalize tour services, itineraries, and travel assistance.</li>
                  <li>To process bookings, payments, and communicate updates regarding your trips.</li>
                  <li>To respond to enquiries and offer customer support.</li>
                  <li>To improve our website, services, and user experience through analytics.</li>
                  <li>To send updates, promotional offers, and newsletters (you may opt out at any time).</li>
                  <li>To comply with legal obligations and enforce our terms and policies.</li>
                </ul>
              </section>

              <section id="cookies">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar technologies to remember your preferences, analyze usage, and improve
                  the performance of our website. You can control cookie settings through your browser. Disabling
                  cookies may affect certain features of the website.
                </p>
                <p className="mt-2 text-sm text-gray-600">Tip: Most browsers let you clear cookies and set Do Not Track or tracking prevention. See your browser’s privacy settings.</p>
              </section>

              <section id="sharing">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Sharing and Third Parties</h2>
                <p>
                  We do not sell your personal information. We may share data with trusted partners solely to deliver
                  services (e.g., local tour operators, payment processors), subject to confidentiality obligations.
                  We may also disclose information when required by law or to protect rights, safety, and property.
                </p>
                <div className="mt-3 text-sm bg-gray-50 border rounded-none p-4">
                  <div className="flex items-center gap-2 font-medium text-gray-800"><Globe className="w-4 h-4" /> Typical partners</div>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Payment processors and banks</li>
                    <li>Local guides and ground operators</li>
                    <li>IT and analytics providers</li>
                  </ul>
                </div>
              </section>

              <section id="security">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Security</h2>
                <p>
                  We implement administrative, technical, and physical safeguards to protect your information from
                  unauthorized access, loss, misuse, or disclosure. While we strive to protect your data, no method of
                  transmission or storage is fully secure.
                </p>
                <p className="mt-2 text-sm text-gray-600">Examples of safeguards: role‑based access, encryption in transit, and limited retention.</p>
              </section>

              <section id="legal-basis">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Legal Basis (GDPR/EU)</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contract: processing bookings, payments, and travel arrangements.</li>
                  <li>Consent: marketing communications and certain analytics cookies.</li>
                  <li>Legitimate Interests: service improvement, security, and fraud prevention.</li>
                  <li>Legal Obligation: tax, accounting, and compliance requirements.</li>
                </ul>
              </section>

              <section id="rights">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Rights</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access, update, or correct your personal information.</li>
                  <li>Request deletion of your data, subject to legal or contractual obligations.</li>
                  <li>Opt out of marketing communications at any time.</li>
                  <li>Request a copy of your data or restrict certain processing activities.</li>
                </ul>
                <div className="mt-3 text-sm bg-gray-50 border rounded-none p-4">
                  <div className="flex items-center gap-2 font-medium text-gray-800"><UserCheck className="w-4 h-4" /> CCPA (California)</div>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Right to know categories of data collected and shared</li>
                    <li>Right to delete (with certain exceptions)</li>
                    <li>Right to opt‑out of sale or sharing (we do not sell)</li>
                  </ul>
                </div>
              </section>

              <section id="retention">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Retention</h2>
                <p>
                  We retain personal information only as long as necessary to provide services, comply with legal
                  requirements, resolve disputes, and enforce agreements.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                  <li>Enquiries: up to 24 months</li>
                  <li>Bookings and accounting records: up to 7 years</li>
                  <li>Analytics data: 26 months (typical)</li>
                </ul>
              </section>

              <section id="international">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">International Data Transfers</h2>
                <p>
                  Depending on your travel plans, your information may be processed in countries outside of your
                  residence. We take steps to ensure adequate protection consistent with applicable laws.
                </p>
              </section>

              <section id="children">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Children’s Privacy</h2>
                <p>
                  Our services are not directed to children under 16. We do not knowingly collect personal information
                  from children. If you believe a child has provided us information, please contact us to delete it.
                </p>
              </section>

              <section id="links">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Third‑Party Links</h2>
                <p>
                  Our website may include links to third-party sites. We are not responsible for their privacy practices.
                  We encourage you to review the privacy policies of any external websites you visit.
                </p>
              </section>

              <section id="changes">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. Changes will be posted on this page with the
                  updated date. Continued use of our services indicates acceptance of the revised policy.
                </p>
              </section>

              <section id="contact">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
                <div className="bg-gray-50 border rounded-none p-4">
                  <div className="flex items-center text-gray-700 mb-2"><Phone className="w-4 h-4 mr-2" />{phone}</div>
                  <div className="flex items-center text-gray-700 mb-2"><Mail className="w-4 h-4 mr-2" />{email}</div>
                  <div className="flex items-center text-gray-700"><MapPin className="w-4 h-4 mr-2" />{address}</div>
                </div>
                <p className="mt-3 text-sm text-gray-600 flex items-center gap-2"><Scale className="w-4 h-4" /> If you are in the EU/EEA and believe your rights have been infringed, you may lodge a complaint with your local data protection authority.</p>
              </section>
            </div>
          </motion.div>

          {/* TOC moved to right sidebar */}
          <aside className="lg:col-span-3 xl:col-span-3 lg:order-2">
            <div className="sticky top-28 md:top-32 bg-white border border-gray-200 rounded-none shadow-sm p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold"><FileText className="w-4 h-4" /> On this page</div>
              <nav className="space-y-1">
                {toc.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="w-full text-left px-3 py-2 rounded-none text-sm hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </section>
    </>
  );
};

export default PrivacyPolicy;
