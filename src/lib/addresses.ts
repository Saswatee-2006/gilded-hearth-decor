import { supabase } from "@/integrations/supabase/client";

export type SavedAddress = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type SaveAddressInput = {
  label?: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
};

export async function getAddresses() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
  return data as SavedAddress[];
}

export async function saveAddress(userId: string, input: SaveAddressInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) throw new Error("Unauthorized");

  if (input.is_default) {
    // Clear other default addresses
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert([{
      user_id: user.id,
      label: input.label || "Home",
      full_name: input.full_name,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || "",
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      is_default: input.is_default || false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as SavedAddress;
}

export async function updateAddress(id: string, input: Partial<SaveAddressInput>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (input.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedAddress;
}

export async function deleteAddress(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) throw new Error("Unauthorized");

  // Remove default from all
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  // Set default to specified
  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedAddress;
}
