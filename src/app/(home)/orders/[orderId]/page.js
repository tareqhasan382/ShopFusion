import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import OrderModel from "@lib/models/OrderModel";
import ProductModel from "@lib/models/ProductModel";
import StatusPill from "@/components/StatusPill";
import OrderTimeline from "@/components/OrderTimeline";
import { formatPrice } from "@lib/format";
import { getPaymentStatus, getOrderStatus } from "@lib/orderStatus";
import { ArrowLeft, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order Details" };

const OrderDetails = async ({ params }) => {
  const session = await getSession();
  if (!session) return null;

  await connectMongodb();
  const order = await OrderModel.findOne({ _id: params.orderId })
    .populate({ path: "products.product", model: ProductModel })
    .lean();

  const isOwner =
    order && String(order.customerUserId) === String(session.id);
  const isAdmin = session.role === "admin";

  if (!order || (!isOwner && !isAdmin)) notFound();

  const subtotal = order.subtotalAmount ?? order.totalAmount ?? 0;
  const discount = order.discountAmount ?? 0;
  const shipping = order.shippingAmount ?? 0;

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
          <p className="mt-1 text-sm text-slate-500">
            Order {String(order._id)} · Placed {new Date(order.createdAt).toLocaleDateString()}
          </p>
          {order.invoiceNumber && (
            <p className="mt-0.5 text-sm font-semibold text-indigo-600">
              Invoice: {order.invoiceNumber}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusPill kind="payment" value={getPaymentStatus(order)} />
            <StatusPill kind="order" value={getOrderStatus(order)} />
          </div>
          {order.paymentStatus === "paid" && (
            <Link href={`/orders/${order._id}/invoice`} className="btn-primary">
              <FileText className="h-4 w-4" />
              View invoice
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-slate-50 px-4 py-4">
        <OrderTimeline status={getOrderStatus(order)} />
        {order.trackingNumber && (
          <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
            Tracking number:{" "}
            <span className="font-semibold text-slate-900">
              {order.trackingNumber}
            </span>
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Items</h2>
          <div className="mt-4 space-y-4">
            {order?.products?.map((orderItem) => (
              <div
                key={orderItem?.product?._id || orderItem._id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <Image
                  src={orderItem?.product?.media?.[0] || "/placeholder.svg"}
                  alt={orderItem?.product?.title || "Product"}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {orderItem?.product?.title || "Product"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Qty: {orderItem.quantity}
                    {orderItem.color && ` · ${orderItem.color}`}
                    {orderItem.size && ` · ${orderItem.size}`}
                  </p>
                  <p className="text-sm font-semibold text-indigo-600">
                    ${formatPrice(orderItem?.product?.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">${formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-${formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-slate-900">${formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>${formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2>
              <p className="mt-3 text-sm text-slate-600">
                {order.shippingAddress.street || ""}
                <br />
                {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(", ")}
                {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                <br />
                {order.shippingAddress.country || ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
