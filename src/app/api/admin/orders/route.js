import OrderModel from "../../../../../lib/models/OrderModel";
import { connectMongodb } from "../../../../../lib/mongodb";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    await connectMongodb();

    const orders = await OrderModel.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (acc, order) => acc + order.totalAmount,
      0
    );

    return NextResponse.json({ totalOrders, totalRevenue }, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
