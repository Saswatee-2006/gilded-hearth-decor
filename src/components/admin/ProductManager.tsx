import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, ArrowUpDown, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";

type Product = any;

interface ProductManagerProps {
  products: Product[];
  isLoading: boolean;
  onAddProduct: () => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string, name: string) => void;
}

export function ProductManager({ products, isLoading, onAddProduct, onEditProduct, onDeleteProduct }: ProductManagerProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(s) || p.category?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
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
          default:
            return 0;
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, search, categoryFilter, sortConfig]);

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
        <h2 className="text-xl font-medium">Product Catalog</h2>
        <Button onClick={onAddProduct} className="gap-2 shrink-0 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl bg-card shadow-soft border border-border/50 p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, category, or description..."
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
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
            Loading catalog...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                <tr>
                  <SortableHeader label="Product" sortKey="name" />
                  <SortableHeader label="Category" sortKey="category" />
                  <th className="px-6 py-4 font-medium">Brand</th>
                  <SortableHeader label="Price" sortKey="price" />
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredAndSorted.map((p) => (
                  <tr key={p.id} className="hover:bg-accent/5 transition-colors group">
                    <td className="px-6 py-4 font-medium flex items-start gap-4 min-w-[300px]">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary shrink-0 mt-1">
                        <img
                          src={resolveImage(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-base">{p.name || "Unknown Product"}</p>
                        <p className="text-xs text-muted-foreground font-normal mt-1 line-clamp-2">
                          {p.description || "No description provided."}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground capitalize whitespace-nowrap">
                      {p.category?.replace(/-/g, " ") || "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase text-foreground">Aarohan Décor</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{formatINR(p.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary"
                          onClick={() => onEditProduct(p)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100"
                          onClick={() => onDeleteProduct(p.id, p.name)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
