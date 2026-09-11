import { createFileRoute } from "@tanstack/react-router";

import { Block, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Policies — Privacy, Terms & Refunds | Aarohan Décor" },
      {
        name: "description",
        content:
          "Aarohan Décor privacy policy, terms and conditions, refund policy and shipping policy in one place.",
      },
      { property: "og:title", content: "Policies — Aarohan Décor" },
      { property: "og:description", content: "Privacy, terms, refunds and shipping policies." },
    ],
  }),
  component: PoliciesPage,
});

function PoliciesPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Policies"
      intro="Plain-language summaries of how we handle your data, orders and money."
    >
      <Block heading="Privacy policy">
        <p>
          We collect only what we need to fulfil your order: name, contact details, delivery address and
          order history. We never sell your data. Payments are handled by our payment partners; we do not
          store card details.
        </p>
      </Block>
      <Block heading="Terms & conditions">
        <p>
          Prices are in Indian Rupees and inclusive of applicable taxes. Orders are confirmed once payment
          is authorised, or once a Cash on Delivery order is verified. We may cancel an order in case of
          pricing errors or stock issues, with a full refund.
        </p>
      </Block>
      <Block heading="Refund policy">
        <p>
          Approved returns are refunded to the original payment method within 5–7 working days of pickup.
          Cash on Delivery orders are refunded by bank transfer.
        </p>
      </Block>
      <Block heading="Shipping policy">
        <p>
          Free standard shipping above ₹1,999, flat ₹99 below that, and express delivery at ₹149. Delivery
          windows are 2–7 working days depending on your pincode.
        </p>
      </Block>
    </PageShell>
  );
}
