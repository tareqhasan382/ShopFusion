import { connectMongodb } from "../../../../../lib/mongodb";
import SubscriberModel from "../../../../../lib/models/SubscriberModel";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../../lib/apiResponse";
import { isEmail } from "../../../../../lib/validation";

/** Public opt-out. Idempotent — safe to call for a missing email. */
export const POST = async (req) => {
  const quota = AUTH_RATE_LIMITS.newsletter(clientIp(req));
  if (!quota.ok) return rateLimitError(quota.retryAfter);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const email = body?.email?.trim().toLowerCase();
  if (!isEmail(email)) return jsonError("Please enter a valid email address.", 422);

  try {
    await connectMongodb();
    const existing = await SubscriberModel.findOne({ email });

    if (existing && existing.subscribed) {
      existing.subscribed = false;
      existing.unsubscribedAt = new Date();
      await existing.save();
    }

    return jsonSuccess({}, "You've been unsubscribed. We'll miss you!", 200);
  } catch (error) {
    console.error("[newsletter_unsubscribe_POST]", error);
    return jsonError("Failed to unsubscribe. Please try again.");
  }
};
