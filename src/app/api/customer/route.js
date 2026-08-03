//customer
import { connectMongodb } from "../../../../lib/mongodb";
import CustomerModel from "../../../../lib/models/CustomerModel";
import { getSessionFromRequest } from "../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";

export async function GET(req) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit")) || 30, 1),
    100
  );
  const email = searchParams.get("email");
  const search = searchParams.get("search");
  const query = {};
  if (email) query.email = email;
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: rx }, { email: rx }];
  }

  try {
    await connectMongodb();
    const count = await CustomerModel.countDocuments(query);
    const result = await CustomerModel.find(query)
      .sort({ createdAt: "desc" })
      .skip((page - 1) * limit)
      .limit(limit);

    return jsonSuccess({ data: result, total: count, page, limit });
  } catch (error) {
    console.error("[customers_GET]", error);
    return jsonError("Failed to load customers.");
  }
}
