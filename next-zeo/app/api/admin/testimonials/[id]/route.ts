import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpdateTestimonialValidated } from "@/server/http/admin-extra-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const testimonial = await getOne("SELECT * FROM testimonials WHERE id = ?", [Number(id)]);
  if (!testimonial) return notFound();
  return ok(testimonial);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpdateTestimonialValidated(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("testimonials", id, "Testimonial");
}
