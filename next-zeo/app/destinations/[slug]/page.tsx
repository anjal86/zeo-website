export const revalidate = 3600;

import React from 'react';
import { notFound } from 'next/navigation';
import { getDestinationBySlug } from '../../../src/server/repositories/catalog';
import DestinationDetailComponent from '../../../src/components/Destinations/DestinationDetail';
import { createTouristDestinationSchema, createBreadcrumbSchema, createFAQSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

const siteUrl = process.env.APP_URL || 'https://www.zeotourism.com';

const destinationSeo: Record<string, {
  title: string;
  description: string;
  country: string;
  image: string;
  faqs: { question: string; answer: string }[];
}> = {
  nepal: {
    title: 'Nepal Tours from Kathmandu | Pilgrimage, Trekking & Private Travel',
    description: 'Plan Nepal tours from Kathmandu with Zeo Tourism: Muktinath pilgrimage, Kathmandu sightseeing, Everest and Annapurna routes, helicopter tours, family trips and private itineraries with local support.',
    country: 'Nepal',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop',
    faqs: [
      { question: 'Which Nepal tour is best for first-time visitors?', answer: 'Kathmandu, Pokhara, Nagarkot, Chitwan, Lumbini and Muktinath are common choices, but the best route depends on travel days, age group, budget and travel purpose.' },
      { question: 'Can Nepal tours be customized for families or senior travellers?', answer: 'Yes. Nepal tours can be customized with slower pacing, easier road sectors, private vehicles, selected hotels and support based on the traveller profile.' },
    ],
  },
  thailand: {
    title: 'Thailand Tour Packages from Nepal | Bangkok, Beaches & Family Trips',
    description: 'Plan Thailand tour packages from Nepal with Zeo Tourism. Compare Bangkok, Pattaya, Phuket, Krabi, island holidays, family trips and Thailand–Malaysia–Singapore routes with clear support.',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2070&auto=format&fit=crop',
    faqs: [
      { question: 'How many days are enough for Thailand from Nepal?', answer: 'A short Bangkok or Pattaya trip can work in 4 to 5 days, while beach routes or multi-country combinations usually need 7 to 10 days for a better pace.' },
      { question: 'Can Thailand be combined with Malaysia or Singapore?', answer: 'Yes. Thailand, Malaysia and Singapore can be combined, but the route should be planned around flight timing, transfers, hotel locations and total travel days.' },
    ],
  },
  china: {
    title: 'China and Tibet Travel Planning from Nepal | Guided Routes & Support',
    description: 'Plan China, Tibet and cross-border travel from Nepal with documentation guidance, permit coordination, timing clarity and guided route support from Zeo Tourism.',
    country: 'China',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop',
    faqs: [
      { question: 'Can China routes be planned from Nepal?', answer: 'Yes, but document requirements, timing and route feasibility should be checked before confirming a package.' },
      { question: 'Is Tibet planning different from normal China travel?', answer: 'Yes. Tibet-related travel usually requires more careful permit, route and support planning.' },
    ],
  },
};

const nepalDestination = {
  name: 'Nepal',
  country: 'Nepal',
  image: destinationSeo.nepal.image,
  description: destinationSeo.nepal.description,
  tourCount: 1,
};

async function resolveDestination(slug: string) {
  const dest = await getDestinationBySlug(slug);
  if (dest) return dest;
  if (slug === 'nepal') return nepalDestination;
  return null;
}

function getSeo(slug: string, dest: any) {
  return destinationSeo[slug] || {
    title: `${dest.name} Tours & Travel Guide - Zeo Tourism`,
    description: dest.description || `Plan ${dest.name} travel with Zeo Tourism. Compare route options, timing, support level and private travel planning before booking.`,
    country: dest.country || 'Nepal',
    image: dest.image || '',
    faqs: [
      { question: `How do I plan a ${dest.name} trip?`, answer: `Start with your travel dates, group size, preferred pace and budget. Zeo Tourism helps compare routes, hotel areas, transfers and support before booking.` },
      { question: `Can ${dest.name} trips be customized?`, answer: 'Yes. The route can be adjusted around your travel purpose, available days, hotel preference and support needs.' },
    ],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await resolveDestination(slug);

  if (!dest) return { title: 'Not Found' };

  const seo = getSeo(slug, dest);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `${siteUrl}/destinations/${slug}`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${siteUrl}/destinations/${slug}`,
      images: seo.image ? [{ url: seo.image }] : [],
      type: 'website',
    },
  };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await resolveDestination(slug);

  if (!dest) {
    notFound();
  }

  const seo = getSeo(slug, dest);
  const image = dest.image || seo.image || '';

  const structuredData = [
    createTouristDestinationSchema({
      name: dest.name,
      description: seo.description,
      country: seo.country || dest.country || 'Nepal',
      image,
      url: `${siteUrl}/destinations/${slug}`,
      toursCount: Number((dest as any).tourCount || 1),
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'Destinations', url: `${siteUrl}/destinations` },
      { name: dest.name, url: `${siteUrl}/destinations/${slug}` },
    ]),
    createFAQSchema(seo.faqs),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <DestinationDetailComponent />
    </>
  );
}
