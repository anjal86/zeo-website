import { adminDeleteActivity, adminOnly } from "@/server/http/mutation-handlers";
import { adminUpsertActivityValidated } from "@/server/http/admin-content-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const activity = await getOne("SELECT * FROM activities WHERE id = ?", [Number(id)]);
  if (!activity) return notFound();
  return ok(activity);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminUpsertActivityValidated(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteActivity(id);
}
