import { z } from "zod";
import { createTour, updateTour } from "@/server/repositories/mutations";
import { requireAdmin } from "@/server/auth/require-admin";
import { badRequest, created, notFound, ok, serverError } from "@/server/http/api-response";

const optionalString = (max: number) => z.string().trim().max(max).nullable().optional();
const optionalNumber = z.coerce.number().finite().min(0).nullable().optional();
const optionalInteger = z.coerce.number().int().min(0).nullable().optional();
const optionalStringArray = z.array(z.string().trim().max(2000)).optional();
const optionalUnknownArray = z.array(z.unknown()).optional();
const optionalUnknownRecord = z.record(z.string(), z.unknown()).optional();

const tourPayloadSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(500),
    slug: z
      .string()
      .trim()
      .max(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens")
      .optional(),
    category: optionalString(120),
    location: optionalString(255),
    description: z.string().max(100_000).nullable().optional(),
    price: optionalNumber,
    originalPrice: optionalNumber,
    original_price: optionalNumber,
    discountPercentage: z.coerce.number().finite().min(0).max(100).nullable().optional(),
    discount_percentage: z.coerce.number().finite().min(0).max(100).nullable().optional(),
    duration: optionalString(120),
    duration_days: optionalInteger,
    group_size: optionalString(120),
    groupSize: optionalString(120),
    difficulty: optionalString(100),
    rating: z.coerce.number().finite().min(0).max(5).nullable().optional(),
    reviews: optionalInteger,
    best_time: optionalString(255),
    bestTime: optionalString(255),
    image: optionalString(1024),
    image_url: optionalString(1024),
    gallery: optionalUnknownArray,
    highlights: optionalStringArray,
    inclusions: optionalStringArray,
    exclusions: optionalStringArray,
    activities: optionalUnknownArray,
    itinerary: optionalUnknownArray,
    fitness_requirements: optionalUnknownArray,
    related_destinations: optionalUnknownArray,
    related_activities: optionalUnknownArray,
    tags: optionalStringArray,
    seo: optionalUnknownRecord,
    metadata: optionalUnknownRecord,
    primary_destination_id: optionalInteger,
    secondary_destination_ids: z.array(z.coerce.number().int().positive()).optional(),
    activity_ids: z.array(z.coerce.number().int().positive()).optional(),
    featured: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional(),
    listed: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional(),
    priceAvailable: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional(),
    price_available: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional(),
    hasDiscount: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional(),
    has_discount: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional(),
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

export async function adminCreateTourValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");

    const parsed = tourPayloadSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid tour payload", parsed.error.flatten());

    return created(await createTour(parsed.data));
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpdateTourValidated(request: Request, id: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const parsedId = Number.parseInt(id, 10);
    if (!Number.isFinite(parsedId)) return badRequest("Invalid tour id");

    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");

    const parsed = tourPayloadSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid tour payload", parsed.error.flatten());

    const tour = await updateTour(parsedId, parsed.data);
    return tour ? ok(tour) : notFound("Tour not found");
  } catch (error) {
    return serverError(error);
  }
}
