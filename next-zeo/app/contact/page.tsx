"use client";

import { createOrganizationSchema, createBreadcrumbSchema, createTravelAgencySchema } from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';
import PageHeader from '../../src/components/PageHeader/PageHeader';
import Contact from '../../src/components/Contact/Contact';

const ContactPage: React.FC = () => {
  const structuredData = [
    createOrganizationSchema(),
    createTravelAgencySchema(),
    createBreadcrumbSchema([
      { name: "Home", url: "https://zeotourism.com" },
      { name: "Contact", url: "https://zeotourism.com/contact" }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="contact-page">
        <PageHeader
          title="Plan Your Journey With Us"
          subtitle="Share your dates, group size and travel purpose. Our Kathmandu team will help you understand the route, timing and next step."
          breadcrumb="Contact"
          backgroundImage="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070"
        />

        <Contact />
      </div>
    </>
  );
};

export default ContactPage;
