import { execute } from "@/server/db/mysql";

export type AdminAuditInput = {
  adminUserId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  before?: unknown;
  after?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function toJson(value: unknown) {
  return value === undefined ? null : JSON.stringify(value ?? null);
}

export async function recordAdminAudit(input: AdminAuditInput) {
  await execute(
    `INSERT INTO admin_audit_logs
      (admin_user_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.adminUserId ?? null,
      input.action,
      input.entityType,
      input.entityId === undefined || input.entityId === null ? null : String(input.entityId),
      toJson(input.before),
      toJson(input.after),
      input.ipAddress ?? null,
      input.userAgent ?? null,
    ],
  );
}
