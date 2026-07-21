import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { execute, getOne, transaction } from "@/server/db/mysql";
import { getActivityBySlug, getDestinationBySlug } from "./catalog";
import { getPostBySlug } from "./content";
import { getTourBySlug } from "./tours";

type Jsonish = unknown;

function json(value: Jsonish) {
  if (value === undefined) return null;
  return JSON.stringify(value ?? null);
}

function slugify(value: unknown) {
  return String(value ?? "untitled")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function bool(value: unknown, fallback = false) {
  if (value === undefined) return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
}

function num(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function date(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

async function resolveTourDbId(id: number) {
  const row = await getOne<RowDataPacket & { id: number }>(
    "SELECT id FROM tours WHERE id = ? OR legacy_id = ? LIMIT 1",
    [id, id],
  );
  return row?.id ?? null;
}

async function resolveDestinationDbId(id: number) {
  const row = await getOne<RowDataPacket & { id: number }>(
    "SELECT id FROM destinations WHERE id = ? OR legacy_id = ? LIMIT 1",
    [id, id],
  );
  return row?.id ?? null;
}

async function resolveActivityDbId(id: number) {
  const row = await getOne<RowDataPacket & { id: number }>(
    "SELECT id FROM activities WHERE id = ? OR legacy_id = ? LIMIT 1",
    [id, id],
  );
  return row?.id ?? null;
}

async function resolveByIdentifier(table: "destinations" | "activities" | "posts" | "sliders" | "testimonials" | "team_members" | "kailash_gallery", identifier: string) {
  const parsed = Number.parseInt(identifier, 10);
  const hasSlug = ["destinations", "activities", "posts"].includes(table);
  const where = Number.isFinite(parsed)
    ? hasSlug ? "(id = ? OR legacy_id = ? OR slug = ?)" : "(id = ? OR legacy_id = ?)"
    : hasSlug ? "slug = ?" : "id = ?";
  const params = Number.isFinite(parsed)
    ? hasSlug ? [parsed, parsed, identifier] : [parsed, parsed]
    : [identifier];
  const row = await getOne<RowDataPacket & { id: number }>(`SELECT id FROM ${table} WHERE ${where} LIMIT 1`, params);
  return row?.id ?? null;
}

async function setTourRelations(connection: Parameters<Parameters<typeof transaction>[0]>[0], tourId: number, payload: Record<string, unknown>) {
  await connection.execute("DELETE FROM tour_destinations WHERE tour_id = ?", [tourId]);
  await connection.execute("DELETE FROM tour_activities WHERE tour_id = ?", [tourId]);

  const primary = payload.primary_destination_id;
  const secondary = Array.isArray(payload.secondary_destination_ids) ? payload.secondary_destination_ids : [];
  let sort = 0;
  for (const item of [primary, ...secondary].filter((value) => value !== undefined && value !== null && value !== "")) {
    const destinationId = await resolveDestinationDbId(Number(item));
    if (!destinationId) continue;
    await connection.execute(
      "INSERT IGNORE INTO tour_destinations (tour_id, destination_id, relation_type, sort_order) VALUES (?, ?, ?, ?)",
      [tourId, destinationId, item === primary ? "primary" : "secondary", sort++],
    );
  }

  const activityIds = Array.isArray(payload.activity_ids) ? payload.activity_ids : [];
  sort = 0;
  for (const item of activityIds) {
    const activityId = await resolveActivityDbId(Number(item));
    if (!activityId) continue;
    await connection.execute(
      "INSERT IGNORE INTO tour_activities (tour_id, activity_id, sort_order) VALUES (?, ?, ?)",
      [tourId, activityId, sort++],
    );
  }
}

function tourData(payload: Record<string, unknown>) {
  const title = String(payload.title ?? "Untitled tour");
  return {
    slug: String(payload.slug ?? slugify(title)),
    title,
    category: payload.category ?? null,
    location: payload.location ?? null,
    description: payload.description ?? null,
    price: num(payload.price),
    original_price: payload.originalPrice ?? payload.original_price ?? null,
    price_available: bool(payload.priceAvailable ?? payload.price_available, true),
    has_discount: bool(payload.hasDiscount ?? payload.has_discount),
    discount_percentage: payload.discountPercentage ?? payload.discount_percentage ?? null,
    duration: payload.duration ?? null,
    duration_days: payload.duration_days ?? null,
    group_size: payload.group_size ?? payload.groupSize ?? null,
    difficulty: payload.difficulty ?? null,
    rating: num(payload.rating),
    reviews: num(payload.reviews),
    best_time: payload.best_time ?? payload.bestTime ?? null,
    image_url: payload.image ?? payload.image_url ?? null,
    gallery: json(payload.gallery),
    highlights: json(payload.highlights),
    inclusions: json(payload.inclusions),
    exclusions: json(payload.exclusions),
    activities_text: json(payload.activities),
    itinerary: json(payload.itinerary),
    fitness_requirements: json(payload.fitness_requirements),
    related_destinations: json(payload.related_destinations),
    related_activities: json(payload.related_activities),
    tags: json(payload.tags),
    seo: json(payload.seo),
    metadata: json(payload.metadata),
    featured: bool(payload.featured),
    listed: payload.listed === undefined ? true : bool(payload.listed),
  };
}

async function insert(table: string, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  const result = await execute<ResultSetHeader>(
    `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
    keys.map((key) => data[key]),
  );
  return result.insertId;
}

async function update(table: string, id: number, data: Record<string, unknown>) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (!entries.length) return;
  await execute(
    `UPDATE ${table} SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`,
    [...entries.map(([, value]) => value), id],
  );
}

export async function createTour(payload: Record<string, unknown>) {
  const slug = String(payload.slug ?? slugify(payload.title));
  await transaction(async (connection) => {
    const data = tourData(payload);
    const keys = Object.keys(data);
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO tours (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
      keys.map((key) => data[key as keyof typeof data]) as Parameters<typeof connection.execute>[1],
    );
    await setTourRelations(connection, result.insertId, payload);
    return result.insertId;
  });
  return getTourBySlug(slug, true);
}

export async function updateTour(id: number, payload: Record<string, unknown>) {
  const dbId = await resolveTourDbId(id);
  if (!dbId) return null;
  const existing = await getOne<RowDataPacket & { slug: string }>("SELECT slug FROM tours WHERE id = ? LIMIT 1", [dbId]);
  await transaction(async (connection) => {
    const data = tourData(payload);
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    await connection.execute(
      `UPDATE tours SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`,
      [...entries.map(([, value]) => value), dbId] as Parameters<typeof connection.execute>[1],
    );
    await setTourRelations(connection, dbId, payload);
  });
  return getTourBySlug(String(payload.slug ?? existing?.slug), true);
}

export async function deleteTour(id: number) {
  const dbId = await resolveTourDbId(id);
  if (!dbId) return false;
  await execute("DELETE FROM tours WHERE id = ?", [dbId]);
  return true;
}

export async function setTourListing(id: number, listed: boolean) {
  const dbId = await resolveTourDbId(id);
  if (!dbId) return null;
  const existing = await getOne<RowDataPacket & { slug: string }>("SELECT slug FROM tours WHERE id = ? LIMIT 1", [dbId]);
  await execute("UPDATE tours SET listed = ? WHERE id = ?", [listed, dbId]);
  return existing?.slug ? getTourBySlug(existing.slug, true) : null;
}

export async function upsertDestination(identifier: string | null, payload: Record<string, unknown>) {
  const title = String(payload.title ?? payload.name ?? "Untitled destination");
  const inputSeo = payload.seo && typeof payload.seo === "object" && !Array.isArray(payload.seo)
    ? payload.seo as Record<string, unknown>
    : {};
  const hasSeoPayload = payload.seo !== undefined
    || payload.seo_intro !== undefined
    || payload.seo_best_time !== undefined
    || payload.seo_planning_note !== undefined
    || payload.seo_guide_blocks !== undefined
    || payload.seo_faqs !== undefined;
  const seo = {
    ...inputSeo,
    intro: payload.seo_intro ?? inputSeo.intro ?? null,
    best_time: payload.seo_best_time ?? inputSeo.best_time ?? null,
    planning_note: payload.seo_planning_note ?? inputSeo.planning_note ?? null,
    guide_blocks: payload.seo_guide_blocks ?? inputSeo.guide_blocks ?? [],
    faqs: payload.seo_faqs ?? inputSeo.faqs ?? [],
  };
  const data = {
    slug: String(payload.slug ?? slugify(title)),
    name: title,
    title,
    country: payload.country ?? null,
    region: payload.region ?? null,
    type: payload.type ?? (String(payload.country ?? "").toLowerCase() === "nepal" ? "nepal" : "international"),
    image_url: payload.image ?? payload.image_url ?? null,
    description: payload.description ?? null,
    highlights: json(payload.highlights),
    best_time: payload.bestTime ?? payload.best_time ?? null,
    altitude: payload.altitude ?? null,
    difficulty: payload.difficulty ?? null,
    href: payload.href ?? `/destinations/${payload.slug ?? slugify(title)}`,
    related_tours: json(payload.relatedTours ?? payload.related_tours),
    related_activities: json(payload.relatedActivities ?? payload.related_activities),
    gallery: payload.gallery === undefined ? undefined : json(payload.gallery),
    seo: hasSeoPayload ? json(seo) : undefined,
    metadata: payload.metadata === undefined ? undefined : json(payload.metadata),
    featured: bool(payload.featured),
    listed: payload.listed === undefined ? true : bool(payload.listed),
  };
  const id = identifier ? await resolveByIdentifier("destinations", identifier) : null;
  if (id) await update("destinations", id, data);
  else await insert("destinations", data);
  return getDestinationBySlug(data.slug, true);
}

export async function deleteDestination(identifier: string) {
  const id = await resolveByIdentifier("destinations", identifier);
  if (!id) return false;
  await execute("DELETE FROM destinations WHERE id = ?", [id]);
  return true;
}

export async function upsertActivity(identifier: string | null, payload: Record<string, unknown>) {
  const name = String(payload.name ?? "Untitled activity");
  const data = {
    slug: String(payload.slug ?? slugify(name)),
    name,
    type: payload.type ?? null,
    image_url: payload.image ?? payload.image_url ?? null,
    description: payload.description ?? null,
    highlights: json(payload.highlights),
    difficulty: payload.difficulty ?? null,
    best_time: payload.bestTime ?? payload.best_time ?? null,
    duration: payload.duration ?? null,
    popular_destinations: json(payload.popularDestinations ?? payload.popular_destinations),
    related_tours: json(payload.relatedTours ?? payload.related_tours),
    related_destinations: json(payload.relatedDestinations ?? payload.related_destinations),
    featured: bool(payload.featured),
    is_active: payload.is_active === undefined ? true : bool(payload.is_active),
  };
  const id = identifier ? await resolveByIdentifier("activities", identifier) : null;
  if (id) await update("activities", id, data);
  else await insert("activities", data);
  return getActivityBySlug(data.slug, true);
}

export async function deleteActivity(identifier: string) {
  const id = await resolveByIdentifier("activities", identifier);
  if (!id) return false;
  await execute("DELETE FROM activities WHERE id = ?", [id]);
  return true;
}

export async function upsertPost(identifier: string | null, payload: Record<string, unknown>) {
  const title = String(payload.title ?? "Untitled post");
  const data = {
    slug: String(payload.slug ?? slugify(title)),
    title,
    excerpt: payload.excerpt ?? null,
    content: payload.content ?? null,
    image_url: payload.image ?? payload.image_url ?? null,
    author: payload.author ?? "Admin",
    category: payload.category ?? null,
    tags: json(payload.tags),
    reading_time: payload.readTime ?? payload.reading_time ?? "5 min read",
    featured: bool(payload.featured),
    status: payload.status ?? "published",
    seo: json(payload.seo),
    published_at: payload.date ? new Date(String(payload.date)).toISOString().slice(0, 19).replace("T", " ") : null,
  };
  const id = identifier ? await resolveByIdentifier("posts", identifier) : null;
  if (id) await update("posts", id, data);
  else await insert("posts", data);
  return getPostBySlug(data.slug, true);
}

export async function deletePost(identifier: string) {
  const id = await resolveByIdentifier("posts", identifier);
  if (!id) return false;
  await execute("DELETE FROM posts WHERE id = ?", [id]);
  return true;
}

export async function createEnquiry(payload: Record<string, unknown>) {
  const result = await execute<ResultSetHeader>(
    `INSERT INTO enquiries
      (name, email, phone, subject, message, tour_name, destination, number_of_people, travel_date, status, notes, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
    [
      payload.name,
      String(payload.email).toLowerCase(),
      payload.phone ?? null,
      payload.subject ?? "General Enquiry",
      payload.message,
      payload.tour_name ?? payload.tour_title ?? null,
      payload.destination ?? null,
      payload.number_of_people ?? payload.travelers ?? null,
      date(payload.travel_date ?? payload.date),
      payload.notes ?? "",
      JSON.stringify(payload),
    ],
  );
  return result.insertId;
}

export async function createLead(payload: Record<string, unknown>) {
  const result = await execute<ResultSetHeader>(
    "INSERT INTO leads (type, name, email, phone, meta, status) VALUES (?, ?, ?, ?, ?, 'new')",
    [
      payload.type,
      payload.name ?? null,
      String(payload.email).toLowerCase(),
      payload.phone ?? null,
      JSON.stringify(payload.meta ?? payload.metadata ?? payload),
    ],
  );
  return result.insertId;
}

export async function updateStatusTable(table: "leads" | "enquiries", id: number, payload: Record<string, unknown>) {
  const allowed = table === "leads"
    ? ["status"]
    : ["status", "assigned_to", "notes"];
  const data = Object.fromEntries(Object.entries(payload).filter(([key]) => allowed.includes(key)));
  await update(table, id, data);
}

export async function deleteById(table: "leads" | "enquiries" | "sliders" | "testimonials" | "team_members" | "kailash_gallery", id: number) {
  const result = await execute<ResultSetHeader>(`DELETE FROM ${table} WHERE id = ? OR legacy_id = ?`, [id, id]);
  return result.affectedRows > 0;
}

export { insert, update, resolveByIdentifier, slugify, bool, json, num };
