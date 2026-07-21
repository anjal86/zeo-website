import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("Kailash route owns server metadata, structured data and server-loaded content", async () => {
  const page = await readSource("../app/kailash-mansarovar/page.tsx");

  assert.equal(page.includes('"use client"'), false);
  assert.match(page, /export const metadata: Metadata/);
  assert.match(page, /canonical: "\/kailash-mansarovar"/);
  assert.match(page, /listKailashGallery\(\)/);
  assert.match(page, /listTours\(\{ search: "kailash"/);
  assert.match(page, /getContactSettings\(\)/);
  assert.match(page, /createBreadcrumbSchema/);
  assert.match(page, /createTouristDestinationSchema/);
  assert.match(page, /<JsonLd data=\{structuredData\}/);
});

test("Kailash presentation avoids motion residue and duplicate client requests", async () => {
  const client = await readSource(
    "../src/components/Kailash/KailashMansarovarClient.tsx",
  );

  assert.equal(client.includes("framer-motion"), false);
  assert.equal(client.includes("useScroll"), false);
  assert.equal(client.includes("useTransform"), false);
  assert.equal(client.includes("navigator.userAgent"), false);
  assert.equal(client.includes("fetch('/api/kailash-gallery')"), false);
  assert.equal(client.includes('fetch("/api/kailash-gallery")'), false);
  assert.equal(client.includes("+9779851000000"), false);
  assert.match(client, /prefers-reduced-motion: reduce/);
  assert.match(client, /document\.hidden/);
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
