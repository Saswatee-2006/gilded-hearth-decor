import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "New Arrivals", to: "/collection/trending-now" },
      { label: "Bestsellers", to: "/collection/statement-pieces" },
      { label: "Collections", to: "/collection/luxury-decor" },
      { label: "Gifts", to: "/collection/gift-ideas" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns", to: "/returns" },
      { label: "FAQs", to: "/faqs" },
      { label: "Track Order", to: "/track-order" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", to: "/story" },
      { label: "Journal", to: "/journal" },
      { label: "Careers", to: "/careers" },
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
                    <Link to={l.to} className="link-underline text-sm text-muted-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Aarohan Décor. Handpicked in India.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/policies" className="link-underline">Privacy Policy</Link>
            <Link to="/policies" className="link-underline">Terms &amp; Conditions</Link>
            <Link to="/policies" className="link-underline">Refund Policy</Link>
            <Link to="/shipping" className="link-underline">Shipping Policy</Link>
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
