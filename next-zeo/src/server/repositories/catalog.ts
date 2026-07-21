import { execute, getAll, getOne } from "@/server/db/mysql";
import { parseJsonArray, parseJsonObject } from "@/server/db/json";
import { getPagination } from "@/server/http/pagination";
import type { BaseRow, ListOptions, ListResult } from "./types";
import { bool, iso } from "./types";

type DestinationRow = BaseRow & {
  slug: string;
  name: string;
  title: string | null;
  country: string | null;
  region: string | null;
  type: string | null;
  image_url: string | null;
  description: string | null;
  highlights: unknown;
  best_time: string | null;
  altitude: string | null;
  difficulty: string | null;
  href: string | null;
  tour_count: number;
  related_tours: unknown;
  related_activities: unknown;
  gallery: unknown;
  seo: unknown;
  metadata: unknown;
  featured: number | boolean;
  listed: number | boolean;
};

type ActivityRow = BaseRow & {
  slug: string;
  name: string;
  type: string | null;
  image_url: string | null;
  description: string | null;
  highlights: unknown;
  difficulty: string | null;
  best_time: string | null;
  duration: string | null;
  popular_destinations: unknown;
  related_tours: unknown;
  related_destinations: unknown;
  metadata: unknown;
  featured: number | boolean;
  is_active: number | boolean;
};

function serializeDestination(row: DestinationRow) {
  const seo = parseJsonObject(row.seo);
  const metadata = parseJsonObject(row.metadata);

  return {
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title ?? row.name,
    country: row.country,
    region: row.region,
    type: row.type,
    image: row.image_url,
    image_url: row.image_url,
    description: row.description,
    highlights: parseJsonArray<string>(row.highlights),
    bestTime: row.best_time,
    best_time: row.best_time,
    altitude: row.altitude,
    difficulty: row.difficulty,
    href: row.href,
    tourCount: row.tour_count,
    relatedTours: parseJsonArray(row.related_tours),
    relatedActivities: parseJsonArray(row.related_activities),
    gallery: parseJsonArray(row.gallery),
    seo,
    seo_intro: typeof seo.intro === "string" ? seo.intro : "",
    seo_best_time: typeof seo.best_time === "string" ? seo.best_time : "",
    seo_planning_note: typeof seo.planning_note === "string" ? seo.planning_note : "",
    seo_guide_blocks: Array.isArray(seo.guide_blocks) ? seo.guide_blocks : [],
    seo_faqs: Array.isArray(seo.faqs) ? seo.faqs : [],
    metadata,
    featured: bool(row.featured),
    listed: bool(row.listed),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

function serializeActivity(row: ActivityRow) {
  return {
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image_url,
    image_url: row.image_url,
    type: row.type,
    description: row.description,
    highlights: parseJsonArray<string>(row.highlights),
    difficulty: row.difficulty,
    bestTime: row.best_time,
    best_time: row.best_time,
    duration: row.duration,
    popularDestinations: parseJsonArray(row.popular_destinations),
    relatedTours: parseJsonArray(row.related_tours),
    relatedDestinations: parseJsonArray(row.related_destinations),
    metadata: parseJsonObject(row.metadata),
    featured: bool(row.featured),
    is_active: bool(row.is_active),
    listed: bool(row.is_active),
    href: `/activities/${row.slug}`,
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

function destinationWhere(options: ListOptions, admin = false) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (!admin) clauses.push("listed = 1");
  if (options.country) {
    clauses.push("country = ?");
    params.push(options.country);
  }
  if (options.type) {
    clauses.push("type = ?");
    params.push(options.type);
  }
  if (options.featured === "true") clauses.push("featured = 1");
  if (options.search) {
    clauses.push("(name LIKE ? OR title LIKE ? OR description LIKE ? OR country LIKE ?)");
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

function activityWhere(options: ListOptions, admin = false) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (!admin) clauses.push("is_active = 1");
  if (options.type) {
    clauses.push("type = ?");
    params.push(options.type);
  }
  if (options.featured === "true") clauses.push("featured = 1");
  if (options.search) {
    clauses.push("(name LIKE ? OR description LIKE ?)");
    const term = `%${options.search}%`;
    params.push(term, term);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export async function listDestinations(options: ListOptions = {}, admin = false): Promise<ListResult<ReturnType<typeof serializeDestination>>> {
  const pagination = getPagination(options);
  const { where, params } = destinationWhere(options, admin);
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(
    `SELECT COUNT(*) AS total FROM destinations ${where}`,
    params,
  );
  const rows = await getAll<DestinationRow>(
    `SELECT d.*, COUNT(td.tour_id) AS relation_count
     FROM destinations d
     LEFT JOIN tour_destinations td ON td.destination_id = d.id
     ${where}
     GROUP BY d.id
     ORDER BY d.id DESC
     LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  return {
    items: rows.map((row) => serializeDestination({ ...row, tour_count: Number(row.relation_count ?? row.tour_count) })),
    total: count?.total ?? 0,
  };
}

export async function getDestinationBySlug(slug: string, admin = false) {
  const row = await getOne<DestinationRow>(
    `SELECT * FROM destinations WHERE slug = ?${admin ? "" : " AND listed = 1"} LIMIT 1`,
    [slug],
  );
  return row ? serializeDestination(row) : null;
}

export async function listActivities(options: ListOptions = {}, admin = false): Promise<ListResult<ReturnType<typeof serializeActivity>>> {
  const pagination = getPagination(options);
  const { where, params } = activityWhere(options, admin);
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(
    `SELECT COUNT(*) AS total FROM activities ${where}`,
    params,
  );
  const rows = await getAll<ActivityRow>(
    `SELECT * FROM activities ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  return { items: rows.map(serializeActivity), total: count?.total ?? 0 };
}

export async function getActivityBySlug(slug: string, admin = false) {
  const row = await getOne<ActivityRow>(
    `SELECT * FROM activities WHERE slug = ?${admin ? "" : " AND is_active = 1"} LIMIT 1`,
    [slug],
  );
  return row ? serializeActivity(row) : null;
}

export async function subscribeNewsletter(email: string, name: string | null, source = "website") {
  await execute(
    `INSERT INTO newsletter_subscribers (email, name, source, status)
     VALUES (?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE name = COALESCE(VALUES(name), name), source = VALUES(source), status = 'active'`,
    [email.toLowerCase(), name, source],
  );
}