import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/catalog";

type OrderModalProps = {
  orderId: string;
  onClose: () => void;
  onAccept: (id: string) => void;
};

export function OrderModal({ orderId, onClose, onAccept }: OrderModalProps) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#FDFBF7] p-8 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#8C857B] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-ink font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#FDFBF7] p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-[#E5E0D8]">
          <h2 className="text-red-700 font-display text-xl mb-4">Error</h2>
          <p className="text-ink mb-6">Could not load order details.</p>
          <Button onClick={onClose} variant="outline" className="w-full text-ink border-[#E5E0D8] hover:bg-[#F2EFE9]">Close</Button>
        </div>
      </div>
    );
  }

  const { shipping_address: addr, order_items = [] } = order;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#E5E0D8] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E0D8] bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F2EFE9] rounded-lg">
              <Package className="h-5 w-5 text-[#8C857B]" />
            </div>
            <div>
              <h2 className="font-display text-xl text-ink">Order #{order.order_number}</h2>
              <p className="text-sm text-[#8C857B] mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#8C857B] hover:text-ink hover:bg-[#F2EFE9] rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 text-ink">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B] mb-4">Customer Information</h3>
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8C857B] mb-1">Full Name</span>
                    <span className="font-medium">{addr?.name || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8C857B] mb-1">Email</span>
                    <span>{addr?.email || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8C857B] mb-1">Phone Number</span>
                    <span>{addr?.phone || "Unknown"}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B] mb-4">Order Information</h3>
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8C857B]">Order Status</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-gray-100 text-gray-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8C857B]">Payment Status</span>
                    <span className="text-sm font-medium">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method || 'Prepaid'}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E5E0D8] pt-3 mt-3">
                    <span className="text-sm font-medium text-[#8C857B]">Total Amount</span>
                    <span className="font-bold text-lg">{formatINR(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B] mb-1">Order Items ({order_items.length})</h3>
              
              <div className="space-y-4">
                {order_items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white border border-[#E5E0D8] rounded-xl shadow-sm">
                    {/* Image */}
                    <div className="w-20 h-20 bg-[#F9F8F6] rounded-lg border border-[#E5E0D8] overflow-hidden flex-shrink-0">
                      {item.image_key ? (
                        <img 
                          src={`${supabase.storage.from("products").getPublicUrl(item.image_key).data.publicUrl}`} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-[#8C857B]/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-medium text-ink line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-[#8C857B] mt-1 line-clamp-1">
                        {item.variant !== 'Default' ? `Variant: ${item.variant}` : 'Standard'}
                        <span className="mx-2">•</span> 
                        ID: {item.product_id?.split('-')[0] || 'N/A'}
                      </p>
                      
                      <div className="flex justify-between items-end mt-3">
                        <div className="text-sm">
                          <span className="text-[#8C857B]">{item.qty} × </span>
                          <span className="font-medium">{formatINR(item.price)}</span>
                        </div>
                        <div className="font-semibold">
                          {formatINR(item.price * item.qty)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3 shadow-sm mt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8C857B]">Subtotal</span>
                  <span className="font-medium">{formatINR(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8C857B]">Shipping</span>
                  <span className="font-medium">{order.shipping > 0 ? formatINR(order.shipping) : 'Free'}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount</span>
                    <span className="font-medium">-{formatINR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-[#E5E0D8] pt-3 mt-3">
                  <span className="font-medium text-ink">Final Total</span>
                  <span className="font-bold text-xl">{formatINR(order.total || 0)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E5E0D8] bg-[#FDFBF7] flex justify-end gap-3 rounded-b-2xl">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="bg-[#F2EFE9] text-ink hover:bg-[#EAE5DE] px-6 h-10 shadow-none border-0"
          >
            Dismiss
          </Button>
          {order.status === 'placed' && (
            <Button 
              onClick={() => onAccept(order.id)}
              className="bg-[#8C857B] hover:bg-[#7A746B] text-white px-8 h-10 shadow-sm"
            >
              Accept Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
