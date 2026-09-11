import { createFileRoute } from "@tanstack/react-router";

import { Block, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — Aarohan Décor" },
      {
        name: "description",
        content:
          "7-day easy returns, damage-in-transit replacements and refund timelines for Aarohan Décor orders.",
      },
      { property: "og:title", content: "Returns & Refunds — Aarohan Décor" },
      { property: "og:description", content: "7-day easy returns and simple refunds." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <PageShell
      eyebrow="Returns"
      title="Returns & Refunds"
      intro="If a piece isn't right for your space, we'll make it simple to send back."
    >
      <Block heading="7-day window">
        <p>
          Raise a return within 7 days of delivery. The piece should be unused and in its original
          packing.
        </p>
      </Block>
      <Block heading="Damaged in transit">
        <p>
          Send a photo within 48 hours of delivery and we'll ship a replacement at no cost, or refund you
          in full.
        </p>
      </Block>
      <Block heading="Refunds">
        <p>Refunds reach the original payment method within 5–7 working days of pickup.</p>
        <p>Made-to-order and personalised pieces are not returnable unless damaged.</p>
      </Block>
    </PageShell>
  );
}
