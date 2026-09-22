import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  Menu,
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
import { UserManager } from "@/components/admin/UserManager";
import { Input } from "@/components/ui/input";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"] as const;

// Use a globally shared AudioContext to comply with autoplay restrictions
let globalAudioContext: AudioContext | null = null;
const getAudioContext = () => {
  if (!globalAudioContext) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) globalAudioContext = new Ctx();
  }
  return globalAudioContext;
};

const ensureAudioContextResumed = async () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.error("Failed to resume AudioContext", e);
    }
  }
  return ctx;
};

const playNotificationSound = async () => {
  try {
    const ctx = await ensureAudioContextResumed();
    if (!ctx) return;
    
    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Elegant notification sound
    playBeep(440, 0, 0.6); // A4
    playBeep(554.37, 0.2, 0.8); // C#5
  } catch (e) {
    console.error("[ORDER REALTIME] Audio playback failed", e);
  }
};

const playAcceptSound = async () => {
  try {
    console.log("Playing acceptance sound");
    const ctx = await ensureAudioContextResumed();
    if (!ctx) return;
    
    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Subtle confirmation chime
    playBeep(523.25, 0, 0.2); // C5
    playBeep(659.25, 0.1, 0.4); // E5
  } catch (e) {
    console.error("Acceptance sound playback failed: ", e);
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // Profiles (Users) channel
    const profilesChannel = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        }
      )
      .subscribe();

    return () => {
      Array.from(activeAlerts.keys()).forEach(id => stopAlert(id));
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(profilesChannel);
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
    <div className="flex h-screen bg-[#FDFBF7] text-ink overflow-hidden font-sans">
      {/* Notifications Popups (Preserved) */}
      {activePopups.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-[9999] flex flex-col gap-4 max-h-[80vh] overflow-y-auto pointer-events-none w-[calc(100%-2rem)] md:w-[380px]">
          {activePopups.map((popup) => {
            if (popup.type === "order") {
              const newOrder = popup.data;
              return (
                <div key={popup.id} className="bg-[#FDFBF7] p-5 rounded-2xl shadow-xl w-full border border-[#E5E0D8] animate-in slide-in-from-bottom-12 fade-in duration-500 ease-out pointer-events-auto transition-all">
                  <div className="flex items-center justify-between gap-2 text-ink mb-4 font-display text-lg border-b border-[#E5E0D8] pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-[#8C857B]" />
                      <span className="tracking-wide text-base mt-0.5">NEW ORDER</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8C857B] hover:text-ink hover:bg-[#F2EFE9] -mr-2" onClick={() => { stopAlert(popup.id); removePopup(popup.id); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2 text-sm mb-6 text-ink/80">
                    <div className="flex justify-between"><span className="text-[#8C857B]">Customer</span> <span className="font-medium text-ink">{newOrder.shipping_address?.name || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8C857B]">Email</span> <span>{newOrder.shipping_address?.email || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-[#8C857B]">Phone</span> <span>{newOrder.shipping_address?.phone || "Unknown"}</span></div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-[#E5E0D8]"><span className="text-[#8C857B]">Order ID</span> <span className="font-mono text-ink/70">#{newOrder.order_number}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-[#8C857B]">Amount</span> <span className="font-semibold text-ink">{formatINR(newOrder.total || 0)}</span></div>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <Button 
                      variant="outline"
                      className="border-[#E5E0D8] text-ink hover:bg-[#F2EFE9] h-9 px-3 rounded-lg flex-1 text-xs sm:text-sm shadow-none"
                      onClick={() => {
                        stopAlert(popup.id);
                        removePopup(popup.id);
                        window.location.hash = "";
                        document.getElementById("admin-orders-link")?.click();
                      }}
                    >
                      View Order
                    </Button>
                    <div className="flex gap-2 flex-1 justify-end">
                      <Button 
                        variant="secondary"
                        className="bg-[#F2EFE9] text-ink hover:bg-[#EAE5DE] h-9 px-3 rounded-lg text-xs sm:text-sm shadow-none"
                        onClick={() => {
                          stopAlert(popup.id);
                          removePopup(popup.id);
                        }}
                      >
                        Dismiss
                      </Button>
                      <Button 
                        className="bg-[#8C857B] hover:bg-[#7A746B] text-white h-9 px-4 rounded-lg shadow-sm text-xs sm:text-sm"
                        onClick={() => {
                          console.log("Accept clicked");
                          console.log("Stopping incoming order sound");
                          stopAlert(popup.id);
                          playAcceptSound();
                          setStatus.mutate({ id: newOrder.id, status: "processing" });
                          removePopup(popup.id);
                        }}
                      >
                        Accept
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

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#F9F7F1] border-r border-[#E8E3D9] flex flex-col transition-transform duration-300 ease-soft",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-8 border-b border-[#E8E3D9] flex justify-between items-center">
          <Link to="/" className="font-display text-2xl tracking-wider text-ink flex items-center gap-2">
            AAROHAN <span className="text-clay text-[0.5em] tracking-widest uppercase font-sans font-medium mt-1">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden text-ink" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 px-4 py-8 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <p className="eyebrow mb-4 px-4 text-[#8C857B]">Navigation</p>
          <Button 
            variant="ghost" 
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "justify-start h-11 px-4 font-medium transition-all duration-300 rounded-lg",
              location.pathname === '/admin/dashboard' || location.pathname === '/admin' 
                ? 'bg-white text-ink shadow-sm border border-[#E8E3D9]' 
                : 'text-[#6B655C] hover:text-ink hover:bg-white/50'
            )}
          >
            <Link to="/admin/dashboard"><Activity className="mr-3 h-[18px] w-[18px] opacity-70" /> Dashboard</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "justify-start h-11 px-4 font-medium transition-all duration-300 rounded-lg",
              location.pathname.startsWith('/admin/products') 
                ? 'bg-white text-ink shadow-sm border border-[#E8E3D9]' 
                : 'text-[#6B655C] hover:text-ink hover:bg-white/50'
            )}
          >
            <Link to="/admin/products"><Package className="mr-3 h-[18px] w-[18px] opacity-70" /> Products</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "justify-start h-11 px-4 font-medium transition-all duration-300 rounded-lg",
              location.pathname.startsWith('/admin/inventory') 
                ? 'bg-white text-ink shadow-sm border border-[#E8E3D9]' 
                : 'text-[#6B655C] hover:text-ink hover:bg-white/50'
            )}
          >
            <Link to="/admin/inventory"><Box className="mr-3 h-[18px] w-[18px] opacity-70" /> Inventory</Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "justify-start h-11 px-4 font-medium transition-all duration-300 rounded-lg",
              location.pathname.startsWith('/admin/orders') 
                ? 'bg-white text-ink shadow-sm border border-[#E8E3D9]' 
                : 'text-[#6B655C] hover:text-ink hover:bg-white/50'
            )}
          >
            <Link to="/admin/orders" id="admin-orders-link">
              <ShoppingCart className="mr-3 h-[18px] w-[18px] opacity-70" /> Orders
              {pendingOrders > 0 && (
                <span className="ml-auto bg-clay text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingOrders}
                </span>
              )}
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "justify-start h-11 px-4 font-medium transition-all duration-300 rounded-lg",
              location.pathname.startsWith('/admin/users') 
                ? 'bg-white text-ink shadow-sm border border-[#E8E3D9]' 
                : 'text-[#6B655C] hover:text-ink hover:bg-white/50'
            )}
          >
            <Link to="/admin/users"><Users className="mr-3 h-[18px] w-[18px] opacity-70" /> Users</Link>
          </Button>
          
          <div className="mt-8 mb-4">
            <p className="eyebrow px-4 text-[#8C857B]">Configuration</p>
          </div>
          
          <Button 
            variant="ghost" 
            asChild
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "justify-start h-11 px-4 font-medium transition-all duration-300 rounded-lg",
              location.pathname.startsWith('/admin/settings') 
                ? 'bg-white text-ink shadow-sm border border-[#E8E3D9]' 
                : 'text-[#6B655C] hover:text-ink hover:bg-white/50'
            )}
          >
            <Link to="/admin/settings"><SettingsIcon className="mr-3 h-[18px] w-[18px] opacity-70" /> Settings</Link>
          </Button>
        </div>
        
        <div className="p-6 border-t border-[#E8E3D9] flex flex-col gap-2 bg-[#F9F7F1]">
          <Button variant="outline" className="justify-start w-full h-11 bg-white border-[#E8E3D9] hover:bg-[#F4F1EA]" asChild>
            <Link to="/"><ShoppingCart className="mr-3 h-[18px] w-[18px] text-[#8C857B]" /> Back to Store</Link>
          </Button>
          <Button variant="ghost" className="justify-start w-full h-11 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={handleLogout}>
            <LogOut className="mr-3 h-[18px] w-[18px]" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-[#E8E3D9] bg-[#FDFBF7] flex items-center justify-between px-6 z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden text-ink" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <h1 className="font-display font-medium text-2xl tracking-wide capitalize whitespace-nowrap hidden sm:block">
              {location.pathname.split("/").pop() || "Dashboard"}
            </h1>
            <div className="relative max-w-md w-full hidden md:block ml-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#8C857B]" />
              <Input 
                placeholder="Search inventory, orders..." 
                className="pl-11 bg-white border-[#E8E3D9] h-11 rounded-full shadow-sm text-[15px] focus-visible:ring-clay" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Button variant={soundEnabled ? "default" : "outline"} size="sm" className={cn("hidden lg:flex text-[13px] h-9 rounded-full", soundEnabled ? "bg-clay text-white" : "border-[#E8E3D9] bg-white")} onClick={toggleSound}>
              {soundEnabled ? "Alerts On" : "Alerts Off"}
            </Button>
            <Button variant="outline" size="sm" className="hidden lg:flex text-[13px] h-9 rounded-full border-[#E8E3D9] bg-white" onClick={() => startAlert("test-sound")}>
              Test Sound
            </Button>
            
            <div className="h-8 w-px bg-[#E8E3D9] hidden lg:block mx-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-white border border-transparent hover:border-[#E8E3D9] transition-all">
                  <Bell className="h-5 w-5 text-ink" />
                  {recentNotifications.length > 0 && (
                    <span className="absolute top-1.5 right-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lift border-[#E8E3D9]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E3D9] bg-[#FDFBF7]">
                  <span className="font-medium text-sm text-ink">Notifications</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] text-[#8C857B] hover:text-ink" onClick={() => setRecentNotifications([])}>Clear all</Button>
                </div>
                {recentNotifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#8C857B]">You're all caught up.</div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
                    {recentNotifications.map(n => (
                      n.type === "order" ? (
                        <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-[#FDFBF7]" onClick={() => navigate("/admin/orders")}>
                          <span className="font-semibold text-[13px] text-ink">New Order #{n.order_number}</span>
                          <span className="text-[12px] text-[#6B655C]">{formatINR(n.total || 0)} • {n.time.toLocaleTimeString()}</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-[#FDFBF7]">
                          <span className="font-semibold text-[13px] text-clay flex items-center gap-1.5"><Sparkles className="h-3 w-3"/> Customization Request</span>
                          <span className="text-[12px] text-[#6B655C]">{n.title} by {n.customer} • {n.time.toLocaleTimeString()}</span>
                        </DropdownMenuItem>
                      )
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="h-8 w-px bg-[#E8E3D9] hidden sm:block mx-1" />
            
            <div className="flex items-center gap-3 group cursor-pointer hover:bg-white p-1 pr-3 rounded-full border border-transparent hover:border-[#E8E3D9] transition-all">
              <div className="h-9 w-9 rounded-full bg-clay text-white flex items-center justify-center font-medium text-sm shadow-sm">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[13px] font-semibold leading-tight text-ink">Shop Owner</p>
                <p className="text-[11px] text-[#8C857B] mt-0.5 truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 bg-[#FDFBF7]">
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
              <UserManager
                users={users}
                isLoading={usersQuery.isLoading}
                isError={usersQuery.isError}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
              />
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

