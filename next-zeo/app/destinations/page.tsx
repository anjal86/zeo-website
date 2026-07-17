import React from "react";
import type { Metadata } from "next";
import { listDestinations } from "../../src/server/repositories/catalog";
import PageHeader from "../../src/components/PageHeader/PageHeader";
import Destinations from "../../src/components/Destinations/Destinations";

export const revalidate = 3600;

const title = "Nepal & International Travel Destinations | Zeo Tourism";
const description =
  "Explore Nepal and international destinations for pilgrimage, Himalayan journeys, cultural tours, activities and private travel planning.";
const image =
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&h=900&fit=crop";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/destinations",
  },
  openGraph: {
    title,
    description,
    url: "/destinations",
    type: "website",
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: "Himalayan travel destination in Nepal",
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

export default async function DestinationsPage() {
  await listDestinations({ limit: "100" });

  return (
    <div className="pt-20">
      <PageHeader
        title="Destinations"
        subtitle="Explore Nepal and international travel routes planned with local clarity, practical support, and purpose-first guidance."
        breadcrumb="Destinations"
        backgroundImage={image}
      />
      <Destinations />
    </div>
  );
}
