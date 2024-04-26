//customer
import { NextResponse } from "next/server";
import { connectMongodb } from "../../../../lib/mongodb";
import CustomerModel from "../../../../lib/models/CustomerModel";

export async function GET(req, res) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 100;
  const email = searchParams.get("email");
  const query = {};
  if (email) {
    query.email = email;
  }
  try {
    await connectMongodb();

    const count = await CustomerModel.countDocuments(query);
    const result = await CustomerModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        message: "Customers retrieved successfully.",
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
