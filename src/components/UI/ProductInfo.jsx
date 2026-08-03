"use client";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import useCart from "@/store/useCart";
import HeartFavorite from "./HeartFavorite";
import { formatPrice } from "@lib/format";

const ProductInfo = ({ productInfo }) => {
  const [selectedColor, setSelectedColor] = useState(
    productInfo?.colors?.[0] || ""
  );
  const [selectedSize, setSelectedSize] = useState(
    productInfo?.sizes?.[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const cart = useCart();

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {productInfo?.title}
          </h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-wide text-slate-500">
            {productInfo?.category}
          </p>
        </div>
        <HeartFavorite product={productInfo} />
      </div>

      <p className="text-3xl font-extrabold text-indigo-600">
        ${formatPrice(productInfo?.price)}
      </p>

      {productInfo?.description && (
        <div>
          <p className="text-sm font-semibold text-slate-900">Description</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {productInfo.description}
          </p>
        </div>
      )}

      {productInfo?.colors?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-900">Colors</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {productInfo.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  selectedColor === color
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {productInfo?.sizes?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-900">Sizes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {productInfo.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  selectedSize === size
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-slate-900">Quantity</p>
        <div className="mt-2 flex items-center gap-4 rounded-full border border-slate-200 px-2 py-1.5 w-fit">
          <button
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            className="rounded-full p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-sm font-bold text-slate-900">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="rounded-full p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        className="btn-primary w-full"
        onClick={() =>
          cart.addItem({
            item: productInfo,
            quantity,
            color: selectedColor,
            size: selectedSize,
          })
        }
      >
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </button>
    </div>
  );
};

export default ProductInfo;
