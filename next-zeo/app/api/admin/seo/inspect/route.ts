import { requireAdmin } from '@/server/auth/require-admin';
import { inspectSearchConsoleUrl } from '@/server/seo/searchConsole';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => ({})) as { url?: unknown };
  const pageUrl = typeof body.url === 'string' ? body.url.trim() : '';
  if (!pageUrl) return Response.json({ error: 'A page URL is required.' }, { status: 400 });

  try {
    return Response.json(await inspectSearchConsoleUrl(pageUrl));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'URL inspection failed.' },
      { status: 502 },
    );
  }
}
