import { requireAdmin } from '@/server/auth/require-admin';
import { getSearchConsoleOverview } from '@/server/seo/searchConsole';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get('days') || 28);
  try {
    return Response.json(await getSearchConsoleOverview(days));
  } catch (error) {
    return Response.json(
      { configured: true, error: error instanceof Error ? error.message : 'Could not load Search Console overview.' },
      { status: 502 },
    );
  }
}
