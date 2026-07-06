import { getAll, getOne } from "@/server/db/mysql";
import { parseJson, parseJsonArray, parseJsonObject } from "@/server/db/json";
import { getPagination } from "@/server/http/pagination";
import { sanitizeHtmlContent } from "@/server/security/sanitize-html";
import type { BaseRow, ListOptions, ListResult } from "./types";
import { bool, iso } from "./types";

type PostRow = BaseRow & {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  category: string | null;
  tags: unknown;
  reading_time: string | null;
  featured: number | boolean;
  status: "draft" | "published";
  seo: unknown;
  published_at: Date | string | null;
};

type SliderRow = BaseRow & {
  title: string;
  subtitle: string | null;
  location: string | null;
  image_url: string | null;
  video_url: string | null;
  video_start_time: number | null;
  button_text: string | null;
  button_url: string | null;
  button_style: string | null;
  show_button: number | boolean;
  order_index: number;
  is_active: number | boolean;
  metadata: unknown;
};

type TestimonialRow = BaseRow & {
  name: string;
  email: string | null;
  country: string | null;
  tour: string | null;
  rating: number;
  title: string | null;
  message: string | null;
  image_url: string | null;
  testimonial_date: Date | string | null;
  is_featured: number | boolean;
  is_approved: number | boolean;
};

function serializePost(row: PostRow, options: { sanitizeContent?: boolean } = {}) {
  const content = options.sanitizeContent ? sanitizeHtmlContent(row.content) : row.content;

  return {
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content,
    image: row.image_url,
    image_url: row.image_url,
    author: row.author,
    category: row.category,
    tags: parseJsonArray<string>(row.tags),
    readTime: row.reading_time,
    reading_time: row.reading_time,
    featured: bool(row.featured),
    status: row.status,
    seo: parseJsonObject(row.seo),
    date: iso(row.published_at),
    published_at: iso(row.published_at),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

function serializeSlider(row: SliderRow) {
  return {
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    location: row.location,
    image: row.image_url,
    video: row.video_url,
    image_url: row.image_url,
    video_url: row.video_url,
    video_start_time: row.video_start_time,
    button_text: row.button_text,
    button_url: row.button_url,
    button_style: row.button_style,
    show_button: bool(row.show_button),
    order_index: row.order_index,
    is_active: bool(row.is_active),
    metadata: parseJsonObject(row.metadata),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

function serializeTestimonial(row: TestimonialRow) {
  return {
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    name: row.name,
    email: row.email,
    country: row.country,
    tour: row.tour,
    rating: row.rating,
    title: row.title,
    message: row.message,
    image: row.image_url,
    image_url: row.image_url,
    date: iso(row.testimonial_date),
    testimonial_date: iso(row.testimonial_date),
    is_featured: bool(row.is_featured),
    is_approved: bool(row.is_approved),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

export async function listPosts(options: ListOptions = {}, admin = false): Promise<ListResult<ReturnType<typeof serializePost>>> {
  const pagination = getPagination(options);
  const clauses = admin ? [] : ["status = 'published'"];
  const params: unknown[] = [];
  if (options.category) {
    clauses.push("category = ?");
    params.push(options.category);
  }
  if (options.featured === "true") clauses.push("featured = 1");
  if (options.search) {
    clauses.push("(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)");
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(`SELECT COUNT(*) AS total FROM posts ${where}`, params);
  const rows = await getAll<PostRow>(
    `SELECT * FROM posts ${where} ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  return { items: rows.map((row) => serializePost(row, { sanitizeContent: !admin })), total: count?.total ?? 0 };
}

export async function getPostBySlug(slug: string, admin = false) {
  const row = await getOne<PostRow>(
    `SELECT * FROM posts WHERE slug = ?${admin ? "" : " AND status = 'published'"} LIMIT 1`,
    [slug],
  );
  return row ? serializePost(row, { sanitizeContent: !admin }) : null;
}

export async function listSliders(admin = false) {
  const rows = await getAll<SliderRow>(
    `SELECT * FROM sliders ${admin ? "" : "WHERE is_active = 1"} ORDER BY order_index ASC, id ASC`,
  );
  return rows.map(serializeSlider);
}

export async function listTestimonials(admin = false) {
  const rows = await getAll<TestimonialRow>(
    `SELECT * FROM testimonials ${admin ? "" : "WHERE is_approved = 1"} ORDER BY is_featured DESC, created_at DESC`,
  );
  return rows.map(serializeTestimonial);
}

export async function getContactSettings() {
  const row = await getOne<{ payload: unknown } & import("mysql2/promise").RowDataPacket>(
    "SELECT payload FROM contact_settings WHERE setting_key = 'default' LIMIT 1",
  );
  return parseJson(row?.payload, {});
}
