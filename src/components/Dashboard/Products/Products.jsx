"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Trash2, PencilLine, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import DataTable from "@/components/Dashboard/DataTable";
import { formatPrice } from "@lib/format";

const Products = ({ page, search = "", limit = 10 }) => {
  const router = useRouter();
  const [products, setProducts] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async (currentPage, searchTerm) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit });
      if (searchTerm) params.set("search", searchTerm);
      const result = await fetch(
        `${BASEURL}/api/product?${params.toString()}`,
        { method: "GET", cache: "no-store" }
      );
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setProducts(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, search);
  }, [page, search, limit]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setDeleting(productId);
    try {
      const result = await fetch(`${BASEURL}/api/product/${productId}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to delete data");
      toast.success("Product deleted.");
      fetchProducts(page);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.media?.[0] ? (
            <Image
              src={item.media[0]}
              alt={item.title}
              width={48}
              height={48}
              className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <ImageIcon className="h-5 w-5" />
            </span>
          )}
          <span className="font-medium text-slate-900">{item.title}</span>
        </div>
      ),
    },
    {
      key: "cost",
      label: "Cost",
      render: (item) => <span className="text-slate-600">{formatPrice(item.cost)}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (item) => <span className="font-semibold text-slate-900">{formatPrice(item.price)}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (item) => (
        <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
          {item.category}
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
            href={`/admin/products/${item._id}`}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Edit product"
          >
            <PencilLine className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleting === item._id}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Delete product"
          >
            {deleting === item._id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={products?.data || []}
      loading={loading}
      page={page}
      total={products?.total || 0}
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
      searchPlaceholder="Search products…"
      emptyMessage="No products found. Create your first product to get started."
    />
  );
};

export default Products;
