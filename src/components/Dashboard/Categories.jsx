"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { Trash2, PencilLine, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import DataTable from "@/components/Dashboard/DataTable";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/category`, { method: "GET", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setCategories(data.data || []);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setDeleting(categoryId);
    try {
      const result = await fetch(`${BASEURL}/api/category/${categoryId}`, { method: "DELETE", cache: "no-store" });
      if (!result.ok) throw new Error("Failed to delete data");
      toast.success("Category deleted.");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Category",
      render: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.title}</p>
          {item.description && (
            <p className="max-w-xs truncate text-xs text-slate-500">{item.description}</p>
          )}
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
            href={`/admin/categories/${item._id}`}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Edit category"
          >
            <PencilLine className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleting === item._id}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Delete category"
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
      rows={categories}
      loading={loading}
      emptyMessage="No categories yet. Create your first category to organize products."
    />
  );
};

export default Categories;
