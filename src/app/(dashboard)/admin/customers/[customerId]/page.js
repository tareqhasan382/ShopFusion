"use client";
import { BASEURL } from "@lib/config";
import Link from "next/link";
import FormateDate from "@/components/FormateDate";
import StatusPill from "@/components/StatusPill";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag, Wallet, CheckCircle2, CalendarDays, ReceiptText } from "lucide-react";
import { formatPrice } from "@lib/format";
import DataTable from "@/components/Dashboard/DataTable";

const initials = (name) =>
  (name || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StatCard = ({ icon: Icon, label, value, accent = "text-indigo-600 bg-indigo-50" }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
      <Icon className="h-4.5 w-4.5" />
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

const CustomerHistory = ({ params }) => {
  const { customerId } = params;
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetch(`${BASEURL}/api/customer/${customerId}`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await result.json();
        if (!result.ok) throw new Error(data.message || "Failed to load customer");
        setRes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !res?.customer) {
    return <p className="py-12 text-center text-slate-500">{error || "Customer not found."}</p>;
  }

  const { customer, orders = [], stats = {} } = res;

  const columns = [
    {
      key: "_id",
      label: "Order",
      render: (item) => (
        <div>
          <Link
            href={`/admin/orders/${item._id}`}
            className="font-mono text-xs text-indigo-600 hover:underline"
          >
            {String(item._id).slice(-8).toUpperCase()}
          </Link>
          {item.invoiceNumber && (
            <p className="text-xs text-slate-400">{item.invoiceNumber}</p>
          )}
        </div>
      ),
    },
    {
      key: "products",
      label: "Items",
      render: (item) => (
        <span className="text-slate-600">
          {item.products?.length} {item.products?.length === 1 ? "item" : "items"}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (item) => (
        <span className="font-semibold text-slate-900">${formatPrice(item.totalAmount)}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (item) => <StatusPill kind="payment" value={item.paymentStatus} />,
    },
    {
      key: "orderStatus",
      label: "Order status",
      render: (item) => <StatusPill kind="order" value={item.orderStatus} />,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item) => <FormateDate date={item.createdAt} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
          {initials(customer.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900">{customer.name || "Customer"}</h2>
          <p className="text-sm text-slate-500">{customer.email || "—"}</p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>Joined</p>
          <p className="font-medium text-slate-900">
            <FormateDate date={customer.createdAt} />
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total orders" value={stats.totalOrders ?? 0} />
        <StatCard
          icon={Wallet}
          label="Total spent"
          value={`$${formatPrice(stats.totalSpent)}`}
          accent="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Paid orders"
          value={stats.paidOrders ?? 0}
          accent="text-amber-600 bg-amber-50"
        />
        <StatCard
          icon={CalendarDays}
          label="Last order"
          value={stats.lastOrderAt ? <FormateDate date={stats.lastOrderAt} /> : "—"}
          accent="text-rose-600 bg-rose-50"
        />
      </div>

      <div className="flex items-center gap-2">
        <ReceiptText className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Order history ({orders.length})
        </h3>
      </div>

      <DataTable
        columns={columns}
        rows={orders}
        loading={false}
        pageSize={10}
        searchPlaceholder="Search invoice, status…"
        emptyMessage="No orders yet."
      />
    </div>
  );
};

export default CustomerHistory;
