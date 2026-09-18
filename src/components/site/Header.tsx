import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Heart, 
  Menu, 
  Search, 
  ShoppingBag, 
  User, 
  ChevronRight,
  Home,
  Store,
  HelpCircle,
  Mail,
  Truck,
  ArrowLeft
} from "lucide-react";
import { useEffect, useState } from "react";

import { SearchDialog } from "@/components/site/SearchDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { NAV_GROUPS } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { cartCount, wishlist, setIsCartOpen } = useShop();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const profileQuery = useQuery({
    queryKey: ["header-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isNavigating = false; // Note: isNavigating state removed or just kept, let's keep it.
  const [isNavigatingState, setIsNavigatingState] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleBack = () => {
    // Check if there is meaningful history within the app by verifying React Router's internal state index
    const hasHistory = window.history.state && window.history.state.idx > 0;
    
    if (hasHistory) {
      navigate(-1);
    } else {
      // Sensible fallbacks when opening a deep link directly
      if (location.pathname.startsWith("/product/")) {
        navigate("/shop");
      } else if (location.pathname.startsWith("/category/") || location.pathname.startsWith("/collection/")) {
        navigate("/shop");
      } else if (location.pathname.startsWith("/checkout")) {
        navigate("/cart");
      } else if (location.pathname.startsWith("/journal/")) {
        navigate("/journal");
      } else {
        navigate("/");
      }
    }
  };

  const handleMobileNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (isNavigating) return;
    
    setMenuOpen(false);
    
    // Only navigate if it's a different route
    if (location.pathname !== href) {
      setIsNavigating(true);
      setTimeout(() => {
        navigate(href);
        setIsNavigating(false);
      }, 300);
    }
  };

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
        {isHomePage && (
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:w-80">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">Aarohan Décor</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col pb-8">
                <div className="flex flex-col py-2">
                  <p className="eyebrow mb-2 px-2 text-muted-foreground">Main Navigation</p>
                  <Link to="/" onClick={(e) => handleMobileNav(e, "/")} className={cn("flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50", location.pathname === "/" && "bg-accent/50 text-accent-foreground")}>
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5" />
                      <span className="text-base font-medium">Home</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link to="/shop" onClick={(e) => handleMobileNav(e, "/shop")} className="flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5" />
                      <span className="text-base font-medium">Shop</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <button type="button" onClick={() => { setMenuOpen(false); setIsCartOpen(true); }} className="flex w-full items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50 text-left">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5" />
                      <span className="text-base font-medium">Cart</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <Link to="/wishlist" onClick={(e) => handleMobileNav(e, "/wishlist")} className="flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5" />
                      <span className="text-base font-medium">Wishlist</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>

                <div className="my-2 h-px bg-border" />

                <div className="flex flex-col py-2">
                  <p className="eyebrow mb-2 px-2 text-muted-foreground">Account</p>
                  <Link to={user ? "/account" : "/auth"} onClick={(e) => handleMobileNav(e, user ? "/account" : "/auth")} className="flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <span className="text-base font-medium">{user ? "My Account" : "Login"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>

                <div className="my-2 h-px bg-border" />

                <div className="flex flex-col py-2">
                  <p className="eyebrow mb-2 px-2 text-muted-foreground">Support</p>
                  <Link to="/faqs" onClick={(e) => handleMobileNav(e, "/faqs")} className="flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5" />
                      <span className="text-base font-medium">Help & Support</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link to="/contact" onClick={(e) => handleMobileNav(e, "/contact")} className="flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <span className="text-base font-medium">Contact Us</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <Link to="/track-order" onClick={(e) => handleMobileNav(e, "/track-order")} className="flex items-center justify-between rounded-md px-2 py-3 transition-colors hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5" />
                      <span className="text-base font-medium">Track Order</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        )}

        <div className="flex items-center">
          {!isHomePage && (
            <button
              onClick={handleBack}
              className="group inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-foreground/80 mr-3 md:mr-6 shrink-0"
            >
              <ArrowLeft className="mr-1 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-1 min-w-0">
            <img src="/favicon.svg" alt="Aarohan Logo" className="h-7 w-7 md:h-9 md:w-9 object-contain shrink-0" />
            <div className="flex flex-col leading-none shrink-1 min-w-0">
              <span className="font-display text-xl tracking-wide md:text-[28px] truncate">Aarohan</span>
              <span className="eyebrow hidden md:block">Décor Atelier</span>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        {isHomePage && (
          <nav className="ml-6 hidden flex-1 items-center gap-6 lg:flex">
            <button
              type="button"
              onMouseEnter={() => setShopOpen(true)}
              onClick={() => setShopOpen((v) => !v)}
              className={cn("link-underline text-sm", shopOpen && "text-accent")}
            >
              Shop
            </button>
            <Link to="/" onMouseEnter={() => setShopOpen(false)} className={cn("link-underline text-sm", location.pathname === "/" && "text-accent")}>
              Home
            </Link>
            <Link to="/shop" onMouseEnter={() => setShopOpen(false)} className="link-underline text-sm">
              All Products
            </Link>
            <Link to="/story" onMouseEnter={() => setShopOpen(false)} className="link-underline text-sm">
              Our Story
            </Link>
            <Link to="/journal" onMouseEnter={() => setShopOpen(false)} className="link-underline text-sm">
              Journal
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-0 sm:gap-1 shrink-0">
          {isHomePage && (
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[18px] w-[18px]" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" asChild aria-label="Wishlist">
            <Link to="/wishlist" className="relative">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 sm:h-10 sm:w-10"
                aria-label={user ? "My account" : "Sign in"}
              >
                <User className="h-[18px] w-[18px]" />
                {user && (
                  <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2">
              {!user ? (
                <>
                  <DropdownMenuLabel className="eyebrow px-2 py-2 text-xs">Account Access</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-accent/10 focus:text-accent">
                    <Link to="/auth" className="w-full">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-accent/10 focus:text-accent">
                    <Link to="/auth?tab=signup" className="w-full">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {profileQuery.data?.full_name || "Valued Customer"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-accent/10 focus:text-accent">
                    <Link to="/account" className="flex w-full items-center justify-between">
                      My Account
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950"
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 relative" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] text-accent-foreground">
                  {cartCount}
                </span>
              )}
          </Button>
        </div>
      </div>

      {/* Mega menu */}
      {isHomePage && (
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
                        to={g.title === "Gifts" ? `/collection/${it.slug}` : `/category/${it.slug}`}
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
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
