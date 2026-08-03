"use client";
import useCart from "@/store/useCart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/Providers";
import { formatPrice } from "@lib/format";

const Cart = () => {
  const { user } = useAuth();
  const router = useRouter();
  const cart = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const total = cart.cartItems.reduce(
    (acc, cartItem) => acc + Number(cartItem.item.price ?? 0) * cartItem.quantity,
    0
  );

  const discountAmount = coupon?.valid ? coupon.discountAmount : 0;
  const grandTotal = Math.max(0, total - discountAmount);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: total }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(data);
        setCouponInput("");
        toast.success(`Coupon ${data.code} applied.`);
      } else {
        setCoupon(null);
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch {
      setCouponError("Could not validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError("");
  };

  const handleCheckout = async () => {
    if (cart.cartItems.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart.cartItems,
          couponCode: coupon?.code || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout session could not be created.");
        setCheckingOut(false);
      }
    } catch (err) {
      console.error("[checkout]", err);
      toast.error(err.message || "Something went wrong during checkout.");
      setCheckingOut(false);
    }
  };

  if (!user) {
    return null; // middleware redirects unauthenticated users
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <hr className="my-6 border-slate-200" />

          {cart.cartItems.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-slate-300" />
              <p className="text-slate-500">Your cart is empty.</p>
              <Link href="/" className="btn-primary">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.cartItems.map((cartItem, index) => {
                const itemHref = cartItem.item?.slug
                  ? `/products/${cartItem.item.slug}`
                  : `/products/${cartItem.item._id}`;
                return (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Link href={itemHref}>
                      <Image
                        src={cartItem.item.media?.[0] || "/placeholder.svg"}
                        width={100}
                        height={100}
                        className="h-24 w-24 rounded-lg object-cover"
                        alt={cartItem.item.title}
                      />
                    </Link>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={itemHref}
                        className="font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        {cartItem.item.title}
                      </Link>
                      {cartItem.color && (
                        <p className="text-sm text-slate-500">Color: {cartItem.color}</p>
                      )}
                      {cartItem.size && (
                        <p className="text-sm text-slate-500">Size: {cartItem.size}</p>
                      )}
                      <p className="text-sm font-semibold text-indigo-600">
                        ${formatPrice(cartItem.item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 px-2 py-1">
                      <button
                        onClick={() => cart.decreaseQuantity(cartItem.item._id)}
                        className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => cart.increaseQuantity(cartItem.item._id)}
                        className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => cart.removeItem(cartItem.item._id)}
                      className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Order Summary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {cart.cartItems.length}{" "}
              {cart.cartItems.length === 1 ? "item" : "items"}
            </p>

            <div className="mt-4">
              {coupon ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                  <span className="font-semibold text-emerald-700">
                    {coupon.code} applied
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-600 hover:text-emerald-800"
                    aria-label="Remove coupon"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Coupon code"
                    className="input-field uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-2 text-sm text-rose-600">{couponError}</p>}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ${formatPrice(total)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({coupon?.code})</span>
                  <span>-${formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="text-slate-500">Calculated at checkout</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>${formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              disabled={!cart.cartItems.length || checkingOut}
              onClick={handleCheckout}
              className="btn-primary mt-6 w-full"
            >
              {checkingOut ? "Redirecting to checkout…" : "Proceed to Checkout"}
            </button>
            <Link
              href="/"
              className="mt-3 block text-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
