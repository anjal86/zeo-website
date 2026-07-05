export const revalidate = 3600;
import React from 'react';
import { listDestinations } from '../../src/server/repositories/catalog';
import PageHeader from '../../src/components/PageHeader/PageHeader';
import Destinations from '../../src/components/Destinations/Destinations';

export const metadata = {
  title: "Destinations | Nepal & International Travel - Zeo Tourism",
  description: "Explore Nepal and international destinations planned by Zeo Tourism, including pilgrimage routes, Himalayan journeys, cultural tours, and private travel planning.",
  alternates: {
    canonical: "https://www.zeotourism.com/destinations"
  }
};

export default async function DestinationsPage() {
  await listDestinations({ limit: '100' });

  return (
    <div className="pt-20">
      <PageHeader
        title="Destinations"
        subtitle="Explore Nepal and international travel routes planned with local clarity, practical support, and purpose-first guidance."
        breadcrumb="Destinations"
        backgroundImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop"
      />
      <Destinations />
    </div>
  );
}
