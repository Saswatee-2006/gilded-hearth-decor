import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/catalog";
import { saveOrder } from "@/lib/orders";
import { FREE_SHIPPING_THRESHOLD, useShop, type Order } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Aarohan Décor" },
      { name: "description", content: "Address, delivery and payment in three quick steps. UPI, cards, net banking and COD." },
      { property: "og:title", content: "Secure Checkout — Aarohan Décor" },
      { property: "og:description", content: "UPI, cards, net banking and Cash on Delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Address", "Delivery", "Payment", "Confirmation"];

function CheckoutPage() {
  const { cartProducts, subtotal, placeOrder } = useShop();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");
  const [address, setAddress] = useState({
    name: "",
    mobile: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const express = delivery === "express" ? 149 : 0;
  const total = subtotal + shipping + express;

  if (cartProducts.length === 0 && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Button className="mt-8" asChild>
          <Link to="/shop">Shop décor</Link>
        </Button>
      </div>
    );
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-6 w-6" />
        </span>
        <h1 className="mt-6 font-display text-4xl">Order confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order <span className="text-foreground">#{order.id}</span> · {formatINR(order.total)} · paid
          via {payment.toUpperCase()}
        </p>
        <ul className="mt-8 space-y-2 text-left text-sm">
          {order.lines.map((l) => (
            <li key={l.name} className="flex justify-between border-b pb-2">
              <span>
                {l.name} × {l.qty}
              </span>
              <span>{formatINR(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center gap-3">
          <Button asChild>
            <Link to="/account">Track order</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/shop">Keep shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const canContinue =
    step !== 0 ||
    (address.name.trim().length > 1 &&
      /^[6-9]\d{9}$/.test(address.mobile) &&
      address.email.includes("@") &&
      address.line1.trim().length > 3 &&
      address.city.trim().length > 1 &&
      address.state.trim().length > 1 &&
      /^\d{6}$/.test(address.pincode));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>

      <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 tracking-[0.18em] uppercase",
              i === step ? "text-accent" : i < step ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border text-[10px]">
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="rounded-md bg-card p-6 shadow-soft">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Full Name", "text"],
                  ["mobile", "Mobile Number", "tel"],
                  ["email", "Email", "email"],
                  ["line1", "Address", "text"],
                  ["line2", "Apartment / House", "text"],
                  ["city", "City", "text"],
                  ["state", "State", "text"],
                  ["pincode", "Pincode", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={key} className="text-xs">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type={type}
                    value={address[key]}
                    maxLength={key === "pincode" ? 6 : key === "mobile" ? 10 : 120}
                    onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-4">
              {[
                { id: "standard", label: "Standard delivery", note: "4–6 days", price: shipping },
                { id: "express", label: "Express delivery", note: "2–3 days", price: 149 },
              ].map((d) => (
                <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-4">
                  <RadioGroupItem value={d.id} id={d.id} />
                  <span className="flex-1">
                    <span className="block text-sm">{d.label}</span>
                    <span className="block text-xs text-muted-foreground">{d.note}</span>
                  </span>
                  <span className="text-sm">{d.price === 0 ? "Free" : formatINR(d.price)}</span>
                </label>
              ))}
            </RadioGroup>
          )}

          {step === 2 && (
            <>
              <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
                {(
                  [
                    ["upi", "UPI — GPay, PhonePe, Paytm"],
                    ["credit", "Credit Card"],
                    ["debit", "Debit Card"],
                    ["netbanking", "Net Banking"],
                    ["cod", "Cash on Delivery"],
                  ] as const
                ).map(([id, label]) => (
                  <label key={id} className="flex cursor-pointer items-center gap-3 rounded-md border p-4 text-sm">
                    <RadioGroupItem value={id} id={id} />
                    {label}
                  </label>
                ))}
              </RadioGroup>
              <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> 256-bit encrypted · we never store card details
              </p>
            </>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            <Button
              disabled={!canContinue}
              onClick={() => {
                if (step === 0 && !canContinue) return;
                if (step < 2) {
                  setStep((s) => s + 1);
                  return;
                }
                const placed = placeOrder(total);
                setOrder(placed);
                setStep(3);
                toast.success("Order placed — confirmation sent to your email");
              }}
            >
              {step < 2 ? "Continue" : `Pay ${formatINR(total)}`}
            </Button>
          </div>
          {step === 0 && !canContinue && (
            <p className="mt-3 text-xs text-muted-foreground">
              Please fill your name, a 10-digit mobile, email, address, city, state and 6-digit pincode.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-md bg-secondary/50 p-6">
          <p className="eyebrow">Your order</p>
          <ul className="mt-4 space-y-3 text-sm">
            {cartProducts.map(({ product, qty }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {product.name} × {qty}
                </span>
                <span>{formatINR(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{shipping + express === 0 ? "Free" : formatINR(shipping + express)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt>Total</dt>
              <dd className="font-display text-xl">{formatINR(total)}</dd>
            </div>
          </dl>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" /> Secure payments · easy 7-day returns
          </p>
        </aside>
      </div>
    </div>
  );
}
