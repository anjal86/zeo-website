import React from "react";
import type { Metadata } from "next";
import { listPosts } from "../../src/server/repositories/content";
import PageHeader from "../../src/components/PageHeader/PageHeader";
import BlogComponent from "../../src/components/Blog/Blog";

export const revalidate = 3600;

const title = "Nepal Travel Blog, Trekking & Yatra Guides | Zeo Tourism";
const description =
  "Read practical Nepal travel guides, trekking advice, pilgrimage preparation tips and seasonal route-planning insights from Zeo Tourism.";
const image =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&h=900&fit=crop";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title,
    description,
    url: "/blog",
    type: "website",
    images: [
      {
        url: image,
        width: 1600,
        height: 900,
        alt: "Himalayan mountain view for Zeo Tourism travel guides",
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

export default async function BlogPage() {
  const posts = await listPosts({ limit: "100" });

  return (
    <div className="pt-20">
      <PageHeader
        title="Travel Blog & Guides"
        subtitle="Practical route advice, trekking guides, pilgrimage preparation and seasonal travel tips to help you plan with confidence."
        breadcrumb="Blog"
        backgroundImage={image}
      />
      <BlogComponent initialPosts={posts.items} totalPosts={posts.total} />
    </div>
  );
}
