import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PRODUCTS, formatINR } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";

const emptyAddress = {
  label: "Home",
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

function AccountPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { wishlist, recentlyViewed } = useShop();
  const [draft, setDraft] = useState(emptyAddress);
  const [profileDraft, setProfileDraft] = useState<{ full_name: string; phone: string } | null>(null);

  const saved = PRODUCTS.filter((p) => wishlist.includes(p.id));
  const viewed = recentlyViewed
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  const ordersQuery = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const addressesQuery = useQuery({
    queryKey: ["my-addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const profileQuery = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  const addAddress = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("addresses").insert({ ...draft, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft(emptyAddress);
      toast.success("Address saved");
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
    },
    onError: () => toast.error("Could not save that address"),
  });
  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Address removed");
      queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
    },
  });
  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileDraft?.full_name ?? null,
          phone: profileDraft?.phone ?? null,
        })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => toast.error("Could not update your profile"),
  });
  const profile = profileDraft ?? {
    full_name: profileQuery.data?.full_name ?? "",
    phone: profileQuery.data?.phone ?? "",
  };

  const addressValid =
    draft.full_name.trim().length > 1 &&
    /^[6-9]\d{9}$/.test(draft.phone) &&
    draft.line1.trim().length > 3 &&
    draft.city.trim().length > 1 &&
    draft.state.trim().length > 1 &&
    /^\d{6}$/.test(draft.pincode);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">My Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button variant="secondary" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="viewed">Recently Viewed</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8">
          {ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your orders…</p>
          ) : (ordersQuery.data?.length ?? 0) === 0 ? (
            <div className="rounded-md border border-dashed p-14 text-center">
              <p className="font-display text-2xl">No orders yet</p>
              <Button className="mt-5" asChild>
                <Link to="/shop">Start shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {ordersQuery.data?.map((o) => (
                <li key={o.id}>
                  <Link to={`/order/${o.id }`} className="block rounded-md bg-card p-5 shadow-soft transition-transform hover:scale-[1.02]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">Order #{o.order_number}</p>
                      <span className="rounded-sm bg-secondary px-2 py-1 text-xs capitalize">
                        {o.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {formatINR(o.total)} · {o.payment_method.toUpperCase()}
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {o.order_items.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.qty}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          {saved.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {saved.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewed" className="mt-8">
          {viewed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Browse a few pieces and they'll appear here.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {viewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Saved addresses</p>
            {(addressesQuery.data?.length ?? 0) === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No addresses saved yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {addressesQuery.data?.map((a) => (
                  <li key={a.id} className="rounded-md bg-card p-4 text-sm shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p>
                          {a.full_name} · {a.label}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                        </p>
                        <p className="mt-1 text-muted-foreground">{a.phone}</p>
                      </div>
                      <button
                        aria-label="Remove address"
                        onClick={() => deleteAddress.mutate(a.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md bg-card p-6 shadow-soft">
            <p className="eyebrow">Add an address</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["full_name", "Full Name"],
                  ["phone", "Mobile Number"],
                  ["line1", "Address"],
                  ["line2", "Apartment / House"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pincode", "Pincode"],
                  ["label", "Label"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={`addr-${key}`} className="text-xs">
                    {label}
                  </Label>
                  <Input
                    id={`addr-${key}`}
                    value={draft[key]}
                    maxLength={key === "pincode" ? 6 : key === "phone" ? 10 : 120}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
            <Button
              className="mt-6"
              disabled={!addressValid || addAddress.isPending}
              onClick={() => addAddress.mutate()}
            >
              Save address
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-8 max-w-md">
          <div className="rounded-md bg-card p-6 shadow-soft">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="p-name" className="text-xs">
                  Full Name
                </Label>
                <Input
                  id="p-name"
                  value={profile.full_name}
                  maxLength={80}
                  onChange={(e) => setProfileDraft({ ...profile, full_name: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="p-phone" className="text-xs">
                  Mobile Number
                </Label>
                <Input
                  id="p-phone"
                  value={profile.phone}
                  maxLength={10}
                  onChange={(e) => setProfileDraft({ ...profile, phone: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <Button
              className="mt-6"
              disabled={saveProfile.isPending || !profileDraft}
              onClick={() => saveProfile.mutate()}
            >
              Save changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AccountPage;
