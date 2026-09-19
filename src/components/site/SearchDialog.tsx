import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveImage, formatINR, searchProducts } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { products: storeProducts, isLoadingProducts } = useShop();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = searchProducts(storeProducts, q, 8);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Overlay - Fixed below the header */}
      <div
        className="fixed top-16 md:top-20 inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Search Panel - Fixed immediately below the header */}
      <div className="fixed top-16 md:top-20 left-0 w-full bg-[#fdfbf7] border-b border-border shadow-md animate-in slide-in-from-top-4 fade-in duration-200 z-[70]">
        <div className="mx-auto max-w-4xl px-4 py-4 md:px-8 md:py-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
              if (q.trim()) {
                navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
              }
            }}
            className="flex items-center gap-4 border-b border-border/60 pb-4"
          >
            <Search className="h-6 w-6 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search wooden clocks, vases, stone art..."
              className="border-0 bg-transparent px-2 text-lg md:text-xl shadow-none focus-visible:ring-0 h-10 md:h-12 placeholder:text-muted-foreground/60 rounded-none font-display text-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-full"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close search</span>
            </Button>
          </form>

          <div className="pt-4">
            {q && results.length === 0 && (
              <p className="text-center py-4 text-muted-foreground font-medium text-sm">
                Nothing matched “{q}”. Try “wooden”, “marble” or “bedroom”.
              </p>
            )}

            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto">
                {results.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-white border border-transparent hover:border-border/50 hover:shadow-sm"
                  >
                    <div className="h-12 w-12 shrink-0 bg-accent/10 rounded-md overflow-hidden border border-border/40">
                      <img
                        src={resolveImage(p.image)}
                        alt={p.name}
                        loading="lazy"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm group-hover:text-foreground/80 transition-colors">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {p.subcategory}
                      </span>
                    </span>
                    <span className="font-medium pr-2 whitespace-nowrap text-sm">
                      {formatINR(p.price)}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {!q && (
              <div>
                <p className="eyebrow text-muted-foreground mb-3 tracking-wider text-xs font-semibold">
                  POPULAR SEARCHES
                </p>
                <div className="flex flex-wrap gap-2">
                  {["wooden wall clock", "stone art", "ivory vase", "brass mirror"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQ(term)}
                      className="px-4 py-1.5 rounded-full bg-transparent border border-border text-sm hover:border-foreground hover:text-foreground transition-all font-medium text-muted-foreground"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
