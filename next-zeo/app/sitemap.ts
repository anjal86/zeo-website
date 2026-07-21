import { MetadataRoute } from "next";
import type { RowDataPacket } from "mysql2/promise";
import { getAll } from "@/server/db/mysql";
import { parseBlogSeoData, slugifyBlogValue } from "@/lib/blogSeo";

type SitemapRow = RowDataPacket & {
  slug: string;
  updated_at: Date | string | null;
};

type PostSitemapRow = SitemapRow & {
  category: string | null;
  seo: unknown;
};

function parseLastModified(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function newestDate(values: Array<Date | string | null | undefined>) {
  const dates = values.map(parseLastModified).filter((value): value is Date => Boolean(value));
  return dates.length ? new Date(Math.max(...dates.map(date => date.getTime()))) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.APP_URL || "https://zeotourism.com").replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tours`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/destinations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/activities`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/kailash-mansarovar`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/kailash-mansarovar-yatra-guide`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/kailash-mansarovar-yatra-cost`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/kailash-mansarovar-yatra-documents-permits`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/kailash-inner-kora-guide`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/kailash-yatra-nri-guide`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/kailash-packing-list`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/kailash-fitness-medical-guide`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/everest-base-camp-guide`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/best-time-to-visit-nepal`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/nepal-visa-guide`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [tours, destinations, activities, posts] = await Promise.all([
      getAll<SitemapRow>(
        "SELECT slug, updated_at FROM tours WHERE listed = 1 ORDER BY updated_at DESC, id DESC",
      ),
      getAll<SitemapRow>(
        "SELECT slug, updated_at FROM destinations WHERE listed = 1 ORDER BY updated_at DESC, id DESC",
      ),
      getAll<SitemapRow>(
        "SELECT slug, updated_at FROM activities WHERE is_active = 1 ORDER BY updated_at DESC, id DESC",
      ),
      getAll<PostSitemapRow>(
        "SELECT slug, category, seo, updated_at FROM posts WHERE status = 'published' ORDER BY updated_at DESC, id DESC",
      ),
    ]);

    const indexablePosts = posts.filter(post => !parseBlogSeoData(post.seo).noindex);

    const tourRoutes: MetadataRoute.Sitemap = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: parseLastModified(tour.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const destinationRoutes: MetadataRoute.Sitemap = destinations.map((destination) => ({
      url: `${baseUrl}/destinations/${destination.slug}`,
      lastModified: parseLastModified(destination.updated_at),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const activityRoutes: MetadataRoute.Sitemap = activities.map((activity) => ({
      url: `${baseUrl}/activities/${activity.slug}`,
      lastModified: parseLastModified(activity.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const postRoutes: MetadataRoute.Sitemap = indexablePosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: parseLastModified(post.updated_at),
      changeFrequency: "monthly",
      priority: parseBlogSeoData(post.seo).cornerstone ? 0.8 : 0.65,
    }));

    const categories = new Map<string, Array<Date | string | null>>();
    const authors = new Map<string, Array<Date | string | null>>();
    for (const post of indexablePosts) {
      if (post.category) {
        const slug = slugifyBlogValue(post.category);
        if (slug) categories.set(slug, [...(categories.get(slug) || []), post.updated_at]);
      }
      const authorSlug = parseBlogSeoData(post.seo).author?.slug;
      if (authorSlug) authors.set(authorSlug, [...(authors.get(authorSlug) || []), post.updated_at]);
    }

    const categoryRoutes: MetadataRoute.Sitemap = [...categories.entries()].map(([slug, dates]) => ({
      url: `${baseUrl}/blog/category/${slug}`,
      lastModified: newestDate(dates),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const authorRoutes: MetadataRoute.Sitemap = [...authors.entries()].map(([slug, dates]) => ({
      url: `${baseUrl}/blog/author/${slug}`,
      lastModified: newestDate(dates),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [
      ...staticRoutes,
      ...tourRoutes,
      ...destinationRoutes,
      ...activityRoutes,
      ...postRoutes,
      ...categoryRoutes,
      ...authorRoutes,
    ];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
