import { NextResponse } from "next/server";
import { connectMongodb } from "../../../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import ProductModel from "../../../../../lib/models/ProductModel";

export async function GET(req, { params }) {
  const { productId } = params;
  try {
    await connectMongodb();
    const session = await getServerSession(authOptions);
    if (!session.user) {
      return NextResponse.json(
        {
          message: "User UnAuthorized.",
          success: "False",
          data: null,
        },
        { status: 201 }
      );
    }
    const result = await ProductModel.findById(productId).populate(
      "collections"
    );
    return NextResponse.json(
      {
        message: "Product fetch successfully.",
        success: "true",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Data fetch failed.", success: "false" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params, body }) {
  const { productId } = params;
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
  console.log("patch Data::", body);

  try {
    await connectMongodb();
    const session = await getServerSession(authOptions);

    if (!session.user) {
      return NextResponse.json(
        {
          message: "User UnAuthorized.",
          success: "false",
          data: null,
        },
        { status: 401 }
      );
    }

    // Find collection by ID and update it
    const result = await ProductModel.findByIdAndUpdate(
      productId,
      {
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
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        {
          message: "Collection not found.",
          success: "false",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Collection updated successfully.",
        success: "true",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Data update failed.", success: "false" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { productId } = params;

  try {
    await connectMongodb();
    const session = await getServerSession(authOptions);
    if (!session.user) {
      return NextResponse.json(
        {
          message: "User UnAuthorized.",
          success: "False",
          data: null,
        },
        { status: 201 }
      );
    }
    const result = await ProductModel.findByIdAndDelete(productId);
    return NextResponse.json(
      {
        message: "Collection deleted successfully.",
        success: "true",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Data delete failed.", success: "false" },
      { status: 500 }
    );
  }
}
