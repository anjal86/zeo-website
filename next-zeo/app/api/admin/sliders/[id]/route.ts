import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpsertSliderValidated } from "@/server/http/admin-extra-handlers";
import { adminPatchSliderStatus } from "@/server/http/admin-patch-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

async function resolveSliderId(id: string) {
  const parsed = Number(id);
  const slider = await getOne<{ id: number }>("SELECT id FROM sliders WHERE id = ? OR legacy_id = ? LIMIT 1", [parsed, parsed]);
  return slider?.id ?? null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const parsed = Number(id);
  const slider = await getOne("SELECT * FROM sliders WHERE id = ? OR legacy_id = ?", [parsed, parsed]);
  if (!slider) return notFound();
  return ok(slider);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const resolvedId = await resolveSliderId(id);
  if (!resolvedId) return notFound("Slider not found");
  return adminUpsertSliderValidated(request, String(resolvedId));
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminPatchSliderStatus(request, id);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple(request, "sliders", id, "Slider");
}
