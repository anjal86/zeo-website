import type { Metadata } from 'next';
import { createOrganizationSchema, createBreadcrumbSchema, createTravelAgencySchema } from '../../src/server/seo/schema';
import JsonLd from '../../src/components/seo/JsonLd';
import PageHeader from '../../src/components/PageHeader/PageHeader';
import Contact from '../../src/components/Contact/Contact';

const siteUrl = (process.env.APP_URL || 'https://zeotourism.com').replace(/\/$/, '');
const title = 'Contact Zeo Tourism | Plan Your Nepal or Kailash Journey';
const description =
  'Contact Zeo Tourism’s Kathmandu team for Nepal tours, Kailash Mansarovar Yatra, trekking, private trips and practical route-planning support.';
const image = 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1600&h=900&fit=crop';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title,
    description,
    url: '/contact',
    siteName: 'Zeo Tourism',
    type: 'website',
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: 'Himalayan trail representing travel planning with Zeo Tourism',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [image],
  },
};

export default function ContactPage() {
  const structuredData = [
    createOrganizationSchema(),
    createTravelAgencySchema(),
    createBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'Contact', url: `${siteUrl}/contact` },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="contact-page">
        <PageHeader
          title="Plan Your Journey With Us"
          subtitle="Share your dates, group size and travel purpose. Our Kathmandu team will help you understand the route, timing and next step."
          breadcrumb="Contact"
          backgroundImage={image}
        />
        <Contact />
      </div>
    </>
  );
}
