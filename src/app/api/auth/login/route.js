import { connectMongodb } from "../../../../../lib/mongodb";
import UserModel from "../../../../../lib/models/UserModel";
import { createSession } from "../../../../../lib/auth";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { jsonError, jsonSuccess, rateLimitError } from "../../../../../lib/apiResponse";
import { validateLogin } from "../../../../../lib/validation";

export const POST = async (req) => {
  const ip = clientIp(req);
  const limiter = AUTH_RATE_LIMITS.login;
  const quota = limiter(ip);
  if (!quota.ok) return rateLimitError(quota.retryAfter);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { email, password } = body || {};
  const errors = validateLogin({ email, password });
  if (Object.keys(errors).length > 0) {
    return jsonError("Validation failed.", 422, { errors });
  }

  try {
    await connectMongodb();

    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Generic message to avoid leaking whether the email exists.
    if (!user || !(await user.comparePassword(password))) {
      return jsonError("Invalid email or password.", 401);
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
      "Signed in successfully."
    );
  } catch (error) {
    console.error("[login]", error);
    return jsonError("Failed to sign in. Please try again.", 500);
  }
};
