import { Link, createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCTS, formatINR } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Aarohan Décor" },
      { name: "description", content: "Your orders, wishlist, addresses and recently viewed décor." },
      { property: "og:title", content: "My Account — Aarohan Décor" },
      { property: "og:description", content: "Your orders, wishlist and saved décor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { orders, wishlist, recentlyViewed } = useShop();
  const saved = PRODUCTS.filter((p) => wishlist.includes(p.id));
  const viewed = recentlyViewed
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">My Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Guest session — orders and saves are stored on this device for now.
      </p>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="viewed">Recently Viewed</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8">
          {orders.length === 0 ? (
            <div className="rounded-md border border-dashed p-14 text-center">
              <p className="font-display text-2xl">No orders yet</p>
              <Button className="mt-5" asChild>
                <Link to="/shop">Start shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {orders.map((o) => (
                <li key={o.id} className="rounded-md bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">Order #{o.id}</p>
                    <span className="rounded-sm bg-secondary px-2 py-1 text-xs">{o.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    · {formatINR(o.total)}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {o.lines.map((l) => (
                      <li key={l.name}>
                        {l.name} × {l.qty}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {saved.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewed" className="mt-8">
          {viewed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Browse a few pieces and they'll appear here.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {viewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-8">
          <p className="text-sm text-muted-foreground">
            Saved addresses arrive with accounts — you can still enter an address at checkout.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
