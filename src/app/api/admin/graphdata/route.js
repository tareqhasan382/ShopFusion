import OrderModel from "../../../../../lib/models/OrderModel";
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
    const orders = await OrderModel.find();

    const salesPerMonth = orders.reduce((acc, order) => {
      if (getPaymentStatus(order) !== "paid") return acc;
      const monthIndex = new Date(order.createdAt).getMonth();
      acc[monthIndex] = (acc[monthIndex] || 0) + (order.totalAmount || 0);
      return acc;
    }, {});

    const graphData = Array.from({ length: 12 }, (_, i) => {
      const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        new Date(0, i)
      );
      return { name: month, sales: salesPerMonth[i] || 0 };
    });

    return jsonSuccess({ graphData });
  } catch (err) {
    console.error("[graphdata_GET]", err);
    return jsonError("Failed to load chart data.");
  }
};
