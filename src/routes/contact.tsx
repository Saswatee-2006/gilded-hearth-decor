import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Block, PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Aarohan Décor — Care Team & Studio" },
      {
        name: "description",
        content:
          "Talk to the Aarohan Décor care team about orders, deliveries, bulk gifting or interior styling advice.",
      },
      { property: "og:title", content: "Contact Aarohan Décor" },
      { property: "og:description", content: "Reach our care team for orders, gifting and styling help." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const valid =
    form.name.trim().length > 1 && form.email.includes("@") && form.message.trim().length > 9;

  return (
    <PageShell
      eyebrow="Contact"
      title="We'd love to hear from you"
      intro="Questions about an order, a piece you've spotted, or styling a whole room — our care team replies within one working day."
    >
      <Block heading="Reach us">
        <p>Care team: care@aarohandecor.in</p>
        <p>Monday to Saturday, 10am – 7pm IST</p>
        <p>Studio: Aarohan Décor, Jaipur, Rajasthan</p>
      </Block>

      <Block heading="Send a message">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            toast.success("Message sent — we'll reply within one working day.");
            setForm({ name: "", email: "", message: "" });
          }}
        >
          <div>
            <Label htmlFor="c-name" className="text-xs">
              Your Name
            </Label>
            <Input
              id="c-name"
              value={form.name}
              maxLength={80}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="c-email" className="text-xs">
              Email
            </Label>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              maxLength={120}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="c-msg" className="text-xs">
              Message
            </Label>
            <Textarea
              id="c-msg"
              value={form.message}
              maxLength={1000}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-fit" disabled={!valid}>
            Send message
          </Button>
        </form>
      </Block>
    </PageShell>
  );
}
