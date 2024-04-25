"use client";

import useCart from "@/store/useCart";
import { MinusCircle, PlusCircle, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { BASEURL } from "../page";

const Cart = () => {
  const { data: session } = useSession();
  const router = useRouter();
  // const { user } = useUser();
  const cart = useCart();

  const total = cart.cartItems.reduce(
    (acc, cartItem) =>
      acc +
      parseFloat(cartItem?.item?.price["$numberDecimal"] ?? 0).toFixed(2) *
        cartItem.quantity,
    0
  );
  const totalRounded = total;

  // cartItem.item.price
  const customer = {
    userId: session?.user._id,
    email: session?.user.email,
    name: session?.user.name,
  };

  const handleCheckout = async () => {
    try {
      if (!session?.user) {
        router.push("sign-in");
      } else {
        const res = await fetch(`${BASEURL}/api/checkout`, {
          method: "POST",
          body: JSON.stringify({ cartItems: cart.cartItems, customer }),
        });
        const data = await res.json();
        window.location.href = data.url;
        console.log(data);
      }
    } catch (err) {
      console.log("[checkout_POST]", err);
    }
  };

  return (
    <div className="flex gap-20 py-16 px-10 max-lg:flex-col max-sm:px-3">
      <div className="w-2/3 max-lg:w-full">
        <p className="text-heading3-bold">Shopping Cart</p>
        <hr className="my-6" />

        {cart.cartItems.length === 0 ? (
          <p className="text-body-bold">No item in cart</p>
        ) : (
          <div>
            {cart.cartItems.map((cartItem, index) => (
              <div
                key={index}
                className="w-full flex max-sm:flex-col max-sm:gap-3 hover:bg-grey-1 px-4 py-3 items-center max-sm:items-start justify-between"
              >
                <div className="flex items-center">
                  <Image
                    src={cartItem.item.media[0]}
                    width={100}
                    height={100}
                    priority
                    className="rounded-lg w-32 h-32 object-cover"
                    alt="product"
                  />
                  <div className="flex flex-col gap-3 ml-4">
                    <p className="text-body-bold">{cartItem.item.title}</p>
                    {cartItem.color && (
                      <p className="text-small-medium">{cartItem.color}</p>
                    )}
                    {cartItem.size && (
                      <p className="text-small-medium">{cartItem.size}</p>
                    )}
                    <p className="text-small-medium">
                      $
                      {parseFloat(
                        cartItem?.item?.price["$numberDecimal"] ?? 0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className=" flex flex-row gap-10 ">
                  <div className="flex gap-4 items-center">
                    <MinusCircle
                      className="hover:text-red-1 cursor-pointer"
                      onClick={() => cart.decreaseQuantity(cartItem?.item?._id)}
                    />
                    <p className="text-body-bold">{cartItem.quantity}</p>
                    <PlusCircle
                      className="hover:text-red-1 cursor-pointer"
                      onClick={() => cart.increaseQuantity(cartItem?.item?._id)}
                    />
                  </div>

                  <Trash
                    className="hover:text-red-1 text-rose-400 cursor-pointer"
                    onClick={() => cart.removeItem(cartItem?.item?._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 max-lg:w-full flex flex-col gap-8 bg-grey-1 rounded-lg px-4 py-5">
        <div className="pb-4">
          <p className="text-heading4-bold">
            Summary{" "}
            <span>{`(${cart?.cartItems?.length} ${
              cart.cartItems.length > 1 ? "items" : "item"
            })`}</span>
          </p>
          <p>Email : {session?.user?.email}</p>
          <p>Name : {session?.user?.name}</p>
        </div>
        <div className="flex justify-between text-body-semibold">
          <span>Total Amount</span>
          <span>$ {totalRounded}</span>
        </div>
        <button
          disabled={!cart?.cartItems?.length}
          className={`${
            cart?.cartItems?.length === 0 && " cursor-not-allowed "
          }border rounded-lg text-body-bold bg-white py-3 w-full hover:bg-black hover:text-white`}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
