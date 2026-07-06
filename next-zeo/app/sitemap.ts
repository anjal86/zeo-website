import { MetadataRoute } from 'next';
import type { RowDataPacket } from 'mysql2/promise';
import { getAll } from '@/server/db/mysql';

type SitemapRow = RowDataPacket & {
  slug: string;
  updated_at: Date | string | null;
};

function lastModified(value: Date | string | null | undefined) {
  if (!value) return new Date();
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://www.zeotourism.com';
  const routes = [
    '',
    '/tours',
    '/destinations',
    '/activities',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const [tours, destinations, activities, posts] = await Promise.all([
      getAll<SitemapRow>('SELECT slug, updated_at FROM tours WHERE listed = 1 ORDER BY updated_at DESC, id DESC'),
      getAll<SitemapRow>('SELECT slug, updated_at FROM destinations WHERE listed = 1 ORDER BY updated_at DESC, id DESC'),
      getAll<SitemapRow>('SELECT slug, updated_at FROM activities WHERE is_active = 1 ORDER BY updated_at DESC, id DESC'),
      getAll<SitemapRow>("SELECT slug, updated_at FROM posts WHERE status = 'published' ORDER BY updated_at DESC, id DESC"),
    ]);

    const tourRoutes = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: lastModified(tour.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const destinationRoutes = destinations.map((dest) => ({
      url: `${baseUrl}/destinations/${dest.slug}`,
      lastModified: lastModified(dest.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const activityRoutes = activities.map((act) => ({
      url: `${baseUrl}/activities/${act.slug}`,
      lastModified: lastModified(act.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const postRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: lastModified(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...routes, ...tourRoutes, ...destinationRoutes, ...activityRoutes, ...postRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return routes;
  }
}
