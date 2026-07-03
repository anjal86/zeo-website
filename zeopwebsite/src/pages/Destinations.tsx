import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import Destinations from '../components/Destinations/Destinations';
import SEO from '../components/SEO/SEO';
import { createBreadcrumbSchema } from '../utils/schema';

const DestinationsPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Explore Our Destinations - Zeo Tourism"
        description="Discover amazing destinations across Nepal and the globe. From the peaks of the Himalayas to the golden sands of Dubai."
        keywords="nepal destinations, travel nepal, international tours, trekking destinations"
        url="https://www.zeotourism.com/destinations"
        structuredData={[
          createBreadcrumbSchema([
            { name: "Home", url: "https://www.zeotourism.com" },
            { name: "Destinations", url: "https://www.zeotourism.com/destinations" }
          ])
        ]}
      />
      <div className="destinations-page">
        <PageHeader
          title="Destinations"
          subtitle="Discover your next adventure"
          breadcrumb="Destinations"
          backgroundImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070"
        />

        <Destinations />
      </div>
    </>
  );
};

export default DestinationsPage;