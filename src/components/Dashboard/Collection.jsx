"use client";
import { BASEURL } from "@lib/config";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/Dashboard/DataTable";
import { Trash2, PencilLine, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

const Collection = ({ page, search = "", limit = 10 }) => {
  const router = useRouter();
  const [collections, setCollections] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCollections = async (currentPage, searchTerm) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit });
      if (searchTerm) params.set("search", searchTerm);
      const result = await fetch(
        `${BASEURL}/api/collection?${params.toString()}`,
        { method: "GET", cache: "no-store" }
      );
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setCollections(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load collections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections(page, search);
  }, [page, search, limit]);

  const handleDelete = async (collectionId) => {
    if (!window.confirm("Are you sure you want to delete this collection?"))
      return;
    setDeleting(collectionId);
    try {
      const result = await fetch(`${BASEURL}/api/collection/${collectionId}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to delete data");
      toast.success("Collection deleted.");
      fetchCollections(page);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete collection.");
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Collection",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.image ? (
            <Image
              src={item.image}
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
          <div>
            <p className="font-medium text-slate-900">{item.title}</p>
            {item.description && (
              <p className="max-w-xs truncate text-xs text-slate-500">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (item) => (
        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {item.products?.length ?? 0}
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
            href={`/admin/collections/${item._id}`}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Edit collection"
          >
            <PencilLine className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleting === item._id}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Delete collection"
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
      rows={collections?.data || []}
      loading={loading}
      page={page}
      total={collections?.total || 0}
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
      searchPlaceholder="Search collections…"
      emptyMessage="No collections found. Create your first collection to get started."
    />
  );
};

export default Collection;
