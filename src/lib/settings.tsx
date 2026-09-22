import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type AdminSettings = {
  store: any;
  notifications: any;
  orders: any;
  inventory: any;
  customers: any;
  authentication: any;
  payments: any;
  shipping: any;
  tax: any;
  email: any;
  storefront: any;
  security: any;
  system: any;
};

const DEFAULT_SETTINGS: AdminSettings = {
  store: { name: "Aarohan Decor Atelier", currency: "INR", timezone: "Asia/Kolkata", status: "open" },
  notifications: { new_order_alerts: true, browser_notifications: false, popup_notifications: true, alert_sound: true, continuous_alert_sound: true, volume: 100, stop_sound_when: "either", low_stock_alerts: true, out_of_stock_alerts: true },
  orders: { default_status: "placed", auto_refresh: true, allow_cancellation: true },
  inventory: { low_stock_threshold: 5, out_of_stock_threshold: 0, auto_deduction: true, allow_negative: false, allow_overselling: false },
  customers: { registration: true, email_verification: true },
  authentication: { email_password: true, google: true, forgot_password: true },
  payments: { online: true, cod: true },
  shipping: { free_shipping_threshold: 999 },
  tax: { prices_include_tax: true },
  email: { order_confirmation: true },
  storefront: { maintenance_mode: false },
  security: { session_timeout: 60, account_lockout: true },
  system: { maintenance_active: false },
};

type SettingsContextType = {
  settings: AdminSettings;
  isLoading: boolean;
  updateSetting: (category: keyof AdminSettings, newSettings: any) => Promise<void>;
  logActivity: (action: string, entityType: string, entityId?: string, details?: any) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_settings").select("category, settings");
      if (error) {
        console.error("Error fetching settings:", error);
        return DEFAULT_SETTINGS;
      }

      const mergedSettings = { ...DEFAULT_SETTINGS };
      if (data) {
        data.forEach((row) => {
          if (row.category in mergedSettings) {
            mergedSettings[row.category as keyof AdminSettings] = {
              ...mergedSettings[row.category as keyof AdminSettings],
              ...row.settings,
            };
          }
        });
      }
      return mergedSettings;
    },
  });

  const settings = settingsData || DEFAULT_SETTINGS;

  const updateMutation = useMutation({
    mutationFn: async ({ category, newSettings }: { category: keyof AdminSettings; newSettings: any }) => {
      if (!isAdmin || !user) throw new Error("Unauthorized");
      
      const { error } = await supabase
        .from("admin_settings")
        .upsert(
          { category, settings: newSettings, updated_by: user.id, updated_at: new Date().toISOString() },
          { onConflict: "category" }
        );
      
      if (error) throw error;
      
      // Also log this change
      await supabase.from("activity_logs").insert({
        admin_id: user.id,
        action: "updated_settings",
        entity_type: "settings",
        entity_id: category,
        details: newSettings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  const updateSetting = async (category: keyof AdminSettings, newSettings: any) => {
    await updateMutation.mutateAsync({ category, newSettings });
  };

  const logActivity = async (action: string, entityType: string, entityId?: string, details?: any) => {
    if (!isAdmin || !user) return;
    try {
      await supabase.from("activity_logs").insert({
        admin_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {}
      });
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSetting, logActivity }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
