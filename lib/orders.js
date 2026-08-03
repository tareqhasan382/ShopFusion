import { stripe } from "./stripe";
import { connectMongodb } from "./mongodb";
import OrderModel from "./models/OrderModel";
import CouponModel from "./models/CouponModel";
import CustomerModel from "./models/CustomerModel";
import { sendOrderConfirmation } from "./mailer";

/**
 * Increment a coupon's usedCount once a paid order is confirmed. Idempotent
 * per order via the order's `couponCounted` flag so webhook retries never
 * double-count the same purchase.
 */
const countCouponUsage = async (order) => {
  if (!order?.couponCode || order.couponCounted) return;
  await CouponModel.updateOne(
    { code: String(order.couponCode).trim().toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
  order.couponCounted = true;
};

/**
 * Create a "pending" order (the tracking record) the moment a Stripe
 * checkout session is created. This lets us track abandoned checkouts and
 * payment cancellations, not just successful purchases.
 *
 * Idempotent by stripeSessionId — safe to call again for the same session.
 *
 * Returns { created, order }.
 */
export const createPendingOrder = async ({ cartItems, userId, sessionId, couponCode, discountAmount }) => {
  if (!sessionId) throw new Error("Missing Stripe session id.");

  await connectMongodb();

  const existing = await OrderModel.findOne({ stripeSessionId: sessionId });
  if (existing) return { created: false, order: existing };

  const orderItems = cartItems
    .filter((cartItem) => cartItem?.item?._id)
    .map((cartItem) => ({
      product: String(cartItem.item._id),
      color: cartItem?.color || "",
      size: cartItem?.size || "",
      quantity: Math.max(1, parseInt(cartItem?.quantity, 10) || 1),
    }));

  const subtotal = cartItems.reduce(
    (acc, cartItem) =>
      acc + Number(cartItem?.item?.price || 0) * Math.max(1, parseInt(cartItem?.quantity, 10) || 1),
    0
  );

  const discount = Math.min(Number(discountAmount) || 0, subtotal);
  const totalAmount = Math.round((subtotal - discount) * 100) / 100;

  const newOrder = new OrderModel({
    customerUserId: userId,
    products: orderItems,
    subtotalAmount: Math.round(subtotal * 100) / 100,
    discountAmount: discount,
    couponCode: couponCode || "",
    totalAmount,
    paymentStatus: "pending",
    orderStatus: "placed",
    stripeSessionId: sessionId,
  });

  await newOrder.save();

  return { created: true, order: newOrder };
};

/** Generate a human-friendly invoice number, e.g. SF-20260803-0001. */
const generateInvoiceNumber = async () => {
  const count = await OrderModel.countDocuments({
    invoiceNumber: { $ne: "", $exists: true },
  });
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SF-${ymd}-${String(count + 1).padStart(4, "0")}`;
};

/**
 * Mark an order as paid once Stripe confirms the checkout session completed.
 * If a pending order already exists for the session it is updated (real total,
 * payment intent id, status); otherwise a full order is created (fallback for
 * payments confirmed before the pending record could be saved).
 *
 * Returns { created, paid, order }.
 */
export const confirmPaidOrder = async (checkoutSession) => {
  const sessionId = checkoutSession?.id;
  if (!sessionId) throw new Error("Missing Stripe session id.");

  await connectMongodb();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product"],
  });

  if (session.payment_status !== "paid") {
    return { created: false, paid: false, order: null };
  }

  const existing = await OrderModel.findOne({ stripeSessionId: sessionId });

  if (existing) {
    existing.paymentStatus = "paid";
    if (session.amount_total) existing.totalAmount = session.amount_total / 100;
    if (session.amount_subtotal) existing.subtotalAmount = session.amount_subtotal / 100;
    if (session.payment_intent) existing.paymentIntentId = session.payment_intent;
    if (session.total_details?.amount_discount !== undefined)
      existing.discountAmount = session.total_details.amount_discount / 100;
    if (session.shipping_cost?.shipping_rate) existing.shippingRate = session.shipping_cost.shipping_rate;
    if (!existing.invoiceNumber) existing.invoiceNumber = await generateInvoiceNumber();
    existing.shippingAddress = {
      street: session?.shipping_details?.address?.line1 || session?.shipping_details?.address?.line2 || "",
      city: session?.shipping_details?.address?.city || "",
      state: session?.shipping_details?.address?.state || "",
      postalCode: session?.shipping_details?.address?.postal_code || "",
      country: session?.shipping_details?.address?.country || "",
      phone: session?.shipping_details?.phone || session?.customer_details?.phone || "",
    };
    await countCouponUsage(existing);
    await existing.save();
    await linkCustomer(existing, session);
    await sendOrderConfirmation({
      email: session?.customer_details?.email,
      name: session?.customer_details?.name,
      order: existing.toObject(),
    });
    return { created: false, paid: true, order: existing };
  }

  const order = await buildPaidOrder(session);
  await countCouponUsage(order);
  await linkCustomer(order, session);
  await sendOrderConfirmation({
    email: session?.customer_details?.email,
    name: session?.customer_details?.name,
    order: order.toObject(),
  });
  return { created: true, paid: true, order };
};

/**
 * Mark a pending order as cancelled (user backed out at Stripe, the session
 * expired, or the payment intent was cancelled). Records the payment intent id
 * when Stripe provides one so the cancelled attempt stays trackable.
 *
 * Returns { updated, order }.
 */
export const cancelOrderBySessionId = async (sessionId) => {
  if (!sessionId) return { updated: false, order: null };

  await connectMongodb();

  const order = await OrderModel.findOne({ stripeSessionId: sessionId });
  if (!order) return { updated: false, order: null };

  if (order.paymentStatus === "pending") {
    order.paymentStatus = "cancelled";
    if (!order.paymentIntentId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_intent) order.paymentIntentId = session.payment_intent;
      } catch {
        // Session lookup is best-effort; status update still succeeds.
      }
    }
    await order.save();
    return { updated: true, order };
  }

  return { updated: false, order };
};

/** Cancel a pending order by its Stripe payment intent id (for the
 *  `payment_intent.cancelled` webhook). Returns { updated, order }. */
export const cancelOrderByPaymentIntent = async (paymentIntentId) => {
  if (!paymentIntentId) return { updated: false, order: null };

  await connectMongodb();

  const order = await OrderModel.findOne({ paymentIntentId });
  if (!order || order.paymentStatus !== "pending") {
    return { updated: false, order };
  }

  order.paymentStatus = "cancelled";
  await order.save();
  return { updated: true, order };
};

/** Build a full paid order from a completed Stripe session (fallback path). */
const buildPaidOrder = async (session) => {
  const sessionId = session.id;
  const lineItems = session?.line_items?.data || [];
  const couponCode = session?.metadata?.couponCode || "";
  const discountMinor = session?.total_details?.amount_discount || 0;
  const discountAmount = discountMinor / 100;

  const orderItems = lineItems
    .map((item) => ({
      product: item.price.product.metadata?.productId,
      color: item.price.product.metadata?.color || "",
      size: item.price.product.metadata?.size || "",
      quantity: item.quantity,
    }))
    .filter((item) => item.product);

  const address = session?.shipping_details?.address || {};

  const newOrder = new OrderModel({
    customerUserId: session?.client_reference_id,
    products: orderItems,
    shippingAddress: {
      street: address.line1 || address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postal_code || "",
      country: address.country || "",
      phone: session?.shipping_details?.phone || session?.customer_details?.phone || "",
    },
    shippingRate: session?.shipping_cost?.shipping_rate || "",
    subtotalAmount: session?.amount_subtotal ? session.amount_subtotal / 100 : 0,
    shippingAmount:
      session?.amount_total && session?.amount_subtotal
        ? (session.amount_total - session.amount_subtotal + discountMinor) / 100
        : 0,
    discountAmount,
    couponCode,
    totalAmount: session?.amount_total ? session.amount_total / 100 : 0,
    paymentStatus: "paid",
    orderStatus: "placed",
    stripeSessionId: sessionId,
    paymentIntentId: session?.payment_intent || "",
    invoiceNumber: await generateInvoiceNumber(),
  });

  await newOrder.save();
  return newOrder;
};

/** Link a paid order to the customer record (idempotent). */
const linkCustomer = async (order, session) => {
  const customerInfo = {
    userId: session?.client_reference_id,
    name: session?.customer_details?.name,
    email: session?.customer_details?.email,
  };

  if (!customerInfo.userId) return;

  let customer = await CustomerModel.findOne({ userId: customerInfo.userId });

  if (customer) {
    if (!customer.orders.includes(order._id)) {
      customer.orders.push(order._id);
      if (customerInfo.name) customer.name = customerInfo.name;
      if (customerInfo.email) customer.email = customerInfo.email;
    }
  } else {
    customer = new CustomerModel({
      ...customerInfo,
      orders: [order._id],
    });
  }

  await customer.save();
};
