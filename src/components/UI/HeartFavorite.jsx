"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/Providers";

const HeartFavorite = ({ product, onToggle }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (active && data.wishlist?.includes(product._id)) {
            setIsLiked(true);
          }
        }
      } catch {
        /* ignore */
      }
    };
    fetchWishlist();
    return () => {
      active = false;
    };
  }, [user, product._id]);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (res.ok) {
        const liked = data.wishlist?.includes(product._id) ?? false;
        setIsLiked(liked);
        toast.success(liked ? "Added to wishlist" : "Removed from wishlist");
        onToggle?.(liked, product._id);
      } else {
        toast.error(data.message || "Failed to update wishlist.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className="h-5 w-5"
        fill={isLiked ? "#e11d48" : "none"}
        stroke={isLiked ? "#e11d48" : "currentColor"}
      />
    </button>
  );
};

export default HeartFavorite;
