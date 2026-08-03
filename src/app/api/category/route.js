import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import CategoryModel from "../../../../lib/models/CategoryModel";
import ProductModel from "../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { uniqueSlug } from "../../../../lib/slug";
import { logAudit } from "../../../../lib/audit";
import { isTitle } from "../../../../lib/validation";

export const POST = async (req) => {
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

  const { title, description, image } = body || {};
  if (!isTitle(title)) return jsonError("Title must be between 2 and 100 characters.", 422);

  await connectMongodb();

  const existing = await CategoryModel.findOne({ title: title.trim(), isDeleted: { $ne: true } });
  if (existing) return jsonError("A category with this title already exists.", 409);

  const slug = await uniqueSlug(CategoryModel, title);
  const category = await CategoryModel.create({
    title: title.trim(),
    slug,
    description: description?.trim() || "",
    image: image || "",
  });

  await logAudit({
    admin: session,
    action: "create",
    entityType: "category",
    entityId: category._id,
    entityTitle: category.title,
  });

  return jsonSuccess({ data: category }, "Category created successfully.", 201);
};

export const GET = async (req) => {
  try {
    await connectMongodb();
    const categories = await CategoryModel.find({ isDeleted: { $ne: true } }).sort({ title: 1 });

    const counts = await ProductModel.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    const data = categories.map((category) => ({
      ...category.toJSON(),
      productCount: countMap[category.title] || 0,
    }));

    return jsonSuccess({ data });
  } catch (error) {
    console.error("[Category_GET]", error);
    return jsonError("Failed to load categories.");
  }
};
