import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StoreSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    name: settings.name || "Aarohan Decor Atelier",
    currency: settings.currency || "INR",
    timezone: settings.timezone || "Asia/Kolkata",
    status: settings.status || "open"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Store settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Store Information</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Store Name</label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="bg-[#FDFBF7]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Store Status</label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger className="bg-[#FDFBF7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="maintenance">Maintenance Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Currency</label>
            <Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
              <SelectTrigger className="bg-[#FDFBF7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink">Timezone</label>
            <Select value={formData.timezone} onValueChange={v => setFormData({...formData, timezone: v})}>
              <SelectTrigger className="bg-[#FDFBF7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
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
