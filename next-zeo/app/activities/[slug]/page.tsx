export const dynamic = 'force-dynamic';
import React from 'react';
import { notFound } from 'next/navigation';
import { getActivityBySlug } from '../../../src/server/repositories/catalog';
import ActivityDetailComponent from '../../../src/components/Activities/ActivityDetail'; 
import { createTouristAttractionSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  
  if (!activity) return { title: 'Not Found' };
  
  return {
    title: `${activity.name} - Zeo Tourism`,
    description: activity.description || `Enjoy ${activity.name} with us.`,
    alternates: {
      canonical: `https://www.zeotourism.com/activities/${slug}`
    }
  };
}

export default async function ActivityDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  
  if (!activity) {
    notFound();
  }

  const structuredData = [
    createTouristAttractionSchema({
      name: activity.name,
      description: activity.description || '',
      image: activity.image || '',
      url: `https://www.zeotourism.com/activities/${slug}`,
      toursCount: 1 
    }),
    createBreadcrumbSchema([
      { name: "Home", url: "https://www.zeotourism.com" },
      { name: "Activities", url: "https://www.zeotourism.com/activities" },
      { name: activity.name, url: `https://www.zeotourism.com/activities/${slug}` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <ActivityDetailComponent />
    </>
  );
}
