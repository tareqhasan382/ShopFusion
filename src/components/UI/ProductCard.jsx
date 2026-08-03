import Image from "next/image";
import Link from "next/link";
import HeartFavorite from "./HeartFavorite";
import { formatPrice } from "@lib/format";

const ProductCard = ({ product, onWishlistToggle }) => {
  const href = product?.slug ? `/products/${product.slug}` : `/products/${product._id}`;
  return (
    <div className="group relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={href}
        className="relative block aspect-[4/5] overflow-hidden bg-slate-100"
      >
        <Image
          src={product?.media?.[0] || "/placeholder.svg"}
          alt={product?.title || "Product"}
          width={450}
          height={560}
          priority
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="absolute right-3 top-3">
        <HeartFavorite product={product} onToggle={onWishlistToggle} />
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <Link
          href={href}
          className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-indigo-600"
        >
          {product?.title}
        </Link>
        <p className="text-xs text-slate-500">{product?.category}</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-base font-bold text-indigo-600">
            ${formatPrice(product?.price)}
          </p>
          <Link
            href={href}
            className="text-xs font-semibold text-slate-600 transition-colors hover:text-indigo-600"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
