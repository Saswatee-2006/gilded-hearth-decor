import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  Box,
  AlertTriangle,
  XCircle,
  RefreshCcw,
  Settings,
  ShoppingCart,
  Plus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveImage, formatINR } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";

type Product = any;
type Inventory = any;
type Order = any;

interface DashboardOverviewProps {
  products: Product[];
  inventory: Inventory[];
  orders: Order[];
  onRefresh: () => void;
}

const COLORS = ["#8C857B", "#59544D", "#2C2A26", "#C4BCB3", "#E8E3D9"];

export function DashboardOverview({ products, inventory, orders, onRefresh }: DashboardOverviewProps) {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<"today" | "7d" | "30d" | "3m" | "1y">("30d");

  const { settings } = useSettings();
  const lowStockThreshold = settings.inventory?.low_stock_threshold ?? 5;

  // Summary Metrics
  const totalProducts = products.length;
  const totalStock = useMemo(() => inventory.reduce((sum, item) => sum + (item.stock || 0), 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter((i) => i.stock > 0 && i.stock < lowStockThreshold).length, [inventory, lowStockThreshold]);
  const outOfStockCount = useMemo(() => inventory.filter((i) => i.stock === 0).length, [inventory]);

  const inventoryValue = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) return sum;
      return sum + (item.stock || 0) * (product.price || 0);
    }, 0);
  }, [inventory, products]);

  // Sales Chart Data
  const chartData = useMemo(() => {
    const daysMap: Record<string, number> = {};
    let daysToSubtract = 30;
    if (timeFilter === "today") daysToSubtract = 0;
    if (timeFilter === "7d") daysToSubtract = 7;
    if (timeFilter === "3m") daysToSubtract = 90;
    if (timeFilter === "1y") daysToSubtract = 365;

    const startDate = startOfDay(subDays(new Date(), daysToSubtract));

    // Initialize map
    for (let i = daysToSubtract; i >= 0; i--) {
      const d = subDays(new Date(), i);
      daysMap[format(d, "MMM dd")] = 0;
    }

    orders.forEach((o) => {
      const orderDate = new Date(o.created_at);
      if (timeFilter === "today") {
        if (orderDate >= startOfDay(new Date())) {
          daysMap[format(orderDate, "MMM dd")] = (daysMap[format(orderDate, "MMM dd")] || 0) + (o.total || 0);
        }
      } else if (isAfter(orderDate, startDate)) {
        const key = format(orderDate, "MMM dd");
        if (daysMap[key] !== undefined) {
          daysMap[key] += (o.total || 0);
        }
      }
    });

    return Object.keys(daysMap).map((date) => ({
      date,
      revenue: daysMap[date],
    }));
  }, [orders, timeFilter]);

  // Order Statistics Donut
  const orderStats = useMemo(() => {
    const stats: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || "unknown";
      stats[s] = (stats[s] || 0) + 1;
    });
    return Object.keys(stats).map((key) => ({
      name: key,
      value: stats[key],
    }));
  }, [orders]);

  // Recent Orders
  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  }, [orders]);

  // Stock Alerts
  const stockAlerts = useMemo(() => {
    const alerts = inventory
      .filter((i) => i.stock < 5)
      .map((i) => {
        const p = products.find((p) => p.id === i.product_id);
        return { ...i, product: p };
      })
      .filter((i) => i.product);
    return alerts.sort((a, b) => a.stock - b.stock).slice(0, 5);
  }, [inventory, products]);

  // Inventory Overview Mini Table
  const inventoryPreview = useMemo(() => {
    return products.map((p) => {
      const inv = inventory.find((i) => i.product_id === p.id) || { stock: 0 };
      const status = inv.stock === 0 ? "Out of Stock" : inv.stock < 5 ? "Low Stock" : "In Stock";
      return { ...p, stock: inv.stock, status };
    }).slice(0, 5);
  }, [products, inventory]);

  return (
    <div className="flex flex-col gap-10 pb-10 max-w-[1400px] mx-auto font-sans animate-in fade-in duration-700">
      {/* 3. Dashboard Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal reveal-in">
        <div className="space-y-1">
          <h2 className="font-display text-4xl font-light text-ink tracking-tight">Good morning, Shop Owner</h2>
          <p className="text-[#8C857B] text-[15px]">
            Here's your store's overview for {format(new Date(), "MMMM do, yyyy")}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-full border-[#E8E3D9] text-ink hover:bg-[#F4F1EA] gap-2 shadow-sm" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4 text-[#8C857B]" /> Refresh
          </Button>
          <Button className="h-10 px-5 rounded-full bg-clay text-white hover:bg-ink gap-2 shadow-sm transition-colors" asChild>
            <Link to="/" target="_blank">
              <ExternalLink className="h-4 w-4" /> View Storefront
            </Link>
          </Button>
        </div>
      </div>

      {/* 4. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 reveal reveal-in" style={{ transitionDelay: "100ms" }}>
        <div className="card-soft rounded-2xl p-6 border border-[#E8E3D9] flex flex-col justify-between group">
          <div className="flex items-center gap-3 text-[#8C857B] mb-4">
            <div className="h-8 w-8 rounded-full bg-[#F4F1EA] flex items-center justify-center group-hover:bg-white transition-colors">
              <Package className="h-4 w-4 text-ink" />
            </div>
            <h3 className="eyebrow tracking-widest text-[#6B655C]">Catalog</h3>
          </div>
          <div>
            <p className="font-display text-4xl text-ink leading-none">{totalProducts}</p>
            <p className="text-[13px] text-[#8C857B] mt-2">Active Products</p>
          </div>
        </div>

        <div className="card-soft rounded-2xl p-6 border border-[#E8E3D9] flex flex-col justify-between group">
          <div className="flex items-center gap-3 text-[#8C857B] mb-4">
            <div className="h-8 w-8 rounded-full bg-[#F4F1EA] flex items-center justify-center group-hover:bg-white transition-colors">
              <Box className="h-4 w-4 text-ink" />
            </div>
            <h3 className="eyebrow tracking-widest text-[#6B655C]">Stock</h3>
          </div>
          <div>
            <p className="font-display text-4xl text-ink leading-none">{totalStock.toLocaleString()}</p>
            <p className="text-[13px] text-[#8C857B] mt-2">Total Units</p>
          </div>
        </div>

        <div className="card-soft rounded-2xl p-6 border border-[#E8E3D9] flex flex-col justify-between group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-white transition-colors">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="eyebrow tracking-widest text-orange-700">Low Stock</h3>
          </div>
          <div>
            <p className="font-display text-4xl text-ink leading-none">{lowStockCount}</p>
            <p className="text-[13px] text-[#8C857B] mt-2">Needs Reorder</p>
          </div>
        </div>

        <div className="card-soft rounded-2xl p-6 border border-[#E8E3D9] flex flex-col justify-between group">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-white transition-colors">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <h3 className="eyebrow tracking-widest text-red-700">Depleted</h3>
          </div>
          <div>
            <p className="font-display text-4xl text-ink leading-none">{outOfStockCount}</p>
            <p className="text-[13px] text-[#8C857B] mt-2">Out of Stock</p>
          </div>
        </div>

        <div className="card-soft rounded-2xl p-6 border border-[#E8E3D9] flex flex-col justify-between group bg-[#F9F7F1]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="font-display text-lg leading-none font-medium text-clay">₹</span>
            </div>
            <h3 className="eyebrow tracking-widest text-[#6B655C]">Asset Value</h3>
          </div>
          <div>
            <p className="font-display text-3xl lg:text-4xl text-ink leading-none truncate" title={formatINR(inventoryValue)}>
              {formatINR(inventoryValue)}
            </p>
            <p className="text-[13px] text-[#8C857B] mt-2">Current Inventory</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 reveal reveal-in" style={{ transitionDelay: "200ms" }}>
        {/* 5. Sales Overview */}
        <div className="card-soft rounded-3xl p-8 border border-[#E8E3D9] lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="font-display text-2xl text-ink mb-1">Sales Overview</h3>
              <p className="text-[14px] text-[#8C857B]">Revenue performance over time</p>
            </div>
            <div className="flex bg-[#F4F1EA] rounded-full p-1 border border-[#E8E3D9]">
              {(["today", "7d", "30d", "3m", "1y"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-4 py-1.5 text-[12px] font-semibold rounded-full uppercase tracking-wider transition-all duration-300",
                    timeFilter === filter
                      ? "bg-white text-ink shadow-sm"
                      : "text-[#8C857B] hover:text-ink hover:bg-white/50"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C857B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8C857B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F1EA" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8C857B', fontFamily: 'var(--font-sans)' }} 
                  dy={15} 
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8C857B', fontFamily: 'var(--font-sans)' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatINR(value), "Revenue"]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E8E3D9', boxShadow: 'var(--shadow-soft)', backgroundColor: '#fff', padding: '12px 16px' }}
                  itemStyle={{ color: 'var(--color-ink)', fontWeight: 500, fontSize: '14px' }}
                  labelStyle={{ color: '#8C857B', fontSize: '12px', marginBottom: '4px' }}
                  cursor={{ stroke: '#E8E3D9', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#59544D" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: "#59544D", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Order Statistics */}
        <div className="card-soft rounded-3xl p-8 border border-[#E8E3D9] flex flex-col">
          <h3 className="font-display text-2xl text-ink mb-1">Order Status</h3>
          <p className="text-[14px] text-[#8C857B] mb-8">Current distribution</p>
          <div className="h-[240px] w-full relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {orderStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number, name: string) => [value, name.toUpperCase()]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E8E3D9', boxShadow: 'var(--shadow-soft)' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="eyebrow text-[#8C857B]">Total</p>
              <p className="font-display text-4xl text-ink mt-1">{orders.length}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            {orderStats.map((stat, i) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[14px] text-ink capitalize font-medium">{stat.name}</span>
                </div>
                <span className="text-[14px] font-semibold text-[#8C857B]">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 reveal reveal-in" style={{ transitionDelay: "300ms" }}>
        {/* 7. Recent Orders */}
        <div className="card-soft rounded-3xl p-0 border border-[#E8E3D9] lg:col-span-2 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-[#E8E3D9] flex items-center justify-between bg-white">
            <div>
              <h3 className="font-display text-2xl text-ink mb-1">Recent Orders</h3>
              <p className="text-[14px] text-[#8C857B]">Latest fulfillment requests</p>
            </div>
            <Button variant="outline" className="h-10 rounded-full border-[#E8E3D9] gap-2 px-5 hover:bg-[#F4F1EA]" asChild>
              <Link to="/admin/orders">View All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto flex-1 bg-white">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <ShoppingCart className="h-12 w-12 text-[#E8E3D9] mb-4" />
                <p className="text-ink font-medium">No orders yet</p>
                <p className="text-[14px] text-[#8C857B] mt-1 max-w-sm">Orders will appear here once customers start placing them.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-[#8C857B] uppercase tracking-wider bg-[#FDFBF7]">
                  <tr>
                    <th className="px-8 py-4 font-semibold">Order ID</th>
                    <th className="px-8 py-4 font-semibold">Customer</th>
                    <th className="px-8 py-4 font-semibold">Date</th>
                    <th className="px-8 py-4 font-semibold text-right">Amount</th>
                    <th className="px-8 py-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3D9]">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F9F7F1] transition-colors group cursor-pointer" onClick={() => navigate("/admin/orders")}>
                      <td className="px-8 py-5 font-mono text-[13px] text-ink">#{o.order_number}</td>
                      <td className="px-8 py-5">
                        <p className="font-medium text-ink">{o.shipping_address?.name}</p>
                        <p className="text-[12px] text-[#8C857B] mt-0.5">{o.shipping_address?.email}</p>
                      </td>
                      <td className="px-8 py-5 text-[#6B655C] text-[13px]">
                        {format(new Date(o.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-8 py-5 font-semibold text-ink text-right">{formatINR(o.total)}</td>
                      <td className="px-8 py-5 text-center">
                        <span
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            o.status === "placed" && "bg-[#FDFBF7] text-ink border-[#E8E3D9]",
                            o.status === "processing" && "bg-orange-50 text-orange-700 border-orange-100",
                            o.status === "shipped" && "bg-purple-50 text-purple-700 border-purple-100",
                            o.status === "delivered" && "bg-green-50 text-green-700 border-green-100",
                            o.status === "cancelled" && "bg-red-50 text-red-700 border-red-100"
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 8. Stock Alerts & 10. Quick Actions */}
        <div className="flex flex-col gap-8">
          <div className="card-soft rounded-3xl p-8 border border-[#E8E3D9] flex flex-col bg-white">
            <h3 className="font-display text-2xl text-ink mb-6">Stock Alerts</h3>
            {stockAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-[#FDFBF7] rounded-2xl border border-[#E8E3D9] flex-1 text-center">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-ink font-medium">Optimal Inventory</p>
                <p className="text-[13px] text-[#8C857B] mt-1">All products are well-stocked.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {stockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] shrink-0 overflow-hidden shadow-sm border border-[#E8E3D9]">
                        <img 
                          src={resolveImage(item.product?.image)} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-[14px] font-semibold text-ink truncate group-hover:text-clay transition-colors">{item.product?.name}</p>
                        <p className={cn("text-[12px] font-medium mt-0.5", item.stock === 0 ? "text-red-600" : "text-orange-600")}>
                          {item.stock === 0 ? "Out of Stock" : `${item.stock} left in stock`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-soft rounded-3xl p-8 border border-[#E8E3D9] bg-[#FDFBF7]">
            <h3 className="font-display text-2xl text-ink mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 px-4 flex-col items-start bg-white border-[#E8E3D9] hover:bg-[#F4F1EA] hover:border-clay rounded-2xl transition-all shadow-sm group" onClick={() => navigate('/admin/products?action=add')}>
                <div className="h-8 w-8 rounded-full bg-[#F4F1EA] group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                  <Plus className="h-4 w-4 text-ink" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-semibold text-ink">Add Product</div>
                  <span className="text-[11px] text-[#8C857B] uppercase tracking-wider mt-1 block">Catalog</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 px-4 flex-col items-start bg-white border-[#E8E3D9] hover:bg-[#F4F1EA] hover:border-clay rounded-2xl transition-all shadow-sm group" asChild>
                <Link to="/admin/inventory">
                  <div className="h-8 w-8 rounded-full bg-[#F4F1EA] group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                    <RefreshCcw className="h-4 w-4 text-ink" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold text-ink">Update Stock</div>
                    <span className="text-[11px] text-[#8C857B] uppercase tracking-wider mt-1 block">Inventory</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 px-4 flex-col items-start bg-white border-[#E8E3D9] hover:bg-[#F4F1EA] hover:border-clay rounded-2xl transition-all shadow-sm group" asChild>
                <Link to="/admin/orders">
                  <div className="h-8 w-8 rounded-full bg-[#F4F1EA] group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                    <ShoppingCart className="h-4 w-4 text-ink" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold text-ink">View Orders</div>
                    <span className="text-[11px] text-[#8C857B] uppercase tracking-wider mt-1 block">Fulfillment</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 px-4 flex-col items-start bg-white border-[#E8E3D9] hover:bg-[#F4F1EA] hover:border-clay rounded-2xl transition-all shadow-sm group" asChild>
                <Link to="/admin/settings">
                  <div className="h-8 w-8 rounded-full bg-[#F4F1EA] group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                    <Settings className="h-4 w-4 text-ink" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold text-ink">Settings</div>
                    <span className="text-[11px] text-[#8C857B] uppercase tracking-wider mt-1 block">Config</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
