"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/cart";
import { normalizeCart } from "@/lib/cart";
import { CART_STORAGE_KEY, CURRENCY_COOKIE, type Currency } from "@/lib/money";

type CartContextValue = {
  items: CartItem[];
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match?.split("=")[1];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("GEL");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        setItems(normalizeCart(JSON.parse(raw) as CartItem[]));
      }
    } catch {
      setItems([]);
    }
    const cookieCurrency = readCookie(CURRENCY_COOKIE);
    if (cookieCurrency === "USD" || cookieCurrency === "GEL") {
      setCurrencyState(cookieCurrency);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => normalizeCart([...current, item]));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      setItems((current) =>
        normalizeCart(
          current.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item,
          ),
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((current) =>
      current.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId),
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      currency,
      setCurrency,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [items, currency, setCurrency, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
