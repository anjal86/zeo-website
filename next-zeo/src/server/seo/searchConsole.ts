import { createSign } from 'node:crypto';

const tokenEndpoint = 'https://oauth2.googleapis.com/token';
const searchConsoleScope = 'https://www.googleapis.com/auth/webmasters';
const searchConsoleBase = 'https://searchconsole.googleapis.com/webmasters/v3';
const inspectionEndpoint = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

type SearchConsoleConfig = {
  clientEmail: string;
  privateKey: string;
  siteUrl: string;
};

type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
};

let tokenCache: { token: string; expiresAt: number; clientEmail: string } | null = null;

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

export function normalizeSearchConsolePrivateKey(value?: string) {
  if (!value) return undefined;

  let privateKey = value.replace(/\\n/g, '\n').trim();
  const quote = privateKey[0];
  if ((quote === '"' || quote === "'") && privateKey.at(-1) === quote) {
    privateKey = privateKey.slice(1, -1).trim();
  }

  // Some cPanel environment editors drop the opening PEM line while keeping
  // the base64 payload and closing line. Restore the standard PKCS#8 wrapper.
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----')) {
    const payload = privateKey
      .replace(/-----END PRIVATE KEY-----[\s\S]*$/, '')
      .replace(/\s+/g, '');
    if (/^[A-Za-z0-9+/=]+$/.test(payload)) {
      const lines = payload.match(/.{1,64}/g) || [];
      privateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
    }
  }

  return privateKey;
}

export function getSearchConsoleConfig(): SearchConsoleConfig | null {
  const clientEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?.trim();
  const privateKey = normalizeSearchConsolePrivateKey(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL?.trim();
  if (!clientEmail || !privateKey || !siteUrl) return null;
  return { clientEmail, privateKey, siteUrl };
}

export function isUrlInSearchConsoleProperty(pageUrl: string, siteUrl: string) {
  try {
    const page = new URL(pageUrl);
    if (siteUrl.startsWith('sc-domain:')) {
      const domain = siteUrl.slice('sc-domain:'.length).toLowerCase();
      const hostname = page.hostname.toLowerCase();
      return hostname === domain || hostname.endsWith(`.${domain}`);
    }
    const property = new URL(siteUrl);
    return page.origin === property.origin && page.pathname.startsWith(property.pathname);
  } catch {
    return false;
  }
}

async function googleApiError(response: Response, label: string) {
  const payload = await response.json().catch(() => null) as {
    error?: { message?: string; status?: string } | string;
  } | null;
  const apiMessage = typeof payload?.error === 'string'
    ? payload.error
    : payload?.error?.message;
  const status = typeof payload?.error === 'object' ? payload.error.status : undefined;
  return new Error(`${label} (${response.status})${status ? ` ${status}` : ''}${apiMessage ? `: ${apiMessage}` : ''}`);
}

async function accessToken(config: SearchConsoleConfig) {
  const nowMs = Date.now();
  if (tokenCache && tokenCache.clientEmail === config.clientEmail && tokenCache.expiresAt > nowMs + 60_000) {
    return tokenCache.token;
  }

  const now = Math.floor(nowMs / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: config.clientEmail,
    scope: searchConsoleScope,
    aud: tokenEndpoint,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(config.privateKey).toString('base64url');
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
  if (!response.ok) throw await googleApiError(response, 'Search Console authentication failed');
  const data = await response.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error('Search Console did not return an access token');

  tokenCache = {
    token: data.access_token,
    expiresAt: nowMs + Math.max(300, data.expires_in || 3600) * 1000,
    clientEmail: config.clientEmail,
  };
  return data.access_token;
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateRange(days: number, offsetDays = 0) {
  const safeDays = Math.max(7, Math.min(days, 180));
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2 - offsetDays);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - safeDays + 1);
  return { startDate: dateString(start), endDate: dateString(end), days: safeDays };
}

function totals(rows: SearchAnalyticsRow[]) {
  const clicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions || 0), 0);
  const position = impressions
    ? rows.reduce((sum, row) => sum + (row.position || 0) * (row.impressions || 0), 0) / impressions
    : 0;
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position,
  };
}

async function querySearchAnalytics(
  config: SearchConsoleConfig,
  token: string,
  input: {
    startDate: string;
    endDate: string;
    dimensions?: string[];
    rowLimit?: number;
    filters?: Array<{ dimension: string; operator: string; expression: string }>;
  },
) {
  const response = await fetch(`${searchConsoleBase}/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      startDate: input.startDate,
      endDate: input.endDate,
      ...(input.dimensions?.length ? { dimensions: input.dimensions } : {}),
      ...(input.filters?.length ? { dimensionFilterGroups: [{ filters: input.filters }] } : {}),
      rowLimit: input.rowLimit || 1000,
      dataState: 'final',
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw await googleApiError(response, 'Search Console analytics query failed');
  const data = await response.json() as SearchAnalyticsResponse;
  return data.rows || [];
}

export async function getSearchConsolePagePerformance(pageUrl: string, days = 90) {
  const config = getSearchConsoleConfig();
  if (!config) return { configured: false as const, message: 'Add Search Console service-account environment variables to enable live performance data.' };
  if (!isUrlInSearchConsoleProperty(pageUrl, config.siteUrl)) throw new Error('The requested page is outside the configured Search Console property.');

  const range = dateRange(days);
  const token = await accessToken(config);
  const rows = await querySearchAnalytics(config, token, {
    ...range,
    dimensions: ['query'],
    rowLimit: 25,
    filters: [{ dimension: 'page', operator: 'equals', expression: pageUrl }],
  });
  return {
    configured: true as const,
    period: { startDate: range.startDate, endDate: range.endDate },
    totals: totals(rows),
    queries: rows.map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
  };
}

export async function getSearchConsoleOverview(days = 28) {
  const config = getSearchConsoleConfig();
  if (!config) return { configured: false as const, message: 'Search Console credentials are not configured.' };

  const current = dateRange(days);
  const previous = dateRange(current.days, current.days);
  const token = await accessToken(config);
  const [pageRows, previousPageRows, queryRows] = await Promise.all([
    querySearchAnalytics(config, token, { ...current, dimensions: ['page'], rowLimit: 500 }),
    querySearchAnalytics(config, token, { ...previous, dimensions: ['page'], rowLimit: 500 }),
    querySearchAnalytics(config, token, { ...current, dimensions: ['query'], rowLimit: 100 }),
  ]);

  return {
    configured: true as const,
    siteUrl: config.siteUrl,
    period: current,
    previousPeriod: previous,
    totals: totals(pageRows),
    previousTotals: totals(previousPageRows),
    pages: pageRows.map(row => ({
      page: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
    queries: queryRows.map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    })),
  };
}

export async function inspectSearchConsoleUrl(pageUrl: string) {
  const config = getSearchConsoleConfig();
  if (!config) return { configured: false as const, message: 'Search Console credentials are not configured.' };
  if (!isUrlInSearchConsoleProperty(pageUrl, config.siteUrl)) throw new Error('The URL must belong to the configured Search Console property.');

  const token = await accessToken(config);
  const response = await fetch(inspectionEndpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: pageUrl, siteUrl: config.siteUrl, languageCode: 'en-US' }),
    cache: 'no-store',
  });
  if (!response.ok) throw await googleApiError(response, 'URL Inspection failed');
  const data = await response.json() as {
    inspectionResult?: {
      inspectionResultLink?: string;
      indexStatusResult?: {
        verdict?: string;
        coverageState?: string;
        robotsTxtState?: string;
        indexingState?: string;
        lastCrawlTime?: string;
        pageFetchState?: string;
        googleCanonical?: string;
        userCanonical?: string;
        crawledAs?: string;
        sitemap?: string[];
        referringUrls?: string[];
      };
      mobileUsabilityResult?: { verdict?: string; issues?: Array<{ issueType?: string; message?: string }> };
      richResultsResult?: { verdict?: string; detectedItems?: Array<{ richResultType?: string }> };
    };
  };
  const result = data.inspectionResult;
  return {
    configured: true as const,
    pageUrl,
    inspectionResultLink: result?.inspectionResultLink,
    index: result?.indexStatusResult || null,
    mobile: result?.mobileUsabilityResult || null,
    richResults: result?.richResultsResult || null,
  };
}

export async function listSearchConsoleSitemaps() {
  const config = getSearchConsoleConfig();
  if (!config) return { configured: false as const, message: 'Search Console credentials are not configured.', sitemaps: [] };
  const token = await accessToken(config);
  const response = await fetch(`${searchConsoleBase}/sites/${encodeURIComponent(config.siteUrl)}/sitemaps`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw await googleApiError(response, 'Could not load Search Console sitemaps');
  const data = await response.json() as { sitemap?: Array<Record<string, unknown>> };
  return { configured: true as const, siteUrl: config.siteUrl, sitemaps: data.sitemap || [] };
}

export async function submitSearchConsoleSitemap(sitemapUrl: string) {
  const config = getSearchConsoleConfig();
  if (!config) throw new Error('Search Console credentials are not configured.');
  if (!isUrlInSearchConsoleProperty(sitemapUrl, config.siteUrl)) throw new Error('The sitemap must belong to the configured Search Console property.');
  const token = await accessToken(config);
  const response = await fetch(`${searchConsoleBase}/sites/${encodeURIComponent(config.siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw await googleApiError(response, 'Sitemap submission failed');
  return { success: true, sitemapUrl };
}

export async function deleteSearchConsoleSitemap(sitemapUrl: string) {
  const config = getSearchConsoleConfig();
  if (!config) throw new Error('Search Console credentials are not configured.');
  if (!isUrlInSearchConsoleProperty(sitemapUrl, config.siteUrl)) throw new Error('The sitemap must belong to the configured Search Console property.');
  const token = await accessToken(config);
  const response = await fetch(`${searchConsoleBase}/sites/${encodeURIComponent(config.siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw await googleApiError(response, 'Sitemap removal failed');
  return { success: true, sitemapUrl };
}
