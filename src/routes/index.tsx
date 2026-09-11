import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Instagram, PackageCheck, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-living.jpg";
import banner from "@/assets/banner-statement.jpg";
import { CATEGORIES, IMAGES, PRODUCTS, ROOMS, STYLES, productsInCollection } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aarohan Décor — Make Your Space Beautiful" },
      {
        name: "description",
        content:
          "Premium Indian home décor: wall clocks, stone art, canvas prints, vases, mirrors, lighting and gifts. Free shipping above ₹999.",
      },
      { property: "og:title", content: "Aarohan Décor — Make Your Space Beautiful" },
      {
        property: "og:description",
        content: "Thoughtfully designed décor that turns everyday spaces into something extraordinary.",
      },
    ],
  }),
  component: Home,
});

const featured = PRODUCTS.filter((p) => p.badges.includes("featured")).slice(0, 8);
const bestsellers = PRODUCTS.filter((p) => p.badges.includes("bestseller")).slice(0, 4);
const newArrivals = PRODUCTS.filter((p) => p.badges.includes("new")).slice(0, 4);
const wallArt = PRODUCTS.filter((p) =>
  ["posters", "canvas-art", "abstract-art", "wall-decor", "wall-hangings", "stone-art"].includes(
    p.category,
  ),
).slice(0, 7);

function SectionHead({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: { label: string; to: string; slug?: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-3xl md:text-[40px]">{title}</h2>
        {copy && <p className="mt-3 text-sm text-muted-foreground">{copy}</p>}
      </div>
      {action && (
        <Button variant="link" className="px-0" asChild>
          {action.slug ? (
            <Link to="/collection/$slug" params={{ slug: action.slug }}>
              {action.label} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          ) : (
            <Link to="/shop">
              {action.label} <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </Button>
      )}
    </div>
  );
}

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative">
        <img
          src={hero}
          alt="Warm neutral living room styled with abstract canvas art, a wooden wall clock and ceramic vases"
          width={1920}
          height={1088}
          className="h-[78vh] min-h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
            <Reveal className="max-w-xl text-primary-foreground">
              <p className="eyebrow text-primary-foreground/80">Aarohan Décor · Est. 2019</p>
              <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-7xl">
                Make Your Space Beautiful.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/85 md:text-base">
                Thoughtfully designed décor that turns everyday spaces into something extraordinary.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link to="/shop">Shop Décor</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/collection/$slug" params={{ slug: "luxury-decor" }}>
                    Explore Collections
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b bg-card">
        <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-xs text-muted-foreground md:px-8">
          {[
            { icon: ShieldCheck, label: "Quality Checked" },
            { icon: Sparkles, label: "Secure Payments" },
            { icon: PackageCheck, label: "Carefully Packed" },
            { icon: RotateCcw, label: "Easy Returns" },
            { icon: Truck, label: "Free Delivery above ₹999" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHead
          eyebrow="Browse"
          title="Shop by Category"
          copy="Sixteen curated categories, from silent wooden clocks to hand-carved stone."
          action={{ label: "All products", to: "/shop" }}
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.slice(0, 12).map((c, i) => (
            <Reveal key={c.slug} delay={i * 40}>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group block overflow-hidden rounded-md bg-secondary"
              >
                <div className="relative">
                  <img
                    src={IMAGES[c.image]}
                    alt={c.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4">
                    <p className="font-display text-xl text-primary-foreground">{c.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] tracking-[0.18em] text-primary-foreground/80 uppercase">
                      Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            eyebrow="Handpicked"
            title="Curated For Your Home"
            copy="A short list of the pieces our stylists reach for first."
            action={{ label: "View all", to: "/shop" }}
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 40}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STYLES */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHead eyebrow="Aesthetic" title="Find Your Style" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((s, i) => (
            <Reveal key={s.tag} delay={i * 30}>
              <Link
                to="/shop"
                search={{ style: s.tag }}
                className="group relative block overflow-hidden rounded-md"
              >
                <img
                  src={IMAGES[CATEGORIES[(i * 3) % CATEGORIES.length].image]}
                  alt={`${s.name} décor`}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-ink/40 p-5 text-primary-foreground">
                  <p className="eyebrow text-primary-foreground/80">{s.name}</p>
                  <p className="mt-2 font-display text-xl leading-snug">{s.line}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROOMS */}
      <section className="bg-secondary/50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            eyebrow="By space"
            title="Decorate Every Corner"
            copy="Pieces chosen for the way each room is actually lived in."
          />
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0">
            {ROOMS.map((r) => (
              <Link
                key={r.slug}
                to="/shop"
                search={{ room: r.slug }}
                className="group w-64 shrink-0 snap-start overflow-hidden rounded-md md:w-auto"
              >
                <img
                  src={IMAGES[r.image]}
                  alt={`${r.name} décor`}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <p className="mt-3 font-display text-xl">{r.name}</p>
                <p className="eyebrow">Shop the room</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WALL ART EDITORIAL */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHead
          eyebrow="Editorial"
          title="The Wall Art Edit"
          copy="Posters, canvas, resin, stone and hand-knotted cotton — layered the way a stylist would."
          action={{ label: "Shop wall art", to: "/shop" }}
        />
        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {wallArt.map((p) => (
            <Link
              key={p.id}
              to="/product/$slug"
              params={{ slug: p.slug }}
              className="group block break-inside-avoid overflow-hidden rounded-md"
            >
              <img
                src={IMAGES[p.image]}
                alt={p.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <p className="mt-2 text-sm">{p.name}</p>
              <p className="eyebrow">{p.subcategory}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead
            eyebrow="Loved by 40,000+ homes"
            title="Most Loved"
            action={{ label: "View all", to: "/collection", slug: "trending-now" }}
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {bestsellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 40}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LIMITED COLLECTION BANNER */}
      <section className="relative my-20">
        <img
          src={banner}
          alt="Luxury entryway styled with a bronze sculpture and arched mirror"
          loading="lazy"
          width={1600}
          height={900}
          className="h-[60vh] min-h-[400px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <Reveal className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-4 text-primary-foreground md:px-8">
            <p className="eyebrow text-primary-foreground/80">Limited collection</p>
            <h2 className="mt-3 max-w-lg font-display text-4xl md:text-6xl">Designed to Be Noticed.</h2>
            <p className="mt-4 max-w-md text-sm text-primary-foreground/85">
              Statement pieces that bring personality to your space.
            </p>
            <Button size="lg" className="mt-7" asChild>
              <Link to="/collection/$slug" params={{ slug: "statement-pieces" }}>
                Explore the Collection
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <SectionHead
          eyebrow="Just landed"
          title="New Arrivals"
          action={{ label: "View all", to: "/collection", slug: "trending-now" }}
        />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {newArrivals.map((p, i) => (
            <Reveal key={p.id} delay={i * 40}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* COLLECTIONS STRIP */}
      <section className="bg-secondary/50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHead eyebrow="Collections" title="Shop a Feeling" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["under-999", "luxury-decor", "minimalist", "gift-ideas"].map((slug) => {
              const count = productsInCollection(slug).length;
              return (
                <Link
                  key={slug}
                  to="/collection/$slug"
                  params={{ slug }}
                  className="card-soft group rounded-md p-6"
                >
                  <p className="font-display text-2xl capitalize">{slug.replace(/-/g, " ")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{count} pieces</p>
                  <ArrowRight className="mt-6 h-4 w-4 text-accent transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* STYLED BY YOU */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHead eyebrow="#AarohanHomes" title="Styled By You" copy="Follow our inspiration" />
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {CATEGORIES.slice(0, 6).map((c) => (
            <div key={c.slug} className="relative overflow-hidden rounded-md">
              <img
                src={IMAGES[c.image]}
                alt={`Customer home styled with ${c.name}`}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <Instagram className="absolute bottom-2 right-2 h-4 w-4 text-primary-foreground" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
