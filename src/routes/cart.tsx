import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IMAGES, discountPct, formatINR } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Aarohan Décor" },
      { name: "description", content: "Review your décor selection and checkout securely in Indian Rupees." },
      { property: "og:title", content: "Your Bag — Aarohan Décor" },
      { property: "og:description", content: "Review your décor selection and checkout securely." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cartProducts, subtotal, setQty, removeFromCart, toggleWishlist } = useShop();
  const mrpTotal = cartProducts.reduce((s, l) => s + l.product.mrp * l.qty, 0);
  const discount = mrpTotal - subtotal;
  const delivery = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const total = subtotal + delivery;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (cartProducts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="font-display text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Start with a wall clock, a vase or a piece of stone art.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/shop">Shop décor</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">Your Bag</h1>
      <p className="mt-2 text-sm text-muted-foreground">{cartProducts.length} item(s)</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-6">
          {cartProducts.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4 border-b pb-6">
              <Link to="/product/$slug" params={{ slug: product.slug }} className="shrink-0">
                <img
                  src={IMAGES[product.image]}
                  alt={product.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-28 w-28 rounded-sm object-cover sm:h-32 sm:w-32"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">{product.subcategory}</p>
                <h2 className="font-display text-xl">
                  <Link to="/product/$slug" params={{ slug: product.slug }} className="link-underline">
                    {product.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm">
                  {formatINR(product.price)}{" "}
                  <span className="text-muted-foreground line-through">{formatINR(product.mrp)}</span>{" "}
                  <span className="text-accent">{discountPct(product)}% off</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-sm border">
                    <Button variant="ghost" size="icon" aria-label="Decrease" onClick={() => setQty(product.id, qty - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-9 text-center text-sm">{qty}</span>
                    <Button variant="ghost" size="icon" aria-label="Increase" onClick={() => setQty(product.id, qty + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleWishlist(product.id)}>
                    <Heart className="mr-1.5 h-4 w-4" /> Wishlist
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeFromCart(product.id)}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                  </Button>
                </div>
              </div>
              <p className="hidden w-24 text-right sm:block">{formatINR(product.price * qty)}</p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-md bg-card p-6 shadow-soft lg:sticky lg:top-28">
          <p className="eyebrow">Order summary</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal (MRP)</dt>
              <dd>{formatINR(mrpTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="text-accent">− {formatINR(discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{delivery === 0 ? "Free" : formatINR(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base">
              <dt>Total</dt>
              <dd className="font-display text-2xl">{formatINR(total)}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <div className="h-1.5 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {remaining > 0
                ? `Add ${formatINR(remaining)} more to unlock free shipping.`
                : "Free shipping unlocked — nice."}
            </p>
          </div>

          <Button className="mt-6 w-full" size="lg" asChild>
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Free shipping above {formatINR(FREE_SHIPPING_THRESHOLD)}
          </p>
        </aside>
      </div>
    </div>
  );
}
