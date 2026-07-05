"use client";


import { createOrganizationSchema, createBreadcrumbSchema , createTravelAgencySchema} from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';

import PageHeader from '../../src/components/PageHeader/PageHeader';
import Contact from '../../src/components/Contact/Contact';
import { useContact } from '../../src/hooks/useApi';



const ContactPage: React.FC = () => {
  const { data: contactInfo } = useContact();

  const structuredData = [
    createOrganizationSchema(),
    createTravelAgencySchema(),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Contact", url: "https://www.zeotourism.com/contact" }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      
      <div className="contact-page">
        <PageHeader
          title={contactInfo?.company?.tagline || "Embrace the Journey"}
          subtitle={contactInfo?.company?.description || "Your trusted partner for authentic Himalayan adventures and spiritual journeys. Get in touch with our travel experts to plan your perfect journey."}
          breadcrumb="Contact"
          backgroundImage="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070"
        />

        <Contact />
      </div>
    </>
  );
};

export default ContactPage;
