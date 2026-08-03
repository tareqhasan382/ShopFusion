import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import ReviewModel from "../../../../../lib/models/ReviewModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { logAudit } from "../../../../../lib/audit";

/** Recompute a product's aggregate rating from approved reviews. */
const recomputeProductRating = async (productId) => {
  const result = await ReviewModel.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const agg = result[0];
  await ProductModel.updateOne(
    { _id: productId },
    {
      $set: {
        ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0,
        ratingCount: agg ? agg.count : 0,
      },
    }
  );
};

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
  const review = await ReviewModel.findById(params.reviewId);
  if (!review) return jsonError("Review not found.", 404);

  if (body?.isApproved !== undefined) review.isApproved = Boolean(body.isApproved);
  if (body?.rating !== undefined && body?.comment !== undefined) {
    review.rating = Number(body.rating);
    review.comment = String(body.comment || "");
  }
  await review.save();
  await recomputeProductRating(review.product);

  await logAudit({
    admin: session,
    action: review.isApproved ? "approve" : "reject",
    entityType: "review",
    entityId: review._id,
    entityTitle: String(review.rating),
  });

  return jsonSuccess({ data: review }, "Review updated successfully.");
};

export const DELETE = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.write(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  await connectMongodb();
  const review = await ReviewModel.findById(params.reviewId);
  if (!review) return jsonError("Review not found.", 404);

  const productId = review.product;
  await ReviewModel.deleteOne({ _id: review._id });
  await recomputeProductRating(productId);

  await logAudit({
    admin: session,
    action: "delete",
    entityType: "review",
    entityId: review._id,
    entityTitle: String(review.rating),
  });

  return jsonSuccess({ data: review }, "Review deleted successfully.");
};
