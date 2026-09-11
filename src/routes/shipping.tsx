import { createFileRoute } from "@tanstack/react-router";

import { Block, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery — Aarohan Décor" },
      {
        name: "description",
        content:
          "Free shipping above ₹1,999, express delivery options, fragile-safe packing and pan-India delivery timelines.",
      },
      { property: "og:title", content: "Shipping & Delivery — Aarohan Décor" },
      { property: "og:description", content: "Pan-India delivery, fragile-safe packing and timelines." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <PageShell
      eyebrow="Shipping"
      title="Shipping & Delivery"
      intro="Every piece is wrapped in fragile-safe packing and shipped from our Jaipur studio."
    >
      <Block heading="Charges">
        <p>Free standard shipping on orders above ₹1,999.</p>
        <p>Flat ₹99 standard shipping below that.</p>
        <p>Express delivery available at ₹149 extra.</p>
      </Block>
      <Block heading="Timelines">
        <p>Metros: 2–4 working days.</p>
        <p>Other cities and towns: 4–7 working days.</p>
        <p>Made-to-order and large pieces: 7–12 working days.</p>
      </Block>
      <Block heading="Tracking">
        <p>
          You'll get a tracking link by email once your parcel leaves the studio. Signed-in customers can
          also follow every order from their account.
        </p>
      </Block>
    </PageShell>
  );
}
