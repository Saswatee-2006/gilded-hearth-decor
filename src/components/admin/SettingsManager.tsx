import React, { useState } from "react";
import { useSettings } from "@/lib/settings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { StoreSettings } from "./settings/StoreSettings";
import { ActivityLogs } from "./settings/ActivityLogs";
import { InventorySettings } from "./settings/InventorySettings";
import { CustomerSettings } from "./settings/CustomerSettings";
import { OrderSettings } from "./settings/OrderSettings";
import { AdminStaffSettings } from "./settings/AdminStaffSettings";
import { SecuritySettings } from "./settings/SecuritySettings";
import { AuthSettings } from "./settings/AuthSettings";
import { PaymentSettings } from "./settings/PaymentSettings";
import { ShippingSettings } from "./settings/ShippingSettings";
import { TaxSettings } from "./settings/TaxSettings";
import { EmailSettings } from "./settings/EmailSettings";
import { StorefrontSettings } from "./settings/StorefrontSettings";
import { SystemSettings } from "./settings/SystemSettings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Store",
  "Notifications",
  "Orders",
  "Inventory",
  "Customers",
  "Admin & Staff",
  "Security",
  "Authentication",
  "Payments",
  "Shipping",
  "Tax & Pricing",
  "Email",
  "Storefront",
  "Activity Logs",
  "System"
];

export function SettingsManager() {
  const [activeCategory, setActiveCategory] = useState("Store");
  const { settings, updateSetting, isLoading } = useSettings();

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading settings...</div>;
  }

  const renderContent = () => {
    switch (activeCategory) {
      case "Store":
        return <StoreSettings settings={settings.store} onSave={(data) => updateSetting("store", data)} />;
      case "Notifications":
        return <NotificationSettings settings={settings.notifications} onSave={(data) => updateSetting("notifications", data)} />;
      case "Inventory":
        return <InventorySettings settings={settings.inventory} onSave={(data) => updateSetting("inventory", data)} />;
      case "Customers":
        return <CustomerSettings settings={settings.customers} onSave={(data) => updateSetting("customers", data)} />;
      case "Orders":
        return <OrderSettings settings={settings.orders} onSave={(data) => updateSetting("orders", data)} />;
      case "Admin & Staff":
        return <AdminStaffSettings />;
      case "Security":
        return <SecuritySettings settings={settings.security} onSave={(data) => updateSetting("security", data)} />;
      case "Authentication":
        return <AuthSettings settings={settings.authentication} onSave={(data) => updateSetting("authentication", data)} />;
      case "Payments":
        return <PaymentSettings settings={settings.payments} onSave={(data) => updateSetting("payments", data)} />;
      case "Shipping":
        return <ShippingSettings settings={settings.shipping} onSave={(data) => updateSetting("shipping", data)} />;
      case "Tax & Pricing":
        return <TaxSettings settings={settings.tax} onSave={(data) => updateSetting("tax", data)} />;
      case "Email":
        return <EmailSettings settings={settings.email} onSave={(data) => updateSetting("email", data)} />;
      case "Storefront":
        return <StorefrontSettings settings={settings.storefront} onSave={(data) => updateSetting("storefront", data)} />;
      case "System":
        return <SystemSettings />;
      case "Activity Logs":
        return <ActivityLogs />;
      default:
        return (
          <div className="p-8 text-center bg-white rounded-xl border border-[#E5E0D8]">
            <h3 className="text-lg font-medium text-ink">{activeCategory} Settings</h3>
            <p className="text-muted-foreground mt-2">Configuration options for {activeCategory.toLowerCase()} will appear here.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto h-full">
      {/* Left Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="font-display text-2xl mb-6 text-ink px-2">Settings</h2>
        <div className="flex overflow-x-auto md:flex-col gap-1 pb-4 md:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "justify-start whitespace-nowrap h-10 px-4 transition-colors font-medium rounded-lg text-sm",
                activeCategory === cat
                  ? "bg-white text-ink shadow-sm border border-[#E5E0D8]"
                  : "text-[#6B655C] hover:text-ink hover:bg-white/50"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 pb-20 md:pb-0">
        {renderContent()}
      </div>
    </div>
  );
}
