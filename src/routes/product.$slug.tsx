import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Check, Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { CustomerReviews } from "@/components/site/ReviewForm";
import {
  IMAGES,
  completeTheLook,
  discountPct,
  formatINR,
  getProduct,
  relatedProducts,
} from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { slug: product.slug, name: product.name, description: product.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Aarohan Décor" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Aarohan Décor`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description.slice(0, 155) },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="font-display text-4xl">Product not found</h1>
      <Link to="/shop" className="link-underline mt-4 inline-block text-sm text-accent">
        Browse all décor
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="font-display text-3xl">We couldn't load this product</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

const RATING_BREAKDOWN = [
  { stars: 5, pct: 72 },
  { stars: 4, pct: 19 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

function ProductPage() {
  const { slug } = Route.useLoaderData();
  const product = getProduct(slug)!;
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useShop();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const off = discountPct(product);
  const emi = Math.round(product.price / 3);

  useEffect(() => {
    markViewed(product.id);
    setActive(0);
    setQty(1);
  }, [product.id, markViewed]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav className="eyebrow flex flex-wrap gap-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span>/</span>
        <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-foreground">
          {product.category.replace(/-/g, " ")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div
            className="overflow-hidden rounded-md bg-secondary"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
          >
            <img
              src={IMAGES[product.gallery[active] ?? product.image]}
              alt={`${product.name} — view ${active + 1}`}
              width={1024}
              height={1024}
              className={cn(
                "aspect-square w-full object-cover transition-transform duration-700",
                zoom && "scale-125",
              )}
            />
          </div>
          <div className="mt-3 flex gap-3">
            {product.gallery.map((g, i) => (
              <button
                key={g + String(i)}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "overflow-hidden rounded-sm border-2",
                  i === active ? "border-accent" : "border-transparent",
                )}
              >
                <img
                  src={IMAGES[g]}
                  alt={`${product.name} thumbnail ${i + 1}`}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-20 w-20 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow">{product.subcategory}</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    "h-4 w-4",
                    s <= Math.round(product.rating) ? "fill-brass text-brass" : "text-border",
                  )}
                />
              ))}
            </span>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">· {product.reviews} reviews</span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl">{formatINR(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-muted-foreground line-through">{formatINR(product.mrp)}</span>
                <span className="rounded-sm bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  {off}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Inclusive of all taxes · or 3 interest-free EMIs of {formatINR(emi)}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
            {[
              ["Material", product.material],
              ["Dimensions", product.dimensions],
              ["Weight", product.weight],
              ["Colour", product.color],
              ["Style", product.style],
              ["Care", product.care],
            ].map(([k, v]) => (
              <div key={k} className="pr-4">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 capitalize">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm">
            {product.stock > 5 ? (
              <span className="text-accent">In stock · ready to ship</span>
            ) : product.stock > 0 ? (
              <span className="text-accent">Only {product.stock} left</span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-sm border">
              <Button variant="ghost" size="icon" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <Button variant="ghost" size="icon" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" onClick={() => addToCart(product.id, qty)} disabled={product.stock === 0}>
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product.id, qty);
                navigate({ to: "/checkout" });
              }}
            >
              Buy Now
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Save to wishlist"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart
                className={cn("h-4 w-4", isWishlisted(product.id) && "fill-accent text-accent")}
              />
            </Button>
          </div>

          <div className="mt-8 rounded-md bg-secondary/60 p-5">
            <p className="eyebrow">Why you'll love it</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                "Premium craftsmanship, finished by hand",
                "Packed in shock-proof, plastic-free layers",
                "Quality checked before dispatch",
                "Easy 7-day returns",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Truck className="h-4 w-4" /> Free delivery above ₹999 · dispatched in 24–48 hours
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24">
        <h2 className="font-display text-3xl">Customer Reviews</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr]">
          <div>
            <p className="font-display text-5xl">{product.rating.toFixed(1)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{product.reviews} verified reviews</p>
            <ul className="mt-5 space-y-2">
              {RATING_BREAKDOWN.map((r) => (
                <li key={r.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8">{r.stars} ★</span>
                  <span className="h-1.5 flex-1 rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full bg-brass"
                      style={{ width: `${r.pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-muted-foreground">{r.pct}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ul className="space-y-6">
              {[
                {
                  name: "Ananya R., Bengaluru",
                  text: "Looks even better than the photos. The finish is genuinely premium and it arrived beautifully packed.",
                  stars: 5,
                },
                {
                  name: "Rahul M., Pune",
                  text: "Bought this for our new home and it instantly lifted the whole wall. Delivery took three days.",
                  stars: 5,
                },
                {
                  name: "Sneha K., Kolkata",
                  text: "Lovely piece, slightly smaller than I imagined — do check the dimensions before ordering.",
                  stars: 4,
                },
              ].map((r) => (
                <li key={r.name} className="border-b pb-5">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn("h-3.5 w-3.5", s <= r.stars ? "fill-brass text-brass" : "text-border")}
                      />
                    ))}
                    <span className="text-sm">{r.name}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                  <div className="mt-3 flex gap-2">
                    {product.gallery.slice(0, 2).map((g, i) => (
                      <img
                        key={i}
                        src={IMAGES[g]}
                        alt="Customer photo"
                        loading="lazy"
                        width={1024}
                        height={1024}
                        className="h-16 w-16 rounded-sm object-cover"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toast("Thanks — marked helpful")}
                    className="mt-3 text-xs text-muted-foreground underline"
                  >
                    Helpful
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <CustomerReviews productSlug={product.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-24">
        <h2 className="font-display text-3xl">You May Also Like</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {relatedProducts(product).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl">Complete the Look</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {completeTheLook(product).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
