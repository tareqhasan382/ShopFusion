"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { Loader2, Trash2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import DataTable from "@/components/Dashboard/DataTable";

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const query = filter === "subscribed" ? "?status=subscribed" : "";
      const result = await fetch(`${BASEURL}/api/newsletter${query}`, {
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to load subscribers");
      const data = await result.json();
      setSubscribers(data.data || []);
    } catch {
      toast.error("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [filter]);

  const removeSubscriber = async (subscriber) => {
    setDeletingId(subscriber._id);
    try {
      const result = await fetch(
        `${BASEURL}/api/newsletter/${subscriber._id}`,
        { method: "DELETE" }
      );
      const data = await result.json();
      if (!result.ok) throw new Error(data.message || "Failed to remove.");
      toast.success("Subscriber removed.");
      fetchSubscribers();
    } catch (err) {
      toast.error(err.message || "Failed to remove.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "email",
      label: "Email",
      render: (item) => (
        <p className="flex items-center gap-2 font-medium text-slate-900">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          {item.email}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) =>
        item.subscribed ? (
          <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Subscribed
          </span>
        ) : (
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            Unsubscribed
          </span>
        ),
    },
    {
      key: "source",
      label: "Source",
      render: (item) => (
        <span className="capitalize text-slate-500">{item.source || "footer"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Subscribed on",
      render: (item) => (
        <span className="text-slate-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => removeSubscriber(item)}
            disabled={deletingId === item._id}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Remove subscriber"
          >
            {deletingId === item._id ? (
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
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2">
        {["all", "subscribed"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={subscribers}
        loading={loading}
        fillHeight
        searchFields={["email", "source"]}
        searchPlaceholder="Search email…"
        emptyMessage="No subscribers yet."
      />
    </div>
  );
};

export default Newsletter;
