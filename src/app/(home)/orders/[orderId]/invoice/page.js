import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@lib/auth";
import { connectMongodb } from "@lib/mongodb";
import OrderModel from "@lib/models/OrderModel";
import CustomerModel from "@lib/models/CustomerModel";
import ProductModel from "@lib/models/ProductModel";
import StoreSettingModel, { getStoreSettings } from "@lib/models/StoreSettingModel";
import { formatPrice } from "@lib/format";
import { getPaymentStatus } from "@lib/orderStatus";
import PrintButton from "@/components/UI/PrintButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Invoice" };

const Invoice = async ({ params }) => {
  const session = await getSession();
  if (!session) return null;

  await connectMongodb();
  const order = await OrderModel.findOne({ _id: params.orderId })
    .populate({ path: "products.product", model: ProductModel })
    .lean();

  const isOwner = order && String(order.customerUserId) === String(session.id);
  const isAdmin = session.role === "admin";

  if (!order || (!isOwner && !isAdmin)) notFound();
  if (order.paymentStatus !== "paid") notFound();

  const customer = await CustomerModel.findOne({ userId: order.customerUserId }).lean();
  const settings = await getStoreSettings();
  const subtotal = order.subtotalAmount ?? order.totalAmount ?? 0;
  const discount = order.discountAmount ?? 0;
  const shipping = order.shippingAmount ?? 0;

  const billedName = customer?.name || session.name || "Customer";
  const billedEmail = customer?.email || session.email;
  const billedPhone = order.shippingAddress?.phone || "";

  return (
    <div className="invoice-page min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-[820px] px-4">
        <div className="no-print mb-4 flex items-center justify-between">
          <Link
            href={`/orders/${order._id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to order
          </Link>
          <PrintButton />
        </div>

        <div className="invoice-sheet rounded-xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="gradient-text text-3xl font-extrabold tracking-tight">
                {settings?.storeName || "ShopFusion"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {settings?.tagline || "Modern e-commerce for every style."}
              </p>
              <p className="mt-2 text-sm text-slate-500">{settings?.address}</p>
              <p className="text-sm text-slate-500">{settings?.supportEmail}</p>
              <p className="text-sm text-slate-500">{settings?.supportPhone}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-900">Invoice</h1>
              <p className="mt-1 text-sm font-semibold text-indigo-600">
                {order.invoiceNumber || String(order._id)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {getPaymentStatus(order)}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs uppercase tracking-wide text-slate-400">Billed to</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {billedName}
            </p>
            <p className="text-sm text-slate-600">{billedEmail}</p>
            {billedPhone && (
              <p className="text-sm text-slate-600">Phone: {billedPhone}</p>
            )}
            {order.shippingAddress && (
              <p className="mt-2 text-sm text-slate-600">
                {order.shippingAddress.street || ""}
                <br />
                {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(", ")}
                {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
                <br />
                {order.shippingAddress.country || ""}
              </p>
            )}
          </div>

          <table className="mt-8 w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4 text-right">Qty</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order?.products?.map((orderItem) => (
                <tr key={orderItem?.product?._id || orderItem._id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-900">
                      {orderItem?.product?.title || "Product"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {orderItem.color && `Color: ${orderItem.color} · `}
                      {orderItem.size && `Size: ${orderItem.size}`}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-600">{orderItem.quantity}</td>
                  <td className="py-3 text-right font-medium text-slate-900">
                    ${formatPrice((orderItem?.product?.price || 0) * orderItem.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">${formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-${formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Shipping</span>
              <span className="font-medium text-slate-900">${formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>${formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          <p className="mt-10 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
            Thank you for shopping with {settings?.storeName || "ShopFusion"}.
            For questions about this invoice, contact {settings?.supportEmail || "support@shopfusion.com"}.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          header,
          footer,
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .invoice-page {
            background: white !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          .invoice-sheet {
            border-radius: 0;
            box-shadow: none;
            border: none;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
