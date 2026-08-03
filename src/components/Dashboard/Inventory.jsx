"use client";
import { BASEURL } from "@lib/config";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import DataTable from "@/components/Dashboard/DataTable";
import SearchableSelect from "@/components/SearchableSelect";

const tabs = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
];

const Inventory = ({ threshold }) => {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingId, setSavingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/product?limit=100`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setProducts(data.data || []);
    } catch {
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const lowStock = (p) => p.stock > 0 && p.stock <= threshold;
  const outOfStock = (p) => p.stock === 0;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((p) => {
      const isLow = p.stock > 0 && p.stock <= threshold;
      const isOut = p.stock === 0;
      if (tab === "low" && !isLow) return false;
      if (tab === "out" && !isOut) return false;
      if (category !== "all" && p.category !== category) return false;
      if (query && !p.title?.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [products, tab, search, category, threshold]);

  const tabCount = (key) =>
    key === "low"
      ? products.filter(lowStock).length
      : key === "out"
      ? products.filter(outOfStock).length
      : products.length;

  const saveStock = async (product) => {
    const value = Number(editingValue);
    if (isNaN(value) || value < 0) {
      toast.error("Stock must be a non-negative number.");
      return;
    }
    setSavingId(product._id);
    try {
      const result = await fetch(`${BASEURL}/api/product/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
        cache: "no-store",
      });
      const payload = await result.json();
      if (!result.ok) throw new Error(payload?.message || "Failed to update stock.");
      toast.success("Stock updated.");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || "Failed to update stock.");
    } finally {
      setSavingId(null);
    }
  };

  const statusPill = (p) => {
    if (p.stock === 0)
      return (
        <span className="inline-block rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
          Out of stock
        </span>
      );
    if (p.stock <= threshold)
      return (
        <span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Low stock
        </span>
      );
    return (
      <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        In stock
      </span>
    );
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.media?.[0] ? (
            <Image
              src={product.media[0]}
              alt={product.title}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
              No img
            </span>
          )}
          <p className="font-medium text-slate-900">{product.title}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (product) => <span className="text-slate-500">{product.category || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (product) => statusPill(product),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product) =>
        editingId === product._id ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="input-field !w-24 !py-1.5"
              autoFocus
            />
            <button
              onClick={() => saveStock(product)}
              disabled={savingId === product._id}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
              aria-label="Save stock"
            >
              {savingId === product._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Cancel edit"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className={`font-semibold ${product.stock === 0 ? "text-rose-600" : product.stock <= threshold ? "text-amber-600" : "text-slate-900"}`}>
            {product.stock}
          </span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (product) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setEditingId(product._id);
              setEditingValue(String(product.stock ?? 0));
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            Update stock
          </button>
          <Link
            href={`/admin/products/${product._id}`}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Edit
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label} ({tabCount(t.key)})
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 shrink-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <SearchableSelect
          value={category}
          onChange={setCategory}
          placeholder="All categories"
          options={[
            { value: "all", label: "All categories" },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
          className={inputClass}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        fillHeight
        searchable={false}
        emptyMessage="No products match this view."
      />
    </div>
  );
};

export default Inventory;
