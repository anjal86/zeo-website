export const revalidate = 3600;
import React from 'react';
import { notFound } from 'next/navigation';
import { getDestinationBySlug } from '../../../src/server/repositories/catalog';
import DestinationDetailComponent from '../../../src/components/Destinations/DestinationDetail'; 
import { createTouristDestinationSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  
  if (!dest) return { title: 'Not Found' };
  
  return {
    title: `${dest.name} Tours & Travel Guide - Zeo Tourism`,
    description: dest.description || `Explore ${dest.name} with our guided tours.`,
    alternates: {
      canonical: `${process.env.APP_URL || 'https://www.zeotourism.com'}/destinations/${slug}`
    }
  };
}

export default async function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  
  if (!dest) {
    notFound();
  }

  const structuredData = [
    createTouristDestinationSchema({
      name: dest.name,
      description: dest.description || '',
      country: dest.country || 'Nepal',
      image: dest.image || '',
      url: `${process.env.APP_URL || 'https://www.zeotourism.com'}/destinations/${slug}`,
      toursCount: 1 // mock or compute
    }),
    createBreadcrumbSchema([
      { name: "Home", url: (process.env.APP_URL || 'https://www.zeotourism.com') },
      { name: "Destinations", url: (process.env.APP_URL || 'https://www.zeotourism.com') + '/destinations' },
      { name: dest.name, url: `${process.env.APP_URL || 'https://www.zeotourism.com'}/destinations/${slug}` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <DestinationDetailComponent />
    </>
  );
}
