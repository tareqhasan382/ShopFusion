import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import AuditLogModel from "../../../../lib/models/AuditLogModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 20));
  const entityType = searchParams.get("entityType") || "";
  const action = searchParams.get("action") || "";
  const search = searchParams.get("search") || "";

  try {
    await connectMongodb();
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { entityTitle: rx },
        { adminEmail: rx },
        { adminUserId: rx },
        { entityId: rx },
        { entityType: rx },
        { action: rx },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AuditLogModel.countDocuments(filter),
    ]);

    return jsonSuccess({ data: logs, total, page, limit });
  } catch (error) {
    console.error("[Audit_GET]", error);
    return jsonError("Failed to load audit logs.");
  }
};
