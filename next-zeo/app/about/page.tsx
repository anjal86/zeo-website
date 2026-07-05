export const metadata = {
  title: "About Zeo Tourism | Kathmandu-Based Travel Planning Team",
  description: "Learn about Zeo Tourism, a Kathmandu-based travel planning team helping travelers plan Kailash Yatra, Nepal tours, international trips, activities, and private journeys with local clarity.",
  alternates: {
    canonical: "https://www.zeotourism.com/about"
  }
};

import { createOrganizationSchema, createBreadcrumbSchema } from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';
import PageHeader from '../../src/components/PageHeader/PageHeader';
import About from '../../src/components/About/About';

const AboutPage: React.FC = () => {
  const structuredData = [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "About", url: "https://www.zeotourism.com/about" }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="about-page">
        <PageHeader
          title="About Zeo Tourism"
          subtitle="A Kathmandu-based travel team helping travelers plan sacred journeys, Nepal tours, international trips, activities, and private travel with clearer local guidance."
          breadcrumb="About"
          backgroundImage="https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=2070&auto=format&fit=crop"
        />

        <About />
      </div>
    </>
  );
};

export default AboutPage;
