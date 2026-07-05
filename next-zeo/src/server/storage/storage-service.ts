import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getUploadDir, loadEnv } from "@/env";

export type StorageFolder =
  | "tours"
  | "destinations"
  | "blog"
  | "sliders"
  | "gallery"
  | "logos"
  | "general";

export type SaveUploadOptions = {
  folder: StorageFolder;
  slug?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  fieldName?: string | null;
  maxBytes?: number;
};

export type StoredUpload = {
  storageDriver: "local" | "s3";
  originalName: string;
  storedName: string;
  fileName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  storagePath: string;
  publicUrl: string;
  entityType: string | null;
  entityId: number | null;
  fieldName: string | null;
};

const imageTypes = new Map([
  ["image/jpeg", [".jpg", ".jpeg"]],
  ["image/png", [".png"]],
  ["image/webp", [".webp"]],
  ["image/gif", [".gif"]],
]);

const videoTypes = new Map([
  ["video/mp4", [".mp4"]],
  ["video/webm", [".webm"]],
  ["video/quicktime", [".mov"]],
]);

const defaultMaxBytes = 8 * 1024 * 1024;
const videoMaxBytes = 80 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 90) || "file";
}

function cleanFolder(options: SaveUploadOptions) {
  const parts: string[] = [options.folder];
  if ((options.folder === "tours" || options.folder === "destinations") && options.slug) {
    parts.push(sanitizeSegment(options.slug));
  }
  return parts;
}

function assertSafePath(root: string, target: string) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid upload path");
  }
}

function validateFile(file: File, maxBytes: number) {
  const ext = path.extname(file.name).toLowerCase();
  const imageExts = imageTypes.get(file.type);
  const videoExts = videoTypes.get(file.type);
  const allowedExts = imageExts ?? videoExts;
  if (!allowedExts || !allowedExts.includes(ext)) {
    throw new Error("Unsupported file type");
  }
  if (file.size <= 0) throw new Error("Empty file");
  const limit = videoExts ? Math.max(maxBytes, videoMaxBytes) : maxBytes;
  if (file.size > limit) throw new Error("File too large");
  return { ext, isImage: Boolean(imageExts), isVideo: Boolean(videoExts) };
}

async function processFile(file: File, maxBytes: number) {
  const validation = validateFile(file, maxBytes);
  const raw = Buffer.from(await file.arrayBuffer());
  if (!validation.isImage || file.type === "image/gif") {
    return {
      buffer: raw,
      mimeType: file.type,
      extension: validation.ext,
      width: null,
      height: null,
    };
  }

  const image = sharp(raw).rotate();
  const metadata = await image.metadata();
  const buffer = await image
    .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return {
    buffer,
    mimeType: "image/webp",
    extension: ".webp",
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}

async function saveLocal(file: File, processed: Awaited<ReturnType<typeof processFile>>, options: SaveUploadOptions) {
  const uploadRoot = path.resolve(getUploadDir());
  const folderParts = cleanFolder(options);
  const targetDir = path.join(uploadRoot, ...folderParts);
  assertSafePath(uploadRoot, targetDir);
  await fs.mkdir(targetDir, { recursive: true });

  const base = sanitizeSegment(path.basename(file.name, path.extname(file.name)));
  const nonce = crypto.randomBytes(5).toString("hex");
  const storedName = `${base}-${Date.now()}-${nonce}${processed.extension}`;
  const targetPath = path.join(targetDir, storedName);
  assertSafePath(uploadRoot, targetPath);
  await fs.writeFile(targetPath, processed.buffer, { flag: "wx" });

  const relative = path.relative(uploadRoot, targetPath).replace(/\\/g, "/");
  return {
    storagePath: relative,
    publicUrl: `/uploads/${relative}`,
    storedName,
  };
}

async function saveS3(file: File, processed: Awaited<ReturnType<typeof processFile>>, options: SaveUploadOptions) {
  const env = loadEnv();
  if (env.STORAGE_DRIVER !== "s3") throw new Error("S3 storage is not configured");
  const base = sanitizeSegment(path.basename(file.name, path.extname(file.name)));
  const storedName = `${base}-${Date.now()}-${crypto.randomBytes(5).toString("hex")}${processed.extension}`;
  const key = [...cleanFolder(options), storedName].join("/");
  const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true,
  });
  await client.send(new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: processed.buffer,
    ContentType: processed.mimeType,
  }));
  return {
    storagePath: key,
    publicUrl: `${env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "")}/${key}`,
    storedName,
  };
}

export async function saveUpload(file: File, options: SaveUploadOptions): Promise<StoredUpload> {
  const env = loadEnv();
  const maxBytes = options.maxBytes ?? defaultMaxBytes;
  const processed = await processFile(file, maxBytes);
  const saved = env.STORAGE_DRIVER === "s3"
    ? await saveS3(file, processed, options)
    : await saveLocal(file, processed, options);

  return {
    storageDriver: env.STORAGE_DRIVER,
    originalName: file.name,
    storedName: saved.storedName,
    fileName: saved.storedName,
    mimeType: processed.mimeType,
    extension: processed.extension.replace(/^\./, ""),
    sizeBytes: processed.buffer.length,
    width: processed.width,
    height: processed.height,
    storagePath: saved.storagePath,
    publicUrl: saved.publicUrl,
    entityType: options.entityType ?? null,
    entityId: options.entityId ?? null,
    fieldName: options.fieldName ?? null,
  };
}
