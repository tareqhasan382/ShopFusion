import { getSessionFromRequest } from "../../../../lib/auth";
import { connectMongodb } from "../../../../lib/mongodb";
import OrderModel from "../../../../lib/models/OrderModel";
import CustomerModel from "../../../../lib/models/CustomerModel";
import { jsonError, jsonSuccess } from "../../../../lib/apiResponse";
import { getPaymentStatus, getOrderStatus } from "../../../../lib/orderStatus";

export const GET = async (req) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit")) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const search = searchParams.get("search");
  const paymentStatus = searchParams.get("paymentStatus");
  const orderStatus = searchParams.get("orderStatus");

  const conditions = [];
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(search);
    conditions.push({
      $or: [
        ...(isObjectId ? [{ _id: search }] : []),
        { paymentStatus: rx },
        { orderStatus: rx },
        { couponCode: rx },
        { invoiceNumber: rx },
        { trackingNumber: rx },
      ],
    });
  }
  if (paymentStatus) {
    conditions.push({
      $or: [{ paymentStatus }, { status: paymentStatus }],
    });
  }
  if (orderStatus) {
    const ors = [{ orderStatus }];
    if (orderStatus === "placed") {
      ors.push({
        orderStatus: { $exists: false },
        status: { $in: ["paid", "pending"] },
      });
    } else {
      ors.push({ orderStatus: { $exists: false }, status: orderStatus });
    }
    conditions.push({ $or: ors });
  }
  const filter = conditions.length === 1 ? conditions[0] : { $and: conditions };

  try {
    await connectMongodb();

    const total = await OrderModel.countDocuments(filter);
    const orders = await OrderModel.find(filter)
      .sort({ createdAt: "desc" })
      .skip(skip)
      .limit(limit);

    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const customer = await CustomerModel.findOne({
          userId: order.customerUserId,
        });
        return {
          _id: order._id,
          customer: customer?.name || "Guest",
          products: order.products.length,
          totalAmount: order.totalAmount,
          paymentStatus: getPaymentStatus(order),
          orderStatus: getOrderStatus(order),
          createdAt: order.createdAt,
        };
      })
    );

    return jsonSuccess({ paginatedOrderDetails: orderDetails, total, page, limit });
  } catch (err) {
    console.error("[orders_GET]", err);
    return jsonError("Failed to load orders.");
  }
};
