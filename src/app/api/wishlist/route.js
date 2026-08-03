import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import UserModel from "../../../../lib/models/UserModel";
import ProductModel from "../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { isObjectId } from "../../../../lib/validation";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.wishlist(ip);
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { productId } = body || {};
  if (!isObjectId(productId)) {
    return jsonError("A valid product id is required.", 400);
  }

  try {
    await connectMongodb();
    const user = await UserModel.findById(session.id);
    if (!user) return jsonError("User not found.", 404);

    const index = user.wishlist.indexOf(productId);
    if (index !== -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    return jsonSuccess(
      { wishlist: user.wishlist.map((id) => id.toString()) },
      index !== -1 ? "Removed from wishlist." : "Added to wishlist."
    );
  } catch (err) {
    console.error("[wishlist_POST]", err);
    return jsonError("Failed to update wishlist.");
  }
};

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  try {
    await connectMongodb();
    const user = await UserModel.findById(session.id);
    if (!user) return jsonError("User not found.", 404);

    const products = await ProductModel.find({
      _id: { $in: user.wishlist },
    });

    return jsonSuccess({
      wishlist: user.wishlist.map((id) => id.toString()),
      products,
    });
  } catch (err) {
    console.error("[wishlist_GET]", err);
    return jsonError("Failed to load wishlist.");
  }
};
