import { adminDeleteSimple, adminTeamUpdate } from "@/server/http/mutation-handlers";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminTeamUpdate(request, id);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return adminDeleteSimple("team_members", id, "Team member");
}
