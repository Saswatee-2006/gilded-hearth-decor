import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Minus, ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { resolveImage, formatINR } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 5;

type Product = any;
type Inventory = any;

interface InventoryManagerProps {
  products: Product[];
  inventory: Inventory[];
  isLoading: boolean;
}

export function InventoryManager({ products, inventory, isLoading }: InventoryManagerProps) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [activeModal, setActiveModal] = useState<"add" | "remove" | "set" | "clear" | null>(null);
  const [activeProduct, setActiveProduct] = useState<{ p: Product; inv: Inventory } | null>(null);
  const [inputValue, setInputValue] = useState("");

  const updateStock = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase
        .from("inventory")
        .update({ stock, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stock updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["public-products"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Unable to update stock. Please try again.");
    },
  });

  const closeModal = () => {
    setActiveModal(null);
    setActiveProduct(null);
    setInputValue("");
  };

  const handleActionClick = (action: "add" | "remove" | "set" | "clear", p: Product, inv: Inventory) => {
    setActiveProduct({ p, inv });
    setActiveModal(action);
    setInputValue("");
  };

  const submitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;

    const { inv } = activeProduct;
    const currentStock = inv.stock || 0;
    const val = parseInt(inputValue, 10);

    if (activeModal === "clear") {
      updateStock.mutate({ id: inv.id, stock: 0 });
      return;
    }

    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid positive number.");
      return;
    }

    if (activeModal === "add") {
      updateStock.mutate({ id: inv.id, stock: currentStock + val });
    } else if (activeModal === "remove") {
      if (val > currentStock) {
        toast.error("Cannot remove more stock than currently available.");
        return;
      }
      updateStock.mutate({ id: inv.id, stock: currentStock - val });
    } else if (activeModal === "set") {
      updateStock.mutate({ id: inv.id, stock: val });
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let result = products.map((p) => {
      const inv = inventory.find((i) => i.product_id === p.id) || { stock: 0 };
      const status =
        inv.stock === 0 ? "Out of Stock" : inv.stock <= LOW_STOCK_THRESHOLD ? "Low Stock" : "In Stock";
      return { ...p, inv, status };
    });

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s));
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let valA, valB;
        switch (sortConfig.key) {
          case "name":
            valA = a.name;
            valB = b.name;
            break;
          case "category":
            valA = a.category || "";
            valB = b.category || "";
            break;
          case "price":
            valA = a.price;
            valB = b.price;
            break;
          case "stock":
            valA = a.inv.stock;
            valB = b.inv.stock;
            break;
          case "status":
            valA = a.status;
            valB = b.status;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, inventory, search, categoryFilter, statusFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((curr) => {
      if (!curr || curr.key !== key) return { key, direction: "asc" };
      if (curr.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <th
      className="px-6 py-4 font-medium cursor-pointer hover:bg-secondary/30 transition-colors group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors",
            sortConfig?.key === sortKey && "text-foreground"
          )}
        />
      </div>
    </th>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Stock Management</h2>
      </div>

      <div className="rounded-xl bg-card shadow-soft border border-border/50 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c as string} value={c as string}>
                  {(c as string).replace(/-/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
            Loading products & inventory...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No products found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                <tr>
                  <SortableHeader label="Product" sortKey="name" />
                  <SortableHeader label="Category" sortKey="category" />
                  <SortableHeader label="Price" sortKey="price" />
                  <SortableHeader label="Current Stock" sortKey="stock" />
                  <SortableHeader label="Status" sortKey="status" />
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredAndSorted.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/5 transition-colors group">
                    <td className="px-6 py-4 font-medium flex items-center gap-4 min-w-[250px]">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-secondary shrink-0">
                        <img
                          src={resolveImage(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{p.name || "Unknown Product"}</p>
                        <p className="text-xs text-muted-foreground font-normal mt-0.5">
                          {p.subcategory || p.category || "General"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize whitespace-nowrap">
                      {p.category?.replace(/-/g, " ") || "—"}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{formatINR(p.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-lg">{p.inv.stock}</span>{" "}
                      <span className="text-xs text-muted-foreground font-normal">units</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {p.inv.id ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-2.5 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                onClick={() => handleActionClick("add", p, p.inv)}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-2.5 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                                onClick={() => handleActionClick("remove", p, p.inv)}
                              >
                                <Minus className="h-3.5 w-3.5 mr-1" /> Remove
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-2.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                onClick={() => handleActionClick("set", p, p.inv)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Set
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-medium px-2.5 text-destructive hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                onClick={() => handleActionClick("clear", p, p.inv)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Clear
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No inv record</span>
                          )}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={activeModal !== null} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submitAction}>
            <DialogHeader>
              <DialogTitle>
                {activeModal === "add" && "Add Stock"}
                {activeModal === "remove" && "Remove Stock"}
                {activeModal === "set" && "Set Stock"}
                {activeModal === "clear" && "Clear Inventory?"}
              </DialogTitle>
            </DialogHeader>

            <div className="py-6">
              {activeModal === "clear" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will set the current stock for <strong>{activeProduct?.p.name}</strong> to 0.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-md mb-4">
                    <span className="text-sm font-medium">Current Stock</span>
                    <span className="text-lg font-bold">{activeProduct?.inv.stock}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      {activeModal === "add" && "Quantity to Add"}
                      {activeModal === "remove" && "Quantity to Remove"}
                      {activeModal === "set" && "New Stock Quantity"}
                    </label>
                    <Input
                      type="number"
                      autoFocus
                      required
                      min={0}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={updateStock.isPending}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={activeModal === "clear" ? "destructive" : "default"}
                disabled={updateStock.isPending}
              >
                {activeModal === "add" && "Add Stock"}
                {activeModal === "remove" && "Remove Stock"}
                {activeModal === "set" && "Set Stock"}
                {activeModal === "clear" && "Clear Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
