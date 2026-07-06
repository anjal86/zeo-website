import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminLeadUpdateValidated } from "@/server/http/admin-extra-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const lead = await getOne("SELECT * FROM leads WHERE id = ?", [Number(id)]);
  if (!lead) return notFound();
  return ok(lead);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminLeadUpdateValidated(request, id);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple(request, "leads", id, "Lead");
}
