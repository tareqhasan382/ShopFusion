"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormateDate from "@/components/FormateDate";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/Dashboard/DataTable";

const getCustomers = async ({ page, limit, search }) => {
  try {
    const params = new URLSearchParams({ page });
    if (limit) params.set("limit", limit);
    if (search) params.set("search", search);
    const result = await fetch(
      `${BASEURL}/api/customer?${params.toString()}`,
      { method: "GET", cache: "no-store" }
    );
    if (!result.ok) throw new Error("Failed to load customers");
    return result.json();
  } catch (error) {
    console.log(error);
    return null;
  }
};

const Customers = ({ searchParams }) => {
  const router = useRouter();
  const [customers, setCustomers] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const page = parseInt(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const limit = parseInt(searchParams?.limit) || 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCustomers({ page, limit, search });
      setCustomers(data || { data: [], total: 0 });
      setLoading(false);
    };
    load();
  }, [page, limit, search]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (item) => (
        <Link
          href={`/admin/customers/${item._id}`}
          className="font-medium text-slate-900 transition-colors hover:text-indigo-600 hover:underline"
        >
          {item.name || "Customer"}
        </Link>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (item) => <span className="text-slate-600">{item.email}</span>,
    },
    {
      key: "orders",
      label: "Orders",
      render: (item) => (
        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {item.orders?.length ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item) => <FormateDate date={item.createdAt} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={customers?.data || []}
      loading={loading}
      page={page}
      total={customers?.total || 0}
      pageSize={limit}
      searchValue={search}
      onSearch={(q) => {
        router.push(`?page=1&limit=${limit}${q ? `&search=${encodeURIComponent(q)}` : ""}`);
      }}
      onPageChange={(p) => {
        router.push(`?page=${p}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      }}
      onPageSizeChange={(l) => {
        router.push(`?page=1&limit=${l}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      }}
      searchPlaceholder="Search name or email…"
      emptyMessage="No customers yet."
    />
  );
};

export default Customers;
