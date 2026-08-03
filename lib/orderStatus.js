/**
 * Order tracking statuses.
 *
 * Payment lifecycle: pending -> paid -> (cancelled | refunded)
 * Order lifecycle:   placed -> processing -> shipped -> delivered
 *                    (any stage can branch to cancelled | returned)
 */

export const PAYMENT_STATUSES = ["pending", "paid", "cancelled", "refunded"];

export const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

/** Main fulfillment flow (used for the tracking timeline). */
export const ORDER_TIMELINE = ["placed", "processing", "shipped", "delivered"];

export const PAYMENT_STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const ORDER_STATUS_LABELS = {
  placed: "Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PAYMENT_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
  refunded: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const ORDER_STATUS_STYLES = {
  placed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
  returned: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

export const paymentStatusLabel = (value) =>
  PAYMENT_STATUS_LABELS[value] || value || "Pending";

export const orderStatusLabel = (value) =>
  ORDER_STATUS_LABELS[value] || value || "Placed";

/**
 * Resolve an order's payment status, falling back to the legacy `status`
 * field for orders created before the two-status model existed.
 */
export const getPaymentStatus = (order) => {
  if (order?.paymentStatus) return order.paymentStatus;
  if (order?.status === "paid") return "paid";
  if (order?.status === "cancelled") return "cancelled";
  return "pending";
};

/**
 * Resolve an order's fulfillment status with a legacy `status` fallback.
 */
export const getOrderStatus = (order) => {
  if (order?.orderStatus) return order.orderStatus;
  const legacy = { paid: "placed", pending: "placed" }[order?.status];
  if (legacy) return legacy;
  if (ORDER_STATUSES.includes(order?.status)) return order.status;
  return "placed";
};
