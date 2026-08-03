import { connectMongodb } from "../../../../../lib/mongodb";
import UserModel from "../../../../../lib/models/UserModel";
import { destroySession } from "../../../../../lib/auth";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../../lib/apiResponse";
import { isPassword } from "../../../../../lib/validation";

export const POST = async (req) => {
  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.passwordReset(ip);
  if (!quota.ok) return rateLimitError(quota.retryAfter);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { token, password } = body || {};
  if (typeof token !== "string" || !token) {
    return jsonError("Invalid or missing reset token.", 422);
  }
  if (!isPassword(password)) {
    return jsonError(
      "Password must be at least 8 characters and include a letter and a number.",
      422,
      { errors: { password: "Password must be at least 8 characters and include a letter and a number." } }
    );
  }

  await connectMongodb();

  const user = await UserModel.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: new Date() },
  }).select("+resetToken +resetTokenExpires");

  if (!user) {
    return jsonError("This reset link is invalid or has expired.", 400);
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  destroySession();

  return jsonSuccess({}, "Your password has been reset. Please sign in.");
};
