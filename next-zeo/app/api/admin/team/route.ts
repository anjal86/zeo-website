import { adminTeamCreateValidated } from "@/server/http/admin-extra-handlers";
import { listTeam, adminOnly } from "@/server/http/mutation-handlers";
import { ok } from "@/server/http/api-response";

export async function GET() {
  const denied = await adminOnly();
  if (denied) return denied;
  return ok(await listTeam(true));
}

export const POST = adminTeamCreateValidated;
