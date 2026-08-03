"use client";
import { BASEURL } from "@lib/config";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PencilLine, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import FormateDate from "@/components/FormateDate";
import DataTable from "@/components/Dashboard/DataTable";
import SearchableSelect from "@/components/SearchableSelect";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/coupon`, { method: "GET", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setCoupons(data.data || []);
    } catch {
      toast.error("Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return coupons.filter((item) => {
      if (type && item.type !== type) return false;
      const expired = item.expiresAt && new Date(item.expiresAt) < now;
      const active = item.isActive && !expired;
      if (status === "active" && !active) return false;
      if (status === "inactive" && active) return false;
      return true;
    });
  }, [coupons, type, status]);

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    setDeleting(couponId);
    try {
      const result = await fetch(`${BASEURL}/api/coupon/${couponId}`, { method: "DELETE", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to delete data");
      toast.success("Coupon deleted.");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete coupon.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (item) => (
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-800">
          {item.code}
        </span>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (item) => (
        <span className="text-slate-700">
          {item.type === "percent" ? `${item.value}%` : `$${item.value.toFixed(2)}`}
          {item.maxDiscount > 0 && (
            <span className="text-xs text-slate-400"> (max ${item.maxDiscount.toFixed(2)})</span>
          )}
        </span>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      render: (item) => (
        <span className="text-slate-500">
          {item.usedCount}
          {item.usageLimit > 0 ? ` / ${item.usageLimit}` : ""}
        </span>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires",
      render: (item) => (
        <span className="text-slate-500">
          {item.expiresAt ? <FormateDate date={item.expiresAt} /> : "Never"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const expired = item.expiresAt && new Date(item.expiresAt) < new Date();
        const active = item.isActive && !expired;
        return (
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
              active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/coupons/${item._id}`}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Edit coupon"
          >
            <PencilLine className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleting === item._id}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Delete coupon"
          >
            {deleting === item._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3">
        <SearchableSelect
          value={type}
          onChange={setType}
          placeholder="All types"
          options={[
            { value: "", label: "All types" },
            { value: "percent", label: "Percent (%)" },
            { value: "fixed", label: "Fixed ($)" },
          ]}
          className="input-field !w-auto min-w-52"
        />
        <SearchableSelect
          value={status}
          onChange={setStatus}
          placeholder="All statuses"
          options={[
            { value: "", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          className="input-field !w-auto min-w-52"
        />
      </div>
      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          fillHeight
          searchFields={["code", "value"]}
          searchPlaceholder="Search coupon code…"
          emptyMessage="No coupons yet. Create your first coupon to start offering discounts."
        />
      </div>
    </div>
  );
};

export default Coupons;
