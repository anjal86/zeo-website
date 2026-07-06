import "dotenv/config";

const baseUrl = process.env.API_VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

type Check = {
  name: string;
  status: "passed" | "failed";
  detail?: string;
};

type ListPayload<T> = T[] | { tours?: T[]; destinations?: T[]; items?: T[] };

const checks: Check[] = [];

function record(name: string, ok: boolean, detail?: string) {
  checks.push({ name, status: ok ? "passed" : "failed", detail });
}

async function request(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, init);
}

async function json<T>(response: Response) {
  return (await response.json()) as T;
}

function readList<T>(payload: ListPayload<T>, key: "tours" | "destinations") {
  if (Array.isArray(payload)) return payload;
  return payload[key] ?? payload.items ?? [];
}

async function expectOk(path: string) {
  const response = await request(path);
  record(`GET ${path}`, response.ok, `${response.status}`);
  return response;
}

async function main() {
  await expectOk("/api/health");

  const toursResponse = await expectOk("/api/tours?limit=5&page=1");
  const toursPayload = await json<ListPayload<{ slug?: string }>>(toursResponse);
  const firstTourSlug = readList(toursPayload, "tours")[0]?.slug;
  if (firstTourSlug) await expectOk(`/api/tours/${encodeURIComponent(firstTourSlug)}`);
  else record("tour slug detail", false, "no tour slug in list response");

  const destinationsResponse = await expectOk("/api/destinations?limit=5&page=1");
  const destinationsPayload = await json<ListPayload<{ slug?: string }>>(destinationsResponse);
  const firstDestinationSlug = readList(destinationsPayload, "destinations")[0]?.slug;
  if (firstDestinationSlug) await expectOk(`/api/destinations/${encodeURIComponent(firstDestinationSlug)}`);
  else record("destination slug detail", false, "no destination slug in list response");

  const unauthAdmin = await request("/api/admin/me");
  record("GET /api/admin/me rejects unauthenticated", unauthAdmin.status === 401, `${unauthAdmin.status}`);

  if (!email || !password) {
    record("POST /api/auth/login", false, "ADMIN_EMAIL/ADMIN_PASSWORD missing");
  } else {
    const login = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    record("POST /api/auth/login", login.ok && Boolean(cookie), `${login.status}`);

    if (cookie) {
      const me = await request("/api/admin/me", { headers: { Cookie: cookie } });
      record("GET /api/admin/me accepts authenticated", me.ok, `${me.status}`);
      const adminTours = await request("/api/admin/tours?limit=2&page=1", { headers: { Cookie: cookie } });
      record("GET /api/admin/tours accepts authenticated", adminTours.ok, `${adminTours.status}`);
    }
  }

  for (const check of checks) {
    console.log(`${check.status}: ${check.name}${check.detail ? ` (${check.detail})` : ""}`);
  }

  const failed = checks.filter((check) => check.status === "failed");
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
