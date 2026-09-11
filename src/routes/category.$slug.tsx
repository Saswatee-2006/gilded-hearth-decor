import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { CATEGORIES, IMAGES, PRODUCTS, getCategory } from "@/lib/catalog";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { name: category.name, blurb: category.blurb, image: category.image, slug: category.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Category unavailable — Aarohan Décor" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Buy Premium ${loaderData.name} Online | Aarohan Décor`;
    return {
      meta: [
        { title },
        { name: "description", content: `${loaderData.blurb} Shop premium ${loaderData.name.toLowerCase()} with free delivery above ₹999.` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.blurb },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="font-display text-4xl">Category not found</h1>
      <Link to="/shop" className="link-underline mt-4 inline-block text-sm text-accent">
        Browse all décor
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="font-display text-3xl">We couldn't load this category</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { name, blurb, image, slug } = Route.useLoaderData();
  const products = PRODUCTS.filter((p) => p.category === slug);
  const siblings = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 6);

  return (
    <>
      <section className="relative">
        <img
          src={IMAGES[image]}
          alt={name}
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
              <span className="text-primary-foreground">{name}</span>
            </nav>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">{name}</h1>
            <p className="mt-2 text-sm text-primary-foreground/85">
              {blurb} · {products.length} pieces
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
                to="/category/$slug"
                params={{ slug: c.slug }}
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
