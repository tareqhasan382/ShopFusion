import Image from "next/image";
import Link from "next/link";
import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import OrderModel from "@lib/models/OrderModel";
import ProductModel from "@lib/models/ProductModel";
import StatusPill from "@/components/StatusPill";
import OrderTimeline from "@/components/OrderTimeline";
import { formatPrice } from "@lib/format";
import { getPaymentStatus, getOrderStatus } from "@lib/orderStatus";
import { PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

const Orders = async () => {
  const session = await getSession();
  if (!session) return null;

  let orders = [];
  try {
    await connectMongodb();
    orders = await OrderModel.find({ customerUserId: session.id })
      .sort({ createdAt: "desc" })
      .populate({ path: "products.product", model: ProductModel })
      .lean();
  } catch (error) {
    console.error("[orders]", error);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
      <hr className="my-6 border-slate-200" />

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <PackageSearch className="h-12 w-12 text-slate-300" />
          <p className="text-slate-500">You have no orders yet.</p>
          <Link href="/" className="btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order?._id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Order ID
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {String(order._id)}
                  </p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Placed
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="text-sm font-bold text-indigo-600">
                      ${formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <StatusPill kind="payment" value={getPaymentStatus(order)} />
                      <StatusPill kind="order" value={getOrderStatus(order)} />
                    </div>
                    <Link
                      href={`/orders/${order._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </div>

            <div className="mt-4 rounded-lg bg-slate-50 px-4 py-4">
                <OrderTimeline status={getOrderStatus(order)} />
              </div>

              <div className="mt-4 space-y-4">
                {order?.products?.map((orderItem) => (
                  <div
                    key={orderItem?.product?._id}
                    className="flex items-center gap-4"
                  >
                    <Image
                      src={orderItem?.product?.media?.[0] || "/placeholder.svg"}
                      alt={orderItem?.product?.title || "Product"}
                      width={100}
                      height={100}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {orderItem?.product?.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        Qty: {orderItem.quantity}
                        {orderItem.color && ` · ${orderItem.color}`}
                        {orderItem.size && ` · ${orderItem.size}`}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      ${formatPrice(orderItem?.product?.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
