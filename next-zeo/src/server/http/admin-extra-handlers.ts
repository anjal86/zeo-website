import { z } from "zod";
import { execute } from "@/server/db/mysql";
import { requireAdmin } from "@/server/auth/require-admin";
import { badRequest, created, ok, serverError } from "@/server/http/api-response";
import { getContactSettings } from "@/server/repositories/content";
import { getDirectorMessage, listLogos, listTeam } from "@/server/repositories/company";
import { bool, insert, json, num, update, updateStatusTable } from "@/server/repositories/mutations";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const optionalString = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().trim().max(1024).optional());
const optionalBoolean = z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal(0), z.literal(1)]).optional();
const optionalRecord = z.record(z.string(), z.unknown()).optional();
const optionalNonnegativeInt = z.coerce.number().int().min(0).optional();

const sliderSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  subtitle: optionalString(1000),
  location: optionalString(255),
  image: optionalUrl,
  image_url: optionalUrl,
  video: optionalUrl,
  video_url: optionalUrl,
  video_start_time: z.coerce.number().min(0).max(86_400).optional(),
  button_text: optionalString(120),
  button_url: optionalString(1024),
  button_style: z.enum(["primary", "secondary", "outline"]).optional(),
  show_button: optionalBoolean,
  order_index: optionalNonnegativeInt,
  is_active: optionalBoolean,
  metadata: optionalRecord,
}).passthrough();

const testimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  email: optionalString(255),
  country: optionalString(120),
  tour: optionalString(255),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: optionalString(255),
  message: z.string().trim().min(1, "Message is required").max(5000),
  image: optionalUrl,
  image_url: optionalUrl,
  is_approved: optionalBoolean,
  is_featured: optionalBoolean,
}).passthrough();

const contactSchema = z.record(z.string(), z.unknown()).refine((value) => Object.keys(value).length > 0, "Contact settings cannot be empty");

const directorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  title: optionalString(255),
  message: z.string().trim().min(1, "Message is required").max(20_000),
  image: optionalUrl,
  image_url: optionalUrl,
}).passthrough();

const teamSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  role: optionalString(255),
  position: optionalString(255),
  bio: z.string().max(10_000).optional(),
  image: optionalUrl,
  image_url: optionalUrl,
  email: optionalString(255),
  phone: optionalString(80),
  social: optionalRecord,
  order_index: optionalNonnegativeInt,
  is_active: optionalBoolean,
}).passthrough();

const teamOrderSchema = z.array(z.object({
  id: z.coerce.number().int().positive(),
  order_index: z.coerce.number().int().min(0),
})).min(1);

const logosSchema = z.record(z.string().trim().min(1).max(80), z.string().trim().max(1024));

const leadStatusSchema = z.object({
  status: z.string().trim().min(1).max(80),
}).passthrough();

const enquiryStatusSchema = z.object({
  status: z.string().trim().min(1).max(80).optional(),
  assigned_to: optionalString(255),
  notes: z.string().max(20_000).optional(),
}).refine((value) => value.status || value.assigned_to || value.notes !== undefined, "At least one update field is required").passthrough();

const gallerySchema = z.object({
  title: optionalString(255),
  image: optionalUrl,
  image_url: optionalUrl,
  alt: optionalString(500),
  gridSpan: optionalString(120),
  grid_span: optionalString(120),
  order: optionalNonnegativeInt,
  order_index: optionalNonnegativeInt,
  isActive: optionalBoolean,
  is_active: optionalBoolean,
  metadata: optionalRecord,
}).refine((value) => Boolean(value.image || value.image_url), { message: "Image is required", path: ["image"] }).passthrough();

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

export async function adminUpsertSliderValidated(request: Request, id?: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = sliderSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid slider payload", parsed.error.flatten());

    const data = parsed.data;
    const row = {
      title: data.title,
      subtitle: data.subtitle ?? null,
      location: data.location ?? null,
      image_url: data.image ?? data.image_url ?? null,
      video_url: data.video ?? data.video_url ?? null,
      video_start_time: data.video_start_time ?? null,
      button_text: data.button_text ?? null,
      button_url: data.button_url ?? null,
      button_style: data.button_style ?? null,
      show_button: bool(data.show_button),
      order_index: num(data.order_index),
      is_active: data.is_active === undefined ? true : bool(data.is_active),
      metadata: json(data.metadata),
    };
    if (id) await update("sliders", Number(id), row);
    else await insert("sliders", row);
    return id ? ok({ success: true }) : created({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpdateTestimonialValidated(request: Request, id: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid testimonial payload", parsed.error.flatten());

    const data = parsed.data;
    await update("testimonials", Number(id), {
      name: data.name,
      email: data.email ?? null,
      country: data.country ?? null,
      tour: data.tour ?? null,
      rating: data.rating ?? 5,
      title: data.title ?? null,
      message: data.message,
      image_url: data.image ?? data.image_url ?? null,
      is_approved: data.is_approved === undefined ? undefined : bool(data.is_approved),
      is_featured: data.is_featured === undefined ? undefined : bool(data.is_featured),
    });
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpdateContactValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid contact settings payload", parsed.error.flatten());
    await execute(
      `INSERT INTO contact_settings (setting_key, payload) VALUES ('default', ?)
       ON DUPLICATE KEY UPDATE payload = VALUES(payload)`,
      [JSON.stringify(parsed.data)],
    );
    return ok(await getContactSettings());
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpdateDirectorValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = directorSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid director message payload", parsed.error.flatten());
    const existing = await getDirectorMessage() as { id?: number };
    const data = {
      name: parsed.data.name,
      title: parsed.data.title ?? null,
      message: parsed.data.message,
      image_url: parsed.data.image ?? parsed.data.image_url ?? null,
    };
    if (existing.id) await update("director_message", existing.id, data);
    else await insert("director_message", data);
    return ok(await getDirectorMessage());
  } catch (error) {
    return serverError(error);
  }
}

export async function adminTeamCreateValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = teamSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid team member payload", parsed.error.flatten());
    const data = parsed.data;
    await insert("team_members", {
      name: data.name,
      role: data.role ?? data.position ?? null,
      bio: data.bio ?? null,
      image_url: data.image ?? data.image_url ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      social: json(data.social),
      order_index: num(data.order_index),
      is_active: data.is_active === undefined ? true : bool(data.is_active),
    });
    return created({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminTeamUpdateValidated(request: Request, id: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = teamSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid team member payload", parsed.error.flatten());
    const data = parsed.data;
    await update("team_members", Number(id), {
      name: data.name,
      role: data.role ?? data.position ?? null,
      bio: data.bio ?? null,
      image_url: data.image ?? data.image_url ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      social: data.social === undefined ? undefined : json(data.social),
      order_index: data.order_index,
      is_active: data.is_active === undefined ? undefined : bool(data.is_active),
    });
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminTeamOrderValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => null);
    const parsed = teamOrderSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid team order payload", parsed.error.flatten());
    for (const item of parsed.data) await update("team_members", item.id, { order_index: item.order_index });
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminLogosPutValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = logosSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid logos payload", parsed.error.flatten());
    for (const [type, value] of Object.entries(parsed.data)) {
      if (!value) continue;
      await execute(
        `INSERT INTO logos (type, name, image_url, is_active) VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), is_active = 1`,
        [type, `${type} logo`, value],
      );
    }
    return ok(await listLogos(true));
  } catch (error) {
    return serverError(error);
  }
}

export async function adminLeadUpdateValidated(request: Request, id: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = leadStatusSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid lead update payload", parsed.error.flatten());
    await updateStatusTable("leads", Number(id), parsed.data);
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminEnquiryUpdateValidated(request: Request, id: string) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = enquiryStatusSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid enquiry update payload", parsed.error.flatten());
    await updateStatusTable("enquiries", Number(id), parsed.data);
    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminGalleryCreateValidated(request: Request) {
  const denied = await requireAdminOrResponse();
  if (denied) return denied;

  try {
    const body = await readJson(request);
    if (!body) return badRequest("Invalid JSON body");
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid gallery payload", parsed.error.flatten());
    const data = parsed.data;
    await insert("kailash_gallery", {
      title: data.title ?? null,
      image_url: data.image ?? data.image_url,
      alt: data.alt ?? null,
      grid_span: data.gridSpan ?? data.grid_span ?? null,
      order_index: num(data.order ?? data.order_index),
      is_active: data.isActive === undefined && data.is_active === undefined ? true : bool(data.isActive ?? data.is_active),
      metadata: json(data.metadata),
    });
    return created({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
