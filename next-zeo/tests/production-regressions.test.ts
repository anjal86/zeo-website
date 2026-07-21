import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

import { authorizeRoles, type AdminSession } from "@/server/auth/require-admin";

test("App Router favicon exists as a valid icon at /favicon.ico", async () => {
  const faviconPath = new URL("../app/favicon.ico", import.meta.url);
  const favicon = await readFile(faviconPath);
  assert.ok((await stat(faviconPath)).size > 0);
  assert.deepEqual([...favicon.subarray(0, 4)], [0, 0, 1, 0]);

  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(layout, /(?:^|["'])x\/favicon\.ico/);
});

test("admin navigation does not link to the missing users route", async () => {
  const sidebar = await readFile(new URL("../src/components/Admin/AdminSidebar.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(sidebar, /["']\/admin\/users["']/);
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

function session(role: AdminSession["role"]): AdminSession {
  return {
    id: 1,
    email: `${role}@example.test`,
    name: role,
    role,
    isAdmin: role === "admin",
  };
}
