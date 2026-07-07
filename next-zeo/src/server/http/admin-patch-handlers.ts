import { z } from "zod";
import { auditMutation } from "./audit-helper";
import { requireAdmin } from "@/server/auth/require-admin";
import { badRequest, created, ok, serverError } from "@/server/http/api-response";
import { bool, insert, resolveByIdentifier, update } from "@/server/repositories/mutations";
import { listTestimonials } from "@/server/repositories/content";

const optionalBoolean = z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]);

const sliderPatchSchema = z.object({
  is_active: optionalBoolean,
});

const activityPatchSchema = z.object({
  is_active: optionalBoolean,
});

const destinationPatchSchema = z.object({
  listed: optionalBoolean,
});

const teamPatchSchema = z.object({
  is_active: optionalBoolean,
});

const testimonialCreateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional(),
  tour: z.string().trim().max(255).optional(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  title: z.string().trim().max(255).optional(),
  message: z.string().trim().min(1).max(5000),
  image: z.string().trim().max(1024).optional(),
  image_url: z.string().trim().max(1024).optional(),
  is_approved: optionalBoolean.optional(),
  is_featured: optionalBoolean.optional(),
});

async function requireAdminSession() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  return admin.user;
}

async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function paginationPayload<T>(key: string, items: T[], page: number, limit: number, totalItems: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    [key]: items,
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

export async function adminListTestimonialsPaginated(request: Request) {
  const admin = await requireAdminSession();
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "20", 10)));
  const search = (url.searchParams.get("search") || "").trim().toLowerCase();
  const approved = url.searchParams.get("is_approved");

  let rows = await listTestimonials(true);

  if (search) {
    rows = rows.filter((item) => [item.name, item.country, item.tour, item.title, item.message]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search)));
  }

  if (approved === "1" || approved === "true") rows = rows.filter((item) => item.is_approved === true);
  if (approved === "0" || approved === "false") rows = rows.filter((item) => item.is_approved === false);

  const total = rows.length;
  const start = (page - 1) * limit;
  return ok(paginationPayload("testimonials", rows.slice(start, start + limit), page, limit, total));
}

export async function adminCreateTestimonialValidated(request: Request) {
  const admin = await requireAdminSession();
  if (admin instanceof Response) return admin;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = testimonialCreateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid testimonial payload", parsed.error.flatten());
    const data = parsed.data;
    const row = {
      name: data.name,
      email: data.email || null,
      country: data.country || null,
      tour: data.tour || null,
      rating: data.rating,
      title: data.title || null,
      message: data.message,
      image_url: data.image ?? data.image_url ?? null,
      is_approved: data.is_approved === undefined ? true : bool(data.is_approved),
      is_featured: data.is_featured === undefined ? false : bool(data.is_featured),
    };
    const id = await insert("testimonials", row);
    await auditMutation(request, admin, "CREATE", "TESTIMONIAL", id, undefined, row);
    return created({ success: true, id });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminPatchSliderStatus(request: Request, id: string) {
  const admin = await requireAdminSession();
  if (admin instanceof Response) return admin;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = sliderPatchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid slider patch payload", parsed.error.flatten());
    const isActive = bool(parsed.data.is_active);
    const resolvedId = await resolveByIdentifier("sliders", id);
    if (!resolvedId) return badRequest("Slider not found");
    await update("sliders", resolvedId, { is_active: isActive });
    await auditMutation(request, admin, "UPDATE", "SLIDER", resolvedId, undefined, { is_active: isActive });
    return ok({ success: true, is_active: isActive });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminPatchActivityStatus(request: Request, id: string) {
  const admin = await requireAdminSession();
  if (admin instanceof Response) return admin;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = activityPatchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid activity patch payload", parsed.error.flatten());
    const isActive = bool(parsed.data.is_active);
    const resolvedId = await resolveByIdentifier("activities", id);
    if (!resolvedId) return badRequest("Activity not found");
    await update("activities", resolvedId, { is_active: isActive });
    await auditMutation(request, admin, "UPDATE", "ACTIVITY_STATUS", resolvedId, undefined, { is_active: isActive });
    return ok({ success: true, is_active: isActive });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminPatchDestinationListed(request: Request, identifier: string) {
  const admin = await requireAdminSession();
  if (admin instanceof Response) return admin;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = destinationPatchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid destination patch payload", parsed.error.flatten());
    const listed = bool(parsed.data.listed);
    const resolvedId = await resolveByIdentifier("destinations", identifier);
    if (!resolvedId) return badRequest("Destination not found");
    await update("destinations", resolvedId, { listed });
    await auditMutation(request, admin, "UPDATE", "DESTINATION_LISTING", resolvedId, undefined, { listed });
    return ok({ success: true, listed });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminPatchTeamStatus(request: Request, id: string) {
  const admin = await requireAdminSession();
  if (admin instanceof Response) return admin;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = teamPatchSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid team patch payload", parsed.error.flatten());
    const isActive = bool(parsed.data.is_active);
    const resolvedId = await resolveByIdentifier("team_members", id);
    if (!resolvedId) return badRequest("Team member not found");
    await update("team_members", resolvedId, { is_active: isActive });
    await auditMutation(request, admin, "UPDATE", "TEAM_MEMBER_STATUS", resolvedId, undefined, { is_active: isActive });
    return ok({ success: true, is_active: isActive });
  } catch (error) {
    return serverError(error);
  }
}
