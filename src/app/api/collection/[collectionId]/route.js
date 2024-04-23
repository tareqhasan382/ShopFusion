import { NextResponse } from "next/server";
import { connectMongodb } from "../../../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import CollectionModel from "../../../../../lib/models/CollectionModel";

export async function GET(req, { params }) {
  const { collectionId } = params;
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
    const result = await CollectionModel.findById(collectionId);
    return NextResponse.json(
      {
        message: "Collection fetch successfully.",
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
  const { collectionId } = params;
  const { title, description, image } = await req.json();
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
    const result = await CollectionModel.findByIdAndUpdate(
      collectionId,
      { title, description, image },
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
  const { collectionId } = params;
  console.log("delete collectionId:", collectionId);
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
    const result = await CollectionModel.findByIdAndDelete(collectionId);
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
