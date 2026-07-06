import { recordAdminAudit } from "@/server/repositories/audit";
import { getClientIp } from "@/server/auth/rate-limit";

export async function auditMutation(
  req: Request,
  adminUser: { id: number },
  action: string,
  entityType: string,
  entityId: string | number | null,
  before?: unknown,
  after?: unknown
) {
  try {
    await recordAdminAudit({
      adminUserId: adminUser.id,
      action,
      entityType,
      entityId,
      before,
      after,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
