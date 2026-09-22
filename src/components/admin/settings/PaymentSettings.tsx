import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function PaymentSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    online: settings.online ?? true,
    cod: settings.cod ?? true,
    min_order_amount: settings.min_order_amount ?? 0,
    max_order_amount: settings.max_order_amount ?? 100000,
    payment_mode: settings.payment_mode ?? "test",
    failure_handling: settings.failure_handling ?? "cancel",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Payment settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink">Payment Configuration</h3>
        <Badge variant={formData.payment_mode === 'test' ? 'secondary' : 'default'} className="uppercase">
          {formData.payment_mode} Mode
        </Badge>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-ink">Payment Methods</h4>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Online Payments</Label>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Enable credit cards, UPI, and wallets
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Not Configured</span>
              </p>
            </div>
            <Switch checked={formData.online} onCheckedChange={(v) => setFormData({...formData, online: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Cash on Delivery (COD)</Label>
              <p className="text-sm text-muted-foreground">Allow customers to pay upon receiving the order</p>
            </div>
            <Switch checked={formData.cod} onCheckedChange={(v) => setFormData({...formData, cod: v})} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
          <h4 className="font-medium text-ink">Order Limits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Order Amount (₹)</Label>
              <Input 
                type="number"
                value={formData.min_order_amount} 
                onChange={e => setFormData({...formData, min_order_amount: parseInt(e.target.value) || 0})} 
                className="bg-[#FDFBF7]"
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Order Amount (₹)</Label>
              <Input 
                type="number"
                value={formData.max_order_amount} 
                onChange={e => setFormData({...formData, max_order_amount: parseInt(e.target.value) || 0})} 
                className="bg-[#FDFBF7]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E0D8]">
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Test Mode</Label>
              <p className="text-sm text-muted-foreground">Simulate transactions without real charges</p>
            </div>
            <Switch 
              checked={formData.payment_mode === "test"} 
              onCheckedChange={(v) => setFormData({...formData, payment_mode: v ? "test" : "live"})} 
            />
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
