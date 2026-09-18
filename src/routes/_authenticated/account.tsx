import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Heart, LogOut, Edit2, Package, ChevronRight, ShoppingBag, Truck, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PRODUCTS, formatINR } from "@/lib/catalog";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
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
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { wishlist, recentlyViewed } = useShop();
  const [draft, setDraft] = useState(emptyAddress);
  const [profileDraft, setProfileDraft] = useState<{ full_name: string; phone: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (!loading && !user) return null;

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

  const [orderFilter, setOrderFilter] = useState("All");
  
  const allOrders = ordersQuery.data ?? [];
  const activeOrdersCount = allOrders.filter((o) => !["delivered", "cancelled"].includes(o.status.toLowerCase())).length;
  const completedOrdersCount = allOrders.filter((o) => o.status.toLowerCase() === "delivered").length;
  
  const displayedOrders = orderFilter === "All" 
    ? allOrders 
    : allOrders.filter((o) => o.status.toLowerCase() === orderFilter.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr] lg:gap-12">
        
        {/* Left Column: Sidebar */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-soft border border-border/50">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-accent text-4xl text-accent-foreground font-display">
              {(profile.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <h2 className="font-display text-2xl">{profile.full_name || "Valued Customer"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            {profile.phone && <p className="mt-1 text-sm text-muted-foreground">{profile.phone}</p>}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-6 w-full rounded-full border-border/60 shadow-sm hover:bg-accent/5">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-8 py-4">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <p className="eyebrow text-muted-foreground">Personal Information</p>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="p-name" className="text-xs">Full Name</Label>
                        <Input
                          id="p-name"
                          value={profile.full_name}
                          maxLength={80}
                          onChange={(e) => setProfileDraft({ ...profile, full_name: e.target.value })}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="p-phone" className="text-xs">Mobile Number</Label>
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
                      className="w-full"
                      disabled={saveProfile.isPending || !profileDraft}
                      onClick={() => saveProfile.mutate()}
                    >
                      Save Profile
                    </Button>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Add Address */}
                  <div className="space-y-4">
                    <p className="eyebrow text-muted-foreground">Add New Address</p>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                          <Label htmlFor={`addr-${key}`} className="text-xs">{label}</Label>
                          <Input
                            id={`addr-${key}`}
                            value={draft[key as keyof typeof draft]}
                            maxLength={key === "pincode" ? 6 : key === "phone" ? 10 : 120}
                            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                            className="mt-1.5"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      disabled={!addressValid || addAddress.isPending}
                      onClick={() => addAddress.mutate()}
                    >
                      Save Address
                    </Button>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Saved Addresses List */}
                  <div className="space-y-4">
                    <p className="eyebrow text-muted-foreground">Saved Addresses</p>
                    {(addressesQuery.data?.length ?? 0) === 0 ? (
                      <p className="text-sm text-muted-foreground">No addresses saved yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {addressesQuery.data?.map((a) => (
                          <li key={a.id} className="rounded-lg border border-border/50 p-3 text-sm flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{a.full_name} <span className="text-muted-foreground font-normal ml-1">· {a.label}</span></p>
                              <p className="mt-1 text-muted-foreground leading-relaxed text-xs">
                                {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                              </p>
                              <p className="mt-1 text-muted-foreground text-xs">{a.phone}</p>
                            </div>
                            <button
                              aria-label="Remove address"
                              onClick={() => deleteAddress.mutate(a.id)}
                              className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sidebar Nav */}
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/wishlist" className="group flex items-center justify-between rounded-xl bg-card p-4 shadow-soft border border-border/50 transition-all hover:border-border hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Heart className="h-5 w-5" />
                </div>
                <span className="font-medium">My Wishlist</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
            
            {isAdmin && (
              <Link to="/admin" className="group flex items-center justify-between rounded-xl bg-card p-4 shadow-soft border border-border/50 transition-all hover:border-border hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Package className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Admin Dashboard</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            )}

            <button
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await signOut();
                navigate("/", { replace: true });
              }}
              className="group flex w-full items-center justify-between rounded-xl bg-card p-4 shadow-soft border border-border/50 transition-all hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/50 dark:hover:bg-red-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white dark:bg-red-950 dark:text-red-400 dark:group-hover:bg-red-900 dark:group-hover:text-red-100">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">Log out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Main Area */}
        <div className="space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col justify-center rounded-xl bg-card p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <ShoppingBag className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">Total Orders</p>
              </div>
              <p className="font-display text-4xl">{allOrders.length}</p>
            </div>
            
            <div className="flex flex-col justify-center rounded-xl bg-card p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Truck className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">Active Orders</p>
              </div>
              <p className="font-display text-4xl">{activeOrdersCount}</p>
            </div>

            <div className="flex flex-col justify-center rounded-xl bg-card p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">Completed</p>
              </div>
              <p className="font-display text-4xl">{completedOrdersCount}</p>
            </div>

            <div className="flex flex-col justify-center rounded-xl bg-card p-5 shadow-soft border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Heart className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">Wishlist</p>
              </div>
              <p className="font-display text-4xl">{wishlist.length}</p>
            </div>
          </div>

          {/* Orders Section */}
          <div className="rounded-2xl bg-card p-6 md:p-8 shadow-soft border border-border/50">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-2xl">My Orders</h3>
                <p className="mt-1 text-sm text-muted-foreground">View and manage your order history.</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto justify-between gap-2 border-border/60 bg-transparent hover:bg-accent/5">
                    Order Status: <span className="font-medium text-foreground">{orderFilter}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  {["All", "Processing", "Confirmed", "Shipped", "Cancelled"].map(status => (
                    <DropdownMenuItem 
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      className={cn("cursor-pointer rounded-lg", orderFilter === status && "bg-accent/10 font-medium text-foreground")}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-8 items-start">
              
              {/* Order List */}
              <div className="w-full">
                {ordersQuery.isLoading ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">Loading your orders…</div>
                ) : displayedOrders.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="font-display text-xl mb-1">No orders found</p>
                    <p className="text-sm text-muted-foreground mb-6">You don't have any orders matching this status.</p>
                    {orderFilter === "All" && (
                      <Button asChild>
                        <Link to="/shop">Start Shopping</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {displayedOrders.map((o) => (
                      <li key={o.id}>
                        <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 p-5 transition-colors hover:border-border hover:bg-accent/5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                              <Package className="h-6 w-6 text-accent-foreground/70" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="font-medium">Order #{o.order_number}</p>
                                <span className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                  o.status === "delivered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                  o.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                  "bg-accent/30 text-accent-foreground"
                                )}>
                                  {o.status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {new Date(o.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                                {o.order_items.map((item: any) => `${item.name} × ${item.qty}`).join(", ")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3 shrink-0">
                            <p className="font-medium text-lg">{formatINR(o.total)}</p>
                            <Button variant="outline" size="sm" className="rounded-full" asChild>
                              <Link to={`/order/${o.id}`}>View Order</Link>
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
