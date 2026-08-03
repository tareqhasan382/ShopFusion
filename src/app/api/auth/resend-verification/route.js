import { connectMongodb } from "../../../../../lib/mongodb";
import UserModel from "../../../../../lib/models/UserModel";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../../lib/apiResponse";
import { isEmail } from "../../../../../lib/validation";
import { sendMail, buildEmail, button } from "../../../../../lib/mailer";
import { APP_NAME, BASEURL } from "../../../../../lib/config";
import crypto from "crypto";

export const POST = async (req) => {
  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.write(ip);
  if (!quota.ok) return rateLimitError(quota.retryAfter);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { email } = body || {};
  if (!isEmail(email)) {
    return jsonError("Please enter a valid email address.", 422);
  }

  await connectMongodb();

  const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
  if (!user || user.emailVerified) {
    return jsonSuccess({}, "If this account is unverified, a new verification link has been sent.");
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.verificationToken = token;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = `${BASEURL}/verify-email?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Verify your email address",
    html: buildEmail({
      title: "Confirm your email",
      content: `
        <p>Hi ${user.name},</p>
        <p>Thanks for signing up for ${APP_NAME}! Please confirm your email address to activate your account.</p>
        ${button("Verify email", verifyUrl)}
        <p>This link is valid for 24 hours.</p>
      `,
    }),
  });

  return jsonSuccess({}, "If this account is unverified, a new verification link has been sent.");
};
