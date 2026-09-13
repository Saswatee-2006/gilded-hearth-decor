import { Link } from "react-router-dom";
import { ARTICLES } from "@/lib/journal";
import fallbackImage from "@/assets/hero-living.jpg";

function JournalPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* HERO SECTION */}
      <section className="text-center md:py-10">
        <p className="eyebrow text-muted-foreground">THE AAROHAN JOURNAL</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Stories, ideas & inspiration for beautiful spaces
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
          Articles, design guides, and visual inspiration to help you style your spaces and discover interior ideas.
        </p>
      </section>

      {/* ARTICLE GRID */}
      <section className="mt-20">
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {ARTICLES.map((article) => (
            <div key={article.id} className="group flex flex-col h-full">
              <Link
                to={`/journal/${article.slug}`}
                className="relative block overflow-hidden rounded-sm aspect-[4/3] bg-secondary mb-6 shrink-0"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
              </Link>
              <div className="flex flex-col flex-1">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3 shrink-0">
                  {article.category} &middot; {article.date}
                </span>
                <h2 className="font-display text-2xl leading-snug mb-3 text-foreground shrink-0">
                  <Link to={`/journal/${article.slug}`} className="hover:text-primary transition-colors">
                    {article.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                  {article.blurb}
                </p>
                <Link
                  to={`/journal/${article.slug}`}
                  className="link-underline w-fit font-medium uppercase tracking-widest text-xs mt-auto shrink-0"
                >
                  Read Story &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default JournalPage;
