import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/catalog";

export type ShippingAddress = {
  name: string;
  mobile: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type SaveOrderInput = {
  userId: string;
  orderNumber: string;
  paymentMethod: string;
  deliveryMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: ShippingAddress;
  lines: { product: Product; qty: number }[];
};

export async function saveOrder(input: SaveOrderInput) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      order_number: input.orderNumber,
      payment_method: input.paymentMethod,
      delivery_method: input.deliveryMethod,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      shipping_address: input.address,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.lines.map(({ product, qty }) => ({
      order_id: data.id,
      product_id: product.id,
      product_slug: product.slug,
      name: product.name,
      image_key: product.image,
      price: product.price,
      qty,
    })),
  );
  if (itemsError) throw itemsError;

  return data.id;
}
