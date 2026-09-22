import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AdminStaffSettings() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["owner", "admin", "manager", "staff"])
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to load staff list");
    } else {
      setStaff(data || []);
    }
    setLoading(false);
  };

  const handleUpdateStaff = async (staffId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", staffId);

      if (error) throw error;
      toast.success("Staff updated successfully");
      fetchStaff();
      setEditingStaff(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update staff");
    }
  };

  const currentProfile = staff.find(s => s.id === user?.id);
  const isOwner = currentProfile?.role === "owner";

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink">Admin & Staff Management</h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-[#FDFBF7] text-[#8C857B] border-b border-[#E5E0D8]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-b border-[#E5E0D8] last:border-0 hover:bg-[#FDFBF7]">
                    <td className="px-4 py-3 font-medium text-ink">
                      {s.full_name || "Unknown"}
                      {s.id === user?.id && <span className="ml-2 text-[10px] bg-clay/10 text-clay px-2 py-0.5 rounded-full">You</span>}
                    </td>
                    <td className="px-4 py-3 text-[#6B655C]">{s.email || "N/A"}</td>
                    <td className="px-4 py-3 capitalize text-[#8C857B]">{s.role}</td>
                    <td className="px-4 py-3 text-green-600 font-medium text-xs">Active</td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-clay hover:text-clay hover:bg-clay/10"
                        onClick={() => setEditingStaff(s)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingStaff && (
            <div className="mt-8 p-6 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg">
              <h4 className="font-medium text-ink mb-4 pb-2 border-b border-[#E5E0D8]">Edit Staff: {editingStaff.full_name}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={editingStaff.role} 
                    onValueChange={v => setEditingStaff({...editingStaff, role: v})}
                    disabled={editingStaff.role === 'owner' && !isOwner}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {editingStaff.role === 'owner' && !isOwner && (
                    <p className="text-xs text-red-500 mt-1">Only owners can modify owner roles.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-md border border-[#E5E0D8]">
                  {["manage_products", "manage_inventory", "manage_orders", "manage_users", "manage_settings"].map(perm => {
                    const hasPerm = editingStaff.permissions?.[perm] ?? false;
                    return (
                      <div key={perm} className="flex items-center space-x-2">
                        <Switch 
                          checked={editingStaff.role === 'owner' ? true : hasPerm}
                          disabled={editingStaff.role === 'owner'}
                          onCheckedChange={(v) => {
                            setEditingStaff({
                              ...editingStaff,
                              permissions: { ...(editingStaff.permissions || {}), [perm]: v }
                            });
                          }}
                        />
                        <Label className="capitalize">{perm.replace("manage_", "Manage ")}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
                <Button 
                  className="bg-accent text-white" 
                  onClick={() => handleUpdateStaff(editingStaff.id, { role: editingStaff.role, permissions: editingStaff.permissions })}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
