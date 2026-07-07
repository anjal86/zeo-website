import { adminDeleteActivity, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpsertActivityValidated } from "@/server/http/admin-content-handlers";
import { adminPatchActivityStatus } from "@/server/http/admin-patch-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const parsed = Number(id);
  const activity = await getOne("SELECT * FROM activities WHERE id = ? OR legacy_id = ?", [parsed, parsed]);
  if (!activity) return notFound();
  return ok(activity);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpsertActivityValidated(request, id);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminPatchActivityStatus(request, id);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteActivity(request, id);
}
