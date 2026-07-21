import { createSign } from 'node:crypto';

const tokenEndpoint = 'https://oauth2.googleapis.com/token';
const scope = 'https://www.googleapis.com/auth/webmasters.readonly';

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function configuredValues() {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (!clientEmail || !privateKey || !siteUrl) return null;
  return { clientEmail, privateKey, siteUrl };
}

async function accessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope,
    aud: tokenEndpoint,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64url');
  const assertion = `${unsigned}.${signature}`;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Search Console authentication failed (${response.status})`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error('Search Console did not return an access token');
  return data.access_token;
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getSearchConsolePagePerformance(pageUrl: string, days = 90) {
  const config = configuredValues();
  if (!config) return { configured: false as const, message: 'Add Search Console service-account environment variables to enable live performance data.' };

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(7, Math.min(days, 180)));
  const token = await accessToken(config.clientEmail, config.privateKey);
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      startDate: dateString(start),
      endDate: dateString(end),
      dimensions: ['query'],
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: pageUrl }] }],
      rowLimit: 25,
      dataState: 'final',
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Search Console query failed (${response.status})`);
  const data = await response.json() as { rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }> };
  const rows = data.rows || [];
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const weightedPosition = impressions
    ? rows.reduce((sum, row) => sum + (row.position || 0) * (row.impressions || 0), 0) / impressions
    : 0;
  return {
    configured: true as const,
    period: { startDate: dateString(start), endDate: dateString(end) },
    totals: { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: weightedPosition },
    queries: rows.map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
  };
}
