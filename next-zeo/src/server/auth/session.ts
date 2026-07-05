import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getOne, execute } from "@/server/db/mysql";
import { loadEnv } from "@/env";
import type { RowDataPacket } from "mysql2/promise";

export const adminSessionCookie = "zeo_admin_session";
const maxAgeSeconds = 60 * 60 * 24;

type SessionPayload = {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
  exp: number;
};

type AdminUserRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  role: "admin" | "editor";
  is_active: number | boolean;
};

function getSecret() {
  return loadEnv().JWT_SECRET;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function parseSessionToken(token: string): SessionPayload | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
  if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed;
}

export function createSessionToken(user: Omit<SessionPayload, "exp">) {
  const payload = encode({ ...user, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds });
  return `${payload}.${sign(payload)}`;
}

export async function setAdminSession(user: Omit<SessionPayload, "exp">) {
  const env = loadEnv();
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookie)?.value;
  if (!token) return null;

  try {
    const payload = parseSessionToken(token);
    if (!payload) return null;

    const user = await getOne<AdminUserRow>(
      "SELECT id, email, name, role, is_active FROM admin_users WHERE id = ? AND email = ? LIMIT 1",
      [payload.id, payload.email],
    );
    if (!user || !user.is_active) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.role === "admin",
    };
  } catch {
    return null;
  }
}

export async function touchAdminLogin(userId: number) {
  await execute("UPDATE admin_users SET last_login_at = NOW() WHERE id = ?", [userId]);
}
