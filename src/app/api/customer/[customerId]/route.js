import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import CustomerModel from "../../../../../lib/models/CustomerModel";
import OrderModel from "../../../../../lib/models/OrderModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { isObjectId } from "../../../../../lib/validation";

export const GET = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { customerId } = params;
  if (!isObjectId(customerId)) return jsonError("Invalid customer id.", 400);

  try {
    await connectMongodb();

    const customer = await CustomerModel.findById(customerId);
    if (!customer) return jsonError("Customer not found.", 404);

    const filter = {
      $or: [
        { customerUserId: customer.userId },
        ...(customer.orders?.length
          ? [{ _id: { $in: customer.orders } }]
          : []),
      ],
    };

    const orders = await OrderModel.find(filter)
      .populate({ path: "products.product", model: ProductModel })
      .sort({ createdAt: "desc" });

    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");

    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      paidOrders: paidOrders.length,
      lastOrderAt: orders[0]?.createdAt || null,
    };

    return jsonSuccess({ customer, orders, stats });
  } catch (err) {
    console.error("[customerId_GET]", err);
    return jsonError("Failed to load customer history.");
  }
};
