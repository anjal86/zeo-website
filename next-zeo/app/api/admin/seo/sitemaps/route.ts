import { requireAdmin } from '@/server/auth/require-admin';
import {
  deleteSearchConsoleSitemap,
  listSearchConsoleSitemaps,
  submitSearchConsoleSitemap,
} from '@/server/seo/searchConsole';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    return Response.json(await listSearchConsoleSitemaps());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Could not load sitemaps.' },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => ({})) as { action?: unknown; sitemapUrl?: unknown };
  const action = body.action === 'delete' ? 'delete' : body.action === 'submit' ? 'submit' : '';
  const sitemapUrl = typeof body.sitemapUrl === 'string' ? body.sitemapUrl.trim() : '';
  if (!action || !sitemapUrl) return Response.json({ error: 'A valid sitemap action and URL are required.' }, { status: 400 });

  try {
    return Response.json(
      action === 'delete'
        ? await deleteSearchConsoleSitemap(sitemapUrl)
        : await submitSearchConsoleSitemap(sitemapUrl),
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Sitemap action failed.' },
      { status: 502 },
    );
  }
}
