import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Heart, Minus, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  IMAGES,
  completeTheLook,
  formatINR,
  getProduct,
  relatedProducts,
} from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

function ProductPage() {
  const { slug } = useParams();
  const product = getProduct(slug)!;
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const hasA4 = product.category === 'posters' || product.name === 'Golden Swirl Resin Wall Art';
  const hasXL = product.category === 'wall-clocks' || product.category === 'wall-decor';
  const hasSize = hasA4 || hasXL;

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string>(
    hasA4 ? "A4" : hasXL ? "XL" : ""
  );
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    markViewed(product.id);
    setQty(1);
    const _hasA4 = product.category === 'posters' || product.name === 'Golden Swirl Resin Wall Art';
    const _hasXL = product.category === 'wall-clocks' || product.category === 'wall-decor';
    setSize(_hasA4 ? "A4" : _hasXL ? "XL" : "");
  }, [product.id, markViewed, product.category, product.name]);

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
        <Link to={`/category/${product.category }`} className="hover:text-foreground">
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
              src={IMAGES[product.image]}
              alt={product.name}
              width={1024}
              height={1024}
              className={cn(
                "aspect-square w-full object-cover transition-transform duration-700",
                zoom && "scale-125",
              )}
            />
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow">{product.subcategory}</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl">{formatINR(product.price)}</span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
            {[
              ["Material", product.material],
              ["Dimensions", hasA4 ? (size === 'A4' ? '21 × 29.7 cm' : '14.8 × 21 cm') : hasXL ? undefined : product.dimensions],
              ["Weight", product.weight],
              ["Colour", product.color],
              ["Style", product.style],
              ["Care", product.care],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string} className="pr-4">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 capitalize">{v as string}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <p className="text-sm mb-4">
              {product.stock > 5 ? (
                <span className="text-accent">In stock · ready to ship</span>
              ) : product.stock > 0 ? (
                <span className="text-accent">Only {product.stock} left</span>
              ) : (
                <span className="text-destructive">Out of stock</span>
              )}
            </p>

            {hasSize && (
              <div className="mb-6">
                <span className="eyebrow block mb-2">Choose Size</span>
                <div className="flex flex-wrap gap-2">
                  {hasA4 ? (
                    <>
                      <Button variant={size === "A4" ? "default" : "outline"} onClick={() => setSize("A4")}>A4 — 21 × 29.7 cm</Button>
                      <Button variant={size === "A5" ? "default" : "outline"} onClick={() => setSize("A5")}>A5 — 14.8 × 21 cm</Button>
                    </>
                  ) : (
                    <>
                      <Button variant={size === "XL" ? "default" : "outline"} onClick={() => setSize("XL")}>XL</Button>
                      <Button variant={size === "XXL" ? "default" : "outline"} onClick={() => setSize("XXL")}>XXL</Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-sm border">
                <Button variant="ghost" size="icon" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <Button variant="ghost" size="icon" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button size="lg" onClick={() => {
                if (!user) {
                  navigate({ to: "/auth", search: { returnTo: window.location.pathname } as any });
                  return;
                }
                addToCart(product.id, qty, hasSize ? size : undefined);
              }} disabled={product.stock === 0 || (hasSize && !size)}>
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={product.stock === 0 || (hasSize && !size)}
                onClick={() => {
                  if (!user) {
                    navigate({ to: "/auth", search: { returnTo: window.location.pathname } as any });
                    return;
                  }
                  addToCart(product.id, qty, hasSize ? size : undefined);
                  navigate("/checkout");
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

export default ProductPage;
