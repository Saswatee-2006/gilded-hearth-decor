import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PRODUCTS, type Product } from "@/lib/catalog";

export type CartLine = { id: string; qty: number };
export type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  lines: { name: string; qty: number; price: number }[];
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  recentlyViewed: string[];
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  markViewed: (id: string) => void;
  placeOrder: (total: number) => Order;
  cartCount: number;
  subtotal: number;
  cartProducts: { product: Product; qty: number }[];
};

const ShopContext = createContext<ShopState | null>(null);
const KEY = "aarohan-shop-v1";

type Persisted = Pick<ShopState, "cart" | "wishlist" | "orders" | "recentlyViewed">;

function load(): Persisted {
  if (typeof window === "undefined") return { cart: [], wishlist: [], orders: [], recentlyViewed: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      cart: parsed.cart ?? [],
      wishlist: parsed.wishlist ?? [],
      orders: parsed.orders ?? [],
      recentlyViewed: parsed.recentlyViewed ?? [],
    };
  } catch {
    return { cart: [], wishlist: [], orders: [], recentlyViewed: [] };
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>({
    cart: [],
    wishlist: [],
    orders: [],
    recentlyViewed: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setState((s) => {
      const existing = s.cart.find((l) => l.id === id);
      const cart = existing
        ? s.cart.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l))
        : [...s.cart, { id, qty }];
      return { ...s, cart };
    });
    const p = PRODUCTS.find((x) => x.id === id);
    toast.success(p ? `${p.name} added to bag` : "Added to bag");
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart: qty <= 0 ? s.cart.filter((l) => l.id !== id) : s.cart.map((l) => (l.id === id ? { ...l, qty } : l)),
    }));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((l) => l.id !== id) }));
    toast("Removed from bag");
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  const toggleWishlist = useCallback((id: string) => {
    setState((s) => {
      const has = s.wishlist.includes(id);
      toast(has ? "Removed from wishlist" : "Saved to wishlist");
      return { ...s, wishlist: has ? s.wishlist.filter((w) => w !== id) : [id, ...s.wishlist] };
    });
  }, []);

  const markViewed = useCallback((id: string) => {
    setState((s) => ({ ...s, recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 8) }));
  }, []);

  const placeOrder = useCallback(
    (total: number) => {
      const order: Order = {
        id: "AD" + Math.floor(100000 + Math.random() * 899999),
        date: new Date().toISOString(),
        total,
        status: "Confirmed",
        lines: state.cart.map((l) => {
          const p = PRODUCTS.find((x) => x.id === l.id);
          return { name: p?.name ?? "Item", qty: l.qty, price: p?.price ?? 0 };
        }),
      };
      setState((s) => ({ ...s, orders: [order, ...s.orders], cart: [] }));
      return order;
    },
    [state.cart],
  );

  const cartProducts = useMemo(
    () =>
      state.cart
        .map((l) => {
          const product = PRODUCTS.find((p) => p.id === l.id);
          return product ? { product, qty: l.qty } : null;
        })
        .filter((x): x is { product: Product; qty: number } => x !== null),
    [state.cart],
  );

  const subtotal = useMemo(
    () => cartProducts.reduce((sum, l) => sum + l.product.price * l.qty, 0),
    [cartProducts],
  );

  const value: ShopState = {
    ...state,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted: (id) => state.wishlist.includes(id),
    markViewed,
    placeOrder,
    cartCount: state.cart.reduce((n, l) => n + l.qty, 0),
    subtotal,
    cartProducts,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export const FREE_SHIPPING_THRESHOLD = 999;
