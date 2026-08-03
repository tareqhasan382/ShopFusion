import { connectMongodb } from "../../../../../lib/mongodb";
import UserModel from "../../../../../lib/models/UserModel";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { isPassword } from "../../../../../lib/validation";

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.write(ip);
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { currentPassword, newPassword } = body || {};

  if (!currentPassword) {
    return jsonError("Current password is required.", 422);
  }
  if (!isPassword(newPassword)) {
    return jsonError("New password must be at least 8 characters and include a letter and a number.", 422);
  }

  await connectMongodb();
  const user = await UserModel.findById(session.id).select("+password");
  if (!user) return jsonError("User not found.", 404);

  const valid = await user.comparePassword(currentPassword);
  if (!valid) return jsonError("Current password is incorrect.", 400);

  user.password = newPassword;
  await user.save();

  return jsonSuccess({}, "Password updated successfully.");
};
