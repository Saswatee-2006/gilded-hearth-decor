import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed supabase import
import { useAuth } from "@/lib/auth";
import { PRODUCTS, formatINR } from "@/lib/catalog";

const STATUSES = ["placed", "packed", "shipped", "delivered", "cancelled"] as const;

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const existing = localStorage.getItem("mock_orders");
      const orders = existing ? JSON.parse(existing) : [];
      return orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews"],
    enabled: isAdmin,
    queryFn: async () => {
      // Mock reviews for admin
      return [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const existing = localStorage.getItem("mock_orders");
      if (!existing) return;
      const orders = JSON.parse(existing);
      const idx = orders.findIndex((o: any) => o.id === id);
      if (idx !== -1) {
        orders[idx].status = status;
        localStorage.setItem("mock_orders", JSON.stringify(orders));
      }
    },
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () => toast.error("Could not update the order"),
  });

  const setApproval = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      // Mock review approval (no op)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });

  if (loading)
    return <div className="px-4 py-6 md:py-10 text-center text-sm">Checking access…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 md:py-10 text-center">
        <h1 className="font-display text-3xl">Admins only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is reserved for the store team. If you should have access, ask an existing admin
          to add you.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/account">Back to my account</Link>
        </Button>
      </div>
    );
  }

  const revenue = (ordersQuery.data ?? []).reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">Store Admin</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Orders", value: String(ordersQuery.data?.length ?? 0) },
          { label: "Revenue", value: formatINR(revenue) },
          { label: "Products live", value: String(PRODUCTS.length) },
        ].map((s) => (
          <div key={s.label} className="rounded-md bg-card p-5 shadow-soft">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8">
          {(ordersQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {ordersQuery.data?.map((o) => (
                <li key={o.id} className="rounded-md bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm">
                        #{o.order_number} · {formatINR(o.total)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString("en-IN")} ·{" "}
                        {o.payment_method.toUpperCase()}
                      </p>
                    </div>
                    <Select
                      value={o.status}
                      onValueChange={(status) => setStatus.mutate({ id: o.id, status })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {o.items?.map((item: any) => (
                      <li key={item.id || item.product_id}>
                        {item.name} × {item.qty}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-8">
          {(reviewsQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No customer reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviewsQuery.data?.map((r: any) => (
                <li key={r.id} className="rounded-md bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm">
                        {r.rating}★ · {r.author_name} · {r.product_slug}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={r.is_approved ? "outline" : "default"}
                      onClick={() => setApproval.mutate({ id: r.id, approved: !r.is_approved })}
                    >
                      {r.is_approved ? "Hide" : "Approve"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="catalogue" className="mt-8">
          <p className="text-sm text-muted-foreground">
            The catalogue of {PRODUCTS.length} pieces is curated in the storefront. Stock and
            pricing highlights below.
          </p>
          <ul className="mt-6 divide-y">
            {PRODUCTS.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <span>{p.name}</span>
                <span className="text-muted-foreground">
                  {formatINR(p.price)} · {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminPage;
