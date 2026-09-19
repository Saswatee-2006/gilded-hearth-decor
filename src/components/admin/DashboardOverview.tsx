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

type Product = any;
type Inventory = any;
type Order = any;

interface DashboardOverviewProps {
  products: Product[];
  inventory: Inventory[];
  orders: Order[];
  onRefresh: () => void;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export function DashboardOverview({ products, inventory, orders, onRefresh }: DashboardOverviewProps) {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<"today" | "7d" | "30d" | "3m" | "1y">("30d");

  // Summary Metrics
  const totalProducts = products.length;
  const totalStock = useMemo(() => inventory.reduce((sum, item) => sum + (item.stock || 0), 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter((i) => i.stock > 0 && i.stock < 5).length, [inventory]);
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
    <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto">
      {/* 3. Dashboard Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Good morning, Shop Owner 👋</h2>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your store today, {format(new Date(), "MMMM do, yyyy")}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" /> Refresh
          </Button>
          <Button className="gap-2" asChild>
            <Link to="/" target="_blank">
              <ExternalLink className="h-4 w-4" /> View Storefront
            </Link>
          </Button>
        </div>
      </div>

      {/* 4. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <Package className="h-5 w-5" />
            <h3 className="font-medium text-sm">TOTAL PRODUCTS</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
          <p className="text-xs text-muted-foreground mt-1">Catalog Items</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <Box className="h-5 w-5" />
            <h3 className="font-medium text-sm">TOTAL STOCK</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalStock.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Units in Stock</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 text-orange-500 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-medium text-sm text-orange-600">LOW STOCK</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{lowStockCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Needs Reorder</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <XCircle className="h-5 w-5" />
            <h3 className="font-medium text-sm text-red-600">OUT OF STOCK</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{outOfStockCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Unavailable Products</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            <span className="font-serif text-lg leading-none font-semibold">₹</span>
            <h3 className="font-medium text-sm">INVENTORY VALUE</h3>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-foreground truncate" title={formatINR(inventoryValue)}>
            {formatINR(inventoryValue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Stock Value</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Sales Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sales Overview</h3>
              <p className="text-sm text-muted-foreground">Revenue across all fulfillment channels</p>
            </div>
            <div className="flex bg-secondary/50 rounded-lg p-1">
              {(["today", "7d", "30d", "3m", "1y"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md uppercase transition-colors",
                    timeFilter === filter
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10} 
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatINR(value), "Revenue"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Order Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
          <h3 className="text-lg font-semibold text-foreground">Order Statistics</h3>
          <p className="text-sm text-muted-foreground mb-6">Status breakdown</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {orderStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number, name: string) => [value, name.toUpperCase()]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-3xl font-display font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {orderStats.map((stat, i) => (
              <div key={stat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground capitalize">{stat.name} ({stat.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7. Recent Orders */}
        <div className="bg-white rounded-xl p-0 shadow-sm border border-border/50 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
            <Button variant="ghost" size="sm" className="text-primary gap-1" asChild>
              <Link to="/admin/orders">View All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto flex-1">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No recent orders found.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 font-medium">#{o.order_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{o.shipping_address?.name}</p>
                        <p className="text-xs text-muted-foreground">{o.shipping_address?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(o.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 font-medium">{formatINR(o.total)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase",
                            o.status === "placed" && "bg-blue-100 text-blue-700",
                            o.status === "processing" && "bg-amber-100 text-amber-700",
                            o.status === "shipped" && "bg-purple-100 text-purple-700",
                            o.status === "delivered" && "bg-green-100 text-green-700",
                            o.status === "cancelled" && "bg-red-100 text-red-700"
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
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-4">Stock Alerts</h3>
            {stockAlerts.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                <CheckCircleIcon className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">All products are sufficiently stocked</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stockAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-md bg-secondary shrink-0 overflow-hidden">
                        <img 
                          src={resolveImage(item.product?.image)} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">{item.product?.name}</p>
                        <p className={cn("text-xs font-medium mt-0.5", item.stock === 0 ? "text-red-500" : "text-orange-500")}>
                          {item.stock === 0 ? "Out of Stock" : `${item.stock} left in stock`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-3 px-4 justify-start bg-secondary/20 hover:bg-secondary/40 border-0" onClick={() => navigate('/admin/products?action=add')}>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-foreground font-medium"><Plus className="h-4 w-4" /> Add Product</div>
                  <span className="text-[10px] text-muted-foreground uppercase">Catalog</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-3 px-4 justify-start bg-secondary/20 hover:bg-secondary/40 border-0" asChild>
                <Link to="/admin/inventory">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-foreground font-medium"><RefreshCcw className="h-4 w-4" /> Update Stock</div>
                    <span className="text-[10px] text-muted-foreground uppercase">Inventory</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 px-4 justify-start bg-secondary/20 hover:bg-secondary/40 border-0" asChild>
                <Link to="/admin/orders">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-foreground font-medium"><ShoppingCart className="h-4 w-4" /> View Orders</div>
                    <span className="text-[10px] text-muted-foreground uppercase">Fulfillment</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3 px-4 justify-start bg-secondary/20 hover:bg-secondary/40 border-0" asChild>
                <Link to="/admin/settings">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-foreground font-medium"><Settings className="h-4 w-4" /> Settings</div>
                    <span className="text-[10px] text-muted-foreground uppercase">Configuration</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Inventory Overview */}
      <div className="bg-white rounded-xl p-0 shadow-sm border border-border/50 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Inventory Overview</h3>
          <Button variant="ghost" size="sm" className="text-primary gap-1" asChild>
            <Link to="/admin/inventory">View All <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          {inventoryPreview.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No inventory data available.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {inventoryPreview.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary shrink-0 overflow-hidden">
                        <img 
                          src={resolveImage(p.image)} 
                          alt={p.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="truncate max-w-[200px]">{p.name}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{p.stock} units</td>
                    <td className="px-6 py-4">{formatINR(p.price)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase",
                          p.status === "In Stock" && "bg-green-100 text-green-700",
                          p.status === "Low Stock" && "bg-orange-100 text-orange-700",
                          p.status === "Out of Stock" && "bg-red-100 text-red-700"
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
