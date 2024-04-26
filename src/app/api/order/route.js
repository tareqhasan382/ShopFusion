import { NextResponse } from "next/server";
// import { format } from "date-fns";
import { connectMongodb } from "../../../../lib/mongodb";
import OrderModel from "../../../../lib/models/OrderModel";
import CustomerModel from "../../../../lib/models/CustomerModel";

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  let page = parseInt(searchParams.get("page")) || 1;
  let limit = parseInt(searchParams.get("limit")) || 100;
  const skip = (page - 1) * limit;

  try {
    await connectMongodb();

    const orders = await OrderModel.find().sort({ createdAt: "desc" });

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

    const paginatedOrderDetails = orderDetails.slice(skip, skip + limit);

    return NextResponse.json(
      { paginatedOrderDetails, total: orderDetails.length },
      { status: 200 }
    );
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

/*
export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 100;
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
    console.log("GET orderDetails:", orderDetails);
    return NextResponse.json(orderDetails, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";

*/
