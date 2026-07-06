export const revalidate = 3600;
import React from 'react';
import type { Metadata } from 'next';
import { listActivities } from '../../src/server/repositories/catalog';
import Activities from '../../src/components/Activities/Activities';

export const metadata: Metadata = {
  title: "Activities - Zeo Tourism",
  description: "Find exciting activities for your next adventure.",
  alternates: {
    canonical: "/activities",
  },
};

export default async function ActivitiesPage() {
  await listActivities({ limit: '100' });
  
  return (
    <div className="pt-20">
      <Activities />
    </div>
  );
}
