import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, ArrowUpDown, Search, X, Package, Check } from "lucide-react";
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

  const SortableHeader = ({ label, sortKey, align = "left" }: { label: string; sortKey: string; align?: "left" | "right" | "center" }) => (
    <th
      className={cn(
        "px-6 py-4 font-semibold tracking-wider text-[11px] uppercase cursor-pointer hover:bg-[#F9F7F1] transition-colors group",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
      onClick={() => handleSort(sortKey)}
    >
      <div className={cn("flex items-center gap-1.5", align === "right" && "justify-end", align === "center" && "justify-center")}>
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors",
            sortConfig?.key === sortKey && "text-ink"
          )}
        />
      </div>
    </th>
  );

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto font-sans animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal reveal-in">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-4xl font-light text-ink tracking-tight">Products</h2>
            {!isLoading && (
              <span className="px-2.5 py-1 rounded-full bg-[#E8E3D9]/50 text-[#6B655C] text-[12px] font-medium border border-[#E8E3D9]">
                {products.length} products
              </span>
            )}
          </div>
          <p className="text-[#8C857B] text-[15px]">
            Manage your AAROHAN product catalog.
          </p>
        </div>
        <Button onClick={onAddProduct} className="h-11 px-6 rounded-full bg-clay text-white hover:bg-ink gap-2 shadow-sm transition-colors text-[14px]">
          <Plus className="h-[18px] w-[18px]" /> Add Product
        </Button>
      </div>

      <div className="card-soft rounded-3xl bg-white shadow-sm border border-[#E8E3D9] overflow-hidden reveal reveal-in" style={{ transitionDelay: "100ms" }}>
        <div className="p-6 md:p-8 border-b border-[#E8E3D9] bg-[#FDFBF7]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#8C857B]" />
              <Input
                placeholder="Search products by name, category, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-10 h-11 bg-white border-[#E8E3D9] rounded-xl shadow-sm text-[15px] focus-visible:ring-clay"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-[#F4F1EA] flex items-center justify-center text-[#8C857B]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[220px] h-11 bg-white border-[#E8E3D9] rounded-xl shadow-sm text-[14px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E8E3D9]">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c as string} value={c as string}>
                      {(c as string).replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || categoryFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => { setSearch(""); setCategoryFilter("all"); }}
                  className="h-11 px-4 border-[#E8E3D9] text-[#6B655C] hover:bg-[#F4F1EA] hover:text-ink shrink-0 rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-[#FDFBF7] border-b border-[#E8E3D9]">
                <tr>
                  <th className="px-8 py-4"><div className="h-4 w-24 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                  <th className="px-8 py-4"><div className="h-4 w-20 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                  <th className="px-8 py-4"><div className="h-4 w-20 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                  <th className="px-8 py-4"><div className="h-4 w-16 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-8 py-5 flex items-start gap-5">
                      <div className="h-20 w-20 rounded-xl bg-[#F4F1EA] animate-pulse shrink-0"></div>
                      <div className="space-y-3 flex-1 mt-2">
                        <div className="h-5 w-3/4 bg-[#E8E3D9] rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-[#E8E3D9] rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-8 py-5"><div className="h-6 w-24 bg-[#F4F1EA] rounded-full animate-pulse"></div></td>
                    <td className="px-8 py-5"><div className="h-4 w-24 bg-[#E8E3D9] rounded animate-pulse"></div></td>
                    <td className="px-8 py-5"><div className="h-5 w-16 bg-[#E8E3D9] rounded animate-pulse"></div></td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <div className="h-9 w-9 bg-[#F4F1EA] rounded-full animate-pulse"></div>
                        <div className="h-9 w-9 bg-[#F4F1EA] rounded-full animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-[#8C857B]" />
            </div>
            <h3 className="text-xl font-display text-ink mb-2">No products found</h3>
            <p className="text-[#8C857B] text-[15px] max-w-sm mb-6">
              Try adjusting your search query or category filter to find what you're looking for.
            </p>
            {(search || categoryFilter !== "all") && (
              <Button 
                onClick={() => { setSearch(""); setCategoryFilter("all"); }}
                className="bg-white border border-[#E8E3D9] text-ink hover:bg-[#F4F1EA] px-6 h-10 rounded-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FDFBF7] text-[#8C857B]">
                <tr>
                  <SortableHeader label="Product" sortKey="name" />
                  <SortableHeader label="Category" sortKey="category" />
                  <th className="px-8 py-4 font-semibold tracking-wider text-[11px] uppercase">Brand</th>
                  <SortableHeader label="Price" sortKey="price" />
                  <th className="px-8 py-4 font-semibold tracking-wider text-[11px] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]">
                {filteredAndSorted.map((p, index) => (
                  <tr 
                    key={p.id} 
                    className="group hover:bg-[#F9F7F1] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                  >
                    <td className="px-8 py-6 min-w-[350px]">
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#F4F1EA] shrink-0 border border-[#E8E3D9] shadow-sm relative group-hover:shadow-md transition-all duration-300">
                          {p.image ? (
                            <img
                              src={resolveImage(p.image)}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/100x100/FDFBF7/8C857B?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8C857B]">
                              <Package className="h-6 w-6 opacity-30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-xl text-ink leading-tight group-hover:text-clay transition-colors">{p.name || "Unknown Product"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {p.category ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#F4F1EA] text-[#6B655C] border border-[#E8E3D9]">
                          {p.category.replace(/-/g, " ")}
                        </span>
                      ) : (
                        <span className="text-[#8C857B] text-[13px]">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-[13px] font-medium text-ink">AAROHAN</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="font-semibold text-[15px] text-ink">{formatINR(p.price)}</span>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-full bg-white border border-[#E8E3D9] text-[#6B655C] hover:text-ink hover:border-clay hover:bg-[#F4F1EA] shadow-sm transition-all"
                          onClick={() => onEditProduct(p)}
                          title="Edit Product"
                        >
                          <Edit className="h-[15px] w-[15px]" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-full bg-white border border-[#E8E3D9] text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 shadow-sm transition-all"
                          onClick={() => onDeleteProduct(p.id, p.name)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-[15px] w-[15px]" />
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
