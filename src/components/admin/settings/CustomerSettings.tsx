import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CustomerSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    registration: settings.registration ?? true,
    email_verification: settings.email_verification ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Customer settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Customer Configuration</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
          <div>
            <Label className="text-base text-ink">Allow Customer Registration</Label>
            <p className="text-sm text-muted-foreground">Enable new customers to sign up</p>
          </div>
          <Switch checked={formData.registration} onCheckedChange={(v) => setFormData({...formData, registration: v})} />
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
          <div>
            <Label className="text-base text-ink">Require Email Verification</Label>
            <p className="text-sm text-muted-foreground">Require customers to verify email before checkout</p>
          </div>
          <Switch checked={formData.email_verification} onCheckedChange={(v) => setFormData({...formData, email_verification: v})} />
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
