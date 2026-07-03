import React, { useMemo } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import About from '../components/About/About';
import SEO from '../components/SEO/SEO';
import { createOrganizationSchema, createBreadcrumbSchema } from '../utils/schema';

const AboutPage: React.FC = () => {
  const structuredData = useMemo(() => [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "About", url: "https://www.zeotourism.com/about" }
    ])
  ], []);

  return (
    <>
      <SEO
        title="About Us - Zeo Tourism | 13+ Years of Professional Travel Expertise"
        description="Expert travel services in Nepal and Dubai by Zeo Tourism. 13+ years of experience in customized international and corporate tours."
        keywords="about zeo tourism, travel company Nepal, Dubai travel agency, ZEO Tourism LLC, customized travel packages, corporate incentive tours, visa processing, MICE"
        url="https://www.zeotourism.com/about"
        type="website"
        structuredData={structuredData}
      />

      <div className="about-page">
        <PageHeader
          title="About Zeo Tourism"
          subtitle="Founded in 2018 with over 13 years of professional expertise, we craft authentic travel experiences across Nepal, Asia, and the Middle East."
          breadcrumb="About"
          backgroundImage="https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=2070&auto=format&fit=crop"
        />

        <About />
      </div>
    </>
  );
};

export default AboutPage;