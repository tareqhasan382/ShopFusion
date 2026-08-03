import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import { getStoreSettings } from "../../../../lib/models/StoreSettingModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { isNonNegativeNumber, isEmail } from "../../../../lib/validation";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  try {
    await connectMongodb();
    const settings = await getStoreSettings();
    return jsonSuccess({ data: settings });
  } catch (error) {
    console.error("[Settings_GET]", error);
    return jsonError("Failed to load settings.");
  }
};

export const PATCH = async (req) => {
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

  if (body?.supportEmail !== undefined && !isEmail(body.supportEmail)) {
    return jsonError("Please enter a valid support email.", 422);
  }
  for (const key of ["lowStockThreshold", "freeShippingThreshold", "shippingCharge"]) {
    if (body?.[key] !== undefined && !isNonNegativeNumber(body[key])) {
      return jsonError(`${key} cannot be negative.`, 422);
    }
  }

  try {
    await connectMongodb();
    const settings = await getStoreSettings();
    const allowed = [
      "storeName",
      "tagline",
      "supportEmail",
      "supportPhone",
      "address",
      "currency",
      "lowStockThreshold",
      "freeShippingThreshold",
      "shippingCharge",
      "seoTitle",
      "seoDescription",
    ];
    allowed.forEach((key) => {
      if (body?.[key] !== undefined) settings[key] = body[key];
    });
    await settings.save();
    return jsonSuccess({ data: settings }, "Settings updated successfully.");
  } catch (error) {
    console.error("[Settings_PATCH]", error);
    return jsonError("Failed to update settings.");
  }
};
