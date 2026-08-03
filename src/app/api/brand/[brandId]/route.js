import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import BrandModel from "../../../../../lib/models/BrandModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { uniqueSlug } from "../../../../../lib/slug";
import { logAudit } from "../../../../../lib/audit";
import { isObjectId, isTitle } from "../../../../../lib/validation";

const findBrand = async (key) => {
  if (isObjectId(key)) return BrandModel.findOne({ _id: key, isDeleted: { $ne: true } });
  return BrandModel.findOne({ slug: key, isDeleted: { $ne: true } });
};

export const GET = async (req, { params }) => {
  try {
    await connectMongodb();
    const brand = await findBrand(params.brandId);
    if (!brand) return jsonError("Brand not found.", 404);

    const productCount = await ProductModel.countDocuments({
      brand: brand.name,
      isDeleted: { $ne: true },
    });

    return jsonSuccess({ data: { ...brand.toJSON(), productCount } });
  } catch (error) {
    console.error("[Brand_GET]", error);
    return jsonError("Failed to load brand.");
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

  const { name, logo, description } = body || {};
  if (name !== undefined && !isTitle(name)) {
    return jsonError("Brand name must be between 2 and 100 characters.", 422);
  }

  await connectMongodb();
  const brand = await BrandModel.findOne({ _id: params.brandId, isDeleted: { $ne: true } });
  if (!brand) return jsonError("Brand not found.", 404);

  if (name !== undefined && name.trim() !== brand.name) {
    const oldName = brand.name;
    const duplicate = await BrandModel.findOne({
      name: name.trim(),
      _id: { $ne: brand._id },
      isDeleted: { $ne: true },
    });
    if (duplicate) return jsonError("A brand with this name already exists.", 409);
    brand.slug = await uniqueSlug(BrandModel, name, brand._id);
    brand.name = name.trim();
    await ProductModel.updateMany({ brand: oldName }, { $set: { brand: name.trim() } });
  }
  if (logo !== undefined) brand.logo = logo || "";
  if (description !== undefined) brand.description = description?.trim() || "";
  await brand.save();

  await logAudit({
    admin: session,
    action: "update",
    entityType: "brand",
    entityId: brand._id,
    entityTitle: brand.name,
  });

  return jsonSuccess({ data: brand }, "Brand updated successfully.");
};

export const DELETE = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return jsonError("Unauthorized.", 401);

  const quota = AUTH_RATE_LIMITS.write(clientIp(req));
  if (!quota.ok) return jsonError("Too many requests. Please try again later.", 429);

  await connectMongodb();
  const brand = await BrandModel.findOne({ _id: params.brandId, isDeleted: { $ne: true } });
  if (!brand) return jsonError("Brand not found.", 404);

  brand.isDeleted = true;
  brand.deletedAt = new Date();
  await brand.save();

  await logAudit({
    admin: session,
    action: "delete",
    entityType: "brand",
    entityId: brand._id,
    entityTitle: brand.name,
  });

  return jsonSuccess({ data: brand }, "Brand deleted successfully.");
};
