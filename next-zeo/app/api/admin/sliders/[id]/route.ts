import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpsertSliderValidated } from "@/server/http/admin-extra-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const slider = await getOne("SELECT * FROM sliders WHERE id = ?", [Number(id)]);
  if (!slider) return notFound();
  return ok(slider);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpsertSliderValidated(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("sliders", id, "Slider");
}
