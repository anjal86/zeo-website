import { adminDeleteTour, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpdateTourValidated } from "@/server/http/admin-tour-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;

  // Try to fetch by ID or slug
  const query = isNaN(Number(id))
    ? "SELECT * FROM tours WHERE slug = ?"
    : "SELECT * FROM tours WHERE id = ?";

  const tour = await getOne(query, [isNaN(Number(id)) ? id : Number(id)]);
  if (!tour) return notFound();
  return ok(tour);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpdateTourValidated(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteTour(id);
}
