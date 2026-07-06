export const revalidate = 3600;
import React from 'react';
import type { Metadata } from 'next';
import { listPosts } from '../../src/server/repositories/content';
import PageHeader from '../../src/components/PageHeader/PageHeader';
import BlogComponent from '../../src/components/Blog/Blog';

export const metadata: Metadata = {
  title: "Blog - Zeo Tourism",
  description: "Read our latest travel guides, tips, and news.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage() {
  await listPosts({ limit: '100' });

  return (
    <div className="pt-20">
      <PageHeader
        title="Stories & Insights"
        subtitle="Travel guides, pilgrimage preparation, Nepal tips and seasonal advice to help you plan with confidence."
        breadcrumb="Blog"
        backgroundImage="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"
      />
      <BlogComponent />
    </div>
  );
}
