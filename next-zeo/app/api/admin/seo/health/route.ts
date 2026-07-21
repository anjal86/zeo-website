import { requireAdmin } from '@/server/auth/require-admin';
import { runSeoHealthCheck } from '@/server/seo/siteHealth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || 60);
  try {
    return Response.json(await runSeoHealthCheck(limit));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'SEO health check failed.' },
      { status: 502 },
    );
  }
}
