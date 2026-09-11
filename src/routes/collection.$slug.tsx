import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { COLLECTIONS, productsInCollection } from "@/lib/catalog";

export const Route = createFileRoute("/collection/$slug")({
  loader: ({ params }) => {
    const collection = COLLECTIONS.find((c) => c.slug === params.slug);
    if (!collection) throw notFound();
    return collection;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Collection unavailable — Aarohan Décor" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} — Aarohan Décor`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.blurb },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.blurb },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="font-display text-4xl">Collection not found</h1>
      <Link to="/shop" className="link-underline mt-4 inline-block text-sm text-accent">
        Browse all décor
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-28 text-center">
      <h1 className="font-display text-3xl">We couldn't load this collection</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: CollectionPage,
});

function CollectionPage() {
  const { slug, title, blurb } = Route.useLoaderData();
  const products = productsInCollection(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <nav className="eyebrow flex gap-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">{title}</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {blurb} · {products.length} pieces
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {COLLECTIONS.filter((c) => c.slug !== slug).map((c) => (
          <Link
            key={c.slug}
            to="/collection/$slug"
            params={{ slug: c.slug }}
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
