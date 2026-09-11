import { Link, useNavigate } from "react-router-dom";
import { Heart, Home, Search, ShoppingBag, Store } from "lucide-react";

import { useShop } from "@/lib/shop-store";

export function MobileTabBar({ onSearch }: { onSearch: () => void }) {
  const { cartCount, wishlist } = useShop();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        <li>
          <Link
            to="/"
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground"
          >
            <Home className="h-[18px] w-[18px]" />
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/shop"
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground"
          >
            <Store className="h-[18px] w-[18px]" />
            Shop
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={onSearch}
            className="flex w-full flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground"
          >
            <Search className="h-[18px] w-[18px]" />
            Search
          </button>
        </li>
        <li>
          <Link
            to="/wishlist"
            className="relative flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground"
          >
            <Heart className="h-[18px] w-[18px]" />
            Wishlist
            {wishlist.length > 0 && (
              <span className="absolute right-5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            )}
          </Link>
        </li>
        <li>
          <Link
            to="/cart"
            className="relative flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            Cart
            {cartCount > 0 && (
              <span className="absolute right-4 top-1 grid h-4 w-4 place-items-center rounded-full bg-accent text-[9px] text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
