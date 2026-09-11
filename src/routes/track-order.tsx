import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Block, PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/catalog";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Aarohan Décor" },
      {
        name: "description",
        content: "Enter your Aarohan Décor order number to see its current status and delivery stage.",
      },
      { property: "og:title", content: "Track Your Order — Aarohan Décor" },
      { property: "og:description", content: "Check the status of your décor order." },
    ],
  }),
  component: TrackOrderPage,
});

const STAGES = ["placed", "packed", "shipped", "delivered"];

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");

  const lookup = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("order_number, status, total, created_at")
        .eq("order_number", orderNumber.trim().toUpperCase())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <PageShell
      eyebrow="Track order"
      title="Where's my order?"
      intro="Enter the order number from your confirmation email. Signed-in customers can also see every order in their account."
    >
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (orderNumber.trim().length < 4) return;
          lookup.mutate();
        }}
      >
        <div className="min-w-56">
          <Label htmlFor="order-no" className="text-xs">
            Order number
          </Label>
          <Input
            id="order-no"
            value={orderNumber}
            maxLength={20}
            placeholder="AD123456"
            onChange={(e) => setOrderNumber(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" disabled={lookup.isPending}>
          Track
        </Button>
      </form>

      {lookup.isSuccess && !lookup.data && (
        <p>
          We couldn't find that order number. Check your confirmation email, or{" "}
          <Link to="/contact" className="underline">
            contact our care team
          </Link>
          .
        </p>
      )}

      {lookup.data && (
        <Block heading={`Order #${lookup.data.order_number}`}>
          <p>
            Placed {new Date(lookup.data.created_at).toLocaleDateString("en-IN")} ·{" "}
            {formatINR(lookup.data.total)}
          </p>
          <ol className="mt-4 space-y-2">
            {STAGES.map((s, i) => {
              const reached = STAGES.indexOf(lookup.data!.status) >= i;
              return (
                <li key={s} className={reached ? "text-foreground" : ""}>
                  {reached ? "●" : "○"} <span className="capitalize">{s}</span>
                </li>
              );
            })}
          </ol>
          {lookup.data.status === "cancelled" && <p className="mt-3">This order was cancelled.</p>}
        </Block>
      )}
    </PageShell>
  );
}
