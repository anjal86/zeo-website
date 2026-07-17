import React from "react";
import type { Metadata } from "next";
import { listTours } from "../../src/server/repositories/tours";
import ToursListClient from "../../src/components/Tours/ToursListClient";
import PageHeader from "../../src/components/PageHeader/PageHeader";

export const revalidate = 3600;

const title = "Nepal Tours, Kailash Yatra & International Packages | Zeo Tourism";
const description =
  "Compare Nepal tours, Himalayan journeys, Kailash Mansarovar Yatra and international packages by duration, travel style and support level.";
const image =
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&h=900&fit=crop";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/tours",
  },
  openGraph: {
    title,
    description,
    url: "/tours",
    type: "website",
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: "Himalayan landscape for Zeo Tourism tour packages",
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

export default async function ToursPage() {
  const result = await listTours({ limit: "500" });

  return (
    <div className="pt-20">
      <PageHeader
        title="Tours & Packages"
        subtitle="Browse our carefully crafted itineraries covering the Himalayas, spiritual journeys, and cross-border adventures."
        breadcrumb="Tours"
        backgroundImage={image}
      />
      <ToursListClient initialTours={result.items as any} />
    </div>
  );
}
