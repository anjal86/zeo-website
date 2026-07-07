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

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function formatInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, (_match, text, href) => {
      return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

function isMarkdownTable(lines: string[]) {
  return lines.length >= 2 &&
    lines[0].includes("|") &&
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[1]);
}

function markdownTableToHtml(lines: string[]) {
  const parseCells = (line: string) => line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  const headers = parseCells(lines[0]);
  const rows = lines.slice(2).map(parseCells).filter((cells) => cells.some(Boolean));

  return `<table><thead><tr>${headers.map((cell) => `<th>${formatInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_header, index) => `<td>${formatInlineMarkdown(row[index] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) return `<h3>${formatInlineMarkdown(block.slice(4).trim())}</h3>`;
      if (block.startsWith("## ")) return `<h2>${formatInlineMarkdown(block.slice(3).trim())}</h2>`;
      if (block.startsWith("# ")) return `<h2>${formatInlineMarkdown(block.slice(2).trim())}</h2>`;
      if (block.startsWith("> ")) return `<blockquote>${formatInlineMarkdown(block.replace(/^>\s*/, ""))}</blockquote>`;

      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (isMarkdownTable(lines)) return markdownTableToHtml(lines);

      const isUnorderedList = lines.length >= 1 && lines.every((line) => /^[-•]\s+/.test(line));
      if (isUnorderedList) {
        return `<ul>${lines.map((line) => `<li>${formatInlineMarkdown(line.replace(/^[-•]\s+/, ""))}</li>`).join("")}</ul>`;
      }

      const isOrderedList = lines.length >= 1 && lines.every((line) => /^\d+[.)]\s+/.test(line));
      if (isOrderedList) {
        return `<ol>${lines.map((line) => `<li>${formatInlineMarkdown(line.replace(/^\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`;
      }

      return `<p>${formatInlineMarkdown(block).replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

function normalizeBlogContent(content: string | null) {
  if (!content) return content;
  const decoded = decodeHtmlEntities(content.trim());
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(decoded);
  return hasHtmlTags ? decoded : plainTextToHtml(decoded);
}

function serializePost(row: PostRow, options: { sanitizeContent?: boolean } = {}) {
  const normalizedContent = normalizeBlogContent(row.content);
  const content = options.sanitizeContent ? sanitizeHtmlContent(normalizedContent) : normalizedContent;

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
