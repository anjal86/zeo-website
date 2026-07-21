import { requireAdmin } from '@/server/auth/require-admin';
import { getSearchConsolePagePerformance } from '@/server/seo/searchConsole';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const url = new URL(request.url);
  const page = url.searchParams.get('page');
  const days = Number(url.searchParams.get('days') || 90);
  if (!page) return Response.json({ error: 'Page URL is required' }, { status: 400 });
  try {
    return Response.json(await getSearchConsolePagePerformance(page, days));
  } catch (error) {
    return Response.json({ configured: true, error: error instanceof Error ? error.message : 'Search Console request failed' }, { status: 502 });
  }
}
