import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("Kailash route renders immediately without repository calls", async () => {
  const page = await readSource("../app/kailash-mansarovar/page.tsx");

  assert.equal(page.includes('"use client"'), false);
  assert.equal(page.includes("listKailashGallery"), false);
  assert.equal(page.includes("listTours"), false);
  assert.equal(page.includes("listDestinations"), false);
  assert.equal(page.includes("getContactSettings"), false);
  assert.equal(page.includes("export default async function"), false);
  assert.match(page, /export const metadata: Metadata/);
  assert.match(page, /canonical: "\/kailash-mansarovar"/);
  assert.match(page, /FALLBACK_GALLERY/);
  assert.match(page, /KailashMansarovarLoader/);
  assert.match(page, /createBreadcrumbSchema/);
  assert.match(page, /createTouristDestinationSchema/);
  assert.match(page, /<JsonLd data=\{structuredData\}/);
});

test("Kailash data loader hydrates CMS content without blocking first paint", async () => {
  const loader = await readSource(
    "../src/components/Kailash/KailashMansarovarLoader.tsx",
  );

  assert.match(loader, /AbortController/);
  assert.match(loader, /REQUEST_TIMEOUT_MS = 6_000/);
  assert.match(loader, /Promise\.allSettled/);
  assert.match(loader, /\/api\/kailash-gallery/);
  assert.match(loader, /\/api\/tours\?search=kailash&limit=12/);
  assert.match(loader, /\/api\/destinations\?limit=100/);
  assert.match(loader, /\/api\/contact/);
  assert.match(loader, /fallbackGallery/);
  assert.match(loader, /MAX_HERO_IMAGES = 8/);
});

test("Kailash presentation avoids heavy motion residue and duplicate requests", async () => {
  const client = await readSource(
    "../src/components/Kailash/KailashMansarovarClient.tsx",
  );

  assert.equal(client.includes("framer-motion"), false);
  assert.equal(client.includes("useScroll"), false);
  assert.equal(client.includes("useTransform"), false);
  assert.equal(client.includes("navigator.userAgent"), false);
  assert.equal(client.includes("fetch("), false);
  assert.match(client, /prefers-reduced-motion: reduce/);
  assert.match(client, /document\.hidden/);
  assert.match(client, /kailash-image-drift/);
  assert.match(client, /kailash-slide-progress/);
});

test("Kailash UX keeps route comparison, guides and package actions easy to scan", async () => {
  const client = await readSource(
    "../src/components/Kailash/KailashMansarovarClient.tsx",
  );

  assert.match(client, /routeOptions\.map/);
  assert.match(client, /planningGuides\.map/);
  assert.match(client, /lg:grid-cols-3/);
  assert.match(client, /min-h-12/);
  assert.match(client, /id="route-comparison"/);
  assert.match(client, /id="yatra-packages"/);
  assert.match(client, /Ask about cost and permits/);
  assert.match(client, /Confirm the right route before committing/);
});

test("Kailash page does not compete with the tour exit-intent modal", async () => {
  const layout = await readSource("../src/components/Layout/PublicLayout.tsx");

  assert.match(layout, /pathname\?\.startsWith\("\/tours\/"\)/);
  assert.equal(
    layout.includes('pathname === "/kailash-mansarovar"'),
    false,
  );
});
