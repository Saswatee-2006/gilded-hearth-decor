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

  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (!user || !id) return;
    
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "orders",
          filter: `id=eq.${id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["order", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, queryClient]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 text-center">
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 text-center">
        <h1 className="font-display text-4xl">Order not found</h1>
        <Button className="mt-8" asChild>
          <Link to="/account">Back to Account</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = Math.max(
    0,
    TIMELINE_STEPS.findIndex((s) => s.id === order.status),
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
            <h1 className="font-display text-4xl md:text-3xl">Order #{order.order_number}</h1>
            <p className="mt-2 text-base md:text-sm text-muted-foreground">
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
            <div className="flex flex-row justify-between w-full gap-1 sm:gap-2 md:gap-4 relative z-0">
              {TIMELINE_STEPS.map((step, i) => {
                const isPast = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const isCompleted = isPast || isCurrent;
                const Icon = isCompleted ? step.icon : Circle;

                return (
                  <div
                    key={step.id}
                    className="relative flex flex-col items-center flex-1 text-center"
                  >
                    {/* Horizontal Line */}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "absolute h-[2px] w-full left-[50%] top-[11px] md:top-[15px] -z-10",
                          isCompleted ? "bg-accent" : "bg-secondary",
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        "flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full z-10 transition-colors shrink-0",
                        isPast
                          ? "bg-accent text-accent-foreground"
                          : isCurrent
                            ? "bg-card border-2 border-accent text-accent shadow-[0_0_0_3px_hsl(var(--accent)/0.2)] md:shadow-[0_0_0_4px_hsl(var(--accent)/0.2)]"
                            : "bg-card border-2 border-muted text-muted-foreground",
                      )}
                    >
                      <Icon
                        className={cn("h-3 w-3 md:h-4 md:w-4", isPast && "text-accent-foreground")}
                      />
                    </div>
                    <div className="mt-2 md:mt-3 w-full px-0.5">
                      <p
                        className={cn(
                          "text-[11px] sm:text-[12px] md:text-sm font-medium leading-[1.2]",
                          isCompleted ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
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
              {order.items?.map((item: any, idx: number) => (
                <li key={item.id || idx} className="flex justify-between gap-4 text-base md:text-sm">
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
              <div className="text-base md:text-sm text-muted-foreground">
                {(() => {
                  const addr = order.shipping_address;
                  if (!addr) return <p>No delivery address provided.</p>;
                  return (
                    <>
                      {addr.name && <p className="text-foreground font-medium">{addr.name}</p>}
                      {addr.line1 && <p>{addr.line1}</p>}
                      {addr.line2 && <p>{addr.line2}</p>}
                      {(addr.city || addr.state || addr.pincode) && (
                        <p>
                          {[addr.city, addr.state].filter(Boolean).join(", ")}
                          {addr.pincode ? ` - ${addr.pincode}` : ""}
                        </p>
                      )}
                      {addr.mobile && (
                        <p className="mt-2">
                          Phone: {addr.mobile.startsWith("+") ? addr.mobile : `+91 ${addr.mobile}`}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            <div>
              <h2 className="eyebrow mb-2">Summary</h2>
              <dl className="space-y-2 md:space-y-1 text-base md:text-sm">
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
