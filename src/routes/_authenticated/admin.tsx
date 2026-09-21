import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  Package,
  ShoppingCart,
  Users,
  AlertCircle,
  TrendingUp,
  Activity,
  LogOut,
  Bell,
  Box,
  Settings as SettingsIcon,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { InventoryManager } from "@/components/admin/InventoryManager";
import { ProductManager } from "@/components/admin/ProductManager";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { Input } from "@/components/ui/input";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"] as const;

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playBeep(880, 0, 0.4);
    playBeep(659.25, 0.15, 0.4);
    playBeep(1046.50, 0.3, 0.6);
  } catch (e) {
    console.error("[ORDER REALTIME] Audio playback failed", e);
  }
};

const activeAlerts = new Map<string, number>();

const stopAlert = (id: string) => {
  if (activeAlerts.has(id)) {
    window.clearInterval(activeAlerts.get(id)!);
    activeAlerts.delete(id);
    console.log(`[ORDER REALTIME] Sound stopped for: ${id}`);
  }
};

const startAlert = (id: string) => {
  if (activeAlerts.has(id)) return;
  
  playNotificationSound();
  const intervalId = window.setInterval(() => {
    playNotificationSound();
  }, 1200);
  
  activeAlerts.set(id, intervalId);
  console.log(`[ORDER REALTIME] Sound started looping for: ${id}`);
  
  setTimeout(() => {
    stopAlert(id);
  }, 6000);
};

function AdminPage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const processedEvents = useRef<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("admin_sound_enabled") === "true";
  });
  const soundEnabledRef = useRef(soundEnabled);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [activePopups, setActivePopups] = useState<any[]>([]);

  const addPopup = (popup: any) => setActivePopups(prev => [...prev, popup]);
  const removePopup = (id: string) => setActivePopups(prev => prev.filter(p => p.id !== id));

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEnabledRef.current = next;
    localStorage.setItem("admin_sound_enabled", next.toString());
    if (next) {
      startAlert("test-sound-id");
      toast.success("Alert sound enabled (6-second test)");
    } else {
      toast("Alert sound disabled");
    }
  };

  // Real-time notifications and cache invalidation
  useEffect(() => {
    if (!isAdmin) return;
    
    console.log("[ORDER REALTIME] Subscription started");

    // Orders channel
    const ordersChannel = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;
          const eventId = `order:${newOrder.id}`;
          if (processedEvents.current.has(eventId)) {
            console.log(`[ORDER REALTIME] Duplicate ignored: ${eventId}`);
            return;
          }
          processedEvents.current.add(eventId);
          console.log(`[ORDER REALTIME] New order received: ${eventId}`);
          
          if (soundEnabledRef.current) {
            startAlert(eventId);
          }
          
          console.log(`[ORDER REALTIME] Popup triggered`);
          addPopup({
            id: eventId,
            type: "order",
            data: newOrder
          });

          setRecentNotifications(prev => [
            { id: eventId, type: "order", order_number: newOrder.order_number, total: newOrder.total, time: new Date() },
            ...prev
          ].slice(0, 10));
          
          queryClient.setQueryData(["admin-orders"], (old: any) => {
            if (!old) return [newOrder];
            return [newOrder, ...old];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updatedOrder = payload.new as any;
          if (updatedOrder.status !== "placed") {
            stopAlert(`order:${updatedOrder.id}`);
          }
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    // Customization Requests channel
    const customizationsChannel = supabase
      .channel("public:customization_requests")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "customization_requests" },
        (payload) => {
          const newReq = payload.new as any;
          const eventId = `customization:${newReq.id}`;
          if (processedEvents.current.has(eventId)) {
            return;
          }
          processedEvents.current.add(eventId);
          
          if (soundEnabledRef.current) {
            startAlert(eventId);
          }
          
          addPopup({
            id: eventId,
            type: "customization",
            data: newReq
          });

          setRecentNotifications(prev => [
            { id: eventId, type: "customization", title: newReq.title, customer: newReq.customer, time: new Date() },
            ...prev
          ].slice(0, 10));
        }
      )
      .subscribe();

    // Inventory channel
    const inventoryChannel = supabase
      .channel("public:inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
        }
      )
      .subscribe();

    // Products channel
    const productsChannel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
        }
      )
      .subscribe();

    return () => {
      Array.from(activeAlerts.keys()).forEach(id => stopAlert(id));
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(customizationsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [isAdmin, queryClient]);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      data?.forEach(o => processedEvents.current.add(`order:${(o as any).id}`));
      return (data as any[]) || [];
    },
  });

  const customizationsQuery = useQuery({
    queryKey: ["admin-customizations"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customization_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      data?.forEach(c => processedEvents.current.add(`customization:${(c as any).id}`));
      return (data as any[]) || [];
    },
  });

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const inventoryQuery = useQuery({
    queryKey: ["admin-inventory"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*, products(name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, phone")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      stopAlert(`order:${id}`);
      const updateData = { status, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("orders").update(updateData as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (err: any) => toast.error(err.message || "Could not update the order"),
  });

  const handleLogout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate("/auth", { replace: true });
  };

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["public-products"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete product"),
  });

  const updateInventory = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const updateData = { stock, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("inventory").update(updateData as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inventory updated");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update inventory"),
  });


  const orders: any[] = (ordersQuery.data as any[]) || [];
  const products: any[] = (productsQuery.data as any[]) || [];
  const inventory: any[] = (inventoryQuery.data as any[]) || [];
  const users: any[] = (usersQuery.data as any[]) || [];

  const pendingOrders = orders.filter((o) => o.status === "placed").length;
  const lowStock = inventory.filter((i) => i.stock > 0 && i.stock < 5).length;
  const outOfStock = inventory.filter((i) => i.stock === 0).length;

  return (
    <div className="flex h-screen bg-gray-50">
      {activePopups.length > 0 && (
        <div className="fixed top-[80px] right-4 md:right-8 z-[9999] flex flex-col gap-4 max-h-[80vh] overflow-y-auto pointer-events-none w-full max-w-[400px]">
          {activePopups.map((popup) => {
            if (popup.type === "order") {
              const newOrder = popup.data;
              return (
                <div key={popup.id} className="bg-white p-6 rounded-xl shadow-2xl w-full border-t-4 border-blue-600 animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto">
                  <div className="flex items-center justify-between gap-2 text-blue-600 font-bold mb-4 text-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      NEW ORDER RECEIVED
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2" onClick={() => { stopAlert(popup.id); removePopup(popup.id); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Customer:</span> <span className="font-semibold">{newOrder.shipping_address?.name || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Email:</span> <span>{newOrder.shipping_address?.email || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Phone:</span> <span>{newOrder.shipping_address?.phone || "Unknown"}</span></div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-border"><span className="text-muted-foreground font-medium">Order ID:</span> <span className="font-mono">#{newOrder.order_number}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Amount:</span> <span className="font-bold text-blue-700">{formatINR(newOrder.total || 0)}</span></div>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        stopAlert(popup.id);
                        removePopup(popup.id);
                        window.location.hash = "";
                        document.getElementById("admin-orders-link")?.click();
                      }}
                    >
                      View Order
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => {
                          stopAlert(popup.id);
                          removePopup(popup.id);
                        }}
                      >
                        DISMISS
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          stopAlert(popup.id);
                          setStatus.mutate({ id: newOrder.id, status: "processing" });
                          removePopup(popup.id);
                        }}
                      >
                        ACCEPT
                      </Button>
                    </div>
                  </div>
                </div>
              );
            } else {
              const newReq = popup.data;
              return (
                <div key={popup.id} className="bg-white p-6 rounded-xl shadow-2xl w-full border-t-4 border-purple-600 animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto">
                  <div className="flex items-center justify-between gap-2 text-purple-700 font-bold mb-4 text-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6" />
                      NEW CUSTOMIZATION
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground -mr-2" onClick={() => { stopAlert(popup.id); removePopup(popup.id); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-3 text-sm mb-6 bg-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Customer:</span> <span className="font-semibold">{newReq.customer || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Email:</span> <span>{newReq.email || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Phone:</span> <span>{newReq.phone || "Unknown"}</span></div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-purple-100"><span className="text-muted-foreground font-medium">Type:</span> <span>{newReq.type || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Title:</span> <span className="truncate max-w-[150px]">{newReq.title || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground font-medium">Quantity:</span> <span>{newReq.quantity || 1}</span></div>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <Button 
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => {
                        stopAlert(popup.id);
                        removePopup(popup.id);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        stopAlert(popup.id);
                        removePopup(popup.id);
                      }}
                    >
                      DISMISS
                    </Button>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border/50 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="font-display text-2xl tracking-wide">
            AAROHAN <span className="text-accent text-sm">ADMIN</span>
          </Link>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">Navigation</p>
          <Button 
            variant="ghost" 
            asChild
            className={`justify-start ${location.pathname === '/admin/dashboard' || location.pathname === '/admin' ? 'text-foreground bg-accent/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link to="/admin/dashboard"><Activity className="mr-3 h-4 w-4" /> Dashboard</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className={`justify-start ${location.pathname.startsWith('/admin/products') ? 'text-foreground bg-accent/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link to="/admin/products"><Package className="mr-3 h-4 w-4" /> Products</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className={`justify-start ${location.pathname.startsWith('/admin/inventory') ? 'text-foreground bg-accent/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link to="/admin/inventory"><Box className="mr-3 h-4 w-4" /> Inventory</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className={`justify-start ${location.pathname.startsWith('/admin/orders') ? 'text-foreground bg-accent/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link to="/admin/orders" id="admin-orders-link">
              <ShoppingCart className="mr-3 h-4 w-4" /> Orders
              {pendingOrders > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              )}
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className={`justify-start ${location.pathname.startsWith('/admin/users') ? 'text-foreground bg-accent/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link to="/admin/users"><Users className="mr-3 h-4 w-4" /> Users</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className={`justify-start ${location.pathname.startsWith('/admin/settings') ? 'text-foreground bg-accent/5' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link to="/admin/settings"><SettingsIcon className="mr-3 h-4 w-4" /> Settings</Link>
          </Button>
        </div>
        <div className="p-4 border-t border-border/50 flex flex-col gap-2">
          <Button variant="outline" className="justify-start w-full" asChild>
            <Link to="/"><ShoppingCart className="mr-3 h-4 w-4" /> Back to Store</Link>
          </Button>
          <Button variant="ghost" className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-3 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="font-medium text-lg capitalize whitespace-nowrap hidden sm:block">
              {location.pathname.split("/").pop() || "Dashboard"}
            </h1>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products, orders..." className="pl-9 bg-secondary/20 border-border/50 h-9" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button variant={soundEnabled ? "default" : "outline"} size="sm" className="hidden lg:flex text-xs h-8" onClick={toggleSound}>
              {soundEnabled ? "Disable Alerts" : "Enable Alerts"}
            </Button>
            <Button variant="outline" size="sm" className="hidden lg:flex text-xs h-8" onClick={() => startAlert("test-sound")}>
              Test Sound
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {recentNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground font-bold">
                      {recentNotifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                  <span className="text-xs font-semibold">Notifications</span>
                  <Button variant="ghost" size="sm" className="h-5 text-[10px]" onClick={() => setRecentNotifications([])}>Clear</Button>
                </div>
                {recentNotifications.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">No new notifications</div>
                ) : (
                  recentNotifications.map(n => (
                    n.type === "order" ? (
                      <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer" onClick={() => navigate("/admin/orders")}>
                        <span className="font-semibold text-xs text-blue-600">New Order #{n.order_number}</span>
                        <span className="text-[10px] text-muted-foreground">{formatINR(n.total || 0)} • {n.time.toLocaleTimeString()}</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                        <span className="font-semibold text-xs text-purple-700">✨ Customization</span>
                        <span className="text-[10px] text-muted-foreground">{n.title} by {n.customer} • {n.time.toLocaleTimeString()}</span>
                      </DropdownMenuItem>
                    )
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="default" size="sm" className="hidden md:flex text-xs h-8" asChild>
              <Link to="/" target="_blank">View Storefront</Link>
            </Button>
            
            <div className="h-6 w-px bg-border/50 hidden sm:block mx-1" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">Shop Owner</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">{user?.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            
            <Route path="dashboard" element={
              <DashboardOverview
                products={products}
                inventory={inventory}
                orders={orders}
                onRefresh={() => {
                  queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
                  queryClient.invalidateQueries({ queryKey: ["admin-products"] });
                  queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
                }}
              />
            } />

            <Route path="products" element={
              <ProductManager
                products={products}
                isLoading={productsQuery.isLoading}
                onAddProduct={() => {
                  setProductToEdit(null);
                  setProductFormOpen(true);
                }}
                onEditProduct={(p) => {
                  setProductToEdit(p);
                  setProductFormOpen(true);
                }}
                onDeleteProduct={(id, name) => {
                  if (confirm(`Are you sure you want to delete ${name}?`)) {
                    deleteProduct.mutate(id);
                  }
                }}
              />
            } />

            <Route path="inventory" element={
              <InventoryManager
                products={products}
                inventory={inventory}
                isLoading={inventoryQuery.isLoading || productsQuery.isLoading}
              />
            } />

            <Route path="orders" element={
              <div className="rounded-xl bg-card shadow-soft border border-border/50 overflow-hidden">
                {ordersQuery.isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                        <tr>
                          <th className="px-6 py-4 font-medium">Order ID</th>
                          <th className="px-6 py-4 font-medium">Customer</th>
                          <th className="px-6 py-4 font-medium">Amount</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-accent/5 transition-colors">
                            <td className="px-6 py-4 font-medium">#{o.order_number}</td>
                            <td className="px-6 py-4">
                              <p>{o.shipping_address?.name}</p>
                              <p className="text-xs text-muted-foreground">{o.shipping_address?.email}</p>
                            </td>
                            <td className="px-6 py-4">{formatINR(o.total)}</td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(o.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                                  o.status === "placed" ? "bg-blue-100 text-blue-700" :
                                  o.status === "processing" ? "bg-amber-100 text-amber-700" :
                                  o.status === "delivered" ? "bg-green-100 text-green-700" :
                                  o.status === "cancelled" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {o.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Select
                                value={o.status}
                                onValueChange={(status) => setStatus.mutate({ id: o.id, status })}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs capitalize">
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            } />

            <Route path="users" element={
              <div className="rounded-xl bg-card shadow-soft border border-border/50 overflow-hidden">
                {usersQuery.isLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No users found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                        <tr>
                          <th className="px-6 py-4 font-medium">Name</th>
                          <th className="px-6 py-4 font-medium">Email</th>
                          <th className="px-6 py-4 font-medium">Role</th>
                          <th className="px-6 py-4 font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-accent/5 transition-colors">
                            <td className="px-6 py-4 font-medium">{u.full_name || "—"}</td>
                            <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${u.role === 'admin' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            } />
            <Route path="settings" element={
              <div className="p-8 text-center bg-card rounded-xl border border-border/50">
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-muted-foreground mt-2">Store configuration settings will appear here.</p>
              </div>
            } />
          </Routes>
        </div>
      </main>

      {/* Add/Edit Product Dialog */}
      <ProductFormDialog 
        open={productFormOpen} 
        onOpenChange={setProductFormOpen} 
        productToEdit={productToEdit}
      />
    </div>
  );
}


export default AdminPage;

