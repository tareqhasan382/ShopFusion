import { getSessionFromRequest } from "../../../../../../lib/auth";
import { connectMongodb } from "../../../../../../lib/mongodb";
import OrderModel from "../../../../../../lib/models/OrderModel";
import ProductModel from "../../../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../../../lib/apiResponse";

export const GET = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const { customerId } = params;
  const isOwner = customerId === session.id;
  const isAdmin = session.role === "admin";
  if (!isOwner && !isAdmin) return jsonError("Forbidden.", 403);

  try {
    await connectMongodb();

    const orders = await OrderModel.find({ customerUserId: customerId })
      .sort({ createdAt: "desc" })
      .populate({ path: "products.product", model: ProductModel });

    return jsonSuccess({ data: orders });
  } catch (err) {
    console.error("[customerId_GET]", err);
    return jsonError("Failed to load orders.");
  }
};
