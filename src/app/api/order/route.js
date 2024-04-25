import { NextResponse } from "next/server";
// import { format } from "date-fns";
import { connectMongodb } from "../../../../lib/mongodb";
import OrderModel from "../../../../lib/models/OrderModel";
import CustomerModel from "../../../../lib/models/CustomerModel";

export const GET = async (req) => {
  try {
    await connectMongodb();

    const orders = await OrderModel.find().sort({ createdAt: "desc" });
    // console.log("GET orders:", orders);
    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const customer = await CustomerModel.findOne({
          userId: order.customerUserkId,
        });
        return {
          _id: order._id,
          customer: customer.name,
          products: order.products.length,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        };
      })
    );
    //console.log("GET orderDetails:", orderDetails);
    return NextResponse.json(orderDetails, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
