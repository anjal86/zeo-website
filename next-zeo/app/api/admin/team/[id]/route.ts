import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminTeamUpdateValidated } from "@/server/http/admin-extra-handlers";
import { adminPatchTeamStatus } from "@/server/http/admin-patch-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const parsed = Number(id);
  const member = await getOne("SELECT * FROM team_members WHERE id = ? OR legacy_id = ?", [parsed, parsed]);
  if (!member) return notFound();
  return ok(member);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminTeamUpdateValidated(request, id);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminPatchTeamStatus(request, id);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple(request, "team_members", id, "Team member");
}
