import { NextResponse } from "next/server";
import UserModel from "../../../../lib/models/UserModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectMongodb } from "../../../../lib/mongodb";

export const POST = async (req) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    await connectMongodb();

    const user = await UserModel.findById(session?.user?._id);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    const { productId } = await req.json();

    if (!productId) {
      return new NextResponse("Product Id required", { status: 400 });
    }
    const index = user.wishlist.indexOf(productId);

    if (index !== -1) {
      // Product already in the wishlist, remove it (Dislike)
      user.wishlist.splice(index, 1);
    } else {
      // Product not in the wishlist, add it (Like)
      user.wishlist.push(productId);
    }

    await user.save();

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.log("[wishlist_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (req) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectMongodb();

    const user = await UserModel.findById(session?.user._id);

    // When the user sign-in for the 1st, immediately we will create a new user for them
    // if (!user) {
    //   user = await UserModel.create({ clerkId: userId })
    //   await user.save()
    // }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.log("[users_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
