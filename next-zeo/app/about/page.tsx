
export const metadata = {
  title: "About Us - Zeo Tourism | 13+ Years of Professional Travel Expertise",
  description: "Expert travel services in Nepal and Dubai by Zeo Tourism. 13+ years of experience in customized international and corporate tours.",
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
