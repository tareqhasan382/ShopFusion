"use client";

import Loader from "@/components/Loader";
import ProductCard from "@/components/UI/ProductCard";
import { useEffect, useState } from "react";
import { BASEURL } from "../page";
import { useSession } from "next-auth/react";

const Wishlist = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [signedInUser, setSignedInUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const getUser = async () => {
    try {
      const res = await fetch(`${BASEURL}/api/wishlist`);
      const data = await res.json();
      setSignedInUser(data);
      setLoading(false);
    } catch (err) {
      console.log("[users_GET", err);
    }
  };

  useEffect(() => {
    if (session?.user) {
      getUser();
    }
  }, [session]);

  useEffect(() => {
    if (signedInUser) {
      const getWishlistProducts = async () => {
        setLoading(true);

        if (!signedInUser) return;

        const wishlistProducts = await Promise.all(
          signedInUser?.wishlist?.map(async (productId) => {
            const res = await fetch(`${BASEURL}/api/product/${productId}`);
            const productData = await res.json();

            return productData?.data;
          })
        );

        setWishlist(wishlistProducts);
        setLoading(false);
      };
      getWishlistProducts();
    }
  }, [signedInUser]);

  return loading ? (
    <Loader />
  ) : (
    <div className="px-10 py-5 flex flex-col items-center justify-center ">
      <p className="text-heading3-bold my-10">Your Wishlist</p>
      {wishlist?.length === 0 && <p>No items in your wishlist</p>}

      <div className="flex flex-wrap justify-center gap-16">
        {wishlist.map((product) => (
          <ProductCard key={product?._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default Wishlist;

/*
{wishlist.map((product) => (
          <ProductCard key={product?._id} product={product} />
        ))}
*/
