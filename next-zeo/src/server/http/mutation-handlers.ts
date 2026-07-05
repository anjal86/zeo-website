import { z } from "zod";
import { execute, getOne } from "@/server/db/mysql";
import { requireAdmin } from "@/server/auth/require-admin";
import { badRequest, created, notFound, ok, serverError } from "@/server/http/api-response";
import { checkRateLimit, getClientIp } from "@/server/auth/rate-limit";
import { createUploadedFileRecord } from "@/server/repositories/uploads";
import { saveUpload, type StorageFolder } from "@/server/storage/storage-service";
import { listTours, getTourByLegacyId, getTourBySlug } from "@/server/repositories/tours";
import { listDestinations, getDestinationBySlug, listActivities } from "@/server/repositories/catalog";
import { listPosts, listSliders, listTestimonials, getContactSettings } from "@/server/repositories/content";
import { getDirectorMessage, listKailashGallery, listLogos, listTeam } from "@/server/repositories/company";
import { listEnquiries, listLeads } from "@/server/repositories/admin";
import {
  bool,
  createEnquiry,
  createLead,
  createTour,
  deleteActivity,
  deleteById,
  deleteDestination,
  deletePost,
  deleteTour,
  insert,
  json,
  num,
  resolveByIdentifier,
  setTourListing,
  update,
  updateStatusTable,
  updateTour,
  upsertActivity,
  upsertDestination,
  upsertPost,
} from "@/server/repositories/mutations";
import { adminList, searchParams } from "./route-utils";

const publicText = z.string().trim().min(1).max(5000);
const email = z.string().email().max(255);

export async function adminOnly() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  return null;
}

export async function requireJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export async function uploadHandler(request: Request, options: { folder: StorageFolder; slugField?: string; entityType?: string }) {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    const form = await request.formData();
    const file = form.get("file") ?? form.get("image") ?? form.get("mediaFile");
    if (!(file instanceof File)) return badRequest("No file uploaded");
    const slug = String(form.get(options.slugField ?? "slug") ?? form.get("destinationSlug") ?? form.get("tourSlug") ?? "");
    const entityId = Number(form.get("entityId") ?? form.get("id") ?? 0) || null;
    const fieldName = String(form.get("fieldName") ?? form.get("field") ?? "image");
    const stored = await saveUpload(file, {
      folder: options.folder,
      slug,
      entityType: options.entityType ?? options.folder,
      entityId,
      fieldName,
    });
    const record = await createUploadedFileRecord(stored, { slug });
    return created({
      success: true,
      url: record.public_url,
      path: record.public_url,
      filename: record.stored_name,
      file: record,
      storage: {
        driver: record.storage_driver,
        key: record.storage_path,
      },
    });
  } catch (error) {
    return badRequest((error as Error).message || "Upload failed");
  }
}

export async function publicEnquiry(request: Request) {
  const limited = checkRateLimit(`enquiry:${getClientIp(request)}`, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limited.allowed) return Response.json({ error: "Too many submissions" }, { status: 429 });
  try {
    const schema = z.object({
      name: publicText.max(255),
      email,
      phone: z.string().trim().max(80).optional(),
      subject: z.string().trim().max(255).optional(),
      message: publicText,
      tour_id: z.coerce.number().optional(),
      tour_name: z.string().trim().max(500).optional(),
      tour_title: z.string().trim().max(500).optional(),
      destination: z.string().trim().max(255).optional(),
      number_of_people: z.string().trim().max(80).optional(),
      travelers: z.string().trim().max(80).optional(),
      travel_date: z.string().trim().optional(),
      date: z.string().trim().optional(),
    });
    const parsed = schema.safeParse(await requireJson(request));
    if (!parsed.success) return badRequest("Invalid enquiry payload", parsed.error.flatten());
    const id = await createEnquiry(parsed.data);
    return created({ success: true, message: "Enquiry submitted successfully", enquiry: { id }, id });
  } catch (error) {
    return serverError(error);
  }
}

export async function publicLead(request: Request) {
  const limited = checkRateLimit(`lead:${getClientIp(request)}`, { limit: 12, windowMs: 15 * 60 * 1000 });
  if (!limited.allowed) return Response.json({ error: "Too many submissions" }, { status: 429 });
  try {
    const schema = z.object({
      type: z.string().trim().min(1).max(120),
      name: z.string().trim().max(255).optional(),
      email,
      phone: z.string().trim().max(80).optional(),
      destination: z.string().trim().max(255).optional(),
      tour: z.string().trim().max(255).optional(),
      message: z.string().trim().max(2000).optional(),
      meta: z.record(z.string(), z.unknown()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    });
    const parsed = schema.safeParse(await requireJson(request));
    if (!parsed.success) return badRequest("Invalid lead payload", parsed.error.flatten());
    const id = await createLead(parsed.data);
    return created({ success: true, id });
  } catch (error) {
    return serverError(error);
  }
}

export async function publicTestimonial(request: Request) {
  const limited = checkRateLimit(`testimonial:${getClientIp(request)}`, { limit: 4, windowMs: 60 * 60 * 1000 });
  if (!limited.allowed) return Response.json({ error: "Too many submissions" }, { status: 429 });
  try {
    const schema = z.object({
      name: publicText.max(255),
      email: email.optional(),
      country: z.string().trim().max(120).optional(),
      tour: z.string().trim().max(255).optional(),
      rating: z.coerce.number().int().min(1).max(5).default(5),
      title: z.string().trim().max(255).optional(),
      message: publicText.max(3000),
      image: z.string().trim().max(1024).optional(),
    });
    const parsed = schema.safeParse(await requireJson(request));
    if (!parsed.success) return badRequest("Invalid testimonial payload", parsed.error.flatten());
    const id = await insert("testimonials", {
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      country: parsed.data.country ?? null,
      tour: parsed.data.tour ?? null,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      message: parsed.data.message,
      image_url: parsed.data.image ?? null,
      is_approved: false,
      is_featured: false,
    });
    return created({ success: true, message: "Testimonial submitted for review", id });
  } catch (error) {
    return serverError(error);
  }
}

export async function adminToursExport(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const result = await listTours(searchParams(request), true);
  return ok(result.items);
}

export async function adminTourExport(id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const parsed = Number.parseInt(id, 10);
  const tour = Number.isFinite(parsed) ? await getTourByLegacyId(parsed, true) : null;
  return tour ? ok(tour) : notFound("Tour not found");
}

export async function adminTourBySlug(slug: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const tour = await getTourBySlug(slug, true);
  return tour ? ok(tour) : notFound("Tour not found");
}

export async function adminCreateTour(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    const body = await requireJson(request);
    if (!body.title) return badRequest("Title is required");
    return created(await createTour(body));
  } catch (error) {
    return serverError(error);
  }
}

export async function adminUpdateTour(request: Request, id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    const parsed = Number.parseInt(id, 10);
    const tour = await updateTour(parsed, await requireJson(request));
    return tour ? ok(tour) : notFound("Tour not found");
  } catch (error) {
    return serverError(error);
  }
}

export async function adminDeleteTour(id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const okDelete = await deleteTour(Number.parseInt(id, 10));
  return okDelete ? ok({ message: "Tour deleted successfully" }) : notFound("Tour not found");
}

export async function adminPatchTourListing(request: Request, id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  if (typeof body.listed !== "boolean") return badRequest("Listed status must be a boolean value");
  const tour = await setTourListing(Number.parseInt(id, 10), body.listed);
  return tour ? ok(tour) : notFound("Tour not found");
}

export async function adminGetDestination(identifier: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const destination = await getDestinationBySlug(identifier, true);
  if (destination) return ok(destination);
  const id = await resolveByIdentifier("destinations", identifier);
  return id ? ok((await listDestinations({ includeUnlisted: "true", limit: "100" }, true)).items.find((item) => item.db_id === id)) : notFound("Destination not found");
}

export async function adminUpsertDestination(request: Request, identifier?: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    const destination = await upsertDestination(identifier ?? null, await requireJson(request));
    return identifier ? ok(destination) : created(destination);
  } catch (error) {
    return serverError(error);
  }
}

export async function adminDeleteDestination(identifier: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  return (await deleteDestination(identifier)) ? ok({ message: "Destination deleted successfully" }) : notFound("Destination not found");
}

export async function adminUpsertActivity(request: Request, identifier?: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    const activity = await upsertActivity(identifier ?? null, await requireJson(request));
    return identifier ? ok(activity) : created(activity);
  } catch (error) {
    return serverError(error);
  }
}

export async function adminDeleteActivity(identifier: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  return (await deleteActivity(identifier)) ? ok({ message: "Activity deleted successfully" }) : notFound("Activity not found");
}

export async function adminGetPost(id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const row = await getOne("SELECT slug FROM posts WHERE id = ? OR legacy_id = ? LIMIT 1", [id, id]) as { slug?: string } | null;
  return row?.slug ? ok(await listPosts({ limit: "1000" }, true).then((r) => r.items.find((p) => p.slug === row.slug))) : notFound("Post not found");
}

export async function adminUpsertPost(request: Request, id?: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  try {
    const post = await upsertPost(id ?? null, await requireJson(request));
    return id ? ok(post) : created(post);
  } catch (error) {
    return serverError(error);
  }
}

export async function adminDeletePost(id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  return (await deletePost(id)) ? ok({ message: "Post deleted" }) : notFound("Post not found");
}

export async function adminListSliders() {
  const denied = await adminOnly();
  if (denied) return denied;
  return ok(await listSliders(true));
}

export async function adminUpsertSlider(request: Request, id?: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  const data = {
    title: body.title ?? "Untitled slider",
    subtitle: body.subtitle ?? null,
    location: body.location ?? null,
    image_url: body.image ?? body.image_url ?? null,
    video_url: body.video ?? body.video_url ?? null,
    video_start_time: body.video_start_time ?? null,
    button_text: body.button_text ?? null,
    button_url: body.button_url ?? null,
    button_style: body.button_style ?? null,
    show_button: bool(body.show_button),
    order_index: num(body.order_index),
    is_active: body.is_active === undefined ? true : bool(body.is_active),
    metadata: json(body.metadata),
  };
  if (id) await update("sliders", Number(id), data);
  else await insert("sliders", data);
  return id ? ok({ success: true }) : created({ success: true });
}

export async function adminDeleteSimple(
  table: "leads" | "enquiries" | "sliders" | "testimonials" | "team_members" | "kailash_gallery",
  id: string,
  label: string,
) {
  const denied = await adminOnly();
  if (denied) return denied;
  return (await deleteById(table, Number(id))) ? ok({ message: `${label} deleted successfully` }) : notFound(`${label} not found`);
}

export async function adminListTestimonials() {
  const denied = await adminOnly();
  if (denied) return denied;
  return ok(await listTestimonials(true));
}

export async function adminUpdateTestimonial(request: Request, id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  await update("testimonials", Number(id), {
    name: body.name,
    email: body.email,
    country: body.country,
    tour: body.tour,
    rating: body.rating,
    title: body.title,
    message: body.message,
    image_url: body.image ?? body.image_url,
    is_approved: body.is_approved,
    is_featured: body.is_featured,
  });
  return ok({ success: true });
}

export async function adminPatchTestimonial(id: string, field: "is_approved" | "is_featured", request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body: Record<string, unknown> = await requireJson(request).catch(() => ({}));
  const value = field === "is_approved" ? body.approved ?? body.is_approved ?? true : body.featured ?? body.is_featured ?? true;
  await update("testimonials", Number(id), { [field]: bool(value, true) });
  return ok({ success: true });
}

export async function adminUpdateContact(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  await execute(
    `INSERT INTO contact_settings (setting_key, payload) VALUES ('default', ?)
     ON DUPLICATE KEY UPDATE payload = VALUES(payload)`,
    [JSON.stringify(body)],
  );
  return ok(await getContactSettings());
}

export async function adminUpdateDirector(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  const existing = await getDirectorMessage() as { id?: number };
  const data = {
    name: body.name ?? "Director",
    title: body.title ?? null,
    message: body.message ?? null,
    image_url: body.image ?? body.image_url ?? null,
  };
  if (existing.id) await update("director_message", existing.id, data);
  else await insert("director_message", data);
  return ok(await getDirectorMessage());
}

export async function adminTeamCreate(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  await insert("team_members", {
    name: body.name ?? "Unnamed",
    role: body.role ?? body.position ?? null,
    bio: body.bio ?? null,
    image_url: body.image ?? body.image_url ?? null,
    email: body.email ?? null,
    phone: body.phone ?? null,
    social: json(body.social),
    order_index: num(body.order_index),
    is_active: body.is_active === undefined ? true : bool(body.is_active),
  });
  return created({ success: true });
}

export async function adminTeamUpdate(request: Request, id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  await update("team_members", Number(id), {
    name: body.name,
    role: body.role ?? body.position,
    bio: body.bio,
    image_url: body.image ?? body.image_url,
    email: body.email,
    phone: body.phone,
    social: body.social === undefined ? undefined : json(body.social),
    order_index: body.order_index,
    is_active: body.is_active,
  });
  return ok({ success: true });
}

export async function adminTeamOrder(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await request.json() as Array<{ id: number; order_index: number }>;
  for (const item of body) await update("team_members", item.id, { order_index: item.order_index });
  return ok({ success: true });
}

export async function adminLogosGet() {
  const denied = await adminOnly();
  if (denied) return denied;
  return ok(await listLogos(true));
}

export async function adminLogosPut(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  for (const [type, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    await execute(
      `INSERT INTO logos (type, name, image_url, is_active) VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), is_active = 1`,
      [type, `${type} logo`, value],
    );
  }
  return ok(await listLogos(true));
}

export async function adminLogoDelete(type: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  await execute("DELETE FROM logos WHERE type = ?", [type]);
  return ok({ success: true });
}

export async function adminLeadUpdate(request: Request, id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  await updateStatusTable("leads", Number(id), await requireJson(request));
  return ok({ success: true });
}

export async function adminEnquiryGet(id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const result = await listEnquiries({ limit: "1000" });
  const item = result.items.find((enquiry) => enquiry.id === Number(id) || enquiry.db_id === Number(id));
  return item ? ok(item) : notFound("Enquiry not found");
}

export async function adminEnquiryUpdate(request: Request, id: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  await updateStatusTable("enquiries", Number(id), await requireJson(request));
  return ok({ success: true });
}

export async function adminGalleryCreate(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const body = await requireJson(request);
  await insert("kailash_gallery", {
    title: body.title ?? null,
    image_url: body.image ?? body.image_url,
    alt: body.alt ?? null,
    grid_span: body.gridSpan ?? body.grid_span ?? null,
    order_index: num(body.order ?? body.order_index),
    is_active: body.isActive === undefined ? true : bool(body.isActive ?? body.is_active),
    metadata: json(body.metadata),
  });
  return created({ success: true });
}

export async function adminTourGalleryDelete(tourId: string, filename: string) {
  const denied = await adminOnly();
  if (denied) return denied;
  const tour = await getTourByLegacyId(Number(tourId), true);
  if (!tour) return notFound("Tour not found");
  const gallery = (tour.gallery as string[]).filter((url) => !url.endsWith(`/${filename}`) && url !== filename);
  await updateTour(Number(tourId), { ...tour, gallery });
  return ok({ success: true, gallery });
}

export async function adminReadList(kind: "tours" | "destinations" | "activities" | "posts" | "enquiries" | "leads", request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;
  const params = searchParams(request);
  if (kind === "tours") {
    const result = await listTours(params, true);
    return ok(adminList(request, "tours", result.items, result.total));
  }
  if (kind === "destinations") {
    const result = await listDestinations(params, true);
    return ok(adminList(request, "destinations", result.items, result.total));
  }
  if (kind === "activities") {
    const result = await listActivities(params, true);
    return ok(adminList(request, "activities", result.items, result.total));
  }
  if (kind === "posts") {
    const result = await listPosts(params, true);
    return ok(adminList(request, "posts", result.items, result.total));
  }
  if (kind === "enquiries") {
    const result = await listEnquiries(params);
    return ok(adminList(request, "enquiries", result.items, result.total));
  }
  const result = await listLeads(params);
  return ok(adminList(request, "leads", result.items, result.total));
}

export { listKailashGallery, listTeam };
