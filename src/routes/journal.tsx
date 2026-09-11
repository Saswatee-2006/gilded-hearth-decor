;

import { PageShell } from "@/components/site/PageShell";

const POSTS = [
  {
    title: "How to build a wall that tells a story",
    read: "5 min read",
    excerpt:
      "Start with one anchor piece, then layer smaller frames and objects around it in a loose triangle. Breathing room matters more than symmetry.",
  },
  {
    title: "Warm lighting, three ways",
    read: "4 min read",
    excerpt:
      "One overhead light flattens a room. Add a table lamp at eye level and a low candle glow and everything softens.",
  },
  {
    title: "A festive table without the clutter",
    read: "6 min read",
    excerpt:
      "Choose two materials — brass and linen, say — and repeat them. Restraint is what makes a table look considered.",
  },
  {
    title: "Small spaces, big presence",
    read: "3 min read",
    excerpt:
      "In compact homes, fewer and larger pieces read calmer than many small ones. Mirrors do the rest.",
  },
];

function JournalPage() {
  return (
    <PageShell
      eyebrow="Journal"
      title="Notes from the studio"
      intro="Practical styling ideas from the people who design and pack your décor."
    >
      <ul className="space-y-8">
        {POSTS.map((p) => (
          <li key={p.title} className="border-b pb-6">
            <p className="eyebrow">{p.read}</p>
            <h2 className="mt-2 font-display text-2xl text-foreground">{p.title}</h2>
            <p className="mt-2">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

export default JournalPage;
