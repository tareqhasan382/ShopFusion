"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { Check, X, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import FormateDate from "@/components/FormateDate";
import DataTable from "@/components/Dashboard/DataTable";

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
];

const Reviews = () => {
  const [tab, setTab] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchReviews = async (status) => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/review?status=${status}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch data");
      const data = await result.json();
      setReviews(data.data || []);
    } catch {
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(tab);
  }, [tab]);

  const moderate = async (reviewId, isApproved) => {
    setBusyId(reviewId);
    try {
      const result = await fetch(`${BASEURL}/api/review/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to update review.");
      toast.success(isApproved ? "Review approved." : "Review rejected.");
      fetchReviews(tab);
    } catch {
      toast.error("Failed to update review.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    setBusyId(reviewId);
    try {
      const result = await fetch(`${BASEURL}/api/review/${reviewId}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to delete review.");
      toast.success("Review deleted.");
      fetchReviews(tab);
    } catch {
      toast.error("Failed to delete review.");
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (review) => (
        <span className="font-medium text-slate-900">{review.productTitle || review.product}</span>
      ),
    },
    {
      key: "userName",
      label: "Customer",
      render: (review) => <span className="text-slate-600">{review.userName}</span>,
    },
    {
      key: "rating",
      label: "Rating",
      render: (review) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-900">{review.rating}</span>
        </div>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      render: (review) => (
        <span className="max-w-xs truncate text-slate-600">
          {review.comment || <span className="text-slate-300">—</span>}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (review) => <FormateDate date={review.createdAt} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (review) => (
        <div className="flex items-center justify-end gap-2">
          {tab === "pending" && (
            <button
              onClick={() => moderate(review._id, true)}
              disabled={busyId === review._id}
              className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
              aria-label="Approve review"
              title="Approve"
            >
              {busyId === review._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
          )}
          {tab === "approved" && (
            <button
              onClick={() => moderate(review._id, false)}
              disabled={busyId === review._id}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50"
              aria-label="Reject review"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(review._id)}
            disabled={busyId === review._id}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            aria-label="Delete review"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2">
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
            {t.label}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={reviews}
        loading={loading}
        fillHeight
        searchFields={["productTitle", "userName", "comment"]}
        searchPlaceholder="Search product or customer…"
        emptyMessage={`No ${tab} reviews.`}
      />
    </div>
  );
};

export default Reviews;
