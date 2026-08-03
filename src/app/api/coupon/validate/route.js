import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { validateCoupon } from "../../../../../lib/coupon";

export const POST = async (req) => {
  const quota = AUTH_RATE_LIMITS.coupon(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  try {
    const result = await validateCoupon(body?.code, body?.subtotal);
    return jsonSuccess(result);
  } catch (error) {
    console.error("[Coupon_Validate]", error);
    return jsonError("Failed to validate coupon.");
  }
};
