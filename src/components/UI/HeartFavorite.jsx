"use client"
import { BASEURL } from "@/app/(home)/page";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


const HeartFavorite = ({ product }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const getUser = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${BASEURL}/api/wishlist`);
          const data = await res.json();
          setIsLiked(data.wishlist.includes(product._id));
          setLoading(false);
        } catch (err) {
          console.log("[users_GET]", err);
        }
      };
      getUser();
    }
  }, [session,product]);

  const handleLike = async (e) => {
    e.preventDefault();
  
    try {
      if (!session?.user) {
        router.push("/sign-in");
        return;
      } else {
        const res = await fetch(`${BASEURL}/api/wishlist`, {
          method: "POST",
          body: JSON.stringify({ productId: product._id }),
        });
        const updatedUser = await res.json();
        setIsLiked(updatedUser.wishlist.includes(product._id));
        
      }
    } catch (err) {
      console.log("[wishlist_POST]", err);
    }
  };
  return (
    <button disabled={loading} onClick={handleLike} >
      <Heart fill={`${isLiked ? "red" : "white"}`} />
    </button>
  );
};

export default HeartFavorite;