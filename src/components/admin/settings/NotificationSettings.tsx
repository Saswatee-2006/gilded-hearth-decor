import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { startAlert, stopAlert } from "@/routes/_authenticated/admin";

export function NotificationSettings({ settings, onSave }: { settings: any, onSave: (d: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    new_order_alerts: settings.new_order_alerts ?? true,
    browser_notifications: settings.browser_notifications ?? false,
    popup_notifications: settings.popup_notifications ?? true,
    alert_sound: settings.alert_sound ?? true,
    continuous_alert_sound: settings.continuous_alert_sound ?? true,
    volume: settings.volume ?? 100,
    stop_sound_when: settings.stop_sound_when ?? "either",
    low_stock_alerts: settings.low_stock_alerts ?? true,
    out_of_stock_alerts: settings.out_of_stock_alerts ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success("Notification settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const testSound = () => {
    toast.success("Testing alert sound...");
    startAlert("test-sound", formData);
    if (!formData.continuous_alert_sound) {
      setTimeout(() => stopAlert("test-sound"), 3000);
    }
  };

  const stopTestSound = () => {
    stopAlert("test-sound");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink">Notification Preferences</h3>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={stopTestSound}>Stop</Button>
          <Button type="button" variant="secondary" onClick={testSound}>Test Sound</Button>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <h4 className="font-medium text-ink">New Order Alerts</h4>
          
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Enable Order Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive real-time alerts for new orders</p>
            </div>
            <Switch checked={formData.new_order_alerts} onCheckedChange={(v) => setFormData({...formData, new_order_alerts: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Popup Notifications</Label>
              <p className="text-sm text-muted-foreground">Show in-app visual popup notifications</p>
            </div>
            <Switch checked={formData.popup_notifications} onCheckedChange={(v) => setFormData({...formData, popup_notifications: v})} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E5E0D8]">
          <h4 className="font-medium text-ink">Audio Alerts</h4>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Enable Alert Sound</Label>
              <p className="text-sm text-muted-foreground">Play a sound when a new order arrives</p>
            </div>
            <Switch checked={formData.alert_sound} onCheckedChange={(v) => setFormData({...formData, alert_sound: v})} />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <Label className="text-base text-ink">Continuous Alert Sound</Label>
              <p className="text-sm text-muted-foreground">Loop the sound continuously until dismissed</p>
            </div>
            <Switch checked={formData.continuous_alert_sound} onCheckedChange={(v) => setFormData({...formData, continuous_alert_sound: v})} />
          </div>

          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50 space-y-4">
            <Label className="text-base text-ink block">Alert Volume ({formData.volume}%)</Label>
            <Slider 
              value={[formData.volume]} 
              onValueChange={([v]) => setFormData({...formData, volume: v})} 
              max={100} 
              step={1} 
              className="py-2"
            />
          </div>

          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50 space-y-3">
            <Label className="text-base text-ink block">Stop Sound When</Label>
            <RadioGroup 
              value={formData.stop_sound_when} 
              onValueChange={(v) => setFormData({...formData, stop_sound_when: v})}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accept" id="r-accept" />
                <Label htmlFor="r-accept">Admin clicks Accept</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dismiss" id="r-dismiss" />
                <Label htmlFor="r-dismiss">Admin clicks Dismiss</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="either" id="r-either" />
                <Label htmlFor="r-either">Admin clicks Either Accept or Dismiss</Label>
              </div>
            </RadioGroup>
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
