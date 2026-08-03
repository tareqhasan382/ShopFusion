import { connectMongodb } from "./mongodb";
import CouponModel from "./models/CouponModel";

/**
 * Validate a coupon against a subtotal. Returns:
 *   { valid, code, type, discountAmount, message }
 * The caller is responsible for rate limiting.
 */
export const validateCoupon = async (code, subtotal) => {
  if (!code || typeof code !== "string") {
    return { valid: false, discountAmount: 0, message: "Coupon code is required." };
  }
  const subTotal = Number(subtotal);
  if (!Number.isFinite(subTotal) || subTotal < 0) {
    return { valid: false, discountAmount: 0, message: "A valid subtotal is required." };
  }

  await connectMongodb();
  const coupon = await CouponModel.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) return { valid: false, discountAmount: 0, message: "Invalid coupon code." };
  if (!coupon.isActive)
    return { valid: false, discountAmount: 0, message: "This coupon is no longer active." };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return { valid: false, discountAmount: 0, message: "This coupon has expired." };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
    return { valid: false, discountAmount: 0, message: "This coupon has reached its usage limit." };
  if (subTotal < coupon.minOrderAmount)
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order amount for this coupon is $${coupon.minOrderAmount.toFixed(2)}.`,
    };

  let discountAmount =
    coupon.type === "percent" ? (subTotal * coupon.value) / 100 : coupon.value;

  if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }
  if (discountAmount > subTotal) discountAmount = subTotal;

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discountAmount: Math.round(discountAmount * 100) / 100,
    message: "Coupon applied.",
  };
};
