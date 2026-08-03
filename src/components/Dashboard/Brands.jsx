"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { Trash2, PencilLine, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import DataTable from "@/components/Dashboard/DataTable";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/brand`, { method: "GET", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setBrands(data.data || []);
    } catch {
      toast.error("Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (brandId) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;
    setDeleting(brandId);
    try {
      const result = await fetch(`${BASEURL}/api/brand/${brandId}`, { method: "DELETE", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to delete data");
      toast.success("Brand deleted.");
      fetchBrands();
    } catch {
      toast.error("Failed to delete brand.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Brand",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logo} alt={item.name} className="h-9 w-9 rounded-lg border border-slate-200 object-contain" />
          )}
          <p className="font-medium text-slate-900">{item.name}</p>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (item) => <span className="text-slate-500">{item.slug}</span>,
    },
    {
      key: "productCount",
      label: "Products",
      render: (item) => (
        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {item.productCount ?? 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/brands/${item._id}`}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Edit brand"
          >
            <PencilLine className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleting === item._id}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Delete brand"
          >
            {deleting === item._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={brands}
      loading={loading}
      emptyMessage="No brands yet. Create your first brand to organize products."
    />
  );
};

export default Brands;
