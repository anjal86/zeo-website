import { z } from "zod";
import { requireAdmin } from "@/server/auth/require-admin";
import { badRequest, created, ok, serverError } from "@/server/http/api-response";
import { upsertActivity, upsertDestination, upsertPost } from "@/server/repositories/mutations";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const optionalString = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalSlug = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens")
    .optional(),
);
const optionalStringArray = z.array(z.string().trim().max(2000)).optional();
const optionalUnknownArray = z.array(z.unknown()).optional();
const optionalUnknownRecord = z.record(z.string(), z.unknown()).optional();
const optionalBoolean = z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional();

const postPayloadSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(500),
    slug: optionalSlug,
    excerpt: optionalString(1000),
    content: z.string().max(250_000).nullable().optional(),
    image: optionalString(1024),
    image_url: optionalString(1024),
    author: optionalString(255),
    category: optionalString(120),
    tags: optionalStringArray,
    readTime: optionalString(80),
    reading_time: optionalString(80),
    featured: optionalBoolean,
    status: z.enum(["draft", "published"]).optional(),
    seo: optionalUnknownRecord,
    date: optionalString(80),
  })
  .passthrough();

const destinationPayloadSchema = z
  .object({
    name: optionalString(255),
    title: optionalString(500),
    slug: optionalSlug,
    country: optionalString(120),
    region: optionalString(120),
    type: z.enum(["nepal", "international"]).optional(),
    image: optionalString(1024),
    image_url: optionalString(1024),
    description: z.string().max(100_000).nullable().optional(),
    highlights: optionalStringArray,
    bestTime: optionalString(255),
    best_time: optionalString(255),
    altitude: optionalString(120),
    difficulty: optionalString(100),
    href: optionalString(1024),
    relatedTours: optionalUnknownArray,
    related_tours: optionalUnknownArray,
    relatedActivities: optionalUnknownArray,
    related_activities: optionalUnknownArray,
    gallery: optionalUnknownArray,
    seo: optionalUnknownRecord,
    metadata: optionalUnknownRecord,
    featured: optionalBoolean,
    listed: optionalBoolean,
  })
  .refine((value) => Boolean(value.name || value.title), { message: "Name or title is required", path: ["name"] })
  .passthrough();

const activityPayloadSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(255),
    slug: optionalSlug,
    type: optionalString(120),
    image: optionalString(1024),
    image_url: optionalString(1024),
    description: z.string().max(100_000).nullable().optional(),
    highlights: optionalStringArray,
    difficulty: optionalString(100),
    bestTime: optionalString(255),
    best_time: optionalString(255),
    duration: optionalString(120),
    popularDestinations: optionalUnknownArray,
    popular_destinations: optionalUnknownArray,
    relatedTours: optionalUnknownArray,
    related_tours: optionalUnknownArray,
    relatedDestinations: optionalUnknownArray,
    related_destinations: optionalUnknownArray,
    metadata: optionalUnknownRecord,
    featured: optionalBoolean,
    is_active: optionalBoolean,
  })
  .passthrough();

async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function requireAdminOrResponse() {
  const admin = await requireAdmin();
  return admin.ok ? null : admin.response;
}

export async function adminUpsertPostValidated(request: Request, id?: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");

    const parsed = postPayloadSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid post payload", parsed.error.flatten());

    const post = await upsertPost(id ?? null, parsed.data);
    return id ? ok(post) : created(post);
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpsertDestinationValidated(request: Request, identifier?: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");

    const parsed = destinationPayloadSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid destination payload", parsed.error.flatten());

    const destination = await upsertDestination(identifier ?? null, parsed.data);
    return identifier ? ok(destination) : created(destination);
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpsertActivityValidated(request: Request, identifier?: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");

    const parsed = activityPayloadSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid activity payload", parsed.error.flatten());

    const activity = await upsertActivity(identifier ?? null, parsed.data);
    return identifier ? ok(activity) : created(activity);
  } catch (error) {
    return serverError(error);
  }
}
