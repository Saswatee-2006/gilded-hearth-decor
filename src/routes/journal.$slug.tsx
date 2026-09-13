import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getArticle } from "@/lib/journal";
import { cn } from "@/lib/utils";

import fallbackImage from "@/assets/hero-living.jpg";

function ArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug || "");

  if (!article) {
    return <Navigate to="/404" replace />;
  }

  return (
    <article className="pb-24">
      {/* Top Navigation */}
      <div className="mx-auto max-w-4xl px-4 pt-12 pb-6 md:px-8">
        <Link
          to="/journal"
          className="inline-flex items-center text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Journal
        </Link>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-4xl px-4 text-center md:px-8">
        <p className="eyebrow text-muted-foreground">{article.category}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-foreground">
          {article.title}
        </h1>
        <p className="mt-6 text-sm text-muted-foreground tracking-wide uppercase">
          {article.date}
        </p>
      </header>

      {/* Hero Image */}
      <figure className="mx-auto mt-12 max-w-5xl px-4 md:px-8">
        <div className="overflow-hidden rounded-sm aspect-video w-full bg-secondary">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>
      </figure>

      {/* Content */}
      <div className="mx-auto mt-16 max-w-2xl px-4 md:px-8 space-y-8 text-lg leading-relaxed text-foreground/85">
        {article.content.map((block, i) => (
          <div key={i}>
            {block.heading && (
              <h2 className="font-display text-2xl md:text-3xl text-foreground mt-12 mb-4">
                {block.heading}
              </h2>
            )}
            <p className="font-light">{block.text}</p>
          </div>
        ))}
      </div>

      {/* Footer Back Link */}
      <div className="mx-auto max-w-2xl mt-20 pt-10 border-t border-border flex justify-center">
        <Link
          to="/journal"
          className="inline-flex items-center text-sm font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Journal
        </Link>
      </div>
    </article>
  );
}

export default ArticlePage;
