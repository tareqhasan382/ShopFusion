import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import CouponModel from "../../../../../lib/models/CouponModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { logAudit } from "../../../../../lib/audit";
import { isCouponCode, isNonNegativeNumber } from "../../../../../lib/validation";

export const PATCH = async (req, { params }) => {
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

  await connectMongodb();
  const coupon = await CouponModel.findById(params.couponId);
  if (!coupon) return jsonError("Coupon not found.", 404);

  const { code, type, value, minOrderAmount, maxDiscount, expiresAt, usageLimit, isActive } = body || {};

  if (code !== undefined && !isCouponCode(code)) {
    return jsonError("Code must be 3-50 characters (letters, numbers, - or _).", 422);
  }
  if (type !== undefined && type !== "percent" && type !== "fixed") {
    return jsonError("Type must be either percent or fixed.", 422);
  }
  if (value !== undefined && !isNonNegativeNumber(value)) {
    return jsonError("Value must be a non-negative number.", 422);
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

  if (code !== undefined) {
    const newCode = code.trim().toUpperCase();
    const duplicate = await CouponModel.findOne({ code: newCode, _id: { $ne: coupon._id } });
    if (duplicate) return jsonError("A coupon with this code already exists.", 409);
    coupon.code = newCode;
  }
  if (type !== undefined) coupon.type = type;
  if (value !== undefined) coupon.value = Number(value);
  if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
  if (maxDiscount !== undefined) coupon.maxDiscount = Number(maxDiscount);
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
  if (isActive !== undefined) coupon.isActive = Boolean(isActive);
  await coupon.save();

  await logAudit({
    admin: session,
    action: "update",
    entityType: "coupon",
    entityId: coupon._id,
    entityTitle: coupon.code,
  });

  return jsonSuccess({ data: coupon }, "Coupon updated successfully.");
};

export const DELETE = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.write(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  await connectMongodb();
  const coupon = await CouponModel.findById(params.couponId);
  if (!coupon) return jsonError("Coupon not found.", 404);

  await logAudit({
    admin: session,
    action: "delete",
    entityType: "coupon",
    entityId: coupon._id,
    entityTitle: coupon.code,
  });

  await CouponModel.deleteOne({ _id: coupon._id });

  return jsonSuccess({ data: coupon }, "Coupon deleted successfully.");
};
