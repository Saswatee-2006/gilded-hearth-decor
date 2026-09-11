import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IMAGES, formatINR, searchProducts } from "@/lib/catalog";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = searchProducts(q);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-24 max-w-xl translate-y-0 p-0">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
            navigate({ to: "/shop", search: { q: q || undefined } });
          }}
          className="flex items-center gap-3 border-b px-4 py-3"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search wooden clocks, vases, stone art…"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </form>
        <div className="max-h-80 overflow-y-auto p-2">
          {q && results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Nothing matched “{q}”. Try “wooden”, “marble” or “bedroom”.
            </p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              to="/product/$slug"
              params={{ slug: p.slug }}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary"
            >
              <img
                src={IMAGES[p.image]}
                alt={p.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="h-12 w-12 rounded-sm object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{p.name}</span>
                <span className="block text-xs text-muted-foreground">{p.subcategory}</span>
              </span>
              <span className="text-sm">{formatINR(p.price)}</span>
            </Link>
          ))}
          {!q && (
            <p className="p-4 text-sm text-muted-foreground">
              Popular: wooden wall clock · stone art · ivory vase · brass mirror
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
