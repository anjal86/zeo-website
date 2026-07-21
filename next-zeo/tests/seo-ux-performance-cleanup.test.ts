import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

test('contact page owns server metadata and a canonical URL', async () => {
  const page = await readSource('../app/contact/page.tsx');
  assert.equal(page.includes('use client'), false);
  assert.match(page, /export const metadata: Metadata/);
  assert.match(page, /canonical: '\/contact'/);
  assert.match(page, /createBreadcrumbSchema/);
});

test('contact fields have associated labels and announced results', async () => {
  const contact = await readSource('../src/components/Contact/Contact.tsx');
  const fieldIds = [
    'contact-name',
    'contact-email',
    'contact-phone',
    'contact-destination',
    'contact-travelers',
    'contact-date',
    'contact-message',
  ];

  for (const fieldId of fieldIds) {
    assert.ok(contact.includes(`htmlFor="${fieldId}"`));
    assert.ok(contact.includes(`id="${fieldId}"`));
  }

  assert.ok(contact.includes('role="status"'));
  assert.ok(contact.includes('aria-live="polite"'));
  assert.ok(contact.includes('role="alert"'));
  assert.equal(contact.includes('setTimeout('), false);
  assert.equal(contact.includes('framer-motion'), false);
});

test('hero avoids duplicate slide requests and eager video preloading', async () => {
  const hero = await readSource('../src/components/Hero/Hero.tsx');
  assert.ok(hero.includes('initialSlides'));
  assert.ok(hero.includes('preload="metadata"'));
  assert.ok(hero.includes('prefers-reduced-motion'));
  assert.ok(hero.includes('saveData'));
  assert.equal(hero.includes('useSliders'), false);
  assert.equal(hero.includes('preloadedVideos'), false);
  assert.equal(hero.includes('preload="auto"'), false);
  assert.equal(hero.includes('framer-motion'), false);
});
