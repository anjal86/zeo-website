import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  analyzeMarkdownLinks,
  buildBlogSeoReadiness,
  countInternalLinks,
  countMarkdownHeadings,
  extractMarkdownHeadings,
  mergeSeoKeywords,
  normalizeTopicList,
  parseBlogSeoData,
  topicSimilarity,
} from '@/lib/blogSeo';

test('normalizes blog planning topics and schema keywords', () => {
  assert.deepEqual(normalizeTopicList('weather, permits, weather, route options'), [
    'weather',
    'permits',
    'route options',
  ]);

  assert.deepEqual(
    mergeSeoKeywords('best time for Kailash yatra', ['Kailash', 'Pilgrimage'], ['weather', 'Kailash']),
    ['best time for Kailash yatra', 'Kailash', 'Pilgrimage', 'weather'],
  );
});

test('extracts stable article sections and audits Markdown links', () => {
  const content = `## Best time at a glance

Read the [Kailash package](/tours/kailash-yatra).

## Best time at a glance

See [click here](/contact), [requirements](#requirements) and [official guidance](https://example.com "nofollow").`;

  assert.deepEqual(extractMarkdownHeadings(content), [
    { id: 'best-time-at-a-glance', text: 'Best time at a glance', level: 2 },
    { id: 'best-time-at-a-glance-2', text: 'Best time at a glance', level: 2 },
  ]);
  assert.equal(countMarkdownHeadings(content), 2);
  assert.equal(countInternalLinks(content), 3);
  const links = analyzeMarkdownLinks(content);
  assert.equal(links.find(link => link.text === 'click here')?.genericAnchor, true);
  assert.equal(links.find(link => link.text === 'official guidance')?.title, 'nofollow');
});

test('publishing readiness separates essential content from richer trust checks', () => {
  const checks = buildBlogSeoReadiness({
    title: 'Best Time for Kailash Mansarovar Yatra',
    slug: 'best-time-kailash-mansarovar-yatra',
    excerpt: 'A practical month-by-month guide to weather, permits and route planning for Kailash pilgrims.',
    content: '## Best time at a glance\n\nUseful answer.\n\n## Permit planning\n\n[View the tour](/tours/kailash).',
    imageUrl: '/uploads/kailash.jpg',
    imageAlt: 'Mount Kailash beneath a clear blue sky',
    seoTitle: 'Best Time for Kailash Mansarovar Yatra',
    seoDescription: 'Compare weather, permit timing and practical travel conditions to choose the best Kailash Mansarovar Yatra season.',
    primaryQuery: 'best time for Kailash Mansarovar yatra',
    searchIntent: 'decide',
    targetReader: 'First-time pilgrims planning from India',
    secondaryTopics: ['weather by month', 'permit timing'],
    authorName: 'Zeo Tourism Editorial Team',
    reviewerName: 'Kailash Journey Specialist',
    sourceCount: 1,
    linkIssueCount: 0,
  });

  assert.equal(checks.filter(check => check.priority === 'essential' && !check.complete).length, 0);
  assert.equal(checks.every(check => check.complete), true);
});

test('normalizes stored SEO trust, relation and indexing data', () => {
  const seo = parseBlogSeoData({
    title: 'Kailash guide',
    noindex: true,
    cornerstone: true,
    author: { name: 'Anjal Shrestha', expertise: ['Kailash', 'Nepal travel'] },
    sources: [{ title: 'Official notice', url: 'https://example.com/notice' }],
    relatedTours: [{ type: 'tour', title: 'Kailash Yatra', url: '/tours/kailash', status: 'published' }],
  });
  assert.equal(seo.noindex, true);
  assert.equal(seo.cornerstone, true);
  assert.equal(seo.author?.slug, 'anjal-shrestha');
  assert.equal(seo.sources?.length, 1);
  assert.equal(seo.relatedTours?.[0].url, '/tours/kailash');
});

test('topic-overlap scoring remains transparent and deterministic', () => {
  assert.equal(topicSimilarity('Kailash Yatra cost guide', 'Kailash Mansarovar Yatra cost'), 0.75);
  assert.equal(topicSimilarity('Everest trekking permits', 'Kailash weather by month'), 0);
});

test('public blog page owns metadata, redirects and server relations', async () => {
  const page = await readFile(new URL('../app/blog/[slug]/page.tsx', import.meta.url), 'utf8');
  const publicComponent = await readFile(new URL('../src/components/Blog/BlogPost.tsx', import.meta.url), 'utf8');
  assert.match(page, /parseBlogSeoData/);
  assert.match(page, /mergeSeoKeywords/);
  assert.match(page, /tags: schemaTags/);
  assert.match(page, /permanentRedirect/);
  assert.match(page, /resolveBlogRelations/);
  assert.match(page, /robots: seo\.noindex/);
  assert.doesNotMatch(publicComponent, /<SEO/);
  assert.doesNotMatch(publicComponent, /useApi/);
});

test('Markdown article renders crawlable headings and treats internal links as internal', async () => {
  const article = await readFile(new URL('../src/components/Blog/MarkdownArticle.tsx', import.meta.url), 'utf8');
  const toc = await readFile(new URL('../src/components/Blog/TableOfContents.tsx', import.meta.url), 'utf8');
  assert.match(article, /id=\{headingId\(children\)\}/);
  assert.match(article, /href\.startsWith\('\/'\)/);
  assert.match(article, /<Link href=\{href\}/);
  assert.match(toc, /href=\{`#\$\{id\}`\}/);
  assert.doesNotMatch(toc, /querySelectorAll/);
});

test('admin editor stores the complete SEO workflow and protects unsaved work', async () => {
  const editor = await readFile(new URL('../app/admin/(dashboard)/blog/edit/[id]/page.tsx', import.meta.url), 'utf8');
  for (const field of [
    'primaryQuery', 'searchIntent', 'targetReader', 'secondaryTopics', 'imageAlt',
    'imageCaption', 'imageCredit', 'canonicalUrl', 'noindex', 'cornerstone',
    'author', 'reviewer', 'sources', 'relatedArticles', 'relatedTours', 'cta',
  ]) {
    assert.match(editor, new RegExp(field));
  }
  assert.match(editor, /InternalLinkAssistant/);
  assert.match(editor, /SeoDiagnosticsPanel/);
  assert.match(editor, /SearchConsolePanel/);
  assert.match(editor, /beforeunload/);
  assert.match(editor, /Publishing readiness/);
});

test('blog SEO system includes redirects, hubs and Search Console foundations', async () => {
  const migration = await readFile(new URL('../src/server/db/migrations/004_blog_seo_system.sql', import.meta.url), 'utf8');
  const sitemap = await readFile(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  const searchConsole = await readFile(new URL('../src/server/seo/searchConsole.ts', import.meta.url), 'utf8');
  assert.match(migration, /CREATE TABLE IF NOT EXISTS post_redirects/);
  assert.match(sitemap, /blog\/category/);
  assert.match(sitemap, /blog\/author/);
  assert.match(sitemap, /!parseBlogSeoData\(post\.seo\)\.noindex/);
  assert.match(searchConsole, /GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL/);
  assert.match(searchConsole, /searchAnalytics\/query/);
});
