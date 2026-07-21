import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { middleware } from "../src/middleware";

const publicOrigin = "https://zeotourism.com";
const internalPassengerUrl = "http://127.0.0.1:3000/api/admin/tours/0";

test("accepts the configured public origin behind Passenger", () => {
  const previous = process.env.APP_URL;
  process.env.APP_URL = publicOrigin;
  try {
    const response = middleware(request({ origin: publicOrigin }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  } finally {
    process.env.APP_URL = previous;
  }
});

test("rejects an admin mutation without an origin or referer", async () => {
  const previous = process.env.APP_URL;
  process.env.APP_URL = publicOrigin;
  try {
    const response = middleware(request());
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Invalid request origin" });
  } finally {
    process.env.APP_URL = previous;
  }
});

test("rejects an admin mutation from a foreign origin", async () => {
  const previous = process.env.APP_URL;
  process.env.APP_URL = publicOrigin;
  try {
    const response = middleware(request({ origin: "https://example.test" }));
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Invalid request origin" });
  } finally {
    process.env.APP_URL = previous;
  }
});

function request(headers: Record<string, string> = {}) {
  return new NextRequest(internalPassengerUrl, {
    method: "PUT",
    headers,
  });
}
