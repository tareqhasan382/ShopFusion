import { connectMongodb } from "../../../../lib/mongodb";
import UserModel from "../../../../lib/models/UserModel";
import { getSessionFromRequest, createSession } from "../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { isName } from "../../../../lib/validation";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  await connectMongodb();
  const user = await UserModel.findById(session.id).lean();

  if (!user) return jsonError("User not found.", 404);

  return jsonSuccess({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      phone: user.phone || "",
      avatar: user.avatar || "",
      addresses: user.addresses || [],
      createdAt: user.createdAt,
    },
  });
};

export const PATCH = async (req) => {
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

  const { name, phone, avatar } = body || {};

  if (name !== undefined && !isName(name)) {
    return jsonError("Name must be between 2 and 50 characters.", 422);
  }
  if (phone !== undefined && (typeof phone !== "string" || phone.length > 30)) {
    return jsonError("Phone number is too long.", 422);
  }
  if (avatar !== undefined && (typeof avatar !== "string" || avatar.length > 1000)) {
    return jsonError("Invalid avatar URL.", 422);
  }

  await connectMongodb();
  const user = await UserModel.findById(session.id);
  if (!user) return jsonError("User not found.", 404);

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatar !== undefined) user.avatar = avatar.trim();
  await user.save();

  await createSession({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  return jsonSuccess({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } }, "Profile updated.");
};
