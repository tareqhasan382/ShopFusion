import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminUserId: { type: String, required: true, index: true },
    adminEmail: { type: String, default: "" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: "" },
    entityTitle: { type: String, default: "" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

auditLogSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLogModel;
