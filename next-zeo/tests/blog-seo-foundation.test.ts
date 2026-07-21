import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildBlogSeoReadiness,
  countInternalLinks,
  countMarkdownHeadings,
  mergeSeoKeywords,
  normalizeTopicList,
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

test('counts practical article structure and internal links', () => {
  const content = `## Best time at a glance

Read the [Kailash package](/tours/kailash-yatra).

## Permit planning

See [requirements](#requirements) and [official guidance](https://example.com).`;

  assert.equal(countMarkdownHeadings(content), 2);
  assert.equal(countInternalLinks(content), 2);
});

test('publishing readiness separates essential content from SEO improvements', () => {
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
  });

  assert.equal(checks.filter(check => check.priority === 'essential' && !check.complete).length, 0);
  assert.equal(checks.every(check => check.complete), true);
});

test('public blog metadata uses stored SEO values and schema keywords', async () => {
  const page = await readFile(new URL('../app/blog/[slug]/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /seoString\(seo, 'title'\)/);
  assert.match(page, /seoString\(seo, 'description'\)/);
  assert.match(page, /mergeSeoKeywords/);
  assert.match(page, /tags: schemaTags/);
  assert.match(page, /imageAlt/);
});

test('admin editor stores search planning fields and protects unsaved work', async () => {
  const editor = await readFile(new URL('../app/admin/(dashboard)/blog/edit/[id]/page.tsx', import.meta.url), 'utf8');
  for (const field of ['primaryQuery', 'searchIntent', 'targetReader', 'secondaryTopics', 'imageAlt']) {
    assert.match(editor, new RegExp(field));
  }
  assert.match(editor, /beforeunload/);
  assert.match(editor, /Publishing readiness/);
});
