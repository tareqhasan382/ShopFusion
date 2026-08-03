import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import ProductModel from "../../../../../lib/models/ProductModel";
import CollectionModel from "../../../../../lib/models/CollectionModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import {
  isNonNegativeNumber,
  isObjectId,
  isTitle,
} from "../../../../../lib/validation";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { uniqueSlug } from "../../../../../lib/slug";
import { logAudit } from "../../../../../lib/audit";

const findProduct = async (key) => {
  if (isObjectId(key)) return ProductModel.findById(key);
  return ProductModel.findOne({ slug: key });
};

export async function GET(req, { params }) {
  const { productId } = params;

  try {
    await connectMongodb();
    const result = await findProduct(productId);
    if (!result || result.isDeleted) return jsonError("Product not found.", 404);
    return jsonSuccess({ data: result });
  } catch (error) {
    console.error("[Product_GET]", error);
    return jsonError("Failed to load product.");
  }
}

export async function PATCH(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { productId } = params;
  if (!isObjectId(productId)) return jsonError("Invalid product id.", 400);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const {
    title,
    description,
    media,
    category,
    brand,
    collections,
    tags,
    sizes,
    colors,
    price,
    cost,
    stock,
  } = body || {};

  const errors = {};
  if (title !== undefined && !isTitle(title)) errors.title = "Title must be between 2 and 200 characters.";
  if (category !== undefined && !isTitle(category)) errors.category = "Category must be between 2 and 100 characters.";
  if (price !== undefined && !isNonNegativeNumber(price)) errors.price = "A valid price is required.";
  if (cost !== undefined && !isNonNegativeNumber(cost)) errors.cost = "Cost cannot be negative.";
  if (stock !== undefined && !isNonNegativeNumber(stock)) errors.stock = "Stock cannot be negative.";
  if (media !== undefined && (!Array.isArray(media) || media.length === 0)) errors.media = "At least one image is required.";

  if (Object.keys(errors).length > 0) {
    return jsonError("Validation failed.", 422, { errors });
  }

  try {
    await connectMongodb();
    const existing = await ProductModel.findById(productId);
    if (!existing) return jsonError("Product not found.", 404);

    const update = {
      ...(title !== undefined && { title: title.trim() }),
      ...(brand !== undefined && { brand: brand?.trim() || "" }),
      ...(description !== undefined && { description: description?.trim() }),
      ...(media !== undefined && { media }),
      ...(category !== undefined && { category: category.trim() }),
      ...(collections !== undefined && { collections }),
      ...(tags !== undefined && { tags }),
      ...(sizes !== undefined && { sizes }),
      ...(colors !== undefined && { colors }),
      ...(price !== undefined && { price: Number(price) }),
      ...(cost !== undefined && { cost: Number(cost) }),
      ...(stock !== undefined && { stock: Number(stock) }),
    };

    if (title !== undefined && title.trim() !== existing.title) {
      update.slug = await uniqueSlug(ProductModel, title, existing._id);
    }

    const result = await ProductModel.findByIdAndUpdate(productId, update, { new: true });

    // Reconcile collection <-> product references.
    if (collections !== undefined) {
      const prevSet = new Set((existing.collections || []).map((c) => String(c)));
      const nextSet = new Set(collections.map((c) => String(c)));

      for (const removed of prevSet) {
        if (!nextSet.has(removed)) {
          await CollectionModel.updateOne(
            { _id: removed },
            { $pull: { products: result._id } }
          );
        }
      }
      for (const added of nextSet) {
        if (!prevSet.has(added)) {
          await CollectionModel.updateOne(
            { _id: added },
            { $addToSet: { products: result._id } }
          );
        }
      }
    }

    await logAudit({
      admin: session,
      action: "update",
      entityType: "product",
      entityId: result._id,
      entityTitle: result.title,
      details: { changed: Object.keys(update) },
    });

    return jsonSuccess({ data: result }, "Product updated successfully.");
  } catch (error) {
    console.error("[Product_PATCH]", error);
    return jsonError("Failed to update product.");
  }
}

export async function DELETE(req, { params }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { productId } = params;
  if (!isObjectId(productId)) return jsonError("Invalid product id.", 400);

  try {
    await connectMongodb();
    const result = await ProductModel.findByIdAndUpdate(
      productId,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!result) return jsonError("Product not found.", 404);

    await logAudit({
      admin: session,
      action: "delete",
      entityType: "product",
      entityId: result._id,
      entityTitle: result.title,
    });

    return jsonSuccess({ data: result }, "Product deleted successfully.");
  } catch (error) {
    console.error("[Product_DELETE]", error);
    return jsonError("Failed to delete product.");
  }
}
