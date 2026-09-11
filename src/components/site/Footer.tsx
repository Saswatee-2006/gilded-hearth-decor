import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" as const },
      { label: "New Arrivals", to: "/collection/$slug" as const, slug: "trending-now" },
      { label: "Bestsellers", to: "/collection/$slug" as const, slug: "statement-pieces" },
      { label: "Collections", to: "/collection/$slug" as const, slug: "luxury-decor" },
      { label: "Gifts", to: "/collection/$slug" as const, slug: "gift-ideas" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", to: "/account" as const },
      { label: "Shipping", to: "/account" as const },
      { label: "Returns", to: "/account" as const },
      { label: "FAQs", to: "/account" as const },
      { label: "Track Order", to: "/account" as const },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", to: "/" as const },
      { label: "Journal", to: "/" as const },
      { label: "Careers", to: "/" as const },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="font-display text-3xl">Bring More Beauty Home.</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Décor inspiration, new collection launches and quiet offers — a couple of times a month,
              never more.
            </p>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement | null;
                if (!input?.value.includes("@")) {
                  toast.error("Please enter a valid email address");
                  return;
                }
                toast.success("You're on the list. Welcome to Aarohan.");
                e.currentTarget.reset();
              }}
            >
              <Input name="email" type="email" placeholder="Enter your email" aria-label="Email" />
              <Button type="submit">Subscribe</Button>
            </form>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 place-items-center rounded-full border text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={col.title + l.label}>
                    {"slug" in l && l.slug ? (
                      <Link
                        to={l.to}
                        params={{ slug: l.slug }}
                        className="link-underline text-sm text-muted-foreground"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <Link to={l.to} className="link-underline text-sm text-muted-foreground">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Aarohan Décor. Handpicked in India.</p>
          <div className="flex flex-wrap gap-4">
            <span>Privacy Policy</span>
            <span>Terms &amp; Conditions</span>
            <span>Refund Policy</span>
            <span>Shipping Policy</span>
          </div>
          <div className="flex gap-2">
            {["UPI", "VISA", "MC", "RuPay", "COD"].map((p) => (
              <span key={p} className="rounded-sm border px-2 py-1 tracking-wider">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
