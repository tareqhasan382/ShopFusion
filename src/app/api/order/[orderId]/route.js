import { getSessionFromRequest } from "../../../../../lib/auth";
import { connectMongodb } from "../../../../../lib/mongodb";
import OrderModel from "../../../../../lib/models/OrderModel";
import ProductModel from "../../../../../lib/models/ProductModel";
import CustomerModel from "../../../../../lib/models/CustomerModel";
import UserModel from "../../../../../lib/models/UserModel";
import { sendOrderStatusEmail } from "../../../../../lib/mailer";
import { jsonError, jsonSuccess } from "../../../../../lib/apiResponse";
import { isObjectId } from "../../../../../lib/validation";
import { logAudit } from "../../../../../lib/audit";
import { AUTH_RATE_LIMITS, clientIp } from "../../../../../lib/rateLimit";
import { PAYMENT_STATUSES, ORDER_STATUSES } from "../../../../../lib/orderStatus";

export const GET = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Unauthorized.", 401);

  const { orderId } = params;
  if (!isObjectId(orderId)) return jsonError("Invalid order id.", 400);

  try {
    await connectMongodb();

    const order = await OrderModel.findById(orderId).populate({
      path: "products.product",
      model: ProductModel,
    });

    if (!order) return jsonError("Order not found.", 404);

    const isOwner = order.customerUserId === session.id;
    const isAdmin = session.role === "admin";
    if (!isOwner && !isAdmin) return jsonError("Forbidden.", 403);

    const customer = await CustomerModel.findOne({ userId: order.customerUserId });

    return jsonSuccess({ orderDetails: order, customer });
  } catch (err) {
    console.error("[orderId_GET]", err);
    return jsonError("Failed to load order.");
  }
};

export const PATCH = async (req, { params }) => {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return jsonError("Unauthorized.", 401);
  }

  const ip = clientIp(req);
  const quota = AUTH_RATE_LIMITS.write(ip);
  if (!quota.ok) {
    return jsonError("Too many requests. Please try again later.", 429);
  }

  const { orderId } = params;
  if (!isObjectId(orderId)) return jsonError("Invalid order id.", 400);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { orderStatus, paymentStatus, trackingNumber, shippingAddress } = body || {};
  const update = {};

  if (orderStatus) {
    if (!ORDER_STATUSES.includes(orderStatus)) {
      return jsonError("Invalid order status.", 422);
    }
    update.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return jsonError("Invalid payment status.", 422);
    }
    update.paymentStatus = paymentStatus;
  }

  if (trackingNumber !== undefined) {
    const trimmed = String(trackingNumber).trim();
    if (trimmed.length > 120) {
      return jsonError("Tracking number is too long.", 422);
    }
    update.trackingNumber = trimmed;
  }

  if (shippingAddress !== undefined) {
    if (
      typeof shippingAddress !== "object" ||
      Array.isArray(shippingAddress)
    ) {
      return jsonError("Invalid shipping address.", 422);
    }

    const ADDRESS_LIMITS = {
      street: 200,
      city: 120,
      state: 120,
      postalCode: 20,
      country: 120,
      phone: 40,
    };
    const SHIPPING_FIELDS = Object.keys(ADDRESS_LIMITS);

    for (const key of SHIPPING_FIELDS) {
      if (shippingAddress[key] === undefined) continue;
      const value = String(shippingAddress[key]).trim();
      if (value.length > ADDRESS_LIMITS[key]) {
        return jsonError(`Invalid ${key}.`, 422);
      }
      update[`shippingAddress.${key}`] = value;
    }
  }

  if (Object.keys(update).length === 0) {
    return jsonError("Nothing to update.", 400);
  }

  try {
    await connectMongodb();
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: update },
      { new: true }
    );
    if (!order) return jsonError("Order not found.", 404);

    await logAudit({
      admin: session,
      action: "update",
      entityType: "order",
      entityId: order._id,
      entityTitle: order.invoiceNumber || order._id,
      details: { fields: Object.keys(update) },
    });

    if (update.orderStatus) {
      const customer = await CustomerModel.findOne({
        userId: order.customerUserId,
      });
      const user = await UserModel.findById(order.customerUserId);
      await sendOrderStatusEmail({
        email: customer?.email || user?.email,
        name: customer?.name || user?.name,
        order,
      });
    }

    return jsonSuccess({ orderDetails: order }, "Order updated.");
  } catch (err) {
    console.error("[orderId_PATCH]", err);
    return jsonError("Failed to update order.");
  }
};
