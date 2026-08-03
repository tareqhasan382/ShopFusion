import { NextResponse } from "next/server";
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
    const paidOrders = orders.filter(
      (order) => getPaymentStatus(order) === "paid"
    );
    const totalOrders = paidOrders.length;
    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + (order.totalAmount || 0),
      0
    );

    return jsonSuccess({ totalOrders, totalRevenue });
  } catch (err) {
    console.error("[orders_GET]", err);
    return jsonError("Failed to load orders.");
  }
};
