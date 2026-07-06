import { adminDeleteSimple, adminOnly } from "@/server/http/mutation-handlers";
import { adminTeamUpdateValidated } from "@/server/http/admin-extra-handlers";
import { getOne } from "@/server/db/mysql";
import { notFound, ok } from "@/server/http/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await adminOnly();
  if (denied) return denied;
  const { id } = await context.params;
  const member = await getOne("SELECT * FROM team_members WHERE id = ?", [Number(id)]);
  if (!member) return notFound();
  return ok(member);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminTeamUpdateValidated(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("team_members", id, "Team member");
}
