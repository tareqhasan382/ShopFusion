import crypto from "crypto";
import { connectMongodb } from "../../../../../lib/mongodb";
import UserModel from "../../../../../lib/models/UserModel";
import { sendMail, buildEmail, button } from "../../../../../lib/mailer";
import { BASEURL } from "../../../../../lib/config";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../../lib/apiResponse";
import { isEmail } from "../../../../../lib/validation";

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

  const { email } = body || {};
  if (!isEmail(email)) {
    return jsonError("Please enter a valid email address.", 422, {
      errors: { email: "Please enter a valid email address." },
    });
  }

  await connectMongodb();

  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });

  // Always report success to avoid leaking which emails are registered.
  if (!user) {
    return jsonSuccess({}, "If that email is registered, a reset link has been sent.");
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${BASEURL}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Reset your password",
    html: buildEmail({
      title: "Password reset request",
      content: `
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. This link is valid for 1 hour.</p>
        ${button("Reset my password", resetUrl)}
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    }),
  });

  return jsonSuccess({}, "If that email is registered, a reset link has been sent.");
};
