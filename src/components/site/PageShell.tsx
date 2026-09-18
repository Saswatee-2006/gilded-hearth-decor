import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 md:px-8 md:py-6 md:py-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground">{heading}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
