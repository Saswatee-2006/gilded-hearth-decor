import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IMAGES, discountPct, formatINR, type Product } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const saved = isWishlisted(product.id);
  const off = discountPct(product);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-md bg-secondary">
        <Link to="/product/$slug" params={{ slug: product.slug }} aria-label={product.name}>
          <img
            src={IMAGES[product.image]}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          {product.badges.includes("bestseller") && (
            <span className="rounded-sm bg-primary px-2 py-1 text-[10px] tracking-[0.16em] text-primary-foreground uppercase">
              Bestseller
            </span>
          )}
          {product.badges.includes("new") && (
            <span className="rounded-sm bg-accent px-2 py-1 text-[10px] tracking-[0.16em] text-accent-foreground uppercase">
              New
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/85 backdrop-blur transition-transform duration-300 hover:scale-110"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              saved ? "fill-accent text-accent" : "text-muted-foreground",
            )}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Button size="sm" className="flex-1" onClick={() => addToCart(product.id)}>
            Quick Add
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              View
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="eyebrow">{product.subcategory}</p>
        <h3 className="font-display text-lg leading-snug">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="link-underline"
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-brass text-brass" />
          <span className="text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviews} reviews)</span>
        </div>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base">{formatINR(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(product.mrp)}
              </span>
              <span className="text-xs text-accent">{off}% off</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
