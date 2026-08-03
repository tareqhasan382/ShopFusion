import { connectMongodb } from "../../../../../lib/mongodb";
import UserModel from "../../../../../lib/models/UserModel";
import { createSession } from "../../../../../lib/auth";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../../lib/apiResponse";
import { validateRegistration } from "../../../../../lib/validation";
import { sendMail, buildEmail, button } from "../../../../../lib/mailer";
import { APP_NAME, BASEURL } from "../../../../../lib/config";
import crypto from "crypto";

export const POST = async (req) => {
  const ip = clientIp(req);
  const limiter = AUTH_RATE_LIMITS.register;
  const quota = limiter(ip);
  if (!quota.ok) return rateLimitError(quota.retryAfter);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { name, email, password } = body || {};
  const errors = validateRegistration({ name, email, password });
  if (Object.keys(errors).length > 0) {
    return jsonError("Validation failed.", 422, { errors });
  }

  try {
    await connectMongodb();

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return jsonError("An account with this email already exists.", 409, {
        errors: { email: "Email is already registered." },
      });
    }

    // Bootstrap the first admin: if no admin exists yet and the email/password
    // match ADMIN_EMAIL / ADMIN_PASSWORD, promote this account to admin.
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    let role = "user";
    if (adminEmail) {
      const adminExists = await UserModel.exists({ role: "admin" });
      const matchesAdmin =
        normalizedEmail === adminEmail &&
        (!process.env.ADMIN_PASSWORD ||
          password === process.env.ADMIN_PASSWORD);
      if (!adminExists && matchesAdmin) role = "admin";
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString("hex"),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Best-effort verification email — registration never fails because of it.
    try {
      const verifyUrl = `${BASEURL}/verify-email?token=${user.verificationToken}`;
      await sendMail({
        to: user.email,
        subject: "Verify your email address",
        html: buildEmail({
          title: "Confirm your email",
          content: `
            <p>Hi ${user.name},</p>
            <p>Welcome to ${APP_NAME}! Please confirm your email address to complete sign-up.</p>
            ${button("Verify email", verifyUrl)}
            <p>This link is valid for 24 hours.</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error("[register] verification email failed:", emailErr);
    }

    await createSession({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return jsonSuccess(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Account created successfully.",
      201
    );
  } catch (error) {
    console.error("[register]", error);
    return jsonError("Failed to create account. Please try again.", 500);
  }
};
