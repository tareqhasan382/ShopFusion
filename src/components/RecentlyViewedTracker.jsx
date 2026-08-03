"use client";
import { useEffect } from "react";
import useRecentlyViewed from "@/store/useRecentlyViewed";

/** Records the current product in the recently-viewed list (client-side). */
const RecentlyViewedTracker = ({ product }) => {
  const add = useRecentlyViewed((s) => s.add);

  useEffect(() => {
    if (!product?._id) return;
    add({
      _id: product._id,
      title: product.title,
      price: product.price,
      media: product.media,
      slug: product.slug,
    });
  }, [product, add]);

  return null;
};

export default RecentlyViewedTracker;
