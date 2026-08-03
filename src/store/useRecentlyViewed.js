import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 12;

/** Recently viewed products — stored in localStorage. */
const useRecentlyViewed = create(
  persist(
    (set) => ({
      recent: [],
      add: (product) =>
        set((state) => ({
          recent: [
            product,
            ...state.recent.filter((p) => p?._id !== product?._id),
          ].slice(0, MAX_RECENT),
        })),
      clear: () => set({ recent: [] }),
    }),
    { name: "recently-viewed" }
  )
);

export default useRecentlyViewed;
