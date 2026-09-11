;

import { Block, PageShell } from "@/components/site/PageShell";

function StoryPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Beautiful objects, made to be lived with"
      intro="Aarohan means ascent. We started with a simple belief: a home should rise a little every time you add something you truly love."
    >
      <Block heading="Made with artisans">
        <p>
          Our pieces come from small workshops across Jaipur, Moradabad, Channapatna and Firozabad —
          families who have worked marble, brass, wood and glass for generations. We design with them, not
          around them.
        </p>
      </Block>
      <Block heading="Considered, not fast">
        <p>
          Every collection is small on purpose. We prototype in real rooms, live with the samples, and only
          then put a piece on the site.
        </p>
      </Block>
      <Block heading="Honest pricing">
        <p>
          We sell direct, so you pay for craft and materials — not for a long chain of middlemen. Prices
          are all-inclusive in Indian Rupees.
        </p>
      </Block>
    </PageShell>
  );
}

export default StoryPage;
