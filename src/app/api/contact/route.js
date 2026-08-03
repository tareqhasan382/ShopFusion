import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import ContactMessageModel from "../../../../lib/models/ContactMessageModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { validateContactMessage } from "../../../../lib/validation";

export const POST = async (req) => {
  const quota = AUTH_RATE_LIMITS.contact(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const errors = validateContactMessage(body);
  if (Object.keys(errors).length > 0) return jsonError("Validation failed.", 422, { errors });

  try {
    await connectMongodb();
    const message = await ContactMessageModel.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      subject: body.subject.trim(),
      message: body.message.trim(),
    });
    return jsonSuccess({ data: message }, "Message sent. We will get back to you soon.", 201);
  } catch (error) {
    console.error("[Contact_POST]", error);
    return jsonError("Failed to send message.");
  }
};

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 20));
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    await connectMongodb();
    const filter = unreadOnly ? { isRead: false } : {};
    const [messages, total] = await Promise.all([
      ContactMessageModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContactMessageModel.countDocuments(filter),
    ]);

    const unread = await ContactMessageModel.countDocuments({ isRead: false });

    return jsonSuccess({ data: messages, total, page, limit, unread });
  } catch (error) {
    console.error("[Contact_GET]", error);
    return jsonError("Failed to load messages.");
  }
};
