import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

import {
  getExplicitTourRelationships,
  normalizeTourDurationForEditor,
  normalizeTourDurationForSave,
} from "@/lib/adminTourForm";
import { authorizeRoles, type AdminSession } from "@/server/auth/require-admin";

const file = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("App Router favicon exists as a valid icon at /favicon.ico", async () => {
  const faviconPath = new URL("../app/favicon.ico", import.meta.url);
  const favicon = await readFile(faviconPath);
  assert.ok((await stat(faviconPath)).size > 0);
  assert.deepEqual([...favicon.subarray(0, 4)], [0, 0, 1, 0]);

  const layout = await file("../app/layout.tsx");
  assert.doesNotMatch(layout, /(?:^|["'])x\/favicon\.ico/);
});

test("admin navigation does not link to the missing users route", async () => {
  const sidebar = await file("../src/components/Admin/AdminSidebar.tsx");
  assert.doesNotMatch(sidebar, /["']\/admin\/users["']/);
});

test("only supported administrator accounts may enter the portal", async () => {
  const loginRoute = await file("../app/api/auth/login/route.ts");
  assert.match(loginRoute, /user\.role !== ["']admin["']/);
  assert.match(loginRoute, /Editor access is not enabled yet/);
});

test("admin posts authorization allows admins", async () => {
  const result = await authorizeRoles(["admin"], async () => session("admin"));
  assert.equal(result.ok, true);
});

test("admin posts authorization rejects editors with 403", async () => {
  const result = await authorizeRoles(["admin"], async () => session("editor"));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 403);
});

test("admin posts authorization rejects unauthenticated users with 401", async () => {
  const result = await authorizeRoles(["admin"], async () => null);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 401);
});

test("destination SEO editor fields are persisted and serialized", async () => {
  const mutations = await file("../src/server/repositories/mutations.ts");
  const catalog = await file("../src/server/repositories/catalog.ts");
  for (const field of ["seo_intro", "seo_best_time", "seo_planning_note", "seo_guide_blocks", "seo_faqs"]) {
    assert.match(mutations, new RegExp(field));
    assert.match(catalog, new RegExp(field));
  }
});

test("tour duration normalization preserves descriptive values", () => {
  assert.equal(normalizeTourDurationForEditor("4 nights / 5 days"), "4 nights / 5 days");
  assert.equal(normalizeTourDurationForSave("4 nights / 5 days"), "4 nights / 5 days");
  assert.equal(normalizeTourDurationForSave("13"), "13 days");
  assert.equal(normalizeTourDurationForSave("3–4 hours"), "3–4 hours");
});

test("tour relationships use stored IDs only and never infer from copy", () => {
  assert.deepEqual(getExplicitTourRelationships({
    title: "Everest Base Camp Trek",
    location: "Everest, Nepal",
    primary_destination_id: null,
    secondary_destination_ids: [],
    activity_ids: [],
  }), {
    primaryDestinationId: undefined,
    secondaryDestinationIds: [],
    activityIds: [],
    relatedDestinations: [],
    relatedActivities: [],
  });

  assert.deepEqual(getExplicitTourRelationships({
    primary_destination_id: "4",
    secondary_destination_ids: [5, "6"],
    activity_ids: [7],
    related_destinations: ["Tibet"],
    related_activities: ["Pilgrimage"],
  }), {
    primaryDestinationId: 4,
    secondaryDestinationIds: [5, 6],
    activityIds: [7],
    relatedDestinations: ["Tibet"],
    relatedActivities: ["Pilgrimage"],
  });
});

test("settings and director editors block saving after failed initial loads", async () => {
  for (const path of [
    "../app/admin/(dashboard)/settings/page.tsx",
    "../app/admin/(dashboard)/director/page.tsx",
  ]) {
    const source = await file(path);
    assert.match(source, /loadedSuccessfully/);
    assert.match(source, /Retry/);
    assert.match(source, /disabled=\{saving \|\| !loadedSuccessfully\}/);
  }
});

function session(role: AdminSession["role"]): AdminSession {
  return {
    id: 1,
    email: `${role}@example.test`,
    name: role,
    role,
    isAdmin: role === "admin",
  };
}
