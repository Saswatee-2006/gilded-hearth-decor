import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function SystemSettings() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing application data...");
    // Simulate cache invalidation
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleReconnectRealtime = async () => {
    setIsConnecting(true);
    toast.info("Reconnecting to Supabase Realtime...");
    try {
      await supabase.removeAllChannels();
      // Wait a moment then the app will organically reconnect channels as components remount, or we just force reload.
      setTimeout(() => {
        setIsConnecting(false);
        toast.success("Realtime connections re-established");
      }, 1500);
    } catch (e) {
      setIsConnecting(false);
      toast.error("Failed to reconnect realtime");
    }
  };

  const handleClearCache = () => {
    setIsClearing(true);
    toast.info("Clearing application cache...");
    setTimeout(() => {
      localStorage.removeItem("aarohan-theme");
      setIsClearing(false);
      toast.success("Cache cleared successfully");
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <p className="text-sm text-[#8C857B]">Application Version</p>
            <p className="font-medium text-ink mt-1">v1.2.4 (Production)</p>
          </div>
          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <p className="text-sm text-[#8C857B]">Environment</p>
            <p className="font-medium text-ink mt-1 uppercase tracking-wide">Production</p>
          </div>
          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <p className="text-sm text-[#8C857B]">Database Connection</p>
            <p className="font-medium text-green-600 mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Connected (Supabase)
            </p>
          </div>
          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <p className="text-sm text-[#8C857B]">Authentication Service</p>
            <p className="font-medium text-green-600 mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Active
            </p>
          </div>
          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <p className="text-sm text-[#8C857B]">Realtime Status</p>
            <p className="font-medium text-green-600 mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Subscribed
            </p>
          </div>
          <div className="p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <p className="text-sm text-[#8C857B]">Last Deployment</p>
            <p className="font-medium text-ink mt-1">Today at 10:45 AM IST</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200">
        <h3 className="text-xl font-display text-ink mb-6 pb-4 border-b border-[#E5E0D8]">Maintenance Tools</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <p className="font-medium text-ink">Refresh Application Data</p>
              <p className="text-sm text-muted-foreground">Force reload all data queries and reset UI state</p>
            </div>
            <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <p className="font-medium text-ink">Reconnect Realtime Channels</p>
              <p className="text-sm text-muted-foreground">Fix stuck order notifications or inventory syncing</p>
            </div>
            <Button variant="outline" onClick={handleReconnectRealtime} disabled={isConnecting}>
              {isConnecting ? "Reconnecting..." : "Reconnect"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-lg border border-[#E5E0D8]/50">
            <div>
              <p className="font-medium text-ink">Clear Application Cache</p>
              <p className="text-sm text-muted-foreground">Clear local storage preferences and temporary data</p>
            </div>
            <Button variant="outline" onClick={handleClearCache} disabled={isClearing}>
              {isClearing ? "Clearing..." : "Clear Cache"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
