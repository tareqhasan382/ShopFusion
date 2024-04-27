import OrderModel from "../../../../../lib/models/OrderModel";
import { connectMongodb } from "../../../../../lib/mongodb";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    await connectMongodb();
    const orders = await OrderModel.find();

    const salesPerMonth = orders.reduce((acc, order) => {
      const monthIndex = new Date(order.createdAt).getMonth();
      acc[monthIndex] = (acc[monthIndex] || 0) + order.totalAmount;
      // For June
      // acc[5] = (acc[5] || 0) + order.totalAmount (orders have monthIndex 5)
      return acc;
    }, {});

    const graphData = Array.from({ length: 12 }, (_, i) => {
      const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        new Date(0, i)
      );
      // if i === 5 => month = "Jun"
      return { name: month, sales: salesPerMonth[i] || 0 };
    });

    return NextResponse.json({ graphData }, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
