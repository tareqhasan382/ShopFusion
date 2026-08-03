import { connectMongodb } from "../../../../lib/mongodb";
import SubscriberModel from "../../../../lib/models/SubscriberModel";
import { getSessionFromRequest } from "../../../../lib/auth";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../lib/apiResponse";
import { isEmail } from "../../../../lib/validation";

/** Public subscription (storefront footer). Rate-limited per IP. */
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

    if (existing) {
      if (existing.subscribed) {
        return jsonSuccess({}, "You're already subscribed. Thank you!", 200);
      }
      existing.subscribed = true;
      existing.unsubscribedAt = null;
      await existing.save();
      return jsonSuccess({}, "Welcome back! You're subscribed again.", 200);
    }

    await SubscriberModel.create({
      email,
      source: body?.source === "admin" ? "admin" : "footer",
    });

    return jsonSuccess({}, "Subscribed successfully. Welcome!", 201);
  } catch (error) {
    console.error("[newsletter_POST]", error);
    return jsonError("Failed to subscribe. Please try again.");
  }
};

/** Admin-only subscriber list (ordered newest first). */
export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  try {
    await connectMongodb();
    const { searchParams } = new URL(req.url);
    const subscribedOnly = searchParams.get("status") === "subscribed";
    const filter = subscribedOnly ? { subscribed: true } : {};
    const subscribers = await SubscriberModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(500);
    const total = await SubscriberModel.countDocuments({ subscribed: true });

    return jsonSuccess({
      data: subscribers,
      total,
      subscribedCount: total,
    });
  } catch (error) {
    console.error("[newsletter_GET]", error);
    return jsonError("Failed to load subscribers.");
  }
};
