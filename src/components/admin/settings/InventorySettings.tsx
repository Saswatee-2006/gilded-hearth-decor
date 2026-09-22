import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function InventorySettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    low_stock_threshold: settings.low_stock_threshold ?? 5,
    out_of_stock_threshold: settings.out_of_stock_threshold ?? 0,
    auto_deduction: settings.auto_deduction ?? true,
    allow_negative: settings.allow_negative ?? false,
    allow_overselling: settings.allow_overselling ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Inventory settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Inventory Configuration</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Low Stock Threshold</label>
            <Input 
              type="number"
              value={formData.low_stock_threshold} 
              onChange={e => setFormData({...formData, low_stock_threshold: parseInt(e.target.value) || 0})} 
              className="bg-[#FDFBF7]"
            />
            <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below this number</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Out of Stock Threshold</label>
            <Input 
              type="number"
              value={formData.out_of_stock_threshold} 
              onChange={e => setFormData({...formData, out_of_stock_threshold: parseInt(e.target.value) || 0})} 
              className="bg-[#FDFBF7]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Automatic Stock Deduction</Label>
              <p className="text-sm text-muted-foreground">Deduct inventory automatically when an order is placed</p>
            </div>
            <Switch checked={formData.auto_deduction} onCheckedChange={(v) => setFormData({...formData, auto_deduction: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Allow Negative Inventory</Label>
              <p className="text-sm text-muted-foreground">Let stock values go below zero</p>
            </div>
            <Switch checked={formData.allow_negative} onCheckedChange={(v) => setFormData({...formData, allow_negative: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Allow Overselling</Label>
              <p className="text-sm text-muted-foreground">Allow customers to buy out-of-stock items</p>
            </div>
            <Switch checked={formData.allow_overselling} onCheckedChange={(v) => setFormData({...formData, allow_overselling: v})} />
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
