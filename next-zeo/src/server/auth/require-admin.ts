import { forbidden, unauthorized } from "@/server/http/api-response";
import { getAdminSession } from "./session";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;
export type AdminRole = AdminSession["role"];
export type AuthResult = { ok: true; user: AdminSession } | { ok: false; response: Response };
type SessionLoader = () => Promise<AdminSession | null>;

export async function authorizeRoles(roles: AdminRole[], loadSession: SessionLoader = getAdminSession): Promise<AuthResult> {
  const user = await loadSession();
  if (!user) return { ok: false, response: unauthorized() };
  if (!roles.includes(user.role)) return { ok: false, response: forbidden("Insufficient permissions") };
  return { ok: true, user };
}

export async function requireAuth(): Promise<AuthResult> {
  return authorizeRoles(["admin", "editor"]);
}

export async function requireRole(roles: AdminRole[]): Promise<AuthResult> {
  return authorizeRoles(roles);
}

export async function requireAdmin(): Promise<AuthResult> {
  return requireRole(["admin"]);
}
