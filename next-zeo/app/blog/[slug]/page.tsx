export const revalidate = 3600;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostComponent from '../../../src/components/Blog/BlogPost';
import JsonLd from '../../../src/components/seo/JsonLd';
import { getPostBySlug } from '../../../src/server/repositories/content';
import { createArticleSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import { mergeSeoKeywords } from '../../../src/lib/blogSeo';

const siteUrl = (process.env.APP_URL || 'https://zeotourism.com').replace(/\/$/, '');

function absoluteUrl(value?: string | null) {
  if (!value) return `${siteUrl}/logo/zeo-logo.png`;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function seoString(seo: Record<string, unknown>, key: string) {
  const value = seo[key];
  return typeof value === 'string' ? value.trim() : '';
}

function seoStringArray(seo: Record<string, unknown>, key: string) {
  const value = seo[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Article not found' };

  const canonical = `${siteUrl}/blog/${slug}`;
  const seo = post.seo || {};
  const title = seoString(seo, 'title') || `${post.title} | Zeo Tourism`;
  const description = seoString(seo, 'description') || post.excerpt || `Practical travel guidance for ${post.title} from Zeo Tourism.`;
  const image = absoluteUrl(post.image);
  const imageAlt = seoString(seo, 'imageAlt') || post.title;

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
      images: [{ url: image, alt: imageAlt }],
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
  const seo = post.seo || {};
  const description = seoString(seo, 'description') || post.excerpt || '';
  const schemaTags = mergeSeoKeywords(
    seoString(seo, 'primaryQuery'),
    Array.isArray(post.tags) ? post.tags : [],
    seoStringArray(seo, 'secondaryTopics'),
  );

  const structuredData = [
    createArticleSchema({
      title: seoString(seo, 'title') || post.title,
      description,
      author: post.author || 'Zeo Tourism',
      publishDate: publishDate ? new Date(publishDate).toISOString() : '',
      modifiedDate: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      image: absoluteUrl(post.image),
      url: canonical,
      category: post.category || 'Travel',
      tags: schemaTags,
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
