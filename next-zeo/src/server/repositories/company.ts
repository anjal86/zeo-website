import { getAll, getOne } from "@/server/db/mysql";
import { parseJsonObject } from "@/server/db/json";
import type { BaseRow } from "./types";
import { bool, iso } from "./types";

type TeamRow = BaseRow & {
  name: string;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  social: unknown;
  order_index: number;
  is_active: number | boolean;
};

type LogoRow = BaseRow & {
  type: string;
  name: string | null;
  image_url: string;
  website_url: string | null;
  order_index: number;
  is_active: number | boolean;
  metadata: unknown;
};

type DirectorRow = BaseRow & {
  name: string;
  title: string | null;
  message: string | null;
  image_url: string | null;
};

type GalleryRow = BaseRow & {
  title: string | null;
  image_url: string;
  alt: string | null;
  grid_span: string | null;
  order_index: number;
  is_active: number | boolean;
  uploaded_at: Date | string | null;
  metadata: unknown;
};

export async function listTeam(admin = false) {
  const rows = await getAll<TeamRow>(
    `SELECT * FROM team_members ${admin ? "" : "WHERE is_active = 1"} ORDER BY order_index ASC, id ASC`,
  );
  return rows.map((row) => ({
    id: row.legacy_id ?? row.id,
    db_id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image: row.image_url,
    image_url: row.image_url,
    email: row.email,
    phone: row.phone,
    social: parseJsonObject(row.social),
    order_index: row.order_index,
    is_active: bool(row.is_active),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }));
}

export async function listLogos(admin = false) {
  const rows = await getAll<LogoRow>(
    `SELECT * FROM logos ${admin ? "" : "WHERE is_active = 1"} ORDER BY order_index ASC, id ASC`,
  );
  const list = rows.map((row) => ({
    id: row.id,
    type: row.type,
    name: row.name,
    image: row.image_url,
    image_url: row.image_url,
    website_url: row.website_url,
    order_index: row.order_index,
    is_active: bool(row.is_active),
    metadata: parseJsonObject(row.metadata),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  }));
  return {
    ...Object.fromEntries(list.map((logo) => [logo.type, logo.image])),
    logos: list,
  };
}

export async function getDirectorMessage() {
  const row = await getOne<DirectorRow>("SELECT * FROM director_message ORDER BY id ASC LIMIT 1");
  if (!row) return {};
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    message: row.message,
    image: row.image_url,
    image_url: row.image_url,
    updated_at: iso(row.updated_at),
  };
}

export async function listKailashGallery(admin = false) {
  const rows = await getAll<GalleryRow>(
    `SELECT * FROM kailash_gallery ${admin ? "" : "WHERE is_active = 1"} ORDER BY order_index ASC, id ASC`,
  );
  return {
    gallery: rows.map((row) => ({
      id: row.legacy_id ?? row.id,
      db_id: row.id,
      title: row.title,
      image: row.image_url,
      image_url: row.image_url,
      alt: row.alt,
      gridSpan: row.grid_span,
      grid_span: row.grid_span,
      order: row.order_index,
      order_index: row.order_index,
      isActive: bool(row.is_active),
      is_active: bool(row.is_active),
      uploadedAt: iso(row.uploaded_at),
      metadata: parseJsonObject(row.metadata),
    })),
  };
}
