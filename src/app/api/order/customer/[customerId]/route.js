// import Product from "@/lib/models/Product";

import { NextResponse } from "next/server";
import OrderModel from "../../../../../../lib/models/OrderModel";
import { connectMongodb } from "../../../../../../lib/mongodb";
import ProductModel from "../../../../../../lib/models/ProductModel";

export const GET = async (req, { params }) => {
  try {
    await connectMongodb();

    const orders = await OrderModel.find({
      customerUserkId: params?.customerId,
    }).populate({ path: "products.product", model: ProductModel });
    // console.log("orders:", orders);
    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.log("[customerId_GET", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
/*
await OrderModel.findById(params.orderId).populate({
      path: "products.product",
      model: ProductModel,
    });
*/
