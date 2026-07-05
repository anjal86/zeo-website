export const dynamic = 'force-dynamic';
import React from 'react';
import { listDestinations } from '../../src/server/repositories/catalog';
import Destinations from '../../src/components/Destinations/Destinations';

export const metadata = {
  title: "Destinations - Zeo Tourism",
  description: "Explore our beautiful destinations across Nepal and beyond.",
};

export default async function DestinationsPage() {
  const result = await listDestinations({ limit: '100' });
  
  return (
    <div className="pt-20">
      <Destinations />
    </div>
  );
}
