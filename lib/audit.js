import { connectMongodb } from "./mongodb";
import AuditLogModel from "./models/AuditLogModel";

/**
 * Record an admin action. Best-effort — never throws so it can't break the
 * primary operation.
 */
export const logAudit = async ({ admin, action, entityType, entityId = "", entityTitle = "", details = {} }) => {
  try {
    await connectMongodb();
    await AuditLogModel.create({
      adminUserId: admin?.id || "",
      adminEmail: admin?.email || "",
      action,
      entityType,
      entityId: entityId ? String(entityId) : "",
      entityTitle: entityTitle || "",
      details,
    });
  } catch (err) {
    console.error("[audit] failed to log:", err.message);
  }
};
