import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/catalog";

export function ShippingSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    shipping_enabled: settings.shipping_enabled ?? true,
    free_shipping_threshold: settings.free_shipping_threshold ?? 999,
    flat_shipping_charge: settings.flat_shipping_charge ?? 0,
    estimated_delivery: settings.estimated_delivery ?? "3-5 business days",
    order_processing_time: settings.order_processing_time ?? "1-2 business days",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [shippingZones, setShippingZones] = useState<any[]>([]);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const { data, error } = await supabase.from("shipping_zones").select("*").order("name");
    if (!error && data) setShippingZones(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Shipping settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Shipping Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Enable Shipping Module</Label>
              <p className="text-sm text-muted-foreground">Toggle all shipping functionality</p>
            </div>
            <Switch checked={formData.shipping_enabled} onCheckedChange={(v) => setFormData({...formData, shipping_enabled: v})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Free Shipping Threshold (₹)</Label>
              <Input 
                type="number"
                value={formData.free_shipping_threshold} 
                onChange={e => setFormData({...formData, free_shipping_threshold: parseInt(e.target.value) || 0})} 
                className="bg-[#FDFBF7]"
              />
              <p className="text-xs text-muted-foreground">Orders above this get free shipping</p>
            </div>
            <div className="space-y-2">
              <Label>Flat Shipping Charge (₹)</Label>
              <Input 
                type="number"
                value={formData.flat_shipping_charge} 
                onChange={e => setFormData({...formData, flat_shipping_charge: parseInt(e.target.value) || 0})} 
                className="bg-[#FDFBF7]"
              />
              <p className="text-xs text-muted-foreground">Default charge if below threshold</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E5E0D8]">
            <div className="space-y-2">
              <Label>Estimated Delivery Time</Label>
              <Input 
                value={formData.estimated_delivery} 
                onChange={e => setFormData({...formData, estimated_delivery: e.target.value})} 
                className="bg-[#FDFBF7]"
              />
            </div>
            <div className="space-y-2">
              <Label>Order Processing Time</Label>
              <Input 
                value={formData.order_processing_time} 
                onChange={e => setFormData({...formData, order_processing_time: e.target.value})} 
                className="bg-[#FDFBF7]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex justify-end">
          <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
          <div>
            <h3 className="text-xl font-display text-ink">Shipping Zones</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage delivery areas and restrictions</p>
          </div>
          <Button variant="outline" className="border-[#E5E0D8]">Add Zone</Button>
        </div>

        <div className="space-y-3">
          {shippingZones.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No shipping zones configured.</p>
          ) : (
            shippingZones.map(zone => (
              <div key={zone.id} className="flex justify-between items-center p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <div>
                  <h4 className="font-medium text-ink">{zone.name}</h4>
                  <p className="text-sm text-muted-foreground">Regions: {zone.regions?.join(", ") || "All"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${zone.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="ghost" size="sm" className="text-clay hover:bg-clay/10 hover:text-clay">Edit</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
