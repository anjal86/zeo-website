import "dotenv/config";

const baseUrl = process.env.API_VERIFY_BASE_URL ?? "http://127.0.0.1:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

type Check = { name: string; status: "passed" | "failed"; detail?: string };
const checks: Check[] = [];
const created: { kind: "tour" | "destination" | "post" | "slider"; id: string }[] = [];

function record(name: string, passed: boolean, detail?: string) {
  checks.push({ name, status: passed ? "passed" : "failed", detail });
}

async function req(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, init);
}

async function json<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

function jsonInit(method: string, body: unknown, cookie?: string): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  };
}

async function main() {
  if (!email || !password) throw new Error("ADMIN_EMAIL/ADMIN_PASSWORD required");

  const unauth = await req("/api/admin/tours", jsonInit("POST", { title: "Should reject" }));
  record("unauth admin mutation rejected", unauth.status === 401, `${unauth.status}`);

  const login = await req("/api/auth/login", jsonInit("POST", { email, password }));
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  record("login for write verification", login.ok && Boolean(cookie), `${login.status}`);
  if (!cookie) throw new Error("login failed");

  const stamp = Date.now();
  const destinationSlug = `verify-destination-${stamp}`;
  const tourSlug = `verify-tour-${stamp}`;
  const postSlug = `verify-post-${stamp}`;

  const enquiry = await req("/api/contact/enquiry", jsonInit("POST", {
    name: "Verify User",
    email: `verify-enquiry-${stamp}@example.com`,
    message: "Verification enquiry",
    subject: "Verification",
  }));
  record("public enquiry submit", enquiry.status === 201, `${enquiry.status}`);

  const lead = await req("/api/leads", jsonInit("POST", {
    type: "verify",
    email: `verify-lead-${stamp}@example.com`,
    name: "Verify Lead",
    meta: { stamp },
  }));
  record("public lead submit", lead.status === 201, `${lead.status}`);

  const uploadUnauth = await req("/api/admin/upload", { method: "POST", body: new FormData() });
  record("upload rejects unauthenticated", uploadUnauth.status === 401, `${uploadUnauth.status}`);

  const badForm = new FormData();
  badForm.set("file", new Blob(["bad"], { type: "text/plain" }), "bad.txt");
  const badUpload = await req("/api/admin/upload", { method: "POST", headers: { Cookie: cookie }, body: badForm });
  record("upload rejects unsupported file", badUpload.status === 400, `${badUpload.status}`);

  const destination = await req("/api/admin/destinations", jsonInit("POST", {
    slug: destinationSlug,
    title: "Verify Destination",
    country: "Nepal",
    description: "Temporary destination",
  }, cookie));
  const destinationPayload = await json<{ id?: number; db_id?: number; slug?: string }>(destination);
  const destinationId = String(destinationPayload.id ?? destinationPayload.db_id ?? destinationSlug);
  created.push({ kind: "destination", id: destinationSlug });
  record("destination create", destination.status === 201 && destinationPayload.slug === destinationSlug, `${destination.status}`);

  const destinationUpdate = await req(`/api/admin/destinations/${destinationSlug}`, jsonInit("PUT", {
    slug: destinationSlug,
    title: "Verify Destination Updated",
    country: "Nepal",
  }, cookie));
  record("destination update", destinationUpdate.ok, `${destinationUpdate.status}`);

  const post = await req("/api/admin/posts", jsonInit("POST", {
    slug: postSlug,
    title: "Verify Post",
    excerpt: "Temporary post",
    content: "Temporary post body",
  }, cookie));
  const postPayload = await json<{ id?: number; db_id?: number; slug?: string }>(post);
  created.push({ kind: "post", id: postSlug });
  record("post create", post.status === 201 && postPayload.slug === postSlug, `${post.status}`);

  const postUpdate = await req(`/api/admin/posts/${postPayload.db_id ?? postPayload.id}`, jsonInit("PUT", {
    slug: postSlug,
    title: "Verify Post Updated",
    content: "Updated",
  }, cookie));
  record("post update", postUpdate.ok, `${postUpdate.status}`);

  const tour = await req("/api/admin/tours", jsonInit("POST", {
    slug: tourSlug,
    title: "Verify Tour",
    description: "Temporary tour",
    primary_destination_id: Number(destinationId),
    activity_ids: [],
    gallery: [],
  }, cookie));
  const tourPayload = await json<{ id?: number; db_id?: number; slug?: string }>(tour);
  const tourId = String(tourPayload.db_id ?? tourPayload.id);
  created.push({ kind: "tour", id: tourId });
  record("tour create", tour.status === 201 && tourPayload.slug === tourSlug, `${tour.status}`);

  const tourUpdate = await req(`/api/admin/tours/${tourId}`, jsonInit("PUT", {
    slug: tourSlug,
    title: "Verify Tour Updated",
    description: "Updated",
    primary_destination_id: Number(destinationId),
    gallery: [],
  }, cookie));
  record("tour update", tourUpdate.ok, `${tourUpdate.status}`);

  const tourListing = await req(`/api/admin/tours/${tourId}/listing`, jsonInit("PATCH", { listed: false }, cookie));
  record("tour listing toggle", tourListing.ok, `${tourListing.status}`);

  const slider = await req("/api/admin/sliders", jsonInit("POST", {
    title: "Verify Slider",
    order_index: 9999,
    is_active: false,
  }, cookie));
  record("slider create", slider.status === 201, `${slider.status}`);

  const sliders = await json<Array<{ db_id?: number; id?: number; title?: string }>>(await req("/api/admin/sliders", { headers: { Cookie: cookie } }));
  const sliderId = sliders.find((item) => item.title === "Verify Slider")?.db_id ?? sliders.find((item) => item.title === "Verify Slider")?.id;
  if (sliderId) created.push({ kind: "slider", id: String(sliderId) });
  record("slider list after create", Boolean(sliderId), sliderId ? String(sliderId) : "missing");

  for (const item of created.reverse()) {
    const path =
      item.kind === "tour" ? `/api/admin/tours/${item.id}` :
      item.kind === "destination" ? `/api/admin/destinations/${item.id}` :
      item.kind === "post" ? `/api/admin/posts/${item.id}` :
      `/api/admin/sliders/${item.id}`;
    const cleanup = await req(path, { method: "DELETE", headers: { Cookie: cookie } });
    record(`cleanup ${item.kind}`, cleanup.ok, `${cleanup.status}`);
  }

  for (const check of checks) console.log(`${check.status}: ${check.name}${check.detail ? ` (${check.detail})` : ""}`);
  if (checks.some((check) => check.status === "failed")) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
