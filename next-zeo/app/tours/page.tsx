export const revalidate = 3600;
import React from 'react';
import { listTours } from '../../src/server/repositories/tours';
import ToursListClient from '../../src/components/Tours/ToursListClient';
import PageHeader from '../../src/components/PageHeader/PageHeader';

export const metadata = {
  title: "Tours & Packages - Zeo Tourism",
  description: "Browse our comprehensive collection of tours, from the Himalayas to cultural heritage sites.",
};

export default async function ToursPage() {
  const result = await listTours({ limit: '500' });
  
  return (
    <div className="pt-20">
      <PageHeader
        title="Tours & Packages"
        subtitle="Browse our carefully crafted itineraries covering the Himalayas, spiritual journeys, and cross-border adventures."
        breadcrumb="Tours"
        backgroundImage="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop"
      />
      <ToursListClient initialTours={result.items as any} />
    </div>
  );
}
