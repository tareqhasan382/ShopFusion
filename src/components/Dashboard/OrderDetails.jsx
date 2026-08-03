"use client";
import { BASEURL } from "@lib/config";
import React, { useEffect, useState } from "react";
import FormateDate from "../FormateDate";
import StatusPill from "../StatusPill";
import OrderTimeline from "../OrderTimeline";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  User,
  ShoppingBag,
  Save,
  FileDown,
  ReceiptText,
  Copy,
  Check,
  Phone,
  CreditCard,
  Truck,
  Pencil,
  X,
} from "lucide-react";
import { formatPrice } from "@lib/format";
import {
  PAYMENT_STATUSES,
  ORDER_STATUSES,
  paymentStatusLabel,
  orderStatusLabel,
  getPaymentStatus,
  getOrderStatus,
} from "@lib/orderStatus";
import SearchableSelect from "@/components/SearchableSelect";

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const ADDRESS_FIELDS = [
  { key: "street", label: "Street address", placeholder: "123 Main St", colSpan: true },
  { key: "city", label: "City", placeholder: "New York" },
  { key: "state", label: "State", placeholder: "NY" },
  { key: "postalCode", label: "Postal code", placeholder: "10001" },
  { key: "country", label: "Country", placeholder: "United States" },
  { key: "phone", label: "Contact number", placeholder: "+1 555 000 0000" },
];

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <button
      onClick={copy}
      aria-label="Copy to clipboard"
      className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

const InfoRow = ({ label, value, mono }) =>
  value ? (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`mt-0.5 font-medium text-slate-900 ${
          mono ? "flex items-center gap-1.5 font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  ) : null;

const OrderDetails = ({ orderId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [res, setRes] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingForm, setShippingForm] = useState({});
  const [editingShipping, setEditingShipping] = useState(false);
  const [message, setMessage] = useState(null);
  const [addressMessage, setAddressMessage] = useState(null);

  useEffect(() => {
    const getOrder = async () => {
      setLoading(true);
      try {
        const result = await fetch(`${BASEURL}/api/order/${orderId}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!result.ok) throw new Error("Failed to fetch order");
        const data = await result.json();
        setRes(data);
        setOrderStatus(getOrderStatus(data.orderDetails));
        setPaymentStatus(getPaymentStatus(data.orderDetails));
        setTrackingNumber(data.orderDetails?.trackingNumber || "");
        setShippingForm(data.orderDetails?.shippingAddress || {});
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getOrder();
  }, [orderId]);

  const updateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await fetch(`${BASEURL}/api/order/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber,
        }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.message || "Failed to update");
      setMessage({ type: "success", text: "Order status updated." });
      if (data.orderDetails) {
        setRes((prev) => ({ ...prev, orderDetails: data.orderDetails }));
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const saveShipping = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAddressMessage(null);
    try {
      const result = await fetch(`${BASEURL}/api/order/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: shippingForm }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.message || "Failed to update address");
      setAddressMessage({ type: "success", text: "Shipping address updated." });
      if (data.orderDetails) {
        setRes((prev) => ({ ...prev, orderDetails: data.orderDetails }));
      }
      setEditingShipping(false);
    } catch (error) {
      setAddressMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!res?.orderDetails) {
    return (
      <p className="py-12 text-center text-slate-500">Order not found.</p>
    );
  }

  const order = res.orderDetails;
  const customer = res.customer;
  const shipping = order.shippingAddress || {};
  const subtotal = order.subtotalAmount ?? order.totalAmount ?? 0;
  const discount = order.discountAmount || 0;
  const shippingAmount = order.shippingAmount || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {order.invoiceNumber
                ? `Invoice ${order.invoiceNumber}`
                : `Order #${String(order._id).slice(-6).toUpperCase()}`}
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              {String(order._id).slice(-6).toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Placed on <FormateDate date={order.createdAt} />
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/orders/${order._id}/invoice`}
            target="_blank"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Invoice PDF
          </Link>
          <StatusPill kind="payment" value={paymentStatus} />
          <StatusPill kind="order" value={orderStatus} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <ReceiptText className="h-4 w-4" /> Order reference
        </h3>
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-slate-500">Invoice number</dt>
            <dd className="mt-0.5 font-semibold text-slate-900">
              {order.invoiceNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Order ID</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-slate-900">
              {order._id}
              <CopyButton text={order._id} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Payment intent</dt>
            <dd className="mt-0.5 flex items-start gap-1.5 font-mono text-xs text-slate-900">
              <span className="break-all">
                {order.paymentIntentId || "—"}
              </span>
              {order.paymentIntentId && <CopyButton text={order.paymentIntentId} />}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Placed</dt>
            <dd className="mt-0.5 font-medium text-slate-900">
              <FormateDate date={order.createdAt} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Order tracking
        </h3>
        <OrderTimeline status={orderStatus} />
      </div>

      <form
        onSubmit={updateStatus}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment status
          </label>
          <SearchableSelect
            value={paymentStatus}
            onChange={setPaymentStatus}
            options={PAYMENT_STATUSES.map((value) => ({
              value,
              label: paymentStatusLabel(value),
            }))}
            className={selectClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Order status
          </label>
          <SearchableSelect
            value={orderStatus}
            onChange={setOrderStatus}
            options={ORDER_STATUSES.map((value) => ({
              value,
              label: orderStatusLabel(value),
            }))}
            className={selectClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tracking number
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. 1Z999AA10123456784"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save status
          </button>
          {message && (
            <span
              className={`ml-3 text-sm ${
                message.type === "success"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <User className="h-4 w-4" /> Customer
          </h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {customer?.name || "Guest"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {customer?.email || "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <MapPin className="h-4 w-4" /> Shipping address
            </h3>
            {!editingShipping && (
              <button
                type="button"
                onClick={() => {
                  setShippingForm(shipping);
                  setAddressMessage(null);
                  setEditingShipping(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>

          {editingShipping ? (
            <form onSubmit={saveShipping} className="grid gap-4 sm:grid-cols-2">
              {ADDRESS_FIELDS.map((field) => (
                <div key={field.key} className={field.colSpan ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={shippingForm[field.key] || ""}
                    onChange={(e) =>
                      setShippingForm((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShippingForm(shipping);
                    setAddressMessage(null);
                    setEditingShipping(false);
                  }}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                {addressMessage && (
                  <span
                    className={`text-sm ${
                      addressMessage.type === "success"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {addressMessage.text}
                  </span>
                )}
              </div>
            </form>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Street</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {shipping.street || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">City / State</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {[shipping.city, shipping.state].filter(Boolean).join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Postal code / Country</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {[shipping.postalCode, shipping.country].filter(Boolean).join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="h-3.5 w-3.5" /> Contact number
                </dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {shipping.phone || "—"}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <ShoppingBag className="h-4 w-4" /> Products ({order.products?.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {order.products?.map((item, index) => {
            const product = item.product;
            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-4 py-4"
              >
                {product?.media?.[0] ? (
                  <Image
                    src={product.media[0]}
                    alt={product?.title || "Product"}
                    height={64}
                    width={64}
                    className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                    No image
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {product?.title || product?._id}
                  </p>
                  <p className="text-sm text-slate-500">
                    {product?.category}
                    {item.size && ` · Size ${item.size}`}
                    {item.color && ` · Color ${item.color}`}
                  </p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatPrice(product?.price)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span>
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}
              </span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Truck className="h-3.5 w-3.5" /> Shipping
            </span>
            <span className="font-medium text-slate-900">
              {formatPrice(shippingAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/orders" className="btn-secondary inline-flex">
          Back to orders
        </Link>
        {order.paymentStatus === "paid" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <CreditCard className="h-3.5 w-3.5" />
            Payment confirmed · {order.paymentIntentId ? "Charge ID recorded" : "Awaiting charge details"}
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
