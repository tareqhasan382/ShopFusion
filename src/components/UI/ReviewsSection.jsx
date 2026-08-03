"use client";
import { BASEURL } from "@lib/config";
import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/Providers";
import FormateDate from "@/components/FormateDate";

const ReviewsSection = ({ productId, ratingAvg, ratingCount }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await fetch(`${BASEURL}/api/review?product=${productId}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!result.ok) throw new Error("Failed to fetch reviews");
      const data = await result.json();
      setReviews(data.data || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await fetch(`${BASEURL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId, rating, comment }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.message || "Failed to submit review.");
      toast.success(data.message || "Review submitted.");
      setRating(0);
      setComment("");
      setAlreadyReviewed(true);
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, interactive, size = "h-5 w-5") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            aria-label={interactive ? `Rate ${star} star${star > 1 ? "s" : ""}` : undefined}
          >
            <Star
              className={`${size} ${
                star <= (hoverRating || rating || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto mt-4 max-w-[1280px] px-4 pb-16 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-slate-900">
                {ratingAvg || "0"}
              </span>
              <span className="text-sm text-slate-500">({ratingCount || 0})</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-slate-100 pb-5 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{review.userName}</p>
                    <span className="text-xs text-slate-400">
                      <FormateDate date={review.createdAt} />
                    </span>
                  </div>
                  <div className="mt-1">{renderStars(review.rating, false)}</div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {user && !alreadyReviewed && (
          <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Write a review</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="input-label">Your rating</label>
                <div className="mt-1">{renderStars(0, true, "h-7 w-7")}</div>
              </div>
              <div>
                <label className="input-label">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Share your experience with this product…"
                  className="input-field resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
              <p className="text-xs text-slate-400">
                Reviews appear after admin approval.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
