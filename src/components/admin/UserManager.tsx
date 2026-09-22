import { useState, useMemo } from "react";
import { ArrowUpDown, Search, X, Users, RefreshCw } from "lucide-react";
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

type User = any;

interface UserManagerProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
}

export function UserManager({ users, isLoading, isError, onRefresh }: UserManagerProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const roles = useMemo(() => {
    const rs = new Set(users.map((u) => u.role).filter(Boolean));
    return Array.from(rs).sort();
  }, [users]);

  const filteredAndSorted = useMemo(() => {
    let result = [...users];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((u) => 
        u.full_name?.toLowerCase().includes(s) || 
        u.email?.toLowerCase().includes(s) || 
        u.role?.toLowerCase().includes(s)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let valA, valB;
        switch (sortConfig.key) {
          case "name":
            valA = a.full_name || "";
            valB = b.full_name || "";
            break;
          case "email":
            valA = a.email || "";
            valB = b.email || "";
            break;
          case "phone":
            valA = a.phone || "";
            valB = b.phone || "";
            break;
          case "role":
            valA = a.role || "";
            valB = b.role || "";
            break;
          case "joined":
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
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
  }, [users, search, roleFilter, sortConfig]);

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
        "px-8 py-4 font-semibold tracking-wider text-[11px] uppercase cursor-pointer hover:bg-[#F9F7F1] transition-colors group",
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

  if (isError) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center max-w-[1400px] mx-auto card-soft bg-white rounded-3xl border border-[#E8E3D9]">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <Users className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-display text-ink mb-2">Unable to load users</h3>
        <p className="text-[#8C857B] text-[15px] max-w-sm mb-6">
          Please try again.
        </p>
        <Button onClick={onRefresh} className="bg-white border border-[#E8E3D9] text-ink hover:bg-[#F4F1EA] px-6 h-10 rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1400px] mx-auto font-sans animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal reveal-in">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-4xl font-light text-ink tracking-tight">Users</h2>
            {!isLoading && (
              <span className="px-2.5 py-1 rounded-full bg-[#E8E3D9]/50 text-[#6B655C] text-[12px] font-medium border border-[#E8E3D9]">
                {users.length} Users
              </span>
            )}
          </div>
          <p className="text-[#8C857B] text-[15px]">
            Manage registered customer accounts.
          </p>
        </div>
      </div>

      <div className="card-soft rounded-3xl bg-white shadow-sm border border-[#E8E3D9] overflow-hidden reveal reveal-in" style={{ transitionDelay: "100ms" }}>
        <div className="p-6 md:p-8 border-b border-[#E8E3D9] bg-[#FDFBF7]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#8C857B]" />
              <Input
                placeholder="Search users by name, email, or role..."
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
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[220px] h-11 bg-white border-[#E8E3D9] rounded-xl shadow-sm text-[14px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E8E3D9]">
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r as string} value={r as string}>
                      {(r as string).toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || roleFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => { setSearch(""); setRoleFilter("all"); }}
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
                  <th className="px-8 py-4"><div className="h-4 w-32 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                  <th className="px-8 py-4"><div className="h-4 w-16 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                  <th className="px-8 py-4"><div className="h-4 w-20 bg-[#E8E3D9] rounded animate-pulse"></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-8 py-5">
                      <div className="h-5 w-32 bg-[#E8E3D9] rounded animate-pulse"></div>
                    </td>
                    <td className="px-8 py-5"><div className="h-4 w-48 bg-[#E8E3D9] rounded animate-pulse"></div></td>
                    <td className="px-8 py-5"><div className="h-6 w-16 bg-[#F4F1EA] rounded-full animate-pulse"></div></td>
                    <td className="px-8 py-5"><div className="h-4 w-24 bg-[#E8E3D9] rounded animate-pulse"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-[#8C857B]" />
            </div>
            <h3 className="text-xl font-display text-ink mb-2">
              {search || roleFilter !== "all" ? "No users found" : users.filter(u => u.role !== 'admin').length === 0 ? "No customers registered yet." : "No accounts found matching search"}
            </h3>
            <p className="text-[#8C857B] text-[15px] max-w-sm mb-6">
              {search || roleFilter !== "all" ? "Try adjusting your search query or role filter." : "New registrations will appear here."}
            </p>
            {(search || roleFilter !== "all") && (
              <Button 
                onClick={() => { setSearch(""); setRoleFilter("all"); }}
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
                  <SortableHeader label="Name" sortKey="name" />
                  <SortableHeader label="Email" sortKey="email" />
                  <SortableHeader label="Phone" sortKey="phone" />
                  <SortableHeader label="Role" sortKey="role" />
                  <SortableHeader label="Joined" sortKey="joined" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]">
                {filteredAndSorted.map((u, index) => (
                  <tr 
                    key={u.id} 
                    className="group hover:bg-[#F9F7F1] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                  >
                    <td className="px-8 py-5">
                      <span className="font-semibold text-[15px] text-ink">
                        {u.full_name || "—"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[#6B655C] text-[14px]">
                        {u.email}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[#6B655C] text-[14px]">
                        {u.phone || "—"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase inline-block border",
                        u.role === 'admin' 
                          ? "bg-[#2C2822] text-[#FDFBF7] border-[#2C2822]" 
                          : "bg-white text-[#6B655C] border-[#E8E3D9]"
                      )}>
                        {u.role || "CUSTOMER"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[14px] text-[#8C857B]">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
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
