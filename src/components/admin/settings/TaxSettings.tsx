import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaxSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    tax_enabled: settings.tax_enabled ?? true,
    gst_percentage: settings.gst_percentage ?? 18,
    prices_include_tax: settings.prices_include_tax ?? true,
    price_display_format: settings.price_display_format ?? "standard",
    enable_discounts: settings.enable_discounts ?? true,
    max_discount_limit: settings.max_discount_limit ?? 50,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Tax & Pricing settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Tax & Pricing Configuration</h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-ink">Tax Rules</h4>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Enable Tax Calculation</Label>
              <p className="text-sm text-muted-foreground">Calculate and apply tax on checkout</p>
            </div>
            <Switch checked={formData.tax_enabled} onCheckedChange={(v) => setFormData({...formData, tax_enabled: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Prices Include Tax</Label>
              <p className="text-sm text-muted-foreground">Product catalog prices already have tax applied</p>
            </div>
            <Switch checked={formData.prices_include_tax} onCheckedChange={(v) => setFormData({...formData, prices_include_tax: v})} />
          </div>
          
          <div className="pt-2">
            <Label className="text-base text-ink block mb-2">Default GST Percentage (%)</Label>
            <Input 
              type="number"
              value={formData.gst_percentage} 
              onChange={e => setFormData({...formData, gst_percentage: parseInt(e.target.value) || 0})} 
              className="bg-[#FDFBF7] max-w-[200px]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-[#E5E0D8]">
          <h4 className="font-medium text-ink">Discounts & Pricing Display</h4>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Enable Discounts & Coupons</Label>
              <p className="text-sm text-muted-foreground">Allow applying coupon codes at checkout</p>
            </div>
            <Switch checked={formData.enable_discounts} onCheckedChange={(v) => setFormData({...formData, enable_discounts: v})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximum Discount Limit (%)</Label>
              <Input 
                type="number"
                value={formData.max_discount_limit} 
                onChange={e => setFormData({...formData, max_discount_limit: parseInt(e.target.value) || 0})} 
                className="bg-[#FDFBF7]"
              />
            </div>
            <div className="space-y-2">
              <Label>Price Display Format</Label>
              <Select value={formData.price_display_format} onValueChange={v => setFormData({...formData, price_display_format: v})}>
                <SelectTrigger className="bg-[#FDFBF7]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (₹1,000)</SelectItem>
                  <SelectItem value="decimals">With Decimals (₹1,000.00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex justify-end">
        <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
}
