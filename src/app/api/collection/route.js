import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectMongodb } from "../../../../lib/mongodb";
import CollectionModel from "../../../../lib/models/CollectionModel";
export const POST = async (req, res) => {
  try {
    const session = await getServerSession(authOptions);
    // console.log("server session:", session);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    await connectMongodb();
    const { title, description, image } = await req.json();
    // console.log("data:", title, description);

    const existingCollection = await CollectionModel.findOne({ title: title });

    if (existingCollection) {
      return new NextResponse("Collection already exists", { status: 400 });
    }

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 });
    }

    const result = await CollectionModel.create({ title, description, image });
    return NextResponse.json(
      {
        message: "Collection created successfully.",
        success: true,
        data: result,
      },
      { status: 200 }
    );
    // return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.log("[collections_POST]", err);
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

    const count = await CollectionModel.countDocuments(query);
    const result = await CollectionModel.find(query)
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
