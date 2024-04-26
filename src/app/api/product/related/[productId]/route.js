import { NextResponse } from "next/server";
import { connectMongodb } from "../../../../../../lib/mongodb";
import ProductModel from "../../../../../../lib/models/ProductModel";

export const GET = async (reqt, { params }) => {
  try {
    await connectMongodb();

    const product = await ProductModel.findById(params?.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    const relatedProducts = await ProductModel.find({
      $or: [
        { category: product.category },
        { collections: { $in: product.collections } },
      ],
      _id: { $ne: product._id }, // Exclude the current product
    });

    if (!relatedProducts) {
      return new NextResponse(
        JSON.stringify({ message: "No related products found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(relatedProducts, { status: 200 });
  } catch (err) {
    console.log("[related_GET", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
