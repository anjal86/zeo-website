import type { RowDataPacket } from 'mysql2/promise';
import { getAll, getOne } from '@/server/db/mysql';
import { listActivities, listDestinations } from '@/server/repositories/catalog';
import { listPosts } from '@/server/repositories/content';
import { listTours } from '@/server/repositories/tours';
import {
  parseBlogSeoData,
  staticBlogLinkTargets,
  type BlogLinkTarget,
  type BlogSeoData,
} from '@/lib/blogSeo';

export async function searchBlogLinkTargets(query = '', currentSlug = ''): Promise<BlogLinkTarget[]> {
  const search = query.trim();
  const options = { search: search || undefined, limit: search ? '12' : '20' };
  // cPanel accounts commonly enforce a low per-user MySQL connection ceiling.
  // Keep these independent catalogue reads sequential so opening the blog editor
  // cannot consume the whole account allowance in a single request.
  const posts = await listPosts(options, true);
  const tours = await listTours(options, true);
  const destinations = await listDestinations(options, true);
  const activities = await listActivities(options, true);

  const dynamic: BlogLinkTarget[] = [
    ...posts.items
      .filter(post => post.slug !== currentSlug)
      .map(post => ({ type: 'blog' as const, title: post.title, url: `/blog/${post.slug}`, status: post.status, description: post.excerpt || undefined })),
    ...tours.items.map(tour => ({ type: 'tour' as const, title: tour.title, url: `/tours/${tour.slug}`, status: tour.listed ? 'published' : 'unlisted', description: tour.description || undefined })),
    ...destinations.items.map(destination => ({ type: 'destination' as const, title: destination.title || destination.name, url: `/destinations/${destination.slug}`, status: destination.listed ? 'published' : 'unlisted', description: destination.description || undefined })),
    ...activities.items.map(activity => ({ type: 'activity' as const, title: activity.name, url: `/activities/${activity.slug}`, status: activity.is_active ? 'published' : 'inactive', description: activity.description || undefined })),
  ];

  const needle = search.toLowerCase();
  const staticTargets = staticBlogLinkTargets.filter(target => !needle || `${target.title} ${target.url}`.toLowerCase().includes(needle));
  const seen = new Set<string>();
  return [...dynamic, ...staticTargets].filter(target => {
    if (target.url === `/blog/${currentSlug}` || seen.has(target.url)) return false;
    seen.add(target.url);
    return true;
  });
}

export async function listAllBlogLinkTargets(currentSlug = '') {
  return searchBlogLinkTargets('', currentSlug);
}

export async function findPostRedirect(oldSlug: string) {
  return getOne<RowDataPacket & { old_slug: string; new_slug: string }>(
    'SELECT old_slug, new_slug FROM post_redirects WHERE old_slug = ? LIMIT 1',
    [oldSlug],
  );
}

export async function listPostCategories() {
  const rows = await getAll<RowDataPacket & { category: string; updated_at: Date | string | null }>(
    `SELECT category, MAX(updated_at) AS updated_at
     FROM posts
     WHERE status = 'published' AND category IS NOT NULL AND category <> ''
     GROUP BY category
     ORDER BY category ASC`,
  );
  return rows;
}

function slugFromUrl(url: string, prefix: string) {
  const clean = url.split(/[?#]/)[0].replace(/\/$/, '');
  return clean.startsWith(prefix) ? clean.slice(prefix.length) : '';
}

export async function resolveBlogRelations(post: { slug: string; category?: string | null; seo?: unknown }) {
  const seo = parseBlogSeoData(post.seo);
  const articleSlugs = (seo.relatedArticles || []).map(item => slugFromUrl(item.url, '/blog/')).filter(Boolean);
  const tourSlugs = (seo.relatedTours || []).map(item => slugFromUrl(item.url, '/tours/')).filter(Boolean);

  const allPosts = await listPosts({ limit: '500' });
  const relatedPosts = articleSlugs.length
    ? articleSlugs.flatMap(slug => allPosts.items.filter(item => item.slug === slug))
    : allPosts.items.filter(item => item.slug !== post.slug && item.category && item.category === post.category).slice(0, 3);

  const tours = await listTours({ limit: '500' });
  const relatedTours = tourSlugs.length
    ? tourSlugs.flatMap(slug => tours.items.filter(item => item.slug === slug))
    : tours.items.filter(item => {
        const category = String(post.category || '').toLowerCase();
        const haystack = `${item.title} ${item.category || ''} ${item.location || ''}`.toLowerCase();
        return category.length > 2 && haystack.includes(category);
      }).slice(0, 3);

  return {
    relatedPosts: relatedPosts.slice(0, 6),
    relatedTours: relatedTours.slice(0, 6),
    seo,
  };
}

export async function listPostsForAuthor(authorSlug: string) {
  const posts = await listPosts({ limit: '500' });
  return posts.items.filter(post => {
    const seo = parseBlogSeoData(post.seo);
    return seo.author?.slug === authorSlug;
  });
}

export async function findAuthorProfile(authorSlug: string) {
  const posts = await listPostsForAuthor(authorSlug);
  const profile = posts.map(post => parseBlogSeoData(post.seo).author).find(Boolean);
  return { profile, posts };
}

export function collectRelatedTargets(seo: BlogSeoData) {
  return [
    ...(seo.relatedArticles || []),
    ...(seo.relatedTours || []),
    ...(seo.relatedDestinations || []),
    ...(seo.relatedActivities || []),
  ];
}
