import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import ContactMessageModel from "../../../../../lib/models/ContactMessageModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";

export const PATCH = async (req, { params }) => {
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

  await connectMongodb();
  const message = await ContactMessageModel.findById(params.messageId);
  if (!message) return jsonError("Message not found.", 404);

  if (body?.isRead !== undefined) message.isRead = Boolean(body.isRead);
  await message.save();

  return jsonSuccess({ data: message }, "Message updated successfully.");
};

export const DELETE = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.write(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  await connectMongodb();
  const message = await ContactMessageModel.findById(params.messageId);
  if (!message) return jsonError("Message not found.", 404);

  await ContactMessageModel.deleteOne({ _id: message._id });
  return jsonSuccess({ data: message }, "Message deleted successfully.");
};
