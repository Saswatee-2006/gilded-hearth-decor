import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getProductPrice, type Product } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type CartLine = { id: string; qty: number; size?: string | undefined };
export type Order = {
  id: string;
  date: string;
  total: number;
  status: string;
  lines: { name: string; qty: number; price: number; size?: string | undefined }[];
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  recentlyViewed: string[];
  addToCart: (id: string, qty?: number, size?: string) => void;
  setQty: (id: string, qty: number, size?: string) => void;
  removeFromCart: (id: string, size?: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  markViewed: (id: string) => void;
  placeOrder: (total: number) => Order;
  cartCount: number;
  subtotal: number;
  cartProducts: { product: Product; qty: number; size?: string | undefined }[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  products: Product[];
  isLoadingProducts: boolean;
};

const ShopContext = createContext<ShopState | null>(null);
const KEY = "aarohan-shop-v1";

type Persisted = Pick<ShopState, "cart" | "wishlist" | "orders" | "recentlyViewed">;

function load(): Persisted {
  if (typeof window === "undefined")
    return { cart: [], wishlist: [], orders: [], recentlyViewed: [] };
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
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  const { data: fetchedProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return (data as Product[]) || [];
    },
  });

  const products = fetchedProducts || [];

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addToCart = useCallback((id: string, qty = 1, size?: string) => {
    setState((s) => {
      const existing = s.cart.find((l) => l.id === id && l.size === size);
      const cart = existing
        ? s.cart.map((l) => (l.id === id && l.size === size ? { ...l, qty: l.qty + qty } : l))
        : [...s.cart, { id, qty, size }];
      return { ...s, cart };
    });
    const p = products.find((x) => x.id === id);
    toast.success(p ? `${p.name} added to bag` : "Added to bag");
  }, [products]);

  const setQty = useCallback((id: string, qty: number, size?: string) => {
    setState((s) => ({
      ...s,
      cart:
        qty <= 0
          ? s.cart.filter((l) => !(l.id === id && l.size === size))
          : s.cart.map((l) => (l.id === id && l.size === size ? { ...l, qty } : l)),
    }));
  }, []);

  const removeFromCart = useCallback((id: string, size?: string) => {
    setState((s) => ({ ...s, cart: s.cart.filter((l) => !(l.id === id && l.size === size)) }));
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
    setState((s) => ({
      ...s,
      recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 8),
    }));
  }, []);

  const placeOrder = useCallback(
    (total: number) => {
      const order: Order = {
        id: "AD" + Math.floor(100000 + Math.random() * 899999),
        date: new Date().toISOString(),
        total,
        status: "Confirmed",
        lines: state.cart.map((l) => {
          const p = products.find((x) => x.id === l.id);
          return {
            name: p?.name ?? "Item",
            qty: l.qty,
            price: p ? getProductPrice(p, l.size) : 0,
            size: l.size,
          };
        }),
      };
      setState((s) => ({ ...s, orders: [order, ...s.orders], cart: [] }));
      return order;
    },
    [state.cart, products],
  );

  const cartProducts = useMemo(
    () =>
      state.cart
        .map((l) => {
          const product = products.find((p) => p.id === l.id);
          return product ? { product, qty: l.qty, size: l.size } : null;
        })
        .filter((x) => x !== null) as { product: Product; qty: number; size?: string }[],
    [state.cart, products],
  );

  const subtotal = useMemo(
    () => cartProducts.reduce((sum, l) => sum + getProductPrice(l.product, l.size) * l.qty, 0),
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
    isCartOpen,
    setIsCartOpen,
    products,
    isLoadingProducts,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export const FREE_SHIPPING_THRESHOLD = 999;
