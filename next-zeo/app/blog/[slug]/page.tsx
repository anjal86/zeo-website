export const revalidate = 3600;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostComponent from '../../../src/components/Blog/BlogPost';
import JsonLd from '../../../src/components/seo/JsonLd';
import { getPostBySlug } from '../../../src/server/repositories/content';
import { createArticleSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';

const siteUrl = (process.env.APP_URL || 'https://www.zeotourism.com').replace(/\/$/, '');

function absoluteUrl(value?: string | null) {
  if (!value) return `${siteUrl}/logo/zeo-logo.png`;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Article not found' };

  const canonical = `${siteUrl}/blog/${slug}`;
  const title = `${post.title} | Zeo Tourism Travel Guide`;
  const description = post.excerpt || `Practical travel guidance for ${post.title} from Zeo Tourism.`;
  const image = absoluteUrl(post.image);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: 'Zeo Tourism',
      publishedTime: post.published_at ? new Date(post.published_at).toISOString() : undefined,
      modifiedTime: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const canonical = `${siteUrl}/blog/${slug}`;
  const publishDate = post.published_at || post.created_at || post.updated_at;

  const structuredData = [
    createArticleSchema({
      title: post.title,
      description: post.excerpt || '',
      author: 'Zeo Tourism',
      publishDate: publishDate ? new Date(publishDate).toISOString() : undefined,
      image: absoluteUrl(post.image),
      url: canonical,
      category: post.category || 'Travel',
      tags: [],
    }),
    createBreadcrumbSchema([
      { name: 'Home', url: siteUrl },
      { name: 'Blog', url: `${siteUrl}/blog` },
      { name: post.title, url: canonical },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <BlogPostComponent post={post} />
    </>
  );
}
