import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function StorefrontSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    maintenance_mode: settings.maintenance_mode ?? false,
    store_email: settings.store_email ?? "support@aarohan.com",
    store_phone: settings.store_phone ?? "",
    allow_guest_browsing: settings.allow_guest_browsing ?? true,
    allow_wishlist: settings.allow_wishlist ?? true,
    allow_cart: settings.allow_cart ?? true,
    allow_checkout: settings.allow_checkout ?? true,
    show_out_of_stock: settings.show_out_of_stock ?? true,
    allow_backorders: settings.allow_backorders ?? false,
    return_window_days: settings.return_window_days ?? 7,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Storefront settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked) {
      setShowMaintenanceDialog(true);
    } else {
      setFormData({ ...formData, maintenance_mode: false });
    }
  };

  const confirmMaintenance = () => {
    setFormData({ ...formData, maintenance_mode: true });
    setShowMaintenanceDialog(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Storefront Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <Label className="text-base text-red-900 font-bold">Maintenance Mode</Label>
              <p className="text-sm text-red-700">Prevent customers from accessing the storefront</p>
            </div>
            <Switch 
              checked={formData.maintenance_mode} 
              onCheckedChange={handleMaintenanceToggle} 
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Public Contact Email</Label>
              <Input 
                value={formData.store_email} 
                onChange={e => setFormData({...formData, store_email: e.target.value})} 
                className="bg-[#FDFBF7]"
              />
            </div>
            <div className="space-y-2">
              <Label>Public Contact Phone</Label>
              <Input 
                value={formData.store_phone} 
                onChange={e => setFormData({...formData, store_phone: e.target.value})} 
                className="bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
            <h4 className="font-medium text-ink">Browsing & Shopping</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <Label className="text-sm">Allow Guest Browsing</Label>
                <Switch checked={formData.allow_guest_browsing} onCheckedChange={(v) => setFormData({...formData, allow_guest_browsing: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <Label className="text-sm">Enable Wishlist</Label>
                <Switch checked={formData.allow_wishlist} onCheckedChange={(v) => setFormData({...formData, allow_wishlist: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <Label className="text-sm">Enable Add to Cart</Label>
                <Switch checked={formData.allow_cart} onCheckedChange={(v) => setFormData({...formData, allow_cart: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
                <Label className="text-sm">Enable Checkout</Label>
                <Switch checked={formData.allow_checkout} onCheckedChange={(v) => setFormData({...formData, allow_checkout: v})} />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
            <h4 className="font-medium text-ink">Product & Order Display</h4>
            
            <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
              <Label className="text-sm">Show Out of Stock Products</Label>
              <Switch checked={formData.show_out_of_stock} onCheckedChange={(v) => setFormData({...formData, show_out_of_stock: v})} />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
              <Label className="text-sm">Allow Backorders</Label>
              <Switch checked={formData.allow_backorders} onCheckedChange={(v) => setFormData({...formData, allow_backorders: v})} />
            </div>

            <div className="pt-2 max-w-[200px]">
              <Label className="block mb-2">Return Window (Days)</Label>
              <Input 
                type="number"
                value={formData.return_window_days} 
                onChange={e => setFormData({...formData, return_window_days: parseInt(e.target.value) || 0})} 
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

      <AlertDialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Maintenance Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately lock all customers out of the storefront. They will see a maintenance page. Active checkouts may fail. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowMaintenanceDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMaintenance} className="bg-red-600 hover:bg-red-700">Enable Maintenance Mode</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
