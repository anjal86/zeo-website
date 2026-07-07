export const revalidate = 3600;
import React from 'react';
import { notFound } from 'next/navigation';
import { getTourBySlug } from '../../../src/server/repositories/tours';
import TourDetailComponent from '../../../src/components/Tours/TourDetail';
import { createTourDetailSchema } from '../../../src/server/seo/tourDetailSchema';
import JsonLd from '../../../src/components/seo/JsonLd';

const SITE_URL = (process.env.APP_URL || 'https://www.zeotourism.com').replace(/\/$/, '');

const absoluteUrl = (value?: string | null) => {
  if (!value) return `${SITE_URL}/logo/zeo-logo.png`;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  
  if (!tour) return { title: 'Not Found' };

  const canonical = `${SITE_URL}/tours/${slug}`;
  const title = `${tour.title} - Zeo Tourism`;
  const description = tour.description || `Join our ${tour.title} package.`;
  const image = absoluteUrl(tour.image || tour.image_url || '/logo/zeo-logo.png');
  
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  
  if (!tour) {
    notFound();
  }

  const url = `${SITE_URL}/tours/${slug}`;
  const images = [tour.image, tour.image_url, ...(Array.isArray(tour.gallery) ? tour.gallery : [])]
    .filter(Boolean)
    .map(String);

  const structuredData = createTourDetailSchema({
    name: tour.title,
    description: tour.description || '',
    url,
    images,
    price: tour.price || 0,
    priceAvailable: tour.priceAvailable,
    currency: 'USD',
    category: tour.category,
    duration: tour.duration,
    durationDays: tour.duration_days,
    groupSize: tour.group_size,
    bestTime: tour.best_time,
    location: tour.location,
    difficulty: tour.difficulty,
    ratingValue: tour.rating,
    reviewCount: tour.reviews,
    highlights: tour.highlights,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    itinerary: tour.itinerary,
    faqs: (tour as { faqs?: Array<{ question: string; answer: string }> }).faqs,
    travellerDecision: (tour.metadata as { traveller_decision?: Record<string, unknown[]> } | null | undefined)?.traveller_decision,
  });

  return (
    <>
      <JsonLd data={structuredData} />
      <TourDetailComponent tour={tour as React.ComponentProps<typeof TourDetailComponent>['tour']} />
    </>
  );
}
