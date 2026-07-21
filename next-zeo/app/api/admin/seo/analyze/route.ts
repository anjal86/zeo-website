import { requireAdmin } from '@/server/auth/require-admin';
import { analyzeMarkdownLinks, parseBlogSeoData, staticBlogLinkTargets, topicSimilarity } from '@/lib/blogSeo';
import { listAllBlogLinkTargets } from '@/server/repositories/blog-seo';
import { listPosts } from '@/server/repositories/content';

const normalizeInternalHref = (href: string) => href.split(/[?#]/)[0].replace(/\/$/, '') || '/';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const title = typeof body.title === 'string' ? body.title : '';
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const content = typeof body.content === 'string' ? body.content : '';
  const primaryQuery = typeof body.primaryQuery === 'string' ? body.primaryQuery : '';
  const currentUrl = slug ? `/blog/${slug}` : '';

  // Run after the target catalogue has released its connections. On shared
  // hosting, starting both database-heavy reads together can exceed the MySQL
  // user's connection quota and turn otherwise valid diagnostics into a 500.
  const targets = await listAllBlogLinkTargets(slug);
  const posts = await listPosts({ limit: '500' }, true);
  const targetMap = new Map([...targets, ...staticBlogLinkTargets].map(target => [normalizeInternalHref(target.url), target]));

  const links = analyzeMarkdownLinks(content);
  const issues = links.flatMap(link => {
    if (!link.internal || link.href.startsWith('#')) {
      return link.genericAnchor ? [{ type: 'generic-anchor', href: link.href, message: `Use descriptive anchor text instead of “${link.text}”.` }] : [];
    }
    const normalized = normalizeInternalHref(link.href);
    const target = targetMap.get(normalized);
    const result: Array<{ type: string; href: string; message: string }> = [];
    if (normalized === currentUrl) result.push({ type: 'self-link', href: link.href, message: 'Remove the link from this article to itself.' });
    if (!target) result.push({ type: 'broken-internal-link', href: link.href, message: 'This internal URL does not match a published or known Zeo page.' });
    if (target?.status && !['published', 'listed'].includes(target.status)) result.push({ type: 'unpublished-target', href: link.href, message: `This link points to a ${target.status} item.` });
    if (link.genericAnchor) result.push({ type: 'generic-anchor', href: link.href, message: `Use descriptive anchor text instead of “${link.text}”.` });
    return result;
  });

  const topic = `${primaryQuery} ${title}`.trim();
  const duplicates = posts.items
    .filter(post => post.slug !== slug)
    .map(post => {
      const seo = parseBlogSeoData(post.seo);
      const score = Math.max(
        topicSimilarity(topic, `${seo.primaryQuery || ''} ${post.title}`),
        topicSimilarity(title, post.title),
      );
      return { title: post.title, slug: post.slug, url: `/blog/${post.slug}`, status: post.status, primaryQuery: seo.primaryQuery || '', score };
    })
    .filter(item => item.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const inboundLinks = currentUrl
    ? posts.items.filter(post => post.slug !== slug && typeof post.content === 'string' && post.content.includes(`](${currentUrl}`)).map(post => ({ title: post.title, url: `/blog/${post.slug}` }))
    : [];

  const topicTokens = topic.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 3);
  const suggestions = targets
    .map(target => ({ ...target, score: topicTokens.reduce((score, token) => score + (`${target.title} ${target.description || ''}`.toLowerCase().includes(token) ? 1 : 0), 0) }))
    .filter(target => target.score > 0 && !content.includes(`](${target.url}`))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return Response.json({
    issues,
    duplicates,
    inboundLinks,
    orphaned: Boolean(slug) && inboundLinks.length === 0,
    suggestions,
  });
}
