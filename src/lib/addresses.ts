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

function getLocalAddresses(): SavedAddress[] {
  const data = localStorage.getItem("mock_addresses");
  return data ? JSON.parse(data) : [];
}

function setLocalAddresses(addrs: SavedAddress[]) {
  localStorage.setItem("mock_addresses", JSON.stringify(addrs));
}

export async function getAddresses() {
  const addrs = getLocalAddresses();
  return addrs.sort((a, b) => (a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1));
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
  const addrs = getLocalAddresses();
  if (input.is_default) {
    addrs.forEach((a) => (a.is_default = false));
  }
  const newAddr: SavedAddress = {
    id: "addr_" + Math.random().toString(36).substr(2, 9),
    user_id: userId,
    label: input.label || "Home",
    full_name: input.full_name,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2 || "",
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    is_default: input.is_default || false,
  };
  addrs.push(newAddr);
  setLocalAddresses(addrs);
  return newAddr;
}

export async function updateAddress(id: string, input: Partial<SaveAddressInput>) {
  const addrs = getLocalAddresses();
  const idx = addrs.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Address not found");

  if (input.is_default) {
    addrs.forEach((a) => (a.is_default = false));
  }
  
  addrs[idx] = { ...addrs[idx], ...input };
  setLocalAddresses(addrs);
  return addrs[idx];
}

export async function deleteAddress(id: string) {
  const addrs = getLocalAddresses();
  const filtered = addrs.filter((a) => a.id !== id);
  setLocalAddresses(filtered);
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const addrs = getLocalAddresses();
  let updated: SavedAddress | null = null;
  addrs.forEach((a) => {
    if (a.user_id === userId) {
      a.is_default = a.id === addressId;
      if (a.id === addressId) updated = a;
    }
  });
  setLocalAddresses(addrs);
  if (!updated) throw new Error("Address not found");
  return updated;
}
