import { MetadataRoute } from 'next';
import { listTours } from '../src/server/repositories/tours';
import { listDestinations, listActivities } from '../src/server/repositories/catalog';
import { listPosts } from '../src/server/repositories/content';

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
      listTours({ limit: '1000' }).catch(() => ({ items: [] })),
      listDestinations({ limit: '100' }).catch(() => ({ items: [] })),
      listActivities({ limit: '100' }).catch(() => ({ items: [] })),
      listPosts({ limit: '100' }).catch(() => ({ items: [] }))
    ]);

    const tourRoutes = tours.items.map((tour: any) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updated_at ? new Date(tour.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const destinationRoutes = destinations.items.map((dest: any) => ({
      url: `${baseUrl}/destinations/${dest.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const activityRoutes = activities.items.map((act: any) => ({
      url: `${baseUrl}/activities/${act.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const postRoutes = posts.items.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...routes, ...tourRoutes, ...destinationRoutes, ...activityRoutes, ...postRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return routes;
  }
}
