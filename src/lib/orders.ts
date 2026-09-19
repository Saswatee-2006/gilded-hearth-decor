import type { Product } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

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
  // Insert into orders table
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: input.orderNumber,
      user_id: input.userId,
      payment_method: input.paymentMethod,
      delivery_method: input.deliveryMethod,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      shipping_address: input.address,
      status: "placed"
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  // Insert items
  const items = input.lines.map(({ product, qty }) => ({
    order_id: orderData.id,
    product_id: product.id || null, // in case products table is not populated yet
    name: product.name,
    image_key: product.image,
    price: product.price,
    qty,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) throw itemsError;

  return orderData.id;
}
