import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, List, SlidersHorizontal, Star } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CATEGORIES,
  FILTER_OPTIONS,
  IMAGES,
  PRODUCTS,
  ROOMS,
  STYLES,
  formatINR,
  type Product,
} from "@/lib/catalog";

type ShopSearch = {
  q?: string | undefined;
  category?: string | undefined;
  style?: string | undefined;
  room?: string | undefined;
  material?: string | undefined;
  price?: string | undefined;
  rating?: number | undefined;
  instock?: boolean | undefined;
  discount?: boolean | undefined;
  sort?: string | undefined;
  view?: "grid" | "list" | undefined;
};

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : undefined);

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: str(search["q"]),
    category: str(search["category"]),
    style: str(search["style"]),
    room: str(search["room"]),
    material: str(search["material"]),
    price: str(search["price"]),
    rating: Number(search["rating"]) > 0 ? Number(search["rating"]) : undefined,
    instock: search["instock"] === true || search["instock"] === "true" ? true : undefined,
    sort: str(search["sort"]),
    view: search["view"] === "list" ? "list" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Home Décor — Aarohan Décor" },
      {
        name: "description",
        content:
          "Filter 40+ premium décor pieces by category, style, room, material and price. Wall art, clocks, vases, mirrors and more.",
      },
      { property: "og:title", content: "Shop All Home Décor — Aarohan Décor" },
      {
        property: "og:description",
        content: "Filter premium décor by category, style, room, material and price in Indian Rupees.",
      },
    ],
  }),
  component: ShopPage,
});

function applyFilters(s: ShopSearch): Product[] {
  let list = [...PRODUCTS];
  if (s.q) {
    const t = s.q.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.category, p.subcategory, p.style, p.material, p.color, ...p.room]
        .join(" ")
        .toLowerCase()
        .includes(t),
    );
  }
  if (s.category) list = list.filter((p) => p.category === s.category);
  if (s.style) list = list.filter((p) => p.style === s.style);
  if (s.room) list = list.filter((p) => p.room.includes(s.room!));
  if (s.material) list = list.filter((p) => p.material === s.material);
  if (s.price) {
    const band = FILTER_OPTIONS.price.find((b) => b.label === s.price);
    if (band) list = list.filter((p) => p.price >= band.min && p.price < band.max);
  }
  if (s.rating) list = list.filter((p) => p.rating >= s.rating!);
  if (s.instock) list = list.filter((p) => p.stock > 0);

  switch (s.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    default:
      list.sort((a, b) => b.reviews - a.reviews);
  }
  return list;
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const products = applyFilters(search);
  const view = search.view ?? "grid";

  const set = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const Filters = () => (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">Category</p>
        <ul className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => set({ category: search.category === c.slug ? undefined : c.slug })}
                className={`text-sm ${search.category === c.slug ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-3">Price</p>
        <ul className="space-y-1.5">
          {FILTER_OPTIONS.price.map((b) => (
            <li key={b.label}>
              <button
                type="button"
                onClick={() => set({ price: search.price === b.label ? undefined : b.label })}
                className={`text-sm ${search.price === b.label ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
              >
                {b.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-3">Style</p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.tag}
              type="button"
              onClick={() => set({ style: search.style === s.tag ? undefined : s.tag })}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${
                search.style === s.tag ? "border-accent text-accent" : "text-muted-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Room</p>
        <div className="flex flex-wrap gap-2">
          {ROOMS.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => set({ room: search.room === r.slug ? undefined : r.slug })}
              className={`rounded-full border px-3 py-1 text-xs ${
                search.room === r.slug ? "border-accent text-accent" : "text-muted-foreground"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Material</p>
        <Select
          value={search.material ?? "all"}
          onValueChange={(v) => set({ material: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any material</SelectItem>
            {FILTER_OPTIONS.materials.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={!!search.instock}
            onCheckedChange={(c) => set({ instock: c ? true : undefined })}
          />
          In stock only
        </label>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate({ search: {} })}
      >
        Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav className="eyebrow flex gap-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">Shop</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">
            {search.category
              ? (CATEGORIES.find((c) => c.slug === search.category)?.name ?? "Shop")
              : "All Décor"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{products.length} pieces</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={search.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="Search in shop"
            className="w-44"
          />
          <Select value={search.sort ?? "popular"} onValueChange={(v) => set({ sort: v })}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most popular</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-sm border">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Grid view"
              onClick={() => set({ view: undefined })}
              className={view === "grid" ? "text-accent" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="List view"
              onClick={() => set({ view: "list" })}
              className={view === "list" ? "text-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:w-96">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Filters />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <Filters />
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="rounded-md border border-dashed p-16 text-center">
              <p className="font-display text-2xl">Nothing matches those filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing a filter or two — there is plenty more to see.
              </p>
              <Button className="mt-6" onClick={() => navigate({ search: {} })}>
                Clear filters
              </Button>
            </div>
          ) : view === "list" ? (
            <ul className="space-y-6">
              {products.map((p) => (
                <li key={p.id} className="flex gap-5 border-b pb-6">
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="shrink-0">
                    <img
                      src={IMAGES[p.image]}
                      alt={p.name}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="h-32 w-32 rounded-sm object-cover sm:h-40 sm:w-40"
                    />
                  </Link>
                  <div className="min-w-0">
                    <p className="eyebrow">{p.subcategory}</p>
                    <h2 className="font-display text-xl">
                      <Link to="/product/$slug" params={{ slug: p.slug }} className="link-underline">
                        {p.name}
                      </Link>
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    <p className="mt-2 text-sm">
                      {formatINR(p.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
