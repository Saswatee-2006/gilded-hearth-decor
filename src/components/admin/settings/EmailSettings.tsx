import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function EmailSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    email_verification: settings.email_verification ?? true,
    password_reset: settings.password_reset ?? true,
    order_placed: settings.order_placed ?? true,
    order_confirmation: settings.order_confirmation ?? true,
    order_shipped: settings.order_shipped ?? true,
    order_delivered: settings.order_delivered ?? true,
    order_cancelled: settings.order_cancelled ?? true,
    refund: settings.refund ?? true,
    admin_new_order: settings.admin_new_order ?? true,
    admin_cancellation: settings.admin_cancellation ?? true,
    admin_low_stock: settings.admin_low_stock ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Hardcoded for demonstration, would normally check env variables or db for API key presence
  const isConfigured = false; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Email settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = () => {
    if (!isConfigured) {
      toast.error("Email provider is not configured. Cannot send test email.");
      return;
    }
    toast.success("Test email sent!");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
        <div>
          <h3 className="text-xl font-display text-ink">Email Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">Manage automated email triggers</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isConfigured ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">Configured</Badge>
          ) : (
            <Badge variant="destructive">Not Configured</Badge>
          )}
          {isConfigured && <Button type="button" variant="outline" size="sm" onClick={handleTestEmail}>Send Test Email</Button>}
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <h4 className="font-medium text-ink mb-4">Customer Notifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              email_verification: "Account Verification",
              password_reset: "Password Reset",
              order_placed: "Order Placed",
              order_confirmation: "Order Confirmation",
              order_shipped: "Order Shipped",
              order_delivered: "Order Delivered",
              order_cancelled: "Order Cancelled",
              refund: "Refund Issued",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <Label className="text-sm font-medium">{label}</Label>
                <Switch 
                  checked={formData[key as keyof typeof formData]} 
                  onCheckedChange={(v) => setFormData({...formData, [key]: v})} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E0D8]">
          <h4 className="font-medium text-ink mb-4">Admin Notifications</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              admin_new_order: "New Order",
              admin_cancellation: "Order Cancellation",
              admin_low_stock: "Low Stock Alert",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <Label className="text-sm font-medium">{label}</Label>
                <Switch 
                  checked={formData[key as keyof typeof formData]} 
                  onCheckedChange={(v) => setFormData({...formData, [key]: v})} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex justify-end">
        <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
