"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getWishlist } from "@/api/wishlistApi";

export type WishlistItem = {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  thumbnail?: string;
  inStock?: boolean;
};

type WishlistContextValue = {
  items: WishlistItem[];
  wishlistCount: number;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWishlist = async () => {
    try {
      setLoading(true);
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load lần đầu
    refreshWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        loading,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return ctx;
};
