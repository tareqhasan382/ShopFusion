import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import ReviewModel from "../../../../lib/models/ReviewModel";
import ProductModel from "../../../../lib/models/ProductModel";
import OrderModel from "../../../../lib/models/OrderModel";
import UserModel from "../../../../lib/models/UserModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { validateReview, isObjectId } from "../../../../lib/validation";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const product = searchParams.get("product");
  const status = searchParams.get("status");

  try {
    await connectMongodb();
    const filter = {};
    if (product && isObjectId(product)) filter.product = product;

    const session = await getSessionFromRequest(req);
    const isAdmin = session?.role === "admin";

    if (status && isAdmin) {
      filter.isApproved = status === "approved";
    } else if (!filter.product) {
      if (!session) return jsonError("Unauthorized.", 401);
      filter.user = session.id;
    } else {
      filter.isApproved = true;
    }

    const reviews = await ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    const data = await Promise.all(
      reviews.map(async (review) => {
        const doc = review.toJSON();
        const user = await UserModel.findById(review.user).select("name").lean();
        doc.userName = user?.name || review.name || "Customer";
        const productDoc = await ProductModel.findById(review.product).select("title").lean();
        doc.productTitle = productDoc?.title || "";
        return doc;
      })
    );

    return jsonSuccess({ data });
  } catch (error) {
    console.error("[Review_GET]", error);
    return jsonError("Failed to load reviews.");
  }
};

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.review(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const errors = validateReview(body);
  if (Object.keys(errors).length > 0) return jsonError("Validation failed.", 422, { errors });

  const { product, rating, comment, order } = body || {};
  if (!isObjectId(product)) return jsonError("A valid product id is required.", 422);

  await connectMongodb();

  const productDoc = await ProductModel.findOne({ _id: product, isDeleted: { $ne: true } });
  if (!productDoc) return jsonError("Product not found.", 404);

  const existing = await ReviewModel.findOne({ product, user: session.id });
  if (existing) return jsonError("You have already reviewed this product.", 409);

  if (order && isObjectId(order)) {
    const orderDoc = await OrderModel.findById(order);
    if (orderDoc && String(orderDoc.customerUserId) !== session.id) {
      return jsonError("You can only review products from your own orders.", 403);
    }
  }

  const review = await ReviewModel.create({
    product,
    user: session.id,
    order: order && isObjectId(order) ? order : null,
    name: session.name,
    rating: Number(rating),
    comment: comment?.trim() || "",
  });

  return jsonSuccess({ data: review }, "Review submitted. It will appear after approval.", 201);
};
