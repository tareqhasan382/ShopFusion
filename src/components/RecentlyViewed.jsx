"use client";
import useRecentlyViewed from "@/store/useRecentlyViewed";
import ProductCard from "@/components/UI/ProductCard";
import Link from "next/link";

/** Recently viewed products section (rendered client-side from localStorage). */
const RecentlyViewed = () => {
  const recent = useRecentlyViewed((s) => s.recent);

  if (!recent || recent.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Recently Viewed</h2>
        <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View all
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recent.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
