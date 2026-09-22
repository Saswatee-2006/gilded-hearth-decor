import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrderSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    default_status: settings.default_status || "placed",
    auto_refresh: settings.auto_refresh ?? true,
    allow_cancellation: settings.allow_cancellation ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Order settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Order Configuration</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Default Order Status</label>
            <Select value={formData.default_status} onValueChange={v => setFormData({...formData, default_status: v})}>
              <SelectTrigger className="bg-[#FDFBF7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placed">Placed (Pending)</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Auto-refresh Orders</Label>
              <p className="text-sm text-muted-foreground">Keep order view automatically in sync</p>
            </div>
            <Switch checked={formData.auto_refresh} onCheckedChange={(v) => setFormData({...formData, auto_refresh: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Allow Order Cancellation</Label>
              <p className="text-sm text-muted-foreground">Allow customers to request cancellations</p>
            </div>
            <Switch checked={formData.allow_cancellation} onCheckedChange={(v) => setFormData({...formData, allow_cancellation: v})} />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex justify-end">
        <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
