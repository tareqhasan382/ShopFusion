import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import CollectionModel from "../../../../lib/models/CollectionModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { isDescription, isTitle } from "../../../../lib/validation";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../lib/rateLimit";

export const POST = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.write(ip);
  if (!quota.ok) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { title, description, image } = body || {};

  const errors = {};
  if (!isTitle(title)) errors.title = "Title must be between 2 and 200 characters.";
  if (!image) errors.image = "An image is required.";
  if (description && !isDescription(description)) errors.description = "Description is too long.";

  if (Object.keys(errors).length > 0) {
    return jsonError("Validation failed.", 422, { errors });
  }

  try {
    await connectMongodb();

    const existing = await CollectionModel.findOne({
      title: title.trim().toLowerCase(),
    }).collation({ locale: "en", strength: 2 });

    if (existing) {
      return jsonError("A collection with this title already exists.", 409);
    }

    const result = await CollectionModel.create({
      title: title.trim(),
      description: description?.trim(),
      image,
    });

    return jsonSuccess({ data: result }, "Collection created successfully.", 201);
  } catch (err) {
    console.error("[collections_POST]", err);
    return jsonError("Failed to create collection.");
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit")) || 100, 1), 100);
  const title = searchParams.get("title");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const query = {};
  if (title) query.title = { $regex: title, $options: "i" };
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { title: rx },
      { description: rx },
    ];
  }

  try {
    await connectMongodb();
    const count = await CollectionModel.countDocuments(query);

    if (sort === "popular") {
      const result = await CollectionModel.aggregate([
        { $match: query },
        {
          $addFields: {
            productCount: { $size: { $ifNull: ["$products", []] } },
          },
        },
        { $sort: { productCount: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { productCount: 0 } },
      ]);

      return jsonSuccess({ data: result, total: count, page, limit, sort });
    }

    const result = await CollectionModel.find(query)
      .sort({ createdAt: "desc" })
      .skip((page - 1) * limit)
      .limit(limit);

    return jsonSuccess({ data: result, total: count, page, limit, sort });
  } catch (error) {
    console.error("[collections_GET]", error);
    return jsonError("Failed to load collections.");
  }
}
