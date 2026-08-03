"use client";
import { BASEURL } from "@lib/config";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Search, SearchX, Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "@/components/UI/ProductCard";
import SearchableSelect from "@/components/SearchableSelect";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
];

const PAGE_SIZES = [
  { value: "12", label: "12 per page" },
  { value: "24", label: "24 per page" },
  { value: "48", label: "48 per page" },
];

const DEFAULT_LIMIT = 12;

const SkeletonCard = () => (
  <div className="w-full max-w-[280px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="aspect-[4/5] bg-slate-200" />
    <div className="space-y-3 p-4">
      <div className="h-3.5 w-3/4 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-200" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-slate-200" />
        <div className="h-3 w-10 rounded bg-slate-200" />
      </div>
    </div>
  </div>
);

const CollectionProducts = ({ collectionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;

  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateParamsRef = useRef(() => {});
  const lastCommittedSearch = useRef(search);

  useEffect(() => {
    updateParamsRef.current = (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };
  }, [router, pathname, searchParams]);

  const commitSearch = (value) => {
    lastCommittedSearch.current = value;
    updateParamsRef.current({ search: value, page: "" });
  };

  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => commitSearch(searchInput), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, search]);

  useEffect(() => {
    if (search !== lastCommittedSearch.current) {
      lastCommittedSearch.current = search;
      setSearchInput(search);
    }
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("collection", collectionId);
    if (search) params.set("search", search);
    if (sort !== "newest") params.set("sort", sort);
    params.set("page", page);
    params.set("limit", limit);

    (async () => {
      try {
        const result = await fetch(`${BASEURL}/api/product?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!result.ok) throw new Error("Failed to fetch products");
        const data = await result.json();
        if (cancelled) return;
        setProducts(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error(error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collectionId, search, sort, page, limit]);

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

  const goToPage = (next) =>
    updateParamsRef.current({ page: next === 1 ? "" : String(next) });

  const clearSearch = () => {
    lastCommittedSearch.current = "";
    setSearchInput("");
    updateParamsRef.current({ search: "", page: "" });
  };

  const skeletonCount = Math.min(limit, 12);

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Products in this collection
          </p>
          <h2 className="section-title mt-2">
            {total} product{total === 1 ? "" : "s"}
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search this collection…"
            className="input-field !pl-10"
          />
        </div>
        <div className="w-full md:w-56">
          <SearchableSelect
            value={sort}
            onChange={(value) =>
              updateParamsRef.current({ sort: value === "newest" ? "" : value })
            }
            placeholder="Sort by"
            options={sortOptions}
            className="input-field"
          />
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 py-24 text-center">
          <SearchX className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {search ? "No matching products" : "No products in this collection"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "This collection doesn't have any products yet."}
            </p>
          </div>
          {search && (
            <button onClick={clearSearch} className="btn-secondary">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={`mt-8 grid grid-cols-1 justify-items-center gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
            <p className="text-sm text-slate-500">
              Showing {from}–{to} of {total} product{total === 1 ? "" : "s"}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
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
                      onClick={() => goToPage(item)}
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
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <SearchableSelect
              value={String(limit)}
              onChange={(value) =>
                updateParamsRef.current({ limit: value, page: "" })
              }
              options={PAGE_SIZES}
              dropdownPosition="up"
              showCheck={false}
              className="input-field !w-auto"
            />
          </div>
        </>
      )}
    </>
  );
};

const CollectionProductsWrapper = ({ collectionId }) => (
  <Suspense
    fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }
  >
    <CollectionProducts collectionId={collectionId} />
  </Suspense>
);

export default CollectionProductsWrapper;
