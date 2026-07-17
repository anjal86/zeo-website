import React from "react";
import type { Metadata } from "next";
import { listActivities } from "../../src/server/repositories/catalog";
import Activities from "../../src/components/Activities/Activities";

export const revalidate = 3600;

const title = "Nepal Travel Activities & Experiences | Zeo Tourism";
const description =
  "Explore helicopter tours, trekking, sightseeing, pilgrimage experiences and travel activities in Nepal with practical local planning support.";
const image =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1600&h=900&fit=crop";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/activities",
  },
  openGraph: {
    title,
    description,
    url: "/activities",
    type: "website",
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: "Mountain travel activity in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default async function ActivitiesPage() {
  await listActivities({ limit: "100" });

  return (
    <div className="pt-20">
      <Activities />
    </div>
  );
}
