import { getAll, getOne } from "@/server/db/mysql";
import { parseJsonObject } from "@/server/db/json";
import { getPagination } from "@/server/http/pagination";
import type { ListOptions, ListResult } from "./types";
import { iso } from "./types";

type DashboardCountRow = import("mysql2/promise").RowDataPacket & {
  destinations: number;
  tours: number;
  enquiries: number;
  leads: number;
  testimonials: number;
};

export async function getDashboardCounts() {
  const row = await getOne<DashboardCountRow>(`
    SELECT
      (SELECT COUNT(*) FROM destinations) AS destinations,
      (SELECT COUNT(*) FROM tours) AS tours,
      (SELECT COUNT(*) FROM enquiries) AS enquiries,
      (SELECT COUNT(*) FROM leads) AS leads,
      (SELECT COUNT(*) FROM testimonials) AS testimonials
  `);

  return {
    destinations: Number(row?.destinations ?? 0),
    tours: Number(row?.tours ?? 0),
    enquiries: Number(row?.enquiries ?? 0),
    leads: Number(row?.leads ?? 0),
    testimonials: Number(row?.testimonials ?? 0),
  };
}

type EnquiryRow = import("mysql2/promise").RowDataPacket & {
  id: number;
  legacy_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  tour_name: string | null;
  destination: string | null;
  number_of_people: string | null;
  travel_date: Date | string | null;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  metadata: unknown;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

type LeadRow = import("mysql2/promise").RowDataPacket & {
  id: number;
  legacy_id: number | null;
  type: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  meta: unknown;
  status: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

type NewsletterRow = import("mysql2/promise").RowDataPacket & {
  id: number;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export async function listEnquiries(options: ListOptions = {}): Promise<ListResult<Record<string, unknown>>> {
  const pagination = getPagination(options);
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (options.status) {
    clauses.push("status = ?");
    params.push(options.status);
  }
  if (options.search) {
    clauses.push("(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)");
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(`SELECT COUNT(*) AS total FROM enquiries ${where}`, params);
  const rows = await getAll<EnquiryRow>(
    `SELECT * FROM enquiries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  return {
    items: rows.map((row) => ({
      ...row,
      id: row.legacy_id ?? row.id,
      db_id: row.id,
      metadata: parseJsonObject(row.metadata),
      travel_date: iso(row.travel_date),
      created_at: iso(row.created_at),
      updated_at: iso(row.updated_at),
    })),
    total: count?.total ?? 0,
  };
}

export async function listLeads(options: ListOptions = {}): Promise<ListResult<Record<string, unknown>>> {
  const pagination = getPagination(options);
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (options.status) {
    clauses.push("status = ?");
    params.push(options.status);
  }
  if (options.type) {
    clauses.push("type = ?");
    params.push(options.type);
  }
  if (options.search) {
    clauses.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const term = `%${options.search}%`;
    params.push(term, term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(`SELECT COUNT(*) AS total FROM leads ${where}`, params);
  const rows = await getAll<LeadRow>(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  return {
    items: rows.map((row) => ({
      ...row,
      id: row.legacy_id ?? row.id,
      db_id: row.id,
      meta: parseJsonObject(row.meta),
      created_at: iso(row.created_at),
      updated_at: iso(row.updated_at),
    })),
    total: count?.total ?? 0,
  };
}

export async function listNewsletter(options: ListOptions = {}): Promise<ListResult<Record<string, unknown>>> {
  const pagination = getPagination(options);
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (options.status) {
    clauses.push("status = ?");
    params.push(options.status);
  }
  if (options.search) {
    clauses.push("(email LIKE ? OR name LIKE ?)");
    const term = `%${options.search}%`;
    params.push(term, term);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const count = await getOne<{ total: number } & import("mysql2/promise").RowDataPacket>(`SELECT COUNT(*) AS total FROM newsletter_subscribers ${where}`, params);
  const rows = await getAll<NewsletterRow>(
    `SELECT * FROM newsletter_subscribers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  return {
    items: rows.map((row) => ({
      ...row,
      created_at: iso(row.created_at),
      updated_at: iso(row.updated_at),
    })),
    total: count?.total ?? 0,
  };
}
