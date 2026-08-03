import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import ProductModel from "../../../../lib/models/ProductModel";
import CollectionModel from "../../../../lib/models/CollectionModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import {
  isDescription,
  isNonNegativeNumber,
  isTitle,
} from "../../../../lib/validation";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";
import { uniqueSlug } from "../../../../lib/slug";
import { logAudit } from "../../../../lib/audit";

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { ratingCount: -1, ratingAvg: -1 },
};

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.write(ip);
  if (!quota.ok) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

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
  if (!isTitle(title)) errors.title = "Title must be between 2 and 200 characters.";
  if (!isTitle(category)) errors.category = "Category must be between 2 and 100 characters.";
  if (description && !isDescription(description)) errors.description = "Description is too long.";
  if (!isNonNegativeNumber(price)) errors.price = "A valid price is required.";
  if (cost && !isNonNegativeNumber(cost)) errors.cost = "Cost cannot be negative.";
  if (stock !== undefined && !isNonNegativeNumber(stock)) errors.stock = "Stock cannot be negative.";
  if (!Array.isArray(media) || media.length === 0) errors.media = "At least one image is required.";

  if (Object.keys(errors).length > 0) {
    return jsonError("Validation failed.", 422, { errors });
  }

  try {
    await connectMongodb();

    const slug = await uniqueSlug(ProductModel, title);

    const result = await ProductModel.create({
      title: title.trim(),
      slug,
      brand: brand?.trim() || "",
      description: description?.trim(),
      media,
      category: category.trim(),
      collections: Array.isArray(collections) ? collections : [],
      tags: Array.isArray(tags) ? tags : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      stock: stock !== undefined ? Number(stock) : 0,
    });

    if (Array.isArray(collections)) {
      for (const collectionId of collections) {
        const collection = await CollectionModel.findById(collectionId);
        if (collection && !collection.products.includes(result._id)) {
          collection.products.push(result._id);
          await collection.save();
        }
      }
    }

    await logAudit({
      admin: session,
      action: "create",
      entityType: "product",
      entityId: result._id,
      entityTitle: result.title,
    });

    return jsonSuccess({ data: result }, "Product created successfully.", 201);
  } catch (err) {
    console.error("[Product_POST]", err);
    return jsonError("Failed to create product.");
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit")) || 30, 1), 100);

  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const collection = searchParams.get("collection");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "newest";
  const inStockOnly = searchParams.get("inStock") === "true";

  const query = { isDeleted: { $ne: true } };

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { title: regex },
      { category: regex },
      { brand: regex },
      { tags: regex },
      { description: regex },
    ];
  }
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (collection) query.collections = collection;
  if (minPrice !== null && minPrice !== "" && Number.isFinite(Number(minPrice))) {
    query.price = { ...(query.price || {}), $gte: Number(minPrice) };
  }
  if (maxPrice !== null && maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
    query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
  }
  if (inStockOnly) query.stock = { $gt: 0 };

  try {
    await connectMongodb();
    const count = await ProductModel.countDocuments(query);
    const result = await ProductModel.find(query)
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("collections");

    const categories = await ProductModel.distinct("category", { isDeleted: { $ne: true } });
    const brands = await ProductModel.distinct("brand", { isDeleted: { $ne: true }, brand: { $ne: "" } });

    return jsonSuccess({ data: result, total: count, page, limit, categories, brands });
  } catch (error) {
    console.error("[Product_GET]", error);
    return jsonError("Failed to load products.");
  }
}
