import { Link, useParams } from "react-router-dom";

import { ProductCard } from "@/components/site/ProductCard";
import { COLLECTIONS, productsInCollection } from "@/lib/catalog";

import { useShop } from "@/lib/shop-store";

function CollectionPage() {
  const { products: allProducts } = useShop();
  const { slug } = useParams<{ slug: string }>();
  const collection = COLLECTIONS.find((c) => c.slug === slug);
  const products = productsInCollection(allProducts, slug || "");

  if (!collection) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 text-center">
        <h1 className="font-display text-4xl">Collection not found</h1>
        <Link to="/shop" className="link-underline mt-4 inline-block text-sm text-accent">
          Browse all décor
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <nav className="eyebrow flex gap-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">{collection.title}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">{collection.title}</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {collection.blurb} · {products.length} pieces
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {COLLECTIONS.filter((c) => c.slug !== slug).map((c) => (
          <Link
            key={c.slug}
            to={`/collection/${c.slug}`}
            className="rounded-full border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {c.title}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default CollectionPage;
