import { forbidden, unauthorized } from "@/server/http/api-response";
import { getAdminSession } from "./session";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

export async function requireAdmin(): Promise<
  { ok: true; user: AdminSession } | { ok: false; response: Response }
> {
  const user = await getAdminSession();
  if (!user) return { ok: false, response: unauthorized() };
  if (!user.isAdmin) return { ok: false, response: forbidden() };
  return { ok: true, user };
}
