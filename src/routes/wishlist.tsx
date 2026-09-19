import { Link } from "react-router-dom";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";

function WishlistPage() {
  const { wishlist, products, isLoadingProducts } = useShop();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">Wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">{items.length} saved piece(s)</p>

      {isLoadingProducts ? (
        <div className="mt-14 rounded-md border border-dashed py-32 text-center text-muted-foreground animate-pulse">
          Loading wishlist...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-14 rounded-md border border-dashed p-16 text-center">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any piece to keep it here.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/shop">Browse décor</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
