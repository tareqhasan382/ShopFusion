"use client";
import { BASEURL } from "@lib/config";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  Search,
  SearchX,
  SlidersHorizontal,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const ProductListing = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;

  const [searchInput, setSearchInput] = useState(search);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
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
        if (data.categories?.length) setCategories(data.categories);
        if (data.brands?.length) setBrands(data.brands);
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
  }, [search, category, brand, minPrice, maxPrice, inStock, sort, page, limit]);

  const activeFilterCount = [category, brand, minPrice, maxPrice, inStock].filter(Boolean).length;
  const hasFilters = search || activeFilterCount > 0 || sort !== "newest";

  const clearAll = () => {
    lastCommittedSearch.current = "";
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const chips = [];
  if (category)
    chips.push({
      key: "category",
      label: `Category: ${category}`,
      clear: () => updateParamsRef.current({ category: "", page: "" }),
    });
  if (brand)
    chips.push({
      key: "brand",
      label: `Brand: ${brand}`,
      clear: () => updateParamsRef.current({ brand: "", page: "" }),
    });
  if (minPrice || maxPrice)
    chips.push({
      key: "price",
      label: `Price: ${minPrice ? `$${minPrice}` : "$0"} – ${maxPrice ? `$${maxPrice}` : "∞"}`,
      clear: () => updateParamsRef.current({ minPrice: "", maxPrice: "", page: "" }),
    });
  if (inStock)
    chips.push({
      key: "inStock",
      label: "In stock only",
      clear: () => updateParamsRef.current({ inStock: "", page: "" }),
    });

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

  const skeletonCount = Math.min(limit, 12);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Browse the store
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          All Products
        </h1>
        <p className="mt-1 text-slate-500">
          {total} product{total === 1 ? "" : "s"} available
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
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
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="btn-secondary relative inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {chips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-700"
              >
                {chip.label}
                <button
                  onClick={chip.clear}
                  aria-label={`Remove ${chip.label}`}
                  className="rounded-full p-0.5 transition-colors hover:bg-indigo-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-rose-600 transition-colors hover:text-rose-700"
            >
              Clear all
            </button>
          </div>
        )}

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="input-label">Category</label>
              <SearchableSelect
                value={category}
                onChange={(value) =>
                  updateParamsRef.current({ category: value, page: "" })
                }
                placeholder="All categories"
                options={[
                  { value: "", label: "All categories" },
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Brand</label>
              <SearchableSelect
                value={brand}
                onChange={(value) =>
                  updateParamsRef.current({ brand: value, page: "" })
                }
                placeholder="All brands"
                options={[
                  { value: "", label: "All brands" },
                  ...brands.map((b) => ({ value: b, label: b })),
                ]}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Min Price</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) =>
                  updateParamsRef.current({ minPrice: e.target.value, page: "" })
                }
                placeholder="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Max Price</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) =>
                  updateParamsRef.current({ maxPrice: e.target.value, page: "" })
                }
                placeholder="No limit"
                className="input-field"
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) =>
                    updateParamsRef.current({
                      inStock: e.target.checked ? "true" : "",
                      page: "",
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                In stock only
              </label>
            </div>
          </div>
        )}
      </div>

      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <SearchX className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-lg font-semibold text-slate-900">
              No products found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or filters.
            </p>
          </div>
          {hasFilters && (
            <button onClick={clearAll} className="btn-secondary">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 justify-items-center gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
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
    </div>
  );
};

const ProductListingPage = () => (
  <Suspense
    fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }
  >
    <ProductListing />
  </Suspense>
);

export default ProductListingPage;
