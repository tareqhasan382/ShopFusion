"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

const btnClass = (disabled) =>
  `inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors ${
    disabled
      ? "cursor-not-allowed border-slate-200 text-slate-300"
      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
  }`;

const getPageItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("...");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("...");
  items.push(total);
  return items;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const rowSearchText = (row, keys) => {
  const parts = keys.map((key) => {
    const v = row[key];
    if (typeof v === "string" || typeof v === "number") return String(v);
    return "";
  });
  return parts.join(" ").toLowerCase();
};

const DataTable = ({
  title,
  columns,
  rows,
  loading = false,
  emptyMessage = "No data found.",
  pageSize = 10,
  onPageSizeChange,
  page,
  total,
  onPageChange,
  bodyHeight = "h-[420px]",
  fillHeight = false,
  footer,
  searchable = true,
  searchPlaceholder = "Search…",
  searchValue,
  onSearch,
  searchFields,
}) => {
  const serverMode = typeof onPageChange === "function";
  const serverSearchMode = typeof onSearch === "function";
  const [localPage, setLocalPage] = useState(1);
  const [localSearch, setLocalSearch] = useState(searchValue ?? "");
  const [size, setSize] = useState(pageSize);
  const firstSearchRender = useRef(true);

  const searchKeys = searchFields || columns.map((c) => c.key);

  useEffect(() => {
    setSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (searchValue !== undefined) setLocalSearch(searchValue ?? "");
  }, [searchValue]);

  useEffect(() => {
    if (!serverSearchMode) return;
    if (firstSearchRender.current) {
      firstSearchRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [localSearch, serverSearchMode]);

  const filteredRows = useMemo(() => {
    if (serverSearchMode) return rows;
    const q = localSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => rowSearchText(row, searchKeys).includes(q));
  }, [rows, localSearch, serverSearchMode, searchKeys]);

  const rowCount = serverMode ? total ?? 0 : filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(rowCount / size));
  const currentPage = serverMode ? page ?? 1 : localPage;
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (!serverMode) setLocalPage(1);
  }, [filteredRows, serverMode]);

  const visibleRows = useMemo(() => {
    if (serverMode) return rows;
    return filteredRows.slice((safePage - 1) * size, safePage * size);
  }, [rows, filteredRows, safePage, size, serverMode]);

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === safePage) return;
    if (serverMode) onPageChange(p);
    else setLocalPage(p);
  };

  const handleSizeChange = (v) => {
    const val = Number(v);
    setSize(val);
    if (serverMode) {
      if (onPageSizeChange) onPageSizeChange(val);
      else onPageChange(1);
    } else {
      setLocalPage(1);
    }
  };

  const handleSearchChange = (value) => {
    setLocalSearch(value);
  };

  const from = rowCount === 0 ? 0 : (safePage - 1) * size + 1;
  const to = Math.min(safePage * size, rowCount);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {footer}
        </div>
      )}
      {searchable && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {localSearch && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {!title && footer && <div className="flex items-center gap-2">{footer}</div>}
        </div>
      )}
      <div
        className={
          fillHeight
            ? "min-h-0 flex-1 overflow-auto"
            : `overflow-x-auto overflow-y-auto ${bodyHeight}`
        }
      >
        <table className="min-w-full table-auto divide-y divide-slate-200">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <p className="text-sm text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={row._id || index}
                  className="transition-colors hover:bg-slate-50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-slate-600 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-5 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Rows per page
              <SearchableSelect
                value={size}
                onChange={handleSizeChange}
                options={PAGE_SIZE_OPTIONS.map((opt) => ({
                  value: opt,
                  label: String(opt),
                }))}
                dropdownPosition="up"
                showCheck={false}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </label>
            <p className="text-sm text-slate-500">
              {rowCount === 0
                ? "No entries"
                : `Showing ${from}–${to} of ${rowCount}`}
            </p>
          </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={safePage <= 1}
            onClick={() => goTo(safePage - 1)}
            className={btnClass(safePage <= 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          {getPageItems(safePage, totalPages).map((item, index) =>
            item === "..." ? (
              <span key={`gap-${index}`} className="px-1 text-sm text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => goTo(item)}
                className={`h-9 min-w-[2.25rem] rounded-lg px-2 text-sm font-medium transition-colors ${
                  item === safePage
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            disabled={safePage >= totalPages}
            onClick={() => goTo(safePage + 1)}
            className={btnClass(safePage >= totalPages)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
