import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { resolveImage, formatINR, getProductPrice } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, useShop } from "@/lib/shop-store";

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartProducts, subtotal, setQty, removeFromCart, cartCount } =
    useShop();

  const delivery = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const total = subtotal + delivery;

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="flex w-[95vw] flex-col overflow-hidden p-0 sm:max-w-md bg-white"
      >
        <SheetHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
          <SheetTitle className="font-display text-xl flex items-center gap-2 m-0">
            <span role="img" aria-label="cart text-xl">
              🛍
            </span>{" "}
            Your Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {cartProducts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <span className="text-3xl">🛒</span>
            </div>
            <h2 className="font-display text-2xl">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Looks like you haven't added anything yet.
            </p>
            <Button className="mt-6 w-full" onClick={() => setIsCartOpen(false)} asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-6">
                {cartProducts.map(({ product, qty, size }) => (
                  <li key={product.id + (size || "")} className="flex gap-4">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => setIsCartOpen(false)}
                      className="shrink-0"
                    >
                      <img
                        src={resolveImage(product.image)}
                        alt={product.name}
                        loading="lazy"
                        width={1024}
                        height={1024}
                        className="h-24 w-24 rounded-sm object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base leading-tight">
                            <Link
                              to={`/product/${product.slug}`}
                              onClick={() => setIsCartOpen(false)}
                              className="link-underline"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <p className="eyebrow mt-1 text-xs">
                            {product.subcategory} {size ? `• ${size}` : ""}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 -mt-1 -mr-2"
                          onClick={() => removeFromCart(product.id, size)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-3">
                        <div className="flex items-center rounded-sm border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label="Decrease"
                            onClick={() => setQty(product.id, qty - 1, size)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-medium">{qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label="Increase"
                            onClick={() => setQty(product.id, qty + 1, size)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatINR(getProductPrice(product, size))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t bg-gray-50/50 p-6">
              <dl className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-foreground">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery</dt>
                  <dd className="font-medium text-foreground">
                    {delivery === 0 ? "Free" : formatINR(delivery)}
                  </dd>
                </div>
                <div className="mt-4 flex justify-between border-t pt-4 text-base font-medium text-foreground">
                  <dt>Total</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>
              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={() => setIsCartOpen(false)}
                asChild
              >
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
