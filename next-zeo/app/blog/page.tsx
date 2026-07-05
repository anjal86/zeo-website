export const revalidate = 3600;
import React from 'react';
import { listPosts } from '../../src/server/repositories/content';
import BlogComponent from '../../src/components/Blog/Blog';

export const metadata = {
  title: "Blog - Zeo Tourism",
  description: "Read our latest travel guides, tips, and news.",
};

export default async function BlogPage() {
  const result = await listPosts({ limit: '100' });
  
  return (
    <div className="pt-20">
      <BlogComponent />
    </div>
  );
}
