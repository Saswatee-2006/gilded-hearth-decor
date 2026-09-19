import { Link } from "react-router-dom";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed supabase import
import { formatINR } from "@/lib/catalog";
import { useMutation } from "@tanstack/react-query";

const STAGES = ["placed", "packed", "shipped", "delivered"];

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");

  const lookup = useMutation({
    mutationFn: async () => {
      const existing = localStorage.getItem("mock_orders");
      const orders = existing ? JSON.parse(existing) : [];
      const data = orders.find((o: any) => o.order_number === orderNumber.trim().toUpperCase());
      if (!data) return null;
      return {
        order_number: data.order_number,
        status: data.status || "processing",
        total: data.total,
        created_at: data.created_at
      };
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 md:px-8">
      <p className="eyebrow">Track order</p>
      <h1 className="mt-2 font-display text-4xl">Where's my order?</h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-xl">
        Enter the order number from your confirmation email. Signed-in customers can also see every
        order in their account.
      </p>

      <form
        className="mt-10 flex flex-wrap items-end gap-3"
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
        <p className="mt-8 text-sm text-muted-foreground">
          We couldn't find that order number. Check your confirmation email, or{" "}
          <Link to="/contact" className="underline">
            contact our care team
          </Link>
          .
        </p>
      )}

      {lookup.data && (
        <div className="mt-10 rounded-md bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl">Order #{lookup.data.order_number}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {new Date(lookup.data.created_at).toLocaleDateString("en-IN")} ·{" "}
            {formatINR(lookup.data.total)}
          </p>
          <ol className="mt-6 space-y-2">
            {STAGES.map((s, i) => {
              const reached = STAGES.indexOf(lookup.data!.status) >= i;
              return (
                <li
                  key={s}
                  className={reached ? "text-foreground font-medium" : "text-muted-foreground"}
                >
                  {reached ? "●" : "○"} <span className="capitalize">{s}</span>
                </li>
              );
            })}
          </ol>
          {lookup.data.status === "cancelled" && (
            <p className="mt-3 text-sm text-destructive">This order was cancelled.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackOrderPage;
