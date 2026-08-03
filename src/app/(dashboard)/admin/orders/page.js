"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import FormateDate from "@/components/FormateDate";
import StatusPill from "@/components/StatusPill";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { formatPrice } from "@lib/format";
import DataTable from "@/components/Dashboard/DataTable";
import SearchableSelect from "@/components/SearchableSelect";
import {
  PAYMENT_STATUSES,
  ORDER_STATUSES,
  paymentStatusLabel,
  orderStatusLabel,
} from "@lib/orderStatus";

const getOrders = async ({ page, limit, search, paymentStatus, orderStatus }) => {
  try {
    const params = new URLSearchParams({ page });
    if (limit) params.set("limit", limit);
    if (search) params.set("search", search);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    if (orderStatus) params.set("orderStatus", orderStatus);
    const result = await fetch(
      `${BASEURL}/api/order?${params.toString()}`,
      { method: "GET", cache: "no-store" }
    );
    if (!result.ok) throw new Error("Failed to load orders");
    return result.json();
  } catch (error) {
    console.log(error);
    return null;
  }
};

const Orders = ({ searchParams }) => {
  const router = useRouter();
  const [res, setRes] = useState({ paginatedOrderDetails: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const paymentStatus = searchParams?.paymentStatus || "";
  const orderStatus = searchParams?.orderStatus || "";
  const limit = parseInt(searchParams?.limit) || 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getOrders({ page, limit, search, paymentStatus, orderStatus });
      setRes(data || { paginatedOrderDetails: [], total: 0 });
      setLoading(false);
    };
    load();
  }, [page, limit, search, paymentStatus, orderStatus]);

  const queryString = (p, l, searchTerm, pay, ord) => {
    const params = new URLSearchParams({ page: p, limit: l });
    if (searchTerm) params.set("search", searchTerm);
    if (pay) params.set("paymentStatus", pay);
    if (ord) params.set("orderStatus", ord);
    return params.toString();
  };

  const columns = [
    {
      key: "_id",
      label: "Order",
      render: (item) => (
        <Link
          href={`/admin/orders/${item._id}`}
          className="font-mono text-xs text-indigo-600 hover:underline"
        >
          {item._id}
        </Link>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (item) => <span className="font-medium text-slate-900">{item.customer}</span>,
    },
    {
      key: "products",
      label: "Products",
      render: (item) => <span className="text-slate-600">{item.products}</span>,
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (item) => <span className="font-semibold text-slate-900">{formatPrice(item.totalAmount)}</span>,
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
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3">
        <SearchableSelect
          value={paymentStatus}
          onChange={(v) =>
            router.push(`?${queryString(1, limit, search, v, orderStatus)}`)
          }
          placeholder="All payment statuses"
          options={[
            { value: "", label: "All payment statuses" },
            ...PAYMENT_STATUSES.map((value) => ({
              value,
              label: paymentStatusLabel(value),
            })),
          ]}
          className="input-field !w-auto min-w-52"
        />
        <SearchableSelect
          value={orderStatus}
          onChange={(v) =>
            router.push(`?${queryString(1, limit, search, paymentStatus, v)}`)
          }
          placeholder="All order statuses"
          options={[
            { value: "", label: "All order statuses" },
            ...ORDER_STATUSES.map((value) => ({
              value,
              label: orderStatusLabel(value),
            })),
          ]}
          className="input-field !w-auto min-w-52"
        />
      </div>
      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          rows={res?.paginatedOrderDetails || []}
          loading={loading}
          fillHeight
          page={page}
          total={res?.total || 0}
          pageSize={limit}
          searchValue={search}
          onSearch={(q) => {
            router.push(`?${queryString(1, limit, q, paymentStatus, orderStatus)}`);
          }}
          onPageChange={(p) => {
            router.push(`?${queryString(p, limit, search, paymentStatus, orderStatus)}`);
          }}
          onPageSizeChange={(l) => {
            router.push(`?${queryString(1, l, search, paymentStatus, orderStatus)}`);
          }}
          searchPlaceholder="Search order ID or status…"
          emptyMessage="No orders found yet."
        />
      </div>
    </div>
  );
};

export default Orders;
