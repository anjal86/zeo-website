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
  assert.ok(hero.includes('onPlaying={() => setReadyVideoKey(activeMediaKey)}'));
  assert.ok(hero.includes('poster={activeImage}'));
  assert.equal(hero.includes('window.innerWidth >= 768'), false);
  assert.equal(hero.includes('useSliders'), false);
  assert.equal(hero.includes('preloadedVideos'), false);
  assert.equal(hero.includes('preload="auto"'), false);
  assert.equal(hero.includes('framer-motion'), false);
});

test('homepage uses a clear hierarchy without section motion residue', async () => {
  const [home, destinations, testimonials] = await Promise.all([
    readSource('../src/components/Home/HomeClient.tsx'),
    readSource('../src/components/FeaturedDestinations/FeaturedDestinations.tsx'),
    readSource('../src/components/Testimonials/TestimonialsSlider.tsx'),
  ]);

  assert.equal(home.includes('framer-motion'), false);
  assert.equal(destinations.includes('framer-motion'), false);
  assert.equal(testimonials.includes('framer-motion'), false);

  assert.match(home, /Plan with less confusion/);
  assert.match(home, /Start with the journey that feels closest/);
  assert.match(home, /Local clarity for journeys that cannot afford guesswork/);
  assert.match(home, /Get a clear route plan before you book/);
  assert.match(home, /bg-primary py-16/);

  assert.match(destinations, /Places worth planning around/);
  assert.match(destinations, /md:grid-cols-12/);
  assert.match(testimonials, /What good planning feels like after the journey/);
  assert.match(testimonials, /prefers-reduced-motion/);
  assert.match(testimonials, /aria-live="polite"/);
});

test('app uses one restrained global radius system and keeps hero controls clear', async () => {
  const designSystem = await readSource('../app/styles/design-system.css');

  assert.match(designSystem, /--radius-sm: 0\.375rem/);
  assert.match(designSystem, /--radius-md: 0\.625rem/);
  assert.match(designSystem, /--card-radius: var\(--radius-xl\)/);
  assert.match(designSystem, /--panel-radius: var\(--radius-2xl\)/);
  assert.match(designSystem, /border-radius: var\(--control-radius\)/);
  assert.match(designSystem, /border-radius: var\(--card-radius\)/);
  assert.equal(designSystem.includes('border-radius: 0 !important'), false);
  assert.equal(designSystem.includes('square-corner visual language'), false);

  assert.match(designSystem, /\.home-page > section\.relative\.z-20/);
  assert.match(designSystem, /margin-top: -2rem !important/);
  assert.match(designSystem, /\.home-page #home > div\.absolute\.left-4\.right-4/);
  assert.match(designSystem, /bottom: 5rem !important/);
});
