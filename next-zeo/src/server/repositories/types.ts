import type { RowDataPacket } from "mysql2/promise";

export type ListOptions = {
  search?: string | null;
  featured?: string | null;
  listed?: string | null;
  category?: string | null;
  location?: string | null;
  country?: string | null;
  type?: string | null;
  status?: string | null;
  page?: string | null;
  limit?: string | null;
  includeUnlisted?: string | null;
};

export type ListResult<T> = {
  items: T[];
  total: number;
};

export type BaseRow = RowDataPacket & {
  id: number;
  legacy_id: number | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
};

export function bool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export function iso(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
