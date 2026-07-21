import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { isUrlInSearchConsoleProperty, normalizeSearchConsolePrivateKey } from '@/server/seo/searchConsole';
import { calculateSeoPageScore } from '@/server/seo/siteHealth';

test('Search Console property validation supports domain and URL-prefix properties', () => {
  assert.equal(isUrlInSearchConsoleProperty('https://zeotourism.com/blog/example', 'sc-domain:zeotourism.com'), true);
  assert.equal(isUrlInSearchConsoleProperty('https://www.zeotourism.com/tours/example', 'sc-domain:zeotourism.com'), true);
  assert.equal(isUrlInSearchConsoleProperty('https://example.com/', 'sc-domain:zeotourism.com'), false);
  assert.equal(isUrlInSearchConsoleProperty('https://zeotourism.com/blog/example', 'https://zeotourism.com/'), true);
  assert.equal(isUrlInSearchConsoleProperty('https://zeotourism.com.evil.example/', 'https://zeotourism.com/'), false);
});

test('cPanel private key normalization keeps a valid PEM envelope', () => {
  const normalized = normalizeSearchConsolePrivateKey('"-----BEGIN PRIVATE KEY-----\\nabc123==\\n-----END PRIVATE KEY-----"');
  assert.equal(normalized, '-----BEGIN PRIVATE KEY-----\nabc123==\n-----END PRIVATE KEY-----');
});

test('SEO health scoring prioritizes indexability and rendered metadata failures', () => {
  const healthy = calculateSeoPageScore({
    url: 'https://zeotourism.com/example',
    status: 200,
    responseTimeMs: 400,
    title: 'A useful and specific Nepal travel planning guide',
    description: 'A practical description that clearly explains the page and gives travellers enough context before they open the complete guide.',
    canonical: 'https://zeotourism.com/example',
    noindex: false,
    h1Count: 1,
    jsonLdCount: 1,
    internalLinkCount: 8,
    imagesMissingAlt: 0,
  });
  assert.equal(healthy.score, 100);
  assert.equal(healthy.issues.length, 0);

  const broken = calculateSeoPageScore({
    url: 'https://zeotourism.com/broken',
    status: 500,
    responseTimeMs: 3000,
    title: '',
    description: '',
    canonical: '',
    noindex: true,
    h1Count: 0,
    jsonLdCount: 0,
    internalLinkCount: 0,
    imagesMissingAlt: 3,
  });
  assert.equal(broken.score, 0);
  assert.ok(broken.issues.some(issue => issue.code === 'noindex-in-sitemap' && issue.severity === 'critical'));
  assert.ok(broken.issues.some(issue => issue.code === 'http-status' && issue.severity === 'critical'));
});

test('SEO Manager is wired as a dedicated admin surface with guarded APIs', async () => {
  const [page, component, sidebar, overviewRoute, inspectRoute, sitemapRoute, healthRoute, service] = await Promise.all([
    readFile(new URL('../app/admin/(dashboard)/seo/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Admin/SeoManager.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Admin/AdminSidebar.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/admin/seo/overview/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/admin/seo/inspect/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/admin/seo/sitemaps/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/admin/seo/health/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/server/seo/searchConsole.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(page, /<SeoManager/);
  assert.match(sidebar, /SEO Manager/);
  for (const route of [overviewRoute, inspectRoute, sitemapRoute, healthRoute]) assert.match(route, /requireAdmin/);
  assert.match(component, /URL inspection/);
  assert.match(component, /Site health/);
  assert.match(component, /Sitemap management/);
  assert.match(component, /Google does not provide a general/);
  assert.match(service, /urlInspection\/index:inspect/);
  assert.match(service, /sitemaps/);
  assert.match(service, /auth\/webmasters'/);
});
