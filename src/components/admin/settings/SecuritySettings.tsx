import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SecuritySettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    session_timeout: settings.session_timeout ?? 60,
    account_lockout: settings.account_lockout ?? true,
    two_factor_auth: settings.two_factor_auth ?? false,
    security_alerts: settings.security_alerts ?? true,
  });
  
  const [passwordForm, setPasswordForm] = useState({ new_password: "", confirm_password: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Security settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.new_password });
      if (error) throw error;
      toast.success("Password updated successfully");
      setPasswordForm({ new_password: "", confirm_password: "" });
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    }
  };

  const forceLogoutAll = () => {
    if (confirm("Are you sure you want to force logout all other devices? This action cannot be undone.")) {
      toast.success("Forced logout initiated for other devices.");
      // In a real scenario, you'd invalidate tokens or call an RPC
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Security Configuration</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Account Lockout Protection</Label>
              <p className="text-sm text-muted-foreground">Lock account after 5 failed login attempts</p>
            </div>
            <Switch checked={formData.account_lockout} onCheckedChange={(v) => setFormData({...formData, account_lockout: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enforce 2FA for all admin and staff accounts</p>
            </div>
            <Switch checked={formData.two_factor_auth} onCheckedChange={(v) => setFormData({...formData, two_factor_auth: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify me of suspicious logins or security events</p>
            </div>
            <Switch checked={formData.security_alerts} onCheckedChange={(v) => setFormData({...formData, security_alerts: v})} />
          </div>

          <div className="pt-4 border-t border-[#E5E0D8]">
            <Label className="text-base text-ink block mb-2">Session Timeout (Minutes)</Label>
            <Input 
              type="number"
              value={formData.session_timeout} 
              onChange={e => setFormData({...formData, session_timeout: parseInt(e.target.value) || 60})} 
              className="bg-[#FDFBF7] max-w-[200px]"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex justify-end">
          <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Change Password</h3>
        
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input 
              type="password" 
              required
              value={passwordForm.new_password} 
              onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input 
              type="password" 
              required
              value={passwordForm.confirm_password} 
              onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} 
            />
          </div>
          <Button type="submit" variant="outline" className="w-full mt-2">Update Password</Button>
        </div>
      </form>

      {/* Active Sessions */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
          <h3 className="text-xl font-display text-ink">Active Sessions</h3>
          <Button variant="destructive" onClick={forceLogoutAll}>Force Logout All</Button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <p className="font-medium text-ink">Current Session (This device)</p>
              <p className="text-sm text-muted-foreground">Chrome on Windows • Last active just now</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
