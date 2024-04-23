import { NextResponse } from "next/server";
import { connectMongodb } from "../../../../lib/mongodb";
import UserModel from "../../../../lib/models/UserModel";

export async function POST(req, res) {
  try {
    const { name, email, password } = await req.json();
    await connectMongodb();
    const existUser = await UserModel.findOne({ email });

    if (existUser) {
      return NextResponse.json(
        { message: "User Already exist.", success: "false" },
        { status: 409 }
      );
    }
    await UserModel.create({ name, email, password });
    return NextResponse.json(
      { message: "User created successfully.", success: "true" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "User created failed.", success: "false" },
      { status: 500 }
    );
  }
}
