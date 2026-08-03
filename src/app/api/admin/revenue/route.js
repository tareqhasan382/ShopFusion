import OrderModel from "../../../../../lib/models/OrderModel";
import CustomerModel from "../../../../../lib/models/CustomerModel";
import { connectMongodb } from "../../../../../lib/mongodb";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { getPaymentStatus } from "../../../../../lib/orderStatus";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  try {
    await connectMongodb();
    const [orders, customers] = await Promise.all([
      OrderModel.find(),
      CustomerModel.find(),
    ]);

    const paidOrders = orders.filter(
      (order) => getPaymentStatus(order) === "paid"
    );
    const totalOrders = paidOrders.length;
    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + (order.totalAmount || 0),
      0
    );
    const totalCustomers = customers.length;

    return jsonSuccess({ totalRevenue, totalOrders, totalCustomers });
  } catch (err) {
    console.error("[revenue_GET]", err);
    return jsonError("Failed to load revenue data.");
  }
};
