import { execute, getAll } from "@/server/db/mysql";
import { parseJsonObject } from "@/server/db/json";
import type { StoredUpload } from "@/server/storage/storage-service";
import { iso } from "./types";

type UploadedFileRow = import("mysql2/promise").RowDataPacket & {
  id: number;
  storage_driver: "local" | "s3";
  entity_type: string | null;
  entity_id: number | null;
  field_name: string | null;
  original_name: string;
  file_name: string;
  stored_name: string | null;
  mime_type: string;
  extension: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  public_url: string;
  storage_path: string;
  alt_text: string | null;
  metadata: unknown;
  created_at: Date | string;
  updated_at: Date | string;
};

export function serializeUploadedFile(row: UploadedFileRow) {
  return {
    id: row.id,
    storage_driver: row.storage_driver,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    field_name: row.field_name,
    original_name: row.original_name,
    file_name: row.file_name,
    stored_name: row.stored_name ?? row.file_name,
    mime_type: row.mime_type,
    extension: row.extension,
    size_bytes: row.size_bytes,
    width: row.width,
    height: row.height,
    public_url: row.public_url,
    url: row.public_url,
    path: row.public_url,
    storage_path: row.storage_path,
    alt_text: row.alt_text,
    metadata: parseJsonObject(row.metadata),
    created_at: iso(row.created_at),
    updated_at: iso(row.updated_at),
  };
}

export async function createUploadedFileRecord(upload: StoredUpload, metadata: Record<string, unknown> = {}) {
  const result = await execute<import("mysql2/promise").ResultSetHeader>(
    `INSERT INTO uploaded_files
      (storage_driver, entity_type, entity_id, field_name, original_name, file_name, stored_name,
       mime_type, extension, size_bytes, width, height, public_url, storage_path, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      upload.storageDriver,
      upload.entityType,
      upload.entityId,
      upload.fieldName,
      upload.originalName,
      upload.fileName,
      upload.storedName,
      upload.mimeType,
      upload.extension,
      upload.sizeBytes,
      upload.width,
      upload.height,
      upload.publicUrl,
      upload.storagePath,
      JSON.stringify(metadata),
    ],
  );
  const rows = await getAll<UploadedFileRow>("SELECT * FROM uploaded_files WHERE id = ?", [result.insertId]);
  return serializeUploadedFile(rows[0]);
}

export async function listUploadedFiles(entityType?: string | null, entityId?: number | null) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (entityType) {
    clauses.push("entity_type = ?");
    params.push(entityType);
  }
  if (entityId) {
    clauses.push("entity_id = ?");
    params.push(entityId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await getAll<UploadedFileRow>(`SELECT * FROM uploaded_files ${where} ORDER BY created_at DESC`, params);
  return rows.map(serializeUploadedFile);
}

export async function deleteUploadedFileRecord(id: number) {
  await execute("DELETE FROM uploaded_files WHERE id = ?", [id]);
}
