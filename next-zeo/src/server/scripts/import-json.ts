import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExecuteValues, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type Counters = {
  inserted: number;
  updated: number;
  skipped: number;
  warnings: number;
  errors: number;
};

type ImportContext = {
  dataDir: string;
  dryRun: boolean;
  apply: boolean;
  reset: boolean;
  counts: Record<string, Counters>;
  connection?: PoolConnection;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../../..");
const defaultDataDir = path.join(repoRoot, "api", "data");

const tablesInDeleteOrder = [
  "tour_activities",
  "tour_destinations",
  "uploaded_files",
  "newsletter_subscribers",
  "kailash_gallery",
  "director_message",
  "logos",
  "team_members",
  "leads",
  "enquiries",
  "contact_settings",
  "testimonials",
  "sliders",
  "posts",
  "tours",
  "activities",
  "destinations",
  "admin_users",
];

function parseMode() {
  const args = new Set(process.argv.slice(2));
  const modes = ["--dry-run", "--apply", "--reset-and-apply"].filter((mode) => args.has(mode));
  if (modes.length !== 1) {
    throw new Error("Use exactly one mode: --dry-run, --apply, or --reset-and-apply");
  }
  return {
    dryRun: args.has("--dry-run"),
    apply: args.has("--apply") || args.has("--reset-and-apply"),
    reset: args.has("--reset-and-apply"),
  };
}

function counter(ctx: ImportContext, entity: string) {
  ctx.counts[entity] ??= { inserted: 0, updated: 0, skipped: 0, warnings: 0, errors: 0 };
  return ctx.counts[entity];
}

function slugify(value: unknown) {
  const text = String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return text || "untitled";
}

function json(value: unknown): string | null {
  if (value === undefined) return null;
  return JSON.stringify(value ?? null);
}

function asArray<T = Record<string, unknown>>(value: unknown, key?: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (key && value && typeof value === "object" && Array.isArray((value as Record<string, unknown>)[key])) {
    return (value as Record<string, unknown>)[key] as T[];
  }
  return [];
}

function cleanDate(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function cleanDateOnly(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function num(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function readJson<T = unknown>(ctx: ImportContext, file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(ctx.dataDir, file), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    counter(ctx, "files").warnings += 1;
    console.warn(`warn missing/unreadable ${file}: ${(error as Error).message}`);
    return fallback;
  }
}

async function readTourDetails(ctx: ImportContext) {
  const dir = path.join(ctx.dataDir, "tour-details");
  try {
    const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".json")).sort();
    const tours: Record<string, unknown>[] = [];
    for (const file of files) {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      parsed.slug ??= file.replace(/\.json$/, "");
      tours.push(parsed);
    }
    return tours;
  } catch (error) {
    counter(ctx, "tour-details").warnings += 1;
    console.warn(`warn tour-details unavailable: ${(error as Error).message}`);
    return [];
  }
}

async function existsBy(ctx: ImportContext, table: string, where: Record<string, unknown>) {
  if (!ctx.connection) return false;
  const keys = Object.keys(where);
  const [rows] = await ctx.connection.execute<RowDataPacket[]>(
    `SELECT id FROM ${table} WHERE ${keys.map((key) => `${key} = ?`).join(" AND ")} LIMIT 1`,
    Object.values(where) as ExecuteValues[],
  );
  return rows.length > 0;
}

async function upsert(
  ctx: ImportContext,
  entity: string,
  table: string,
  unique: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  const counts = counter(ctx, entity);
  if (ctx.dryRun) {
    counts.skipped += 1;
    return;
  }
  if (!ctx.connection) throw new Error("DB connection unavailable");
  const existed = await existsBy(ctx, table, unique);
  const insertData = Object.fromEntries(
    Object.entries({ ...unique, ...data }).filter(([, value]) => value !== undefined),
  );
  const keys = Object.keys(insertData);
  const updates = Object.keys(data).filter((key) => key !== "id" && key !== "created_at");
  const [result] = await ctx.connection.execute<ResultSetHeader>(
    `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES (${keys.map(() => "?").join(", ")})
      ON DUPLICATE KEY UPDATE ${updates.map((key) => `${key} = VALUES(${key})`).join(", ")}
    `,
    keys.map((key) => insertData[key]) as ExecuteValues[],
  );
  if (existed || result.affectedRows === 2) counts.updated += 1;
  else counts.inserted += 1;
}

async function getIdByLegacyOrSlug(
  ctx: ImportContext,
  table: "tours" | "destinations" | "activities",
  legacyId: unknown,
  slug: unknown,
) {
  if (!ctx.connection) return null;
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (legacyId !== undefined && legacyId !== null && legacyId !== "") {
    clauses.push("legacy_id = ?");
    params.push(legacyId);
  }
  if (slug) {
    clauses.push("slug = ?");
    params.push(slug);
  }
  if (!clauses.length) return null;
  const [rows] = await ctx.connection.execute<RowDataPacket[]>(
    `SELECT id FROM ${table} WHERE ${clauses.join(" OR ")} LIMIT 1`,
    params as ExecuteValues[],
  );
  return rows[0]?.id as number | undefined;
}

async function resetData(ctx: ImportContext) {
  if (!ctx.connection) throw new Error("DB connection unavailable");
  if (process.env.NODE_ENV === "production") {
    throw new Error("--reset-and-apply is blocked in production");
  }
  await ctx.connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of tablesInDeleteOrder) {
    await ctx.connection.query(`DELETE FROM ${table}`);
  }
  await ctx.connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function importDestinations(ctx: ImportContext) {
  const destinations = asArray(await readJson(ctx, "destinations.json", []));
  for (const d of destinations) {
    const id = d.id as number | undefined;
    const slug = String(d.slug ?? slugify(d.name));
    await upsert(ctx, "destinations", "destinations", { slug }, {
      legacy_id: id ?? null,
      name: d.name ?? d.title ?? slug,
      title: d.title ?? d.name ?? null,
      country: d.country ?? null,
      type: d.type ?? null,
      image_url: d.image ?? null,
      description: d.description ?? null,
      highlights: json(d.highlights),
      best_time: d.bestTime ?? d.best_time ?? null,
      altitude: d.altitude ?? null,
      difficulty: d.difficulty ?? null,
      href: d.href ?? null,
      tour_count: num(d.tourCount),
      related_tours: json(d.relatedTours),
      related_activities: json(d.relatedActivities),
      featured: Boolean(d.featured),
      listed: d.listed !== false,
    });
  }
}

async function importActivities(ctx: ImportContext) {
  const activities = asArray(await readJson(ctx, "activities.json", []));
  for (const a of activities) {
    const slug = String(a.slug ?? slugify(a.name));
    await upsert(ctx, "activities", "activities", { slug }, {
      legacy_id: a.id ?? null,
      name: a.name ?? slug,
      type: a.type ?? null,
      image_url: a.image ?? null,
      description: a.description ?? null,
      highlights: json(a.highlights),
      difficulty: a.difficulty ?? null,
      best_time: a.bestTime ?? a.best_time ?? null,
      duration: a.duration ?? null,
      popular_destinations: json(a.popularDestinations),
      related_tours: json(a.relatedTours),
      related_destinations: json(a.relatedDestinations),
      featured: Boolean(a.featured),
      is_active: a.is_active !== false,
    });
  }
}

async function importTours(ctx: ImportContext) {
  const baseTours = asArray(await readJson(ctx, "tours.json", []));
  const details = await readTourDetails(ctx);
  const merged = new Map<string, Record<string, unknown>>();
  for (const tour of baseTours) merged.set(String(tour.slug ?? slugify(tour.title)), tour);
  for (const tour of details) merged.set(String(tour.slug ?? slugify(tour.title)), { ...(merged.get(String(tour.slug)) ?? {}), ...tour });

  for (const tour of merged.values()) {
    const slug = String(tour.slug ?? slugify(tour.title));
    await upsert(ctx, "tours", "tours", { slug }, {
      legacy_id: tour.id ?? null,
      title: tour.title ?? slug,
      category: tour.category ?? null,
      location: tour.location ?? null,
      description: tour.description ?? null,
      price: num(tour.price),
      original_price: tour.originalPrice ?? null,
      price_available: tour.priceAvailable !== false,
      has_discount: Boolean(tour.hasDiscount),
      discount_percentage: tour.discountPercentage ?? null,
      duration: tour.duration ?? null,
      duration_days: tour.duration_days ?? null,
      group_size: tour.group_size ?? tour.groupSize ?? null,
      difficulty: tour.difficulty ?? null,
      rating: num(tour.rating),
      reviews: num(tour.reviews),
      best_time: tour.best_time ?? tour.bestTime ?? null,
      image_url: tour.image ?? null,
      gallery: json(tour.gallery),
      highlights: json(tour.highlights),
      inclusions: json(tour.inclusions),
      exclusions: json(tour.exclusions),
      activities_text: json(tour.activities),
      itinerary: json(tour.itinerary),
      fitness_requirements: json(tour.fitness_requirements),
      related_destinations: json(tour.related_destinations),
      related_activities: json(tour.related_activities),
      tags: json(tour.tags),
      seo: json(tour.seo),
      featured: Boolean(tour.featured),
      listed: tour.listed !== false,
      created_at: cleanDate(tour.created_at) ?? undefined,
      updated_at: cleanDate(tour.updated_at) ?? undefined,
    });
  }

  if (!ctx.dryRun && ctx.connection) {
    for (const tour of merged.values()) {
      const slug = String(tour.slug ?? slugify(tour.title));
      const tourId = await getIdByLegacyOrSlug(ctx, "tours", tour.id, slug);
      if (!tourId) continue;
      await ctx.connection.execute("DELETE FROM tour_destinations WHERE tour_id = ?", [tourId]);
      await ctx.connection.execute("DELETE FROM tour_activities WHERE tour_id = ?", [tourId]);

      const primary = tour.primary_destination_id;
      const secondary = Array.isArray(tour.secondary_destination_ids) ? tour.secondary_destination_ids : [];
      const destinationIds = [primary, ...secondary].filter((value) => value !== undefined && value !== null);
      let sort = 0;
      for (const legacyDestinationId of destinationIds) {
        const destinationId = await getIdByLegacyOrSlug(ctx, "destinations", legacyDestinationId, null);
        if (!destinationId) {
          counter(ctx, "relations").warnings += 1;
          continue;
        }
        await ctx.connection.execute(
          "INSERT IGNORE INTO tour_destinations (tour_id, destination_id, relation_type, sort_order) VALUES (?, ?, ?, ?)",
          [tourId, destinationId, legacyDestinationId === primary ? "primary" : "secondary", sort++],
        );
      }

      const activityIds = Array.isArray(tour.activity_ids) ? tour.activity_ids : [];
      sort = 0;
      for (const legacyActivityId of activityIds) {
        const activityId = await getIdByLegacyOrSlug(ctx, "activities", legacyActivityId, null);
        if (!activityId) {
          counter(ctx, "relations").warnings += 1;
          continue;
        }
        await ctx.connection.execute(
          "INSERT IGNORE INTO tour_activities (tour_id, activity_id, sort_order) VALUES (?, ?, ?)",
          [tourId, activityId, sort++],
        );
      }
    }
  }
}

async function importPosts(ctx: ImportContext) {
  const posts = asArray(await readJson(ctx, "posts.json", { posts: [] }), "posts");
  for (const post of posts) {
    const slug = String(post.slug ?? slugify(post.title));
    await upsert(ctx, "posts", "posts", { slug }, {
      legacy_id: post.id ?? null,
      title: post.title ?? slug,
      excerpt: post.excerpt ?? null,
      content: post.content ?? null,
      image_url: post.image ?? null,
      author: post.author ?? null,
      category: post.category ?? null,
      tags: json(post.tags),
      reading_time: post.readTime ?? post.reading_time ?? null,
      featured: Boolean(post.featured),
      status: post.status ?? "published",
      seo: json(post.seo),
      published_at: cleanDate(post.date ?? post.published_at),
      created_at: cleanDate(post.created_at) ?? undefined,
      updated_at: cleanDate(post.updated_at) ?? undefined,
    });
  }
}

async function importSimpleEntities(ctx: ImportContext) {
  const sliders = asArray(await readJson(ctx, "sliders.json", []));
  for (const s of sliders) {
    await upsert(ctx, "sliders", "sliders", { legacy_id: s.id ?? null }, {
      title: s.title ?? "Untitled slider",
      subtitle: s.subtitle ?? null,
      location: s.location ?? null,
      image_url: s.image ?? null,
      video_url: s.video ?? null,
      video_start_time: s.video_start_time ?? null,
      button_text: s.button_text ?? null,
      button_url: s.button_url ?? null,
      button_style: s.button_style ?? null,
      show_button: Boolean(s.show_button),
      order_index: num(s.order_index),
      is_active: s.is_active !== false,
    });
  }

  const testimonials = asArray(await readJson(ctx, "testimonials.json", []));
  for (const t of testimonials) {
    await upsert(ctx, "testimonials", "testimonials", { legacy_id: t.id ?? null }, {
      name: t.name ?? "Anonymous",
      email: t.email ?? null,
      country: t.country ?? null,
      tour: t.tour ?? null,
      rating: num(t.rating, 5),
      title: t.title ?? null,
      message: t.message ?? null,
      image_url: t.image ?? null,
      testimonial_date: cleanDateOnly(t.date),
      is_featured: Boolean(t.is_featured),
      is_approved: Boolean(t.is_approved),
      created_at: cleanDate(t.created_at) ?? undefined,
      updated_at: cleanDate(t.updated_at) ?? undefined,
    });
  }

  const contact = await readJson<JsonValue>(ctx, "contact.json", {});
  await upsert(ctx, "contact", "contact_settings", { setting_key: "default" }, { payload: json(contact) });

  const enquiries = asArray(await readJson(ctx, "enquiries.json", { enquiries: [] }), "enquiries");
  for (const e of enquiries) {
    await upsert(ctx, "enquiries", "enquiries", { legacy_id: e.id ?? null }, {
      name: e.name ?? "Unknown",
      email: e.email ?? "",
      phone: e.phone ?? null,
      subject: e.subject ?? null,
      message: e.message ?? null,
      tour_name: e.tour_name ?? null,
      destination: e.destination ?? null,
      number_of_people: e.number_of_people ?? null,
      travel_date: cleanDateOnly(e.travel_date),
      status: e.status ?? "new",
      assigned_to: e.assigned_to ?? null,
      notes: e.notes ?? null,
      metadata: json(e),
      created_at: cleanDate(e.created_at) ?? undefined,
      updated_at: cleanDate(e.updated_at) ?? undefined,
    });
  }

  const leads = asArray(await readJson(ctx, "leads.json", { leads: [] }), "leads");
  for (const lead of leads) {
    await upsert(ctx, "leads", "leads", { legacy_id: lead.id ?? null }, {
      type: lead.type ?? "unknown",
      name: lead.name ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      meta: json(lead.meta),
      status: lead.status ?? "new",
      created_at: cleanDate(lead.created_at) ?? undefined,
      updated_at: cleanDate(lead.updated_at) ?? undefined,
    });
  }

  const team = asArray(await readJson(ctx, "team.json", []));
  for (const member of team) {
    await upsert(ctx, "team", "team_members", { legacy_id: member.id ?? null }, {
      name: member.name ?? "Unnamed",
      role: member.role ?? member.position ?? null,
      bio: member.bio ?? null,
      image_url: member.image ?? member.image_url ?? null,
      email: member.email ?? null,
      phone: member.phone ?? null,
      social: json(member.social),
      order_index: num(member.order_index),
      is_active: member.is_active !== false,
    });
  }

  const logos = (await readJson(ctx, "logos.json", {})) as Record<string, unknown>;
  for (const type of ["header", "footer"] as const) {
    if (logos[type]) {
      await upsert(ctx, "logos", "logos", { type }, {
        name: `${type} logo`,
        image_url: logos[type],
        is_active: true,
        metadata: json({ lastUpdated: logos.lastUpdated ?? null }),
      });
    }
  }

  const director = (await readJson(ctx, "director-message.json", {})) as Record<string, unknown>;
  if (director.name || director.message) {
    await upsert(ctx, "director", "director_message", { id: 1 }, {
      name: director.name ?? "Director",
      title: director.title ?? null,
      message: director.message ?? null,
      image_url: director.image ?? null,
    });
  }

  const galleryPayload = (await readJson(ctx, "kailash-gallery.json", { gallery: [] })) as Record<string, unknown>;
  const gallery = asArray(galleryPayload, "gallery");
  for (const item of gallery) {
    await upsert(ctx, "kailash-gallery", "kailash_gallery", { legacy_id: item.id ?? null }, {
      title: item.title ?? null,
      image_url: item.image ?? "",
      alt: item.alt ?? null,
      grid_span: item.gridSpan ?? null,
      order_index: num(item.order),
      is_active: item.isActive !== false,
      uploaded_at: cleanDate(item.uploadedAt),
      metadata: json({ page: galleryPayload.metadata ?? null }),
    });
  }
}

function printSummary(ctx: ImportContext) {
  for (const [entity, counts] of Object.entries(ctx.counts)) {
    console.log(
      `${entity}: inserted=${counts.inserted} updated=${counts.updated} skipped=${counts.skipped} warnings=${counts.warnings} errors=${counts.errors}`,
    );
  }
}

async function main() {
  const mode = parseMode();
  const ctx: ImportContext = {
    dataDir: process.env.ZEO_LEGACY_DATA_DIR || defaultDataDir,
    ...mode,
    counts: {},
  };

  console.log(`mode: ${ctx.dryRun ? "dry-run" : ctx.reset ? "reset-and-apply" : "apply"}`);
  console.log(`data: ${ctx.dataDir}`);

  if (ctx.apply) {
    const { pool } = await import("../db/mysql");
    const connection = await pool.getConnection();
    ctx.connection = connection;
    try {
      if (ctx.reset) await resetData(ctx);
      await connection.beginTransaction();
      await importDestinations(ctx);
      await importActivities(ctx);
      await importTours(ctx);
      await importPosts(ctx);
      await importSimpleEntities(ctx);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      await pool.end();
    }
  } else {
    await importDestinations(ctx);
    await importActivities(ctx);
    await importTours(ctx);
    await importPosts(ctx);
    await importSimpleEntities(ctx);
  }

  printSummary(ctx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
