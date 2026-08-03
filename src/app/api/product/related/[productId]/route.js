import { NextResponse } from "next/server";
import { connectMongodb } from "../../../../../../lib/mongodb";
import ProductModel from "../../../../../../lib/models/ProductModel";
import { isObjectId } from "../../../../../../lib/validation";

const findProduct = async (key) => {
  if (isObjectId(key)) return ProductModel.findOne({ _id: key, isDeleted: { $ne: true } });
  return ProductModel.findOne({ slug: key, isDeleted: { $ne: true } });
};

export const GET = async (reqt, { params }) => {
  try {
    await connectMongodb();

    const product = await findProduct(params?.productId);

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
      _id: { $ne: product._id },
      isDeleted: { $ne: true },
      stock: { $gt: 0 },
    }).limit(8);

    return NextResponse.json(relatedProducts, { status: 200 });
  } catch (err) {
    console.log("[related_GET", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
