export const dynamic = 'force-dynamic';
import React from 'react';
import { notFound } from 'next/navigation';
import { getTourBySlug } from '../../../src/server/repositories/tours';
import TourDetailComponent from '../../../src/components/Tours/TourDetail'; // Assuming we rename to TourDetail component
import { createTouristTripSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  
  if (!tour) return { title: 'Not Found' };
  
  return {
    title: `${tour.title} - Zeo Tourism`,
    description: tour.description || `Join our ${tour.title} package.`,
    alternates: {
      canonical: `https://www.zeotourism.com/tours/${slug}`
    }
  };
}

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  
  if (!tour) {
    notFound();
  }

  const structuredData = [
    createTouristTripSchema({
      name: tour.title,
      description: tour.description || '',
      image: tour.image || '',
      url: `https://www.zeotourism.com/tours/${slug}`,
      price: tour.price || 0,
      currency: "USD",
      category: "Tour Package",
      duration: tour.duration || '',
      location: tour.location || ''
    }),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Tours", url: "https://www.zeotourism.com/tours" },
      { name: tour.title, url: `https://www.zeotourism.com/tours/${slug}` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <TourDetailComponent tour={tour as any} />
    </>
  );
}
