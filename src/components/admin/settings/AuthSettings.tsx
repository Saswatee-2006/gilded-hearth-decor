import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuthSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    email_password: settings.email_password ?? true,
    google: settings.google ?? true,
    forgot_password: settings.forgot_password ?? true,
    allow_registration: settings.allow_registration ?? true,
    require_verified_email: settings.require_verified_email ?? false,
    redirect_after_login: settings.redirect_after_login ?? "/",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Authentication settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Authentication Configuration</h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-ink">Providers</h4>
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Email + Password</Label>
              <p className="text-sm text-muted-foreground">Standard email and password login</p>
            </div>
            <Switch checked={formData.email_password} onCheckedChange={(v) => setFormData({...formData, email_password: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Google Sign-In</Label>
              <p className="text-sm text-muted-foreground">Allow continuing with Google via Supabase OAuth</p>
            </div>
            <Switch checked={formData.google} onCheckedChange={(v) => setFormData({...formData, google: v})} />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50 opacity-60">
            <div>
              <Label className="text-base text-ink line-through">Phone Authentication</Label>
              <p className="text-sm text-muted-foreground">Disabled by administrator request</p>
            </div>
            <Switch checked={false} disabled />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
          <h4 className="font-medium text-ink">Customer Rules</h4>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Allow Customer Registration</Label>
              <p className="text-sm text-muted-foreground">If disabled, only admins can create accounts</p>
            </div>
            <Switch checked={formData.allow_registration} onCheckedChange={(v) => setFormData({...formData, allow_registration: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Require Verified Email</Label>
              <p className="text-sm text-muted-foreground">Customers must verify their email before checkout</p>
            </div>
            <Switch checked={formData.require_verified_email} onCheckedChange={(v) => setFormData({...formData, require_verified_email: v})} />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Enable Password Reset</Label>
              <p className="text-sm text-muted-foreground">Allow users to recover forgotten passwords</p>
            </div>
            <Switch checked={formData.forgot_password} onCheckedChange={(v) => setFormData({...formData, forgot_password: v})} />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E5E0D8] space-y-2">
          <Label className="text-base text-ink block">Redirect After Login</Label>
          <Select value={formData.redirect_after_login} onValueChange={v => setFormData({...formData, redirect_after_login: v})}>
            <SelectTrigger className="bg-[#FDFBF7] max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/">Home Page</SelectItem>
              <SelectItem value="/account">Account Dashboard</SelectItem>
              <SelectItem value="previous">Previous Page</SelectItem>
            </SelectContent>
          </Select>
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
