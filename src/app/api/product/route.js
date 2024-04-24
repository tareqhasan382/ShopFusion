import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectMongodb } from "../../../../lib/mongodb";
import ProductModel from "../../../../lib/models/ProductModel";
import CollectionModel from "../../../../lib/models/CollectionModel";

export const POST = async (req, res) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    await connectMongodb();
    const {
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      cost,
    } = await req.json();

    if (!title || !description || !category || !price) {
      return new NextResponse("Not enough data to create a product", {
        status: 400,
      });
    }

    const result = await ProductModel.create({
      title,
      description,
      media,
      category,
      collections,
      tags,
      sizes,
      colors,
      price,
      cost,
    });
    if (collections) {
      for (const collectionId of collections) {
        const collection = await CollectionModel.findById(collectionId);
        if (collection) {
          collection.products.push(result._id);
          await collection.save();
        }
      }
    }
    return NextResponse.json(
      {
        message: "Product created successfully.",
        success: true,
        data: result,
      },
      { status: 200 }
    );
    // return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.log("[Product_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 3;
  const title = searchParams.get("title");
  const query = {};
  if (title) {
    query.title = title;
  }
  try {
    await connectMongodb();

    const count = await ProductModel.countDocuments(query);
    const result = await ProductModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        message: "Collections retrieved successfully.",
        success: "true",
        data: result,
        total: count,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Data retrive failed.", success: "false" },
      { status: 500 }
    );
  }
}
