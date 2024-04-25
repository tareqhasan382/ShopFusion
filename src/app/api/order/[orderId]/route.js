import { NextResponse } from "next/server";
import OrderModel from "../../../../../lib/models/OrderModel";
import { connectMongodb } from "../../../../../lib/mongodb";
import CustomerModel from "../../../../../lib/models/CustomerModel";
import ProductModel from "../../../../../lib/models/ProductModel";

export const GET = async (req, { params }) => {
  try {
    await connectMongodb();

    const orderDetails = await OrderModel.findById(params.orderId).populate({
      path: "products.product",
      model: ProductModel,
    });
    // console.log("orderDetails:", orderDetails);
    if (!orderDetails) {
      return new NextResponse(JSON.stringify({ message: "Order Not Found" }), {
        status: 404,
      });
    }

    const customer = await CustomerModel.findOne({
      userId: orderDetails.customerUserkId,
    });
    // console.log("customer:", customer);
    return NextResponse.json({ orderDetails, customer }, { status: 200 });
  } catch (err) {
    console.log("[orderId_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
