import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Heart, Minus, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { Footer } from "@/components/site/Footer";
import { resolveImage } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  IMAGES,
  completeTheLook,
  formatINR,
  getProductPrice,
} from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isWishlisted, toggleWishlist, markViewed, products, isLoadingProducts } = useShop();
  const { user } = useAuth();

  const product = products.find((p) => p.slug === slug);
  const related = products
    .filter((x) => x.id !== product?.id && (x.category === product?.category || x.style === product?.style))
    .slice(0, 4);

  const hasA4 = product ? (product.category === "posters" || product.name === "Golden Swirl Resin Wall Art") : false;
  const hasXL = product ? (product.category === "wall-clocks" || product.category === "wall-decor") : false;
  const hasSize = hasA4 || hasXL;

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string>(hasA4 ? "A4" : hasXL ? "XL" : "");
  const [zoom, setZoom] = useState(false);

  const { data: inventoryData, isLoading: isLoadingInventory, error: inventoryError } = useQuery({
    queryKey: ["product-inventory", product?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("stock")
        .eq("product_id", product!.id)
        .eq("variant", "Default")
        .maybeSingle();
      
      if (error) {
        console.error("Failed to fetch inventory:", error);
        throw error;
      }
      return data as any;
    },
  });

  const currentStock = inventoryData?.stock ?? 0;

  useEffect(() => {
    if (product) {
      markViewed(product.id);
      setQty(1);
      const _hasA4 = product.category === "posters" || product.name === "Golden Swirl Resin Wall Art";
      const _hasXL = product.category === "wall-clocks" || product.category === "wall-decor";
      setSize(_hasA4 ? "A4" : _hasXL ? "XL" : "");
    }
  }, [product, markViewed]);

  if (isLoadingProducts) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl text-muted-foreground animate-pulse">Loading piece...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl">Product not found</h1>
        <p className="mt-2 text-muted-foreground">The piece you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-6">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

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
        <Link to={`/category/${product.category}`} className="hover:text-foreground">
          {product.category?.replace(/-/g, " ") || "uncategorized"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name || "Unknown"}</span>
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
              src={resolveImage(product.image)}
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
          <p className="eyebrow">{product.subcategory || "Home Decor"}</p>
          <h1 className="mt-2 font-display text-3xl md:text-5xl">{product.name || "Unknown"}</h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-4xl">
              {formatINR(getProductPrice(product, hasSize ? size : undefined))}
            </span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description || "No description available."}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
            {[
              ["Material", product.material],
              [
                "Dimensions",
                hasA4
                  ? size === "A4"
                    ? "21 × 29.7 cm"
                    : "14.8 × 21 cm"
                  : hasXL
                    ? undefined
                    : product.dimensions,
              ],
              ["Weight", product.weight],
              ["Colour", product.color],
              ["Style", product.style],
              ["Care", product.care],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string} className="pr-4">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-1 capitalize">{v as string}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-8">
            <p className="text-sm mb-4">
              {isLoadingInventory ? (
                <span className="text-muted-foreground animate-pulse">Checking stock...</span>
              ) : inventoryError ? (
                <span className="text-muted-foreground">Stock information unavailable</span>
              ) : currentStock > 5 ? (
                <span className="text-accent">In stock · ready to ship</span>
              ) : currentStock > 0 ? (
                <span className="text-accent">Only {currentStock} left</span>
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
                      <Button
                        variant={size === "A4" ? "default" : "outline"}
                        onClick={() => setSize("A4")}
                      >
                        A4 — 21 × 29.7 cm
                      </Button>
                      <Button
                        variant={size === "A5" ? "default" : "outline"}
                        onClick={() => setSize("A5")}
                      >
                        A5 — 14.8 × 21 cm
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={size === "XL" ? "default" : "outline"}
                        onClick={() => setSize("XL")}
                      >
                        XL
                      </Button>
                      <Button
                        variant={size === "XXL" ? "default" : "outline"}
                        onClick={() => setSize("XXL")}
                      >
                        XXL
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-sm border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  addToCart(product.id, qty, hasSize ? size : undefined);
                }}
                disabled={currentStock === 0 || isLoadingInventory || (hasSize && !size)}
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={currentStock === 0 || isLoadingInventory || (hasSize && !size)}
                onClick={() => {
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
      <section className="mt-10">
        <h2 className="font-display text-3xl">You May Also Like</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Complete the Look</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {completeTheLook(products, product).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
