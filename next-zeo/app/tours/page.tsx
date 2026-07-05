export const dynamic = 'force-dynamic';
import React from 'react';
import { listTours } from '../../src/server/repositories/tours';
import Tours from '../../src/components/Tours/Tours';

export const metadata = {
  title: "Tours & Packages - Zeo Tourism",
  description: "Browse our comprehensive collection of tours, from the Himalayas to cultural heritage sites.",
};

export default async function ToursPage() {
  const result = await listTours({ limit: '500' });
  
  return (
    <div className="pt-20">
      <Tours />
    </div>
  );
}
