export const revalidate = 3600;

import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import BlogPostComponent from '../../../src/components/Blog/BlogPost';
import JsonLd from '../../../src/components/seo/JsonLd';
import { getPostBySlug } from '../../../src/server/repositories/content';
import { findPostRedirect, resolveBlogRelations } from '../../../src/server/repositories/blog-seo';
import { createArticleSchema, createBreadcrumbSchema } from '../../../src/server/seo/schema';
import { extractMarkdownHeadings, mergeSeoKeywords, parseBlogSeoData } from '../../../src/lib/blogSeo';

const siteUrl = (process.env.APP_URL || 'https://zeotourism.com').replace(/\/$/, '');

function absoluteUrl(value?: string | null) {
  if (!value) return `${siteUrl}/logo/zeo-logo.png`;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function canonicalUrl(slug: string, requested?: string) {
  const fallback = `${siteUrl}/blog/${slug}`;
  if (!requested) return fallback;
  try {
    const resolved = new URL(requested, siteUrl);
    const site = new URL(siteUrl);
    return resolved.origin === site.origin ? resolved.toString() : fallback;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } };

  const seo = parseBlogSeoData(post.seo);
  const canonical = canonicalUrl(slug, seo.canonicalUrl);
  const title = seo.title || `${post.title} | Zeo Tourism`;
  const description = seo.description || post.excerpt || `Practical travel guidance for ${post.title} from Zeo Tourism.`;
  const image = absoluteUrl(post.image);
  const imageAlt = seo.imageAlt || post.title;

  return {
    title,
    description,
    alternates: { canonical },
    robots: seo.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: 'Zeo Tourism',
      publishedTime: post.published_at ? new Date(post.published_at).toISOString() : undefined,
      modifiedTime: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      authors: seo.author?.name ? [seo.author.name] : post.author ? [post.author] : undefined,
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
  if (!post) {
    const redirect = await findPostRedirect(slug).catch(() => null);
    if (redirect?.new_slug) permanentRedirect(`/blog/${redirect.new_slug}`);
    notFound();
  }

  const relations = await resolveBlogRelations(post);
  const seo = relations.seo;
  const canonical = canonicalUrl(slug, seo.canonicalUrl);
  const publishDate = post.published_at || post.created_at || post.updated_at;
  const description = seo.description || post.excerpt || '';
  const schemaTags = mergeSeoKeywords(
    seo.primaryQuery || '',
    Array.isArray(post.tags) ? post.tags : [],
    seo.secondaryTopics || [],
  );
  const authorName = seo.author?.name || post.author || 'Zeo Tourism';
  const authorSlug = seo.author?.slug;
  const reviewerSlug = seo.reviewer?.slug;

  const structuredData = [
    createArticleSchema({
      title: seo.title || post.title,
      description,
      author: seo.author ? {
        name: seo.author.name,
        url: authorSlug ? `${siteUrl}/blog/author/${authorSlug}` : undefined,
        image: seo.author.image ? absoluteUrl(seo.author.image) : undefined,
        title: seo.author.title,
      } : authorName,
      reviewer: seo.reviewer ? {
        name: seo.reviewer.name,
        url: reviewerSlug ? `${siteUrl}/blog/author/${reviewerSlug}` : undefined,
        title: seo.reviewer.title,
      } : undefined,
      publishDate: publishDate ? new Date(publishDate).toISOString() : '',
      modifiedDate: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      reviewedDate: seo.reviewedAt ? new Date(seo.reviewedAt).toISOString() : undefined,
      image: absoluteUrl(post.image),
      imageAlt: seo.imageAlt,
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
      <BlogPostComponent
        post={post}
        headings={extractMarkdownHeadings(post.content || '')}
        relatedPosts={relations.relatedPosts}
        relatedTours={relations.relatedTours}
      />
    </>
  );
}
