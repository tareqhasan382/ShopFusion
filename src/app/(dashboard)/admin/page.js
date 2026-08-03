"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CircleDollarSign,
  ShoppingBag,
  UserRound,
  Hourglass,
  PackageOpen,
  PackageX,
  Loader2,
  TrendingUp,
  PieChart,
  Clock,
} from "lucide-react";
import { BASEURL } from "@lib/config";
import SalesChart from "@/components/Dashboard/SalesChart";
import DataTable from "@/components/Dashboard/DataTable";
import StatusPill from "@/components/StatusPill";
import { formatPrice } from "@lib/format";
import { getPaymentStatus, getOrderStatus } from "@lib/orderStatus";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getJson = async (url) => {
    const result = await fetch(url, { method: "GET", cache: "no-store" });
    if (!result.ok) throw new Error("Failed to fetch data");
    return result.json();
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const [data, chart] = await Promise.all([
          getJson(`${BASEURL}/api/admin/analytics`),
          getJson(`${BASEURL}/api/admin/graphdata`),
        ]);
        setAnalytics(data);
        setGraphData(chart?.graphData || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const stats = [
    {
      label: "Total Revenue",
      value: `$${formatPrice(analytics?.totalRevenue)}`,
      icon: CircleDollarSign,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrders ?? 0,
      icon: ShoppingBag,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Total Customers",
      value: analytics?.totalCustomers ?? 0,
      icon: UserRound,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pending Orders",
      value: analytics?.pendingOrders ?? 0,
      icon: Hourglass,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      label: "Low Stock",
      value: analytics?.lowStock ?? 0,
      icon: PackageOpen,
      accent: "bg-orange-50 text-orange-600",
    },
    {
      label: "Out of Stock",
      value: analytics?.outOfStock ?? 0,
      icon: PackageX,
      accent: "bg-rose-50 text-rose-600",
    },
  ];

  const maxCategoryRevenue = Math.max(
    1,
    ...(analytics?.categoryRevenue || []).map((c) => c.revenue)
  );

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.accent}`}
                >
                  <stat.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-0.5 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Sales by month
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {new Date().getFullYear()}
              </span>
            </div>
            <SalesChart data={graphData} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Top selling products
                </h2>
                <Link
                  href="/admin/inventory"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View inventory
                </Link>
              </div>
              {analytics?.topProducts?.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No sales yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics?.topProducts?.map((product, index) => (
                    <div key={product._id} className="flex items-center gap-4">
                      <span className="w-5 text-center text-sm font-bold text-slate-400">
                        {index + 1}
                      </span>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                          No img
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {product.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.units} sold
                          {product.stock === 0 && (
                            <span className="ml-2 font-semibold text-rose-600">
                              · Out of stock
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        ${formatPrice(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <PieChart className="h-5 w-5 text-indigo-600" />
                  Revenue by category
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Paid orders
                </span>
              </div>
              {analytics?.categoryRevenue?.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No category revenue yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics?.categoryRevenue?.map((item) => (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-slate-700">
                          {item.category}
                        </span>
                        <span className="font-semibold text-slate-900">
                          ${formatPrice(item.revenue)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{
                            width: `${(item.revenue / maxCategoryRevenue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DataTable
            title={
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Recent orders
              </span>
            }
            footer={
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            }
            bodyHeight="h-[280px]"
            columns={[
              {
                key: "_id",
                label: "Order",
                render: (order) => (
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    {String(order._id).slice(-8)}
                  </Link>
                ),
              },
              {
                key: "createdAt",
                label: "Date",
                render: (order) => new Date(order.createdAt).toLocaleDateString(),
              },
              {
                key: "totalAmount",
                label: "Total",
                render: (order) => (
                  <span className="font-semibold text-slate-900">
                    ${formatPrice(order.totalAmount)}
                  </span>
                ),
              },
              {
                key: "payment",
                label: "Payment",
                render: (order) => <StatusPill kind="payment" value={getPaymentStatus(order)} />,
              },
              {
                key: "status",
                label: "Status",
                render: (order) => <StatusPill kind="order" value={getOrderStatus(order)} />,
              },
            ]}
            rows={analytics?.recentOrders || []}
            emptyMessage="No orders yet."
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
