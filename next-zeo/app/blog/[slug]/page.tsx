export const revalidate = 3600;
import React from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '../../../src/server/repositories/content';
import BlogPostComponent from '../../../src/components/Blog/BlogPost';
import { createBreadcrumbSchema , createArticleSchema, createFAQSchema} from '../../../src/server/seo/schema';
import JsonLd from '../../../src/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) return { title: 'Not Found' };
  
  return {
    title: `${post.title} - Zeo Tourism Blog`,
    description: post.excerpt || `Read about ${post.title}`,
    alternates: {
      canonical: `${process.env.APP_URL || 'https://www.zeotourism.com'}/blog/${slug}`
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const structuredData = [
    createArticleSchema({
      title: post.title,
      description: post.excerpt || '',
      author: 'Zeo Tourism',
      publishDate: post.published_at ? new Date(post.published_at).toISOString() : new Date().toISOString(),
      image: post.image || '',
      url: `${process.env.APP_URL || 'https://www.zeotourism.com'}/blog/${slug}`,
      category: post.category || 'Travel',
      tags: []
    }),
    createBreadcrumbSchema([
      { name: "Home", url: (process.env.APP_URL || 'https://www.zeotourism.com') },
      { name: "Blog", url: (process.env.APP_URL || 'https://www.zeotourism.com') + '/blog' },
      { name: post.title, url: `${process.env.APP_URL || 'https://www.zeotourism.com'}/blog/${slug}` }
    ])
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <BlogPostComponent />
    </>
  );
}
