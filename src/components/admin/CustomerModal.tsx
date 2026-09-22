import { X, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/catalog";

type CustomerModalProps = {
  customer: any;
  onClose: () => void;
  onViewOrder: (id: string) => void;
};

export function CustomerModal({ customer, onClose, onViewOrder }: CustomerModalProps) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-[99990] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-[#E5E0D8] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E0D8] bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F2EFE9] rounded-lg">
              <User className="h-5 w-5 text-[#8C857B]" />
            </div>
            <div>
              <h2 className="font-display text-xl text-ink">Customer Details</h2>
              <p className="text-sm text-[#8C857B] mt-0.5">{customer.full_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#8C857B] hover:text-ink hover:bg-[#F2EFE9] rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 text-ink">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
            
            {/* Left Column - Details */}
            <div className="space-y-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B] mb-4">Customer Information</h3>
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8C857B] mb-1">Full Name</span>
                    <span className="font-medium">{customer.full_name || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8C857B] mb-1">Email</span>
                    <span>{customer.email || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#8C857B] mb-1">Phone Number</span>
                    <span>{customer.phone || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-[#E5E0D8]">
                    <span className="text-xs text-[#8C857B] mb-1">Account Status</span>
                    <span className="font-semibold text-ink">{customer.status || 'Active'}</span>
                  </div>
                  <div className="flex flex-col pt-2 border-t border-[#E5E0D8]">
                    <span className="text-xs text-[#8C857B] mb-1">Account Created</span>
                    <span className="text-sm">{new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              {customer.shipping_address && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B] mb-4">Last Shipping Address</h3>
                  <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3 shadow-sm">
                    <p className="font-medium text-ink">{customer.shipping_address.name}</p>
                    <p className="text-sm text-[#6B655C]">{customer.shipping_address.address}</p>
                    <p className="text-sm text-[#6B655C]">
                      {customer.shipping_address.city}, {customer.shipping_address.state} {customer.shipping_address.pincode}
                    </p>
                    {customer.shipping_address.phone && <p className="text-sm text-[#6B655C] pt-2">Ph: {customer.shipping_address.phone}</p>}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B] mb-4">Totals</h3>
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-5 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8C857B]">Total Orders</span>
                    <span className="font-semibold text-lg">{customer.orders_count}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E5E0D8] pt-3 mt-3">
                    <span className="text-sm font-medium text-[#8C857B]">Total Amount Spent</span>
                    <span className="font-bold text-xl">{formatINR(customer.total_spent)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E5E0D8] pt-3 mt-3">
                    <span className="text-sm font-medium text-[#8C857B]">Avg Order Value</span>
                    <span className="font-bold text-lg text-ink">
                      {customer.orders_count > 0 ? formatINR(customer.total_spent / customer.orders_count) : formatINR(0)}
                    </span>
                  </div>
                  {customer.orders.length > 0 && (
                    <>
                      <div className="flex justify-between items-center border-t border-[#E5E0D8] pt-3 mt-3">
                        <span className="text-sm font-medium text-[#8C857B]">Most Recent Order</span>
                        <span className="text-sm text-ink">{new Date(customer.orders[0].created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-[#E5E0D8] pt-3 mt-3">
                        <span className="text-sm font-medium text-[#8C857B]">First Order</span>
                        <span className="text-sm text-ink">{new Date(customer.orders[customer.orders.length - 1].created_at).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order History */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-4 w-4 text-[#8C857B]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8C857B]">Order History</h3>
              </div>
              
              <div className="bg-white border border-[#E5E0D8] rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#FDFBF7] text-[#8C857B] text-xs uppercase border-b border-[#E5E0D8]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Order ID</th>
                      <th className="px-5 py-3 font-medium">Date/Time</th>
                      <th className="px-5 py-3 font-medium">Amount</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium hidden sm:table-cell">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {customer.orders.map((order: any) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-[#F9F7F1] transition-colors cursor-pointer"
                        onClick={() => onViewOrder(order.id)}
                      >
                        <td className="px-5 py-4 font-medium text-ink">#{order.order_number || order.id.split('-')[0]}</td>
                        <td className="px-5 py-4 text-[#6B655C]">
                          {new Date(order.created_at).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-5 py-4 font-semibold text-ink">{formatINR(order.total)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${
                              order.status === "placed" ? "bg-blue-100 text-blue-700" :
                              order.status === "processing" ? "bg-amber-100 text-amber-700" :
                              order.status === "delivered" ? "bg-green-100 text-green-700" :
                              order.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#6B655C] hidden sm:table-cell">
                          {order.payment_method === 'cod' ? 'COD' : order.payment_method || 'Prepaid'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
