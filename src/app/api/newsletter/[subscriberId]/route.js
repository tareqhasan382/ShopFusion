import { connectMongodb } from "../../../../../lib/mongodb";
import SubscriberModel from "../../../../../lib/models/SubscriberModel";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { isObjectId } from "../../../../../lib/validation";

/** Admin-only: permanently remove a subscriber. */
export const DELETE = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { subscriberId } = params;
  if (!isObjectId(subscriberId)) return jsonError("Invalid subscriber id.", 400);

  try {
    await connectMongodb();
    const result = await SubscriberModel.findByIdAndDelete(subscriberId);
    if (!result) return jsonError("Subscriber not found.", 404);
    return jsonSuccess({}, "Subscriber removed.", 200);
  } catch (error) {
    console.error("[newsletterId_DELETE]", error);
    return jsonError("Failed to remove subscriber.");
  }
};
