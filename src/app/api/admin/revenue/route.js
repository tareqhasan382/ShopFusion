import CustomerModel from "../../../../../lib/models/CustomerModel";
import { connectMongodb } from "../../../../../lib/mongodb";

export const GET = async (req) => {
  try {
    await connectMongodb();

    const customers = await CustomerModel.find();
    const totalCustomers = customers.length;

    return NextResponse.json({ totalCustomers }, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
