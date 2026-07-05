export const dynamic = 'force-dynamic';
import React from 'react';
import { listActivities } from '../../src/server/repositories/catalog';
import Activities from '../../src/components/Activities/Activities';

export const metadata = {
  title: "Activities - Zeo Tourism",
  description: "Find exciting activities for your next adventure.",
};

export default async function ActivitiesPage() {
  const result = await listActivities({ limit: '100' });
  
  return (
    <div className="pt-20">
      <Activities />
    </div>
  );
}
