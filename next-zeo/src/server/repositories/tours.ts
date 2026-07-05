import { getAll, getOne } from "@/server/db/mysql";
import { parseJsonArray, parseJsonObject } from "@/server/db/json";
import { getPagination } from "@/server/http/pagination";
import type { BaseRow, ListOptions, ListResult } from "./types";
import { bool, iso } from "./types";

type TourRow = BaseRow & {
  slug: string;
  title: string;
  category: string | null;
  location: string | null;
  description: string | null;
  price: string | number;
  original_price: string | number | null;
  price_available: number | boolean;
  has_discount: number | boolean;
  discount_percentage: string | number | null;
  duration: string | null;
  duration_days: number | null;
  group_size: string | null;
  difficulty: string | null;
  rating: string | number;
  reviews: number;
  best_time: string | null;
  image_url: string | null;
  gallery: unknown;
  highlights: unknown;
  inclusions: unknown;
  exclusions: unknown;
  activities_text: unknown;
  itinerary: unknown;
  fitness_requirements: unknown;
  related_destinations: unknown;
  related_activities: unknown;
  tags: unknown;
  seo: unknown;
  metadata: unknown;
  featured: number | boolean;
  listed: number | boolean;
};

type RelationRow = {
  tour_id: number;
  legacy_id: number | null;
  slug: string;
  name: string;
  relation_type?: "primary" | "secondary";
  sort_order: number;
};

const searchFields = "(title LIKE ? OR description LIKE ? OR location LIKE ? OR category LIKE ?)";

function tourWhere(options: ListOptions, admin = false) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (!admin) clauses.push("listed = 1");
  else if (options.status === "listed") clauses.push("listed = 1");
  else if (options.status === "unlisted") clauses.push("listed = 0");
  if (options.category) {
    clauses.push("category = ?");
    params.push(options.category);
  }
  if (options.featured === "true") clauses.push("featured = 1");
  if (options.search) {
    clauses.push(searchFields);
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }
  if (options.location) {
    clauses.push("location LIKE ?");
    params.push(`%${options.location}%`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

async function relations(tourIds: number[]) {
  if (!tourIds.length) return { destinations: new Map<number, RelationRow[]>(), activities: new Map<number, RelationRow[]>() };
  const placeholders = tourIds.map(() => "?").join(",");
  const destinationRows = await getAll<RelationRow & import("mysql2/promise").RowDataPacket>(
    `SELECT td.tour_id, d.legacy_id, d.slug, d.name, td.relation_type, td.sort_order
     FROM tour_destinations td
     JOIN destinations d ON d.id = td.destination_id
     WHERE td.tour_id IN (${placeholders})
     ORDER BY td.tour_id, td.sort_order`,
    tourIds,
  );
  const activityRows = await getAll<RelationRow & import("mysql2/promise").RowDataPacket>(
    `SELECT ta.tour_id, a.legacy_id, a.slug, a.name, ta.sort_order
     FROM tour_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.tour_id IN (${placeholders})
     ORDER BY ta.tour_id, ta.sort_order`,
    tourIds,
  );
  const destinations = new Map<number, RelationRow[]>();
  const activities = new Map<number, RelationRow[]>();
  for (const row of destinationRows) destinations.set(row.tour_id, [...(destinations.get(row.tour_id) ?? []), row]);
  for (const row of activityRows) activities.set(row.tour_id, [...(activities.get(row.tour_id) ?? []), row]);
  return { destinations, activities };
}

function serialize(row: TourRow, rel?: { destinations?: RelationRow[]; activities?: RelationRow[] }) {
  const destinations = rel?.destinations ?? [];
  const activities = rel?.activities ?? [];
  const primary = destinations.find((item) => item.relation_type === "primary") ?? destinations[0];
  return {
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    priceAvailable: bool(row.price_available),
    hasDiscount: bool(row.has_discount),
    discountPercentage: row.discount_percentage === null ? null : Number(row.discount_percentage),
    duration: row.duration,
    duration_days: row.duration_days,
    group_size: row.group_size,
    groupSize: row.group_size,
    difficulty: row.difficulty,
    rating: Number(row.rating),
    reviews: row.reviews,
    best_time: row.best_time,
    bestTime: row.best_time,
    image: row.image_url,
    image_url: row.image_url,
    location: row.location,
    gallery: parseJsonArray(row.gallery),
    highlights: parseJsonArray<string>(row.highlights),
    inclusions: parseJsonArray<string>(row.inclusions),
    exclusions: parseJsonArray<string>(row.exclusions),
    activities: parseJsonArray(row.activities_text),
    itinerary: parseJsonArray(row.itinerary),
    fitness_requirements: parseJsonArray(row.fitness_requirements),
    related_destinations: parseJsonArray(row.related_destinations),
    related_activities: parseJsonArray(row.related_activities),
    tags: parseJsonArray(row.tags),
    seo: parseJsonObject(row.seo),
    metadata: parseJsonObject(row.metadata),
    primary_destination_id: primary?.legacy_id ?? null,
    secondary_destination_ids: destinations.filter((item) => item !== primary).map((item) => item.legacy_id).filter(Boolean),
    activity_ids: activities.map((item) => item.legacy_id).filter(Boolean),
    destinations: destinations.map(({ legacy_id, slug, name, relation_type }) => ({ id: legacy_id, slug, name, relation_type })),
    activityDetails: activities.map(({ legacy_id, slug, name }) => ({ id: legacy_id, slug, name })),
    featured: bool(row.featured),
    listed: bool(row.listed),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

export async function listTours(options: ListOptions = {}, admin = false): Promise<ListResult<ReturnType<typeof serialize>>> {
  const pagination = getPagination(options);
  const { where, params } = tourWhere(options, admin);
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(
    `SELECT COUNT(*) AS total FROM tours ${where}`,
    params,
  );
  const rows = await getAll<TourRow>(
    `SELECT * FROM tours ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  const rel = await relations(rows.map((row) => row.id));
  return {
    items: rows.map((row) => serialize(row, { destinations: rel.destinations.get(row.id), activities: rel.activities.get(row.id) })),
    total: count?.total ?? 0,
  };
}

export async function getTourBySlug(slug: string, admin = false) {
  const row = await getOne<TourRow>(
    `SELECT * FROM tours WHERE slug = ?${admin ? "" : " AND listed = 1"} LIMIT 1`,
    [slug],
  );
  if (!row) return null;
  const rel = await relations([row.id]);
  return serialize(row, { destinations: rel.destinations.get(row.id), activities: rel.activities.get(row.id) });
}

export async function getTourByLegacyId(id: number, admin = false) {
  const row = await getOne<TourRow>(
    `SELECT * FROM tours WHERE legacy_id = ?${admin ? "" : " AND listed = 1"} LIMIT 1`,
    [id],
  );
  if (!row) return null;
  const rel = await relations([row.id]);
  return serialize(row, { destinations: rel.destinations.get(row.id), activities: rel.activities.get(row.id) });
}
