import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import CouponModel from "../../../../lib/models/CouponModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { logAudit } from "../../../../lib/audit";
import { isCouponCode, isNonNegativeNumber } from "../../../../lib/validation";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  try {
    await connectMongodb();
    const coupons = await CouponModel.find().sort({ createdAt: -1 });
    return jsonSuccess({ data: coupons });
  } catch (error) {
    console.error("[Coupon_GET]", error);
    return jsonError("Failed to load coupons.");
  }
};

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.write(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { code, type, value, minOrderAmount, maxDiscount, expiresAt, usageLimit } = body || {};

  if (!isCouponCode(code)) {
    return jsonError("Code must be 3-50 characters (letters, numbers, - or _).", 422);
  }
  if (type !== "percent" && type !== "fixed") {
    return jsonError("Type must be either percent or fixed.", 422);
  }
  if (!isNonNegativeNumber(value) || Number(value) === 0) {
    return jsonError("Value must be a positive number.", 422);
  }
  if (type === "percent" && Number(value) > 100) {
    return jsonError("Percent value cannot exceed 100.", 422);
  }
  if (minOrderAmount !== undefined && !isNonNegativeNumber(minOrderAmount)) {
    return jsonError("Minimum order amount cannot be negative.", 422);
  }
  if (maxDiscount !== undefined && !isNonNegativeNumber(maxDiscount)) {
    return jsonError("Maximum discount cannot be negative.", 422);
  }
  if (usageLimit !== undefined && !isNonNegativeNumber(usageLimit)) {
    return jsonError("Usage limit cannot be negative.", 422);
  }

  await connectMongodb();

  const existing = await CouponModel.findOne({ code: code.trim().toUpperCase() });
  if (existing) return jsonError("A coupon with this code already exists.", 409);

  const coupon = await CouponModel.create({
    code: code.trim().toUpperCase(),
    type,
    value: Number(value),
    minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : 0,
    maxDiscount: maxDiscount !== undefined ? Number(maxDiscount) : 0,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    usageLimit: usageLimit !== undefined ? Number(usageLimit) : 0,
    isActive: body.isActive !== false,
  });

  await logAudit({
    admin: session,
    action: "create",
    entityType: "coupon",
    entityId: coupon._id,
    entityTitle: coupon.code,
  });

  return jsonSuccess({ data: coupon }, "Coupon created successfully.", 201);
};
