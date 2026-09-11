import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Circle, Clock, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const TIMELINE_STEPS = [
  { id: "pending", label: "Order Placed", icon: Clock },
  { id: "processing", label: "Processing", icon: Package },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <h1 className="font-display text-4xl">Order not found</h1>
        <Button className="mt-8" asChild>
          <Link to="/account">Back to Account</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = Math.max(
    0,
    TIMELINE_STEPS.findIndex((s) => s.id === order.status)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <nav className="eyebrow flex flex-wrap gap-2 mb-8" aria-label="Breadcrumb">
        <Link to="/account" className="hover:text-foreground">
          My Account
        </Link>
        <span>/</span>
        <span className="text-foreground">Order #{order.order_number}</span>
      </nav>

      <div className="rounded-md bg-card p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div>
            <h1 className="font-display text-3xl">Order #{order.order_number}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display">{formatINR(order.total)}</p>
            <p className="text-sm text-muted-foreground uppercase">{order.payment_method}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="py-10">
          <h2 className="eyebrow mb-8">Order Status</h2>
          <div className="relative">
            <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-4 relative z-0">
              {TIMELINE_STEPS.map((step, i) => {
                const isPast = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const isCompleted = isPast || isCurrent;
                const Icon = isCompleted ? step.icon : Circle;

                return (
                  <div key={step.id} className="relative flex items-center gap-4 md:flex-col md:text-center md:flex-1">
                    {/* Horizontal Line (Desktop) */}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute hidden md:block h-[2px] w-full left-[50%] top-[15px] -z-10",
                          isCompleted ? "bg-accent" : "bg-secondary"
                        )}
                      />
                    )}
                    {/* Vertical Line (Mobile) */}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute md:hidden w-[2px] left-[15px] top-[15px] -z-10",
                          isCompleted ? "bg-accent" : "bg-secondary"
                        )}
                        style={{ height: "calc(100% + 2rem)" }}
                      />
                    )}

                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full z-10 transition-colors",
                        isPast ? "bg-accent text-accent-foreground" : 
                        isCurrent ? "bg-card border-2 border-accent text-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.2)]" : 
                        "bg-card border-2 border-muted text-muted-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isPast && "text-accent-foreground")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-10 border-t pt-8 md:grid-cols-2">
          <div>
            <h2 className="eyebrow mb-4">Items</h2>
            <ul className="space-y-4">
              {order.order_items.map((item: any) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>{formatINR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="eyebrow mb-2">Delivery Address</h2>
              <div className="text-sm text-muted-foreground">
                <p className="text-foreground font-medium">{order.address?.name}</p>
                <p>{order.address?.line1}</p>
                {order.address?.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address?.city}, {order.address?.state} {order.address?.pincode}
                </p>
                <p className="mt-2">Phone: {order.address?.mobile}</p>
              </div>
            </div>
            <div>
              <h2 className="eyebrow mb-2">Summary</h2>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatINR(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-medium">
                  <dt>Total</dt>
                  <dd>{formatINR(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
