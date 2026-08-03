"use client";
import Loader from "@/components/Loader";
import ProductCard from "@/components/UI/ProductCard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ChevronRight } from "lucide-react";
import { useAuth } from "@/Providers";

const Wishlist = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/wishlist", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        if (active) setProducts(data.products || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWishlist();
    return () => {
      active = false;
    };
  }, [user]);

  const handleWishlistToggle = (liked, productId) => {
    if (!liked) {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-24 text-center sm:px-6">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <Heart className="h-8 w-8 text-rose-500" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
          Your Wishlist
        </h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500">
          Sign in to view and manage the items you have saved for later.
        </p>
        <Link href="/sign-in" className="btn-primary mt-6">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Your Wishlist
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} {products.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        <Link
          href="/products"
          className="hidden items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 sm:inline-flex"
        >
          Browse all products
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <hr className="my-6 border-slate-200" />

      {error ? (
        <div className="py-16 text-center">
          <p className="text-slate-500">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary mt-4">
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Heart className="h-8 w-8 text-slate-400" />
          </span>
          <p className="text-slate-500">No items in your wishlist yet.</p>
          <p className="text-sm text-slate-400">
            Tap the heart on any product to save it here.
          </p>
          <Link href="/products" className="btn-primary mt-2">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
