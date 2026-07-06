import { forbidden, unauthorized } from "@/server/http/api-response";
import { getAdminSession } from "./session";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;
export type AdminRole = AdminSession["role"];
export type AuthResult = { ok: true; user: AdminSession } | { ok: false; response: Response };

export async function requireAuth(): Promise<AuthResult> {
  const user = await getAdminSession();
  if (!user) return { ok: false, response: unauthorized() };
  return { ok: true, user };
}

export async function requireRole(roles: AdminRole[]): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  if (!roles.includes(auth.user.role)) return { ok: false, response: forbidden("Insufficient permissions") };
  return auth;
}

export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(["admin"]);
}
