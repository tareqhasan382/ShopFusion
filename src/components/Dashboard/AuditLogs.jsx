"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FormateDate from "@/components/FormateDate";
import DataTable from "@/components/Dashboard/DataTable";
import SearchableSelect from "@/components/SearchableSelect";

const entityOptions = ["product", "category", "brand", "coupon", "review", "order", "collection"];
const actionOptions = ["create", "update", "delete", "approve", "reject", "status"];

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  const fetchLogs = async (currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityType) params.set("entityType", entityType);
      if (action) params.set("action", action);
      if (search) params.set("search", search);
      params.set("page", currentPage);
      params.set("limit", limit);
      const result = await fetch(`${BASEURL}/api/audit?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLogs(1);
  }, [entityType, action, search]);

  const columns = [
    {
      key: "admin",
      label: "Admin",
      render: (log) => <span className="text-slate-600">{log.adminEmail || log.adminUserId}</span>,
    },
    {
      key: "entityType",
      label: "Entity",
      render: (log) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{log.entityType}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (log) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            log.action === "delete"
              ? "bg-rose-100 text-rose-700"
              : log.action === "create"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          {log.action}
        </span>
      ),
    },
    {
      key: "entityTitle",
      label: "Title",
      render: (log) => <span className="text-slate-800">{log.entityTitle || "—"}</span>,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (log) => <FormateDate date={log.createdAt} />,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3">
        <SearchableSelect
          value={entityType}
          onChange={setEntityType}
          placeholder="All entity types"
          options={[
            { value: "", label: "All entity types" },
            ...entityOptions.map((e) => ({ value: e, label: e })),
          ]}
          className="input-field !w-auto min-w-52"
        />
        <SearchableSelect
          value={action}
          onChange={setAction}
          placeholder="All actions"
          options={[
            { value: "", label: "All actions" },
            ...actionOptions.map((a) => ({ value: a, label: a })),
          ]}
          className="input-field !w-auto min-w-52"
        />
      </div>

      <DataTable
        columns={columns}
        rows={logs}
        loading={loading}
        fillHeight
        page={page}
        total={total}
        pageSize={limit}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(p) => {
          setPage(p);
          fetchLogs(p);
        }}
        onPageSizeChange={(l) => {
          setLimit(l);
          setPage(1);
          fetchLogs(1);
        }}
        searchPlaceholder="Search entity, admin or action…"
        emptyMessage="No audit entries found."
      />
    </div>
  );
};

export default AuditLogs;
