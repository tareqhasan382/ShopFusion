import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import BrandModel from "../../../../lib/models/BrandModel";
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

  const { name, logo, description } = body || {};
  if (!isTitle(name)) return jsonError("Brand name must be between 2 and 100 characters.", 422);

  await connectMongodb();

  const existing = await BrandModel.findOne({ name: name.trim(), isDeleted: { $ne: true } });
  if (existing) return jsonError("A brand with this name already exists.", 409);

  const slug = await uniqueSlug(BrandModel, name);
  const brand = await BrandModel.create({
    name: name.trim(),
    slug,
    logo: logo || "",
    description: description?.trim() || "",
  });

  await logAudit({
    admin: session,
    action: "create",
    entityType: "brand",
    entityId: brand._id,
    entityTitle: brand.name,
  });

  return jsonSuccess({ data: brand }, "Brand created successfully.", 201);
};

export const GET = async (req) => {
  try {
    await connectMongodb();
    const brands = await BrandModel.find({ isDeleted: { $ne: true } }).sort({ name: 1 });

    const counts = await ProductModel.aggregate([
      { $match: { isDeleted: { $ne: true }, brand: { $ne: "" } } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    const data = brands.map((brand) => ({
      ...brand.toJSON(),
      productCount: countMap[brand.name] || 0,
    }));

    return jsonSuccess({ data });
  } catch (error) {
    console.error("[Brand_GET]", error);
    return jsonError("Failed to load brands.");
  }
};
