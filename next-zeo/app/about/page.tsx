import type { Metadata } from "next";
import {
  createOrganizationSchema,
  createBreadcrumbSchema,
} from "../../src/server/seo/schema";
import JsonLd from "../../src/components/seo/JsonLd";
import PageHeader from "../../src/components/PageHeader/PageHeader";
import About from "../../src/components/About/About";

const siteUrl = (process.env.APP_URL || "https://www.zeotourism.com").replace(/\/$/, "");
const title = "About Zeo Tourism | Kathmandu Travel Planning Team";
const description =
  "Learn about Zeo Tourism, a Kathmandu-based team planning Kailash Yatra, Nepal tours, international trips, activities and private journeys.";
const image =
  "https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=1600&h=900&fit=crop";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title,
    description,
    url: "/about",
    type: "website",
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: "Himalayan landscape representing Zeo Tourism's local travel expertise",
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

export default function AboutPage() {
  const structuredData = [
    createOrganizationSchema(),
    createBreadcrumbSchema([
      { name: "Home", url: siteUrl },
      { name: "About", url: `${siteUrl}/about` },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="about-page">
        <PageHeader
          title="About Zeo Tourism"
          subtitle="A Kathmandu-based travel team helping travelers plan sacred journeys, Nepal tours, international trips, activities, and private travel with clearer local guidance."
          breadcrumb="About"
          backgroundImage={image}
        />
        <About />
      </div>
    </>
  );
}
