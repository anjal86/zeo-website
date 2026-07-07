import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpdateTestimonialValidated } from "@/server/http/admin-extra-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

async function resolveTestimonialId(id: string) {
  const parsed = Number(id);
  const testimonial = await getOne<{ id: number }>("SELECT id FROM testimonials WHERE id = ? OR legacy_id = ? LIMIT 1", [parsed, parsed]);
  return testimonial?.id ?? null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const parsed = Number(id);
  const testimonial = await getOne("SELECT * FROM testimonials WHERE id = ? OR legacy_id = ?", [parsed, parsed]);
  if (!testimonial) return notFound();
  return ok(testimonial);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const resolvedId = await resolveTestimonialId(id);
  if (!resolvedId) return notFound("Testimonial not found");
  return adminUpdateTestimonialValidated(request, String(resolvedId));
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple(request, "testimonials", id, "Testimonial");
}
