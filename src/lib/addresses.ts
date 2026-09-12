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

export async function getAddresses() {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SavedAddress[];
}

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

export async function saveAddress(userId: string, input: SaveAddressInput) {
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      label: input.label || "Home",
      full_name: input.full_name,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 || null,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      is_default: input.is_default || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SavedAddress;
}

export async function updateAddress(id: string, input: Partial<SaveAddressInput>) {
  const { data, error } = await supabase
    .from("addresses")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedAddress;
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  // First clear default for all addresses of this user
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  
  // Then set the selected one as default
  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .select()
    .single();

  if (error) throw error;
  return data as SavedAddress;
}
