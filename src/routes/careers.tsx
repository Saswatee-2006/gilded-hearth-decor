import { createFileRoute } from "@tanstack/react-router";

import { Block, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Work With Aarohan Décor" },
      {
        name: "description",
        content: "Open roles in design, merchandising, customer care and studio operations at Aarohan Décor.",
      },
      { property: "og:title", content: "Careers — Aarohan Décor" },
      { property: "og:description", content: "Join our small studio team in India." },
    ],
  }),
  component: CareersPage,
});

const ROLES = [
  { title: "Product Designer (Home Décor)", place: "Jaipur · Full-time" },
  { title: "Customer Care Associate", place: "Remote, India · Full-time" },
  { title: "Studio & Packing Lead", place: "Jaipur · Full-time" },
  { title: "Content & Styling Intern", place: "Jaipur · 6 months" },
];

function CareersPage() {
  return (
    <PageShell
      eyebrow="Careers"
      title="Come make beautiful things"
      intro="We're a small team that cares a lot about craft, clarity and looking after customers."
    >
      <Block heading="Open roles">
        <ul className="space-y-4">
          {ROLES.map((r) => (
            <li key={r.title} className="rounded-md border p-4">
              <p className="text-foreground">{r.title}</p>
              <p className="mt-1 text-xs">{r.place}</p>
            </li>
          ))}
        </ul>
      </Block>
      <Block heading="How to apply">
        <p>Write to careers@aarohandecor.in with your CV and a note on what you'd like to work on.</p>
      </Block>
    </PageShell>
  );
}
