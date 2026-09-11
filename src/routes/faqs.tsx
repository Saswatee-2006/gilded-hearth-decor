;

import { PageShell } from "@/components/site/PageShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Which payment methods do you accept?",
    a: "UPI, credit and debit cards, net banking, wallets and Cash on Delivery on eligible pincodes.",
  },
  {
    q: "Is Cash on Delivery available?",
    a: "Yes, on most pincodes for orders up to ₹15,000. It shows automatically at checkout when available.",
  },
  {
    q: "How do I care for stone and brass pieces?",
    a: "Dust with a dry, soft cloth. Avoid harsh cleaners; a little natural wax keeps brass warm and bright.",
  },
  {
    q: "Do you take bulk or corporate gifting orders?",
    a: "We do — write to care@aarohandecor.in with quantities and we'll share a curated gifting deck.",
  },
  {
    q: "Can I change my delivery address after ordering?",
    a: "Yes, as long as the parcel hasn't shipped. Contact us with your order number and new address.",
  },
];

function FaqPage() {
  return (
    <PageShell
      eyebrow="Help centre"
      title="Frequently asked questions"
      intro="Everything customers usually ask before and after ordering."
    >
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageShell>
  );
}

export default FaqPage;
