export const revalidate = 3600;
import React from 'react';
import { notFound } from 'next/navigation';
import { getDestinationBySlug } from '../../../src/server/repositories/catalog';
import DestinationDetailComponent from '../../../src/components/Destinations/DestinationDetail'; 
import { createTouristDestinationSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

const siteUrl = process.env.APP_URL || 'https://www.zeotourism.com';

const nepalDestination = {
  name: 'Nepal',
  country: 'Nepal',
  image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop',
  description: 'Explore Nepal travel routes planned from Kathmandu, including pilgrimage journeys, Himalayan trekking, cultural tours, family trips, helicopter options and private itineraries.',
  tourCount: 1,
};

async function resolveDestination(slug: string) {
  const dest = await getDestinationBySlug(slug);
  if (dest) return dest;
  if (slug === 'nepal') return nepalDestination;
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await resolveDestination(slug);
  
  if (!dest) return { title: 'Not Found' };
  
  return {
    title: `${dest.name} Tours & Travel Guide - Zeo Tourism`,
    description: dest.description || `Explore ${dest.name} with our guided tours.`,
    alternates: {
      canonical: `${siteUrl}/destinations/${slug}`
    }
  };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await resolveDestination(slug);
  
  if (!dest) {
    notFound();
  }

  const structuredData = [
    createTouristDestinationSchema({
      name: dest.name,
      description: dest.description || '',
      country: dest.country || 'Nepal',
      image: dest.image || '',
      url: `${siteUrl}/destinations/${slug}`,
      toursCount: Number((dest as any).tourCount || 1)
    }),
    createBreadcrumbSchema([
      { name: "Home", url: siteUrl },
      { name: "Destinations", url: `${siteUrl}/destinations` },
      { name: dest.name, url: `${siteUrl}/destinations/${slug}` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <DestinationDetailComponent />
    </>
  );
}
