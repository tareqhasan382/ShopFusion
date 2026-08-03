"use client";
import { BASEURL } from "@lib/config";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import SearchableSelect from "@/components/SearchableSelect";

const PAGE_SIZES = [
  { value: "9", label: "9 per page" },
  { value: "18", label: "18 per page" },
  { value: "27", label: "27 per page" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most products" },
  { value: "newest", label: "Newest" },
];

const CollectionCard = ({ collection }) => (
  <Link
    href={`/collections/${collection._id}`}
    className="group relative overflow-hidden rounded-2xl bg-slate-100"
  >
    <Image
      src={collection.image || "/placeholder.svg"}
      alt={collection.title}
      width={700}
      height={420}
      className="aspect-[5/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
    {(collection.products?.length ?? 0) > 0 && (
      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
        {collection.products.length} items
      </span>
    )}
    <div className="absolute inset-x-0 bottom-0 p-5">
      <h2 className="text-lg font-bold text-white">{collection.title}</h2>
      {collection.description && (
        <p className="mt-1 line-clamp-2 text-sm text-white/80">
          {collection.description}
        </p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white">
        Shop now
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

const CollectionsListing = () => {
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      params.set("sort", sort);
      if (search) params.set("search", search);
      const result = await fetch(`${BASEURL}/api/collection?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch collections");
      const data = await result.json();
      setCollections(data.data || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load collections.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, search]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handlePageSize = (value) => {
    setLimit(Number(value));
    setPage(1);
  };

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPageItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items = [1];
    if (page > 3) items.push("start-ellipsis");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      items.push(i);
    }
    if (page < totalPages - 2) items.push("end-ellipsis");
    items.push(totalPages);
    return items;
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Browse the store
        </p>
        <h1 className="section-title mt-2">All Collections</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          Explore every curated category, from everyday essentials to limited
          drops.
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search collections…"
            className="input-field !pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SearchableSelect
            value={sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            options={SORT_OPTIONS}
            dropdownPosition="up"
            showCheck={false}
            className="input-field !w-auto"
          />
          <SearchableSelect
            value={String(limit)}
            onChange={handlePageSize}
            options={PAGE_SIZES}
            dropdownPosition="up"
            showCheck={false}
            className="input-field !w-auto"
          />
          <span className="text-xs whitespace-nowrap text-slate-500">
            {total === 0 ? "No results" : `${from}–${to} of ${total}`}
          </span>
        </div>
      </div>

      {loading && collections.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-slate-500">No collections match your search.</p>
          <button
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPage(1);
            }}
            className="btn-secondary"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className={`mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
          {collections.map((collection) => (
            <CollectionCard key={collection._id} collection={collection} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageItems().map((item) =>
            item === "start-ellipsis" || item === "end-ellipsis" ? (
              <span key={item} className="px-1 text-sm text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => setPage(item)}
                aria-current={page === item ? "page" : undefined}
                className={`h-10 min-w-10 rounded-lg px-2 text-sm font-semibold transition-colors ${
                  page === item
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionsListing;
