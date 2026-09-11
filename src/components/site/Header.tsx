import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";

import { SearchDialog } from "@/components/site/SearchDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { NAV_GROUPS } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

const MAIN_LINKS = [
  { label: "Home", to: "/" as const },
  { label: "Wall Décor", to: "/category/$slug" as const, slug: "wall-decor" },
  { label: "Art", to: "/category/$slug" as const, slug: "stone-art" },
  { label: "Living", to: "/category/$slug" as const, slug: "showpieces" },
  { label: "Bedroom", to: "/category/$slug" as const, slug: "candles" },
  { label: "Lighting", to: "/category/$slug" as const, slug: "lighting" },
  { label: "Accessories", to: "/category/$slug" as const, slug: "table-decor" },
  { label: "Gifts", to: "/collection/$slug" as const, slug: "gift-ideas" },
];

export function Header() {
  const { cartCount, wishlist } = useShop();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent bg-background/85 backdrop-blur-md transition-all duration-500",
        scrolled && "border-border shadow-soft",
      )}
      onMouseLeave={() => setShopOpen(false)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-20 md:px-8">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:w-80">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Aarohan Décor</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 space-y-6">
              <Link to="/shop" className="block text-base">
                Shop All
              </Link>
              {NAV_GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow mb-2">{g.title}</p>
                  <ul className="space-y-2">
                    {g.items.map((it) => (
                      <li key={g.title + it.slug}>
                        <Link
                          to={g.title === "Gifts" ? "/collection/$slug" : "/category/$slug"}
                          params={{ slug: it.slug }}
                          className="text-sm text-muted-foreground"
                        >
                          {it.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl tracking-wide md:text-[28px]">Aarohan</span>
          <span className="eyebrow hidden md:block">Décor Atelier</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-6 hidden flex-1 items-center gap-6 lg:flex">
          <button
            type="button"
            onMouseEnter={() => setShopOpen(true)}
            onClick={() => setShopOpen((v) => !v)}
            className={cn("link-underline text-sm", shopOpen && "text-accent")}
          >
            Shop
          </button>
          {MAIN_LINKS.map((l) =>
            l.slug ? (
              <Link
                key={l.label}
                to={l.to}
                params={{ slug: l.slug }}
                onMouseEnter={() => setShopOpen(false)}
                className="link-underline text-sm"
                activeProps={{ className: "text-accent" }}
              >
                {l.label}
              </Link>
            ) : (
              <Link
                key={l.label}
                to="/"
                onMouseEnter={() => setShopOpen(false)}
                className="link-underline text-sm"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-accent" }}
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search className="h-[18px] w-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link to="/wishlist" className="relative">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={user ? "My account" : "Sign in"}
          >
            <Link to={user ? "/account" : "/auth"} className="relative">
              <User className="h-[18px] w-[18px]" />
              {user && (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Cart">
            <Link to="/cart" className="relative">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Mega menu */}
      <div
        className={cn(
          "absolute inset-x-0 top-full hidden overflow-hidden border-b bg-card shadow-soft transition-[max-height,opacity] duration-500 lg:block",
          shopOpen ? "max-h-[420px] opacity-100" : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-8 px-8 py-10">
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="eyebrow mb-3">{g.title}</p>
              <ul className="space-y-2">
                {g.items.map((it) => (
                  <li key={g.title + it.slug}>
                    <Link
                      to={g.title === "Gifts" ? "/collection/$slug" : "/category/$slug"}
                      params={{ slug: it.slug }}
                      onClick={() => setShopOpen(false)}
                      className="link-underline text-sm text-muted-foreground hover:text-foreground"
                    >
                      {it.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
