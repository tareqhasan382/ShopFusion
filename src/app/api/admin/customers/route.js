import CustomerModel from "../../../../../lib/models/CustomerModel";
import { connectMongodb } from "../../../../../lib/mongodb";
import { getSessionFromRequest } from "../../../../../lib/auth";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  try {
    await connectMongodb();
    const customers = await CustomerModel.find();
    return jsonSuccess({ totalCustomers: customers.length });
  } catch (err) {
    console.error("[customers_GET]", err);
    return jsonError("Failed to load customers.");
  }
};
