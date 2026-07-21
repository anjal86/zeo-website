import { requireAdmin } from '@/server/auth/require-admin';
import { searchBlogLinkTargets } from '@/server/repositories/blog-seo';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const currentSlug = url.searchParams.get('current') || '';
  const targets = await searchBlogLinkTargets(query, currentSlug);
  return Response.json({ items: targets });
}
