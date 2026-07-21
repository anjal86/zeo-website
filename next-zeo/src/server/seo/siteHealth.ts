import { load } from 'cheerio';

export type SeoHealthSeverity = 'critical' | 'warning' | 'notice';

export type SeoHealthIssue = {
  code: string;
  severity: SeoHealthSeverity;
  message: string;
};

export type SeoPageHealth = {
  url: string;
  status: number;
  responseTimeMs: number;
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  h1Count: number;
  jsonLdCount: number;
  internalLinkCount: number;
  imagesMissingAlt: number;
  score: number;
  issues: SeoHealthIssue[];
};

type FetchResult = {
  status: number;
  text: string;
  responseTimeMs: number;
  contentType: string;
};

function appOrigin() {
  return new URL((process.env.APP_URL || 'https://zeotourism.com').replace(/\/$/, '')).origin;
}

async function fetchText(url: string, timeoutMs = 12_000): Promise<FetchResult> {
  const started = Date.now();
  const response = await fetch(url, {
    redirect: 'follow',
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'Zeo-SEO-Manager/1.0' },
  });
  return {
    status: response.status,
    text: await response.text(),
    responseTimeMs: Date.now() - started,
    contentType: response.headers.get('content-type') || '',
  };
}

function sameOriginUrl(value: string, origin: string) {
  try {
    const url = new URL(value);
    return url.origin === origin ? url.toString() : null;
  } catch {
    return null;
  }
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function parseSitemapLocations(xml: string) {
  const $ = load(xml, { xmlMode: true });
  return $('loc').map((_, element) => $(element).text().trim()).get().filter(Boolean);
}

async function discoverSitemapUrls(sitemapUrl: string, origin: string) {
  const root = await fetchText(sitemapUrl);
  if (root.status < 200 || root.status >= 300) {
    return { status: root.status, urls: [] as string[], childSitemaps: [] as string[], body: root.text };
  }

  const $ = load(root.text, { xmlMode: true });
  const locations = parseSitemapLocations(root.text);
  const isIndex = $('sitemapindex').length > 0;
  if (!isIndex) {
    return {
      status: root.status,
      urls: unique(locations.map(value => sameOriginUrl(value, origin)).filter((value): value is string => Boolean(value))),
      childSitemaps: [] as string[],
      body: root.text,
    };
  }

  const childSitemaps = unique(locations.map(value => sameOriginUrl(value, origin)).filter((value): value is string => Boolean(value))).slice(0, 20);
  const children = await mapWithConcurrency(childSitemaps, 3, async child => {
    try {
      const result = await fetchText(child);
      return result.status >= 200 && result.status < 300 ? parseSitemapLocations(result.text) : [];
    } catch {
      return [];
    }
  });
  const urls = unique(children.flat().map(value => sameOriginUrl(value, origin)).filter((value): value is string => Boolean(value)));
  return { status: root.status, urls, childSitemaps, body: root.text };
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

export function calculateSeoPageScore(input: Omit<SeoPageHealth, 'score' | 'issues'>) {
  const issues: SeoHealthIssue[] = [];
  let score = 100;
  const add = (code: string, severity: SeoHealthSeverity, message: string, deduction: number) => {
    issues.push({ code, severity, message });
    score -= deduction;
  };

  if (input.status < 200 || input.status >= 300) add('http-status', 'critical', `Page returned HTTP ${input.status}.`, 40);
  if (!input.title) add('missing-title', 'critical', 'Missing HTML title.', 20);
  else if (input.title.length < 25 || input.title.length > 65) add('title-length', 'warning', `Title length is ${input.title.length}; aim for roughly 25–65 characters.`, 7);
  if (!input.description) add('missing-description', 'warning', 'Missing meta description.', 15);
  else if (input.description.length < 70 || input.description.length > 170) add('description-length', 'notice', `Meta description length is ${input.description.length}; aim for roughly 70–170 characters.`, 4);
  if (!input.canonical) add('missing-canonical', 'warning', 'Missing canonical URL.', 10);
  if (input.noindex) add('noindex-in-sitemap', 'critical', 'This sitemap URL contains a noindex directive.', 25);
  if (input.h1Count === 0) add('missing-h1', 'warning', 'No H1 heading found.', 10);
  if (input.h1Count > 1) add('multiple-h1', 'notice', `${input.h1Count} H1 headings found.`, 4);
  if (input.jsonLdCount === 0) add('missing-jsonld', 'notice', 'No JSON-LD structured data detected.', 4);
  if (input.imagesMissingAlt > 0) add('missing-image-alt', 'warning', `${input.imagesMissingAlt} image${input.imagesMissingAlt === 1 ? '' : 's'} missing alt text.`, Math.min(10, input.imagesMissingAlt * 2));
  if (input.responseTimeMs > 2500) add('slow-response', 'warning', `Server response took ${input.responseTimeMs} ms.`, 8);
  else if (input.responseTimeMs > 1200) add('response-time', 'notice', `Server response took ${input.responseTimeMs} ms.`, 3);

  return { score: Math.max(0, score), issues };
}

export async function auditSeoPage(url: string): Promise<SeoPageHealth> {
  try {
    const result = await fetchText(url);
    const isHtml = result.contentType.includes('text/html') || /<html[\s>]/i.test(result.text);
    if (!isHtml) {
      const base = {
        url,
        status: result.status,
        responseTimeMs: result.responseTimeMs,
        title: '',
        description: '',
        canonical: '',
        noindex: false,
        h1Count: 0,
        jsonLdCount: 0,
        internalLinkCount: 0,
        imagesMissingAlt: 0,
      };
      const calculated = calculateSeoPageScore(base);
      return {
        ...base,
        score: Math.min(calculated.score, 20),
        issues: [{ code: 'not-html', severity: 'critical', message: 'Sitemap URL did not return an HTML document.' }, ...calculated.issues],
      };
    }

    const $ = load(result.text);
    const title = $('title').first().text().replace(/\s+/g, ' ').trim();
    const description = $('meta[name="description"]').attr('content')?.replace(/\s+/g, ' ').trim() || '';
    const canonical = $('link[rel="canonical"]').attr('href')?.trim() || '';
    const robots = [
      $('meta[name="robots"]').attr('content'),
      $('meta[name="googlebot"]').attr('content'),
    ].filter(Boolean).join(',').toLowerCase();
    const origin = new URL(url).origin;
    const internalLinkCount = unique($('a[href]').map((_, element) => {
      const href = $(element).attr('href');
      if (!href) return '';
      try {
        const resolved = new URL(href, url);
        return resolved.origin === origin ? `${resolved.origin}${resolved.pathname}` : '';
      } catch {
        return '';
      }
    }).get().filter(Boolean)).length;
    const imagesMissingAlt = $('img').filter((_, element) => {
      const alt = $(element).attr('alt');
      return alt === undefined || alt.trim() === '';
    }).length;

    const base = {
      url,
      status: result.status,
      responseTimeMs: result.responseTimeMs,
      title,
      description,
      canonical,
      noindex: /(^|[,\s])noindex([,\s]|$)/.test(robots),
      h1Count: $('h1').length,
      jsonLdCount: $('script[type="application/ld+json"]').length,
      internalLinkCount,
      imagesMissingAlt,
    };
    const calculated = calculateSeoPageScore(base);
    return { ...base, ...calculated };
  } catch (error) {
    return {
      url,
      status: 0,
      responseTimeMs: 0,
      title: '',
      description: '',
      canonical: '',
      noindex: false,
      h1Count: 0,
      jsonLdCount: 0,
      internalLinkCount: 0,
      imagesMissingAlt: 0,
      score: 0,
      issues: [{ code: 'fetch-failed', severity: 'critical', message: error instanceof Error ? error.message : 'Page request failed.' }],
    };
  }
}

export async function runSeoHealthCheck(limit = 60) {
  const origin = appOrigin();
  const sitemapUrl = `${origin}/sitemap.xml`;
  const robotsUrl = `${origin}/robots.txt`;
  const safeLimit = Math.max(10, Math.min(limit, 200));

  const [robotsResult, sitemapResult] = await Promise.all([
    fetchText(robotsUrl).catch(() => ({ status: 0, text: '', responseTimeMs: 0, contentType: '' })),
    discoverSitemapUrls(sitemapUrl, origin).catch(() => ({ status: 0, urls: [] as string[], childSitemaps: [] as string[], body: '' })),
  ]);

  const discoveredUrls = sitemapResult.urls.length ? sitemapResult.urls : [origin];
  const selectedUrls = discoveredUrls.slice(0, safeLimit);
  const pages = await mapWithConcurrency(selectedUrls, 4, auditSeoPage);
  const issueCounts = pages.reduce((counts, page) => {
    for (const issue of page.issues) counts[issue.severity] += 1;
    return counts;
  }, { critical: 0, warning: 0, notice: 0 });
  const averageScore = pages.length ? Math.round(pages.reduce((sum, page) => sum + page.score, 0) / pages.length) : 0;
  const robotsHasSitemap = new RegExp(`^sitemap:\\s*${sitemapUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im').test(robotsResult.text);
  const robotsBlocksSite = /^disallow:\s*\/\s*$/im.test(robotsResult.text);

  return {
    generatedAt: new Date().toISOString(),
    origin,
    summary: {
      score: averageScore,
      totalDiscovered: discoveredUrls.length,
      pagesChecked: pages.length,
      truncated: discoveredUrls.length > pages.length,
      issueCounts,
    },
    infrastructure: {
      robots: {
        url: robotsUrl,
        status: robotsResult.status,
        hasSitemapDirective: robotsHasSitemap,
        blocksEntireSite: robotsBlocksSite,
      },
      sitemap: {
        url: sitemapUrl,
        status: sitemapResult.status,
        childSitemaps: sitemapResult.childSitemaps,
        discoveredUrls: discoveredUrls.length,
      },
    },
    pages,
  };
}
