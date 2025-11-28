"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCart } from "@/api/cartApi";

type CartData = any; // có thể sửa thành type chuẩn nếu bạn có

type CartContextValue = {
  cart: CartData | null;
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const computeCartCount = (data: any) => {
    const items = data?.items || [];
    const totalItems =
      data?.totalItems ??
      items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0);

    setCartCount(totalItems || 0);
  };

  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
      computeCartCount(data);
    } catch (e) {
      setCart(null);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load giỏ hàng lần đầu
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
