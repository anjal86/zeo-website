import bcrypt from "bcryptjs";
import { z } from "zod";
import { getOne } from "@/server/db/mysql";
import { badRequest, ok, serverError, unauthorized } from "@/server/http/api-response";
import { checkRateLimit, getClientIp } from "@/server/auth/rate-limit";
import { setAdminSession, touchAdminLogin } from "@/server/auth/session";
import type { RowDataPacket } from "mysql2/promise";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type AdminLoginRow = RowDataPacket & {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: "admin" | "editor";
  is_active: number | boolean;
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!limited.allowed) {
      return Response.json(
        { error: "Too many login attempts" },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return badRequest("Email and password are required", parsed.error.flatten());

    const user = await getOne<AdminLoginRow>(
      "SELECT id, email, name, password_hash, role, is_active FROM admin_users WHERE email = ? LIMIT 1",
      [parsed.data.email.toLowerCase()],
    );

    if (!user || !user.is_active) return unauthorized("Invalid credentials");
    const valid = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!valid) return unauthorized("Invalid credentials");

    await setAdminSession({ id: user.id, email: user.email, name: user.name, role: user.role });
    await touchAdminLogin(user.id);

    return ok({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === "admin",
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
