import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import Contact from '../components/Contact/Contact';
import { useContact } from '../hooks/useApi';
import { createOrganizationSchema, createTravelAgencySchema, createBreadcrumbSchema } from '../utils/schema';

import SEO from '../components/SEO/SEO';

const ContactPage: React.FC = () => {
  const { data: contactInfo } = useContact();

  const structuredData = useMemo(() => [
    createOrganizationSchema(),
    createTravelAgencySchema(),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Contact", url: "https://www.zeotourism.com/contact" }
    ])
  ], []);

  return (
    <>
      <SEO
        title="Contact Zeo Tourism | Travel Agency in Kathmandu, Nepal"
        description="Contact Zeo Tourism in Kathmandu for Kailash Mansarovar Yatra, Nepal tour packages, Muktinath, Everest, Annapurna, helicopter tours, WhatsApp support and custom travel planning."
        keywords="contact zeo tourism, travel agency in Kathmandu, Nepal tour operator, Kailash tour operator Nepal, Zeo Tourism office, Kathmandu travel agency, Nepal DMC"
        url="https://www.zeotourism.com/contact"
        structuredData={structuredData}
      />
      <div className="contact-page">
        <PageHeader
          title={contactInfo?.company.tagline || "Embrace the Journey"}
          subtitle={contactInfo?.company.description || "Your trusted partner for authentic Himalayan adventures and spiritual journeys. Get in touch with our travel experts to plan your perfect journey."}
          breadcrumb="Contact"
          backgroundImage="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070"
        />

        <Contact />
      </div>
    </>
  );
};

export default ContactPage;
