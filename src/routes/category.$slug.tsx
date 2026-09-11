import { Link, useParams } from "react-router-dom";

import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, IMAGES, PRODUCTS } from "@/lib/catalog";

function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find((c) => c.slug === slug);
  const products = PRODUCTS.filter((p) => p.category === slug);
  const siblings = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 6);

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="font-display text-4xl">Category not found</h1>
        <Link to="/shop" className="link-underline mt-4 inline-block text-sm text-accent">
          Browse all décor
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative">
        <img
          src={IMAGES[category.image]}
          alt={category.name}
          width={1024}
          height={1024}
          className="h-[38vh] min-h-[260px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-10 text-primary-foreground md:px-8">
            <nav className="eyebrow flex gap-2 text-primary-foreground/80" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/shop">Shop</Link>
              <span>/</span>
              <span className="text-primary-foreground">{category.name}</span>
            </nav>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">{category.name}</h1>
            <p className="mt-2 text-sm text-primary-foreground/85">
              {category.blurb} · {products.length} pieces
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">New pieces are on their way to this category.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-20">
          <p className="eyebrow">Keep browsing</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {siblings.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="rounded-full border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default CategoryPage;
