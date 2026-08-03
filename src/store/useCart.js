import { toast } from "react-toastify";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCart = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addItem: (data) => {
        const { item, quantity, color, size } = data;
        const currentItems = get().cartItems;
        const isExisting = currentItems.some(
          (cartItem) => cartItem.item._id === item._id
        );

        if (isExisting) {
          return toast.warning("Item is already in your cart.");
        }

        set({ cartItems: [...currentItems, { item, quantity, color, size }] });
        toast.success("Item added to cart");
      },

      removeItem: (idToRemove) => {
        const newCartItems = get().cartItems.filter(
          (cartItem) => cartItem.item._id !== idToRemove
        );
        set({ cartItems: newCartItems });
        toast.success("Item removed from cart");
      },

      increaseQuantity: (idToIncrease) => {
        const newCartItems = get().cartItems.map((cartItem) =>
          cartItem.item._id === idToIncrease
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        set({ cartItems: newCartItems });
      },

      decreaseQuantity: (idToDecrease) => {
        const newCartItems = get().cartItems.map((cartItem) =>
          cartItem.item._id === idToDecrease && cartItem.quantity > 1
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
        set({ cartItems: newCartItems });
      },

      clearCart: () => {
        if (get().cartItems.length === 0) return;
        set({ cartItems: [] });
        toast.success("Cart cleared");
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
