import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import CategoryModel from "../../../../../lib/models/CategoryModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { uniqueSlug } from "../../../../../lib/slug";
import { logAudit } from "../../../../../lib/audit";
import { isObjectId, isTitle } from "../../../../../lib/validation";

const findCategory = async (key) => {
  if (isObjectId(key)) return CategoryModel.findOne({ _id: key, isDeleted: { $ne: true } });
  return CategoryModel.findOne({ slug: key, isDeleted: { $ne: true } });
};

export const GET = async (req, { params }) => {
  try {
    await connectMongodb();
    const category = await findCategory(params.categoryId);
    if (!category) return jsonError("Category not found.", 404);

    const productCount = await ProductModel.countDocuments({
      category: category.title,
      isDeleted: { $ne: true },
    });

    return jsonSuccess({ data: { ...category.toJSON(), productCount } });
  } catch (error) {
    console.error("[Category_GET]", error);
    return jsonError("Failed to load category.");
  }
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

  const { title, description, image } = body || {};
  if (title !== undefined && !isTitle(title)) {
    return jsonError("Title must be between 2 and 100 characters.", 422);
  }

  await connectMongodb();
  const category = await CategoryModel.findOne({ _id: params.categoryId, isDeleted: { $ne: true } });
  if (!category) return jsonError("Category not found.", 404);

  if (title !== undefined && title.trim() !== category.title) {
    const oldTitle = category.title;
    const duplicate = await CategoryModel.findOne({
      title: title.trim(),
      _id: { $ne: category._id },
      isDeleted: { $ne: true },
    });
    if (duplicate) return jsonError("A category with this title already exists.", 409);
    category.slug = await uniqueSlug(CategoryModel, title, category._id);
    category.title = title.trim();
    // Keep product links in sync.
    await ProductModel.updateMany(
      { category: oldTitle },
      { $set: { category: title.trim() } }
    );
  }
  if (description !== undefined) category.description = description?.trim() || "";
  if (image !== undefined) category.image = image || "";
  await category.save();

  await logAudit({
    admin: session,
    action: "update",
    entityType: "category",
    entityId: category._id,
    entityTitle: category.title,
  });

  return jsonSuccess({ data: category }, "Category updated successfully.");
};

export const DELETE = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.write(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  await connectMongodb();
  const category = await CategoryModel.findOne({ _id: params.categoryId, isDeleted: { $ne: true } });
  if (!category) return jsonError("Category not found.", 404);

  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();

  await logAudit({
    admin: session,
    action: "delete",
    entityType: "category",
    entityId: category._id,
    entityTitle: category.title,
  });

  return jsonSuccess({ data: category }, "Category deleted successfully.");
};
