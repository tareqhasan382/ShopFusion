"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  searchable,
  disabled = false,
  dropdownPosition = "down",
  showCheck = true,
  className = "input-field",
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const [panelWidth, setPanelWidth] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);

  const showSearch = searchable !== undefined ? searchable : options.length > 5;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    if (triggerRef.current) {
      setPanelWidth(triggerRef.current.offsetWidth);
    }
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open && showSearch) searchRef.current?.focus();
  }, [open, showSearch]);

  const toggle = () => {
    if (disabled) return;
    setOpen((o) => !o);
    setHighlight(-1);
    if (open) setQuery("");
  };

  const select = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        toggle();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) select(filtered[highlight]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-between gap-2 text-left ${className} ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <span
          className={`truncate ${selected ? "text-slate-900" : "text-slate-400"}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ${
            dropdownPosition === "up" ? "bottom-full mb-1.5" : "mt-1.5"
          }`}
          style={{ width: panelWidth || "100%" }}
        >
          {showSearch && (
            <div className="relative border-b border-slate-100 p-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder="Search…"
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-400">
                No options found
              </li>
            ) : (
              filtered.map((opt, index) => {
                const isActive = opt.value === value;
                const isHighlighted = index === highlight;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => select(opt)}
                      onMouseEnter={() => setHighlight(index)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        isHighlighted ? "bg-indigo-50" : ""
                      } ${
                        isActive
                          ? "font-medium text-indigo-700"
                          : "text-slate-700"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {showCheck && isActive && (
                        <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
