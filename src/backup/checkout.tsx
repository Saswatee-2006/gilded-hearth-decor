import { Link, useNavigate } from "react-router-dom";
import { Check, Lock, ShieldCheck, Plus, Trash2, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { PRODUCTS, formatINR, getProductPrice } from "@/lib/catalog";
import { saveOrder } from "@/lib/orders";
import { FREE_SHIPPING_THRESHOLD, useShop, type Order } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import {
  getAddresses,
  saveAddress,
  deleteAddress,
  updateAddress,
  type SavedAddress,
} from "@/lib/addresses";

const STEPS = ["Address", "Delivery", "Payment", "Confirmation"];

function CheckoutPage() {
  const { cartProducts, subtotal, placeOrder } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate("/auth?returnTo=/checkout", { replace: true });
    }
  }, [user, navigate]);

  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("upi");

  // Address States
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("manual");
  const [saveForFuture, setSaveForFuture] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [address, setAddress] = useState({
    name: "",
    mobile: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({ ...prev, email: user.email || "" }));
      getAddresses()
        .then((addresses) => {
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
          }
        })
        .catch(() => toast.error("Could not load saved addresses"))
        .finally(() => setLoadingAddresses(false));
    } else {
      setLoadingAddresses(false);
    }
  }, [user]);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99;
  const express = delivery === "express" ? 149 : 0;
  const total = subtotal + shipping + express;

  if (cartProducts.length === 0 && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Button className="mt-8" asChild>
          <Link to="/shop">Shop décor</Link>
        </Button>
      </div>
    );
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-6 w-6" />
        </span>
        <h1 className="mt-6 font-display text-4xl">Order confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order <span className="text-foreground">#{order.id}</span> · {formatINR(order.total)} ·
          paid via {payment.toUpperCase()}
        </p>
        <ul className="mt-8 space-y-2 text-left text-sm">
          {order.lines.map((l) => (
            <li key={l.name} className="flex justify-between border-b pb-2">
              <span>
                {l.name} × {l.qty}
              </span>
              <span>{formatINR(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center gap-3">
          <Button asChild>
            <Link to="/account">Track order</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/shop">Keep shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isManualValid =
    address.name.trim().length > 1 &&
    /^[6-9]\d{9}$/.test(address.mobile) &&
    address.email.includes("@") &&
    address.line1.trim().length > 3 &&
    address.city.trim().length > 1 &&
    address.state.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode);

  const canContinue = step !== 0 || selectedAddressId !== "manual" || isManualValid;

  const handleEditAddress = (addr: SavedAddress) => {
    setAddress({
      name: addr.full_name,
      mobile: addr.phone,
      email: user?.email || "",
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setSelectedAddressId("manual");
    setEditingAddressId(addr.id);
    setSaveForFuture(false);
  };

  const handleAddNew = () => {
    setAddress({
      name: "",
      mobile: "",
      email: user?.email || "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    });
    setSelectedAddressId("manual");
    setEditingAddressId(null);
    setSaveForFuture(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      setSavedAddresses(savedAddresses.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        const remaining = savedAddresses.filter((a) => a.id !== id);
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : "manual");
      }
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>

      <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 tracking-[0.18em] uppercase",
              i === step ? "text-accent" : i < step ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border text-[10px]">
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="rounded-md bg-card p-6 shadow-soft">
          {step === 0 && (
            <div className="space-y-8">
              {loadingAddresses ? (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Loading addresses...
                </div>
              ) : (
                <>
                  {savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="eyebrow text-foreground">Saved Addresses</h3>
                      <RadioGroup
                        value={selectedAddressId}
                        onValueChange={(val) => {
                          setSelectedAddressId(val);
                          setEditingAddressId(null);
                        }}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        {savedAddresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={cn(
                              "relative flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors",
                              selectedAddressId === addr.id
                                ? "border-accent bg-accent/5"
                                : "hover:bg-secondary/50",
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <RadioGroupItem
                                value={addr.id}
                                id={addr.id}
                                className="mt-1 sr-only"
                              />
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded-full border flex items-center justify-center",
                                    selectedAddressId === addr.id
                                      ? "border-accent"
                                      : "border-input",
                                  )}
                                >
                                  {selectedAddressId === addr.id && (
                                    <div className="h-2 w-2 rounded-full bg-accent" />
                                  )}
                                </div>
                                <span className="font-semibold text-sm">{addr.full_name}</span>
                              </div>
                              {addr.label && (
                                <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                  {addr.label}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground pl-6">
                              <p>{addr.line1}</p>
                              {addr.line2 && <p>{addr.line2}</p>}
                              <p>
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p className="mt-1">+91 {addr.phone}</p>
                            </div>

                            <div className="mt-3 flex gap-3 pl-6">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditAddress(addr);
                                }}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteAddress(addr.id);
                                }}
                                className="text-xs font-semibold text-destructive hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </label>
                        ))}
                      </RadioGroup>

                      {selectedAddressId !== "manual" && (
                        <Button variant="outline" className="mt-2" onClick={handleAddNew}>
                          <Plus className="mr-2 h-4 w-4" /> Add New Address
                        </Button>
                      )}
                    </div>
                  )}

                  {selectedAddressId === "manual" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="eyebrow text-foreground">
                          {editingAddressId ? "Edit Address" : "Enter a new address"}
                        </h3>
                        {savedAddresses.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAddressId(savedAddresses[0].id);
                              setEditingAddressId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {(
                          [
                            ["name", "Full Name", "text"],
                            ["mobile", "Mobile Number", "tel"],
                            ["email", "Email", "email"],
                            ["line1", "Address", "text"],
                            ["line2", "Apartment / House", "text"],
                            ["city", "City", "text"],
                            ["state", "State", "text"],
                            ["pincode", "Pincode", "text"],
                          ] as const
                        ).map(([key, label, type]) => (
                          <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                            <Label htmlFor={key} className="text-xs">
                              {label}
                            </Label>
                            <Input
                              id={key}
                              type={type}
                              value={address[key as keyof typeof address]}
                              maxLength={key === "pincode" ? 6 : key === "mobile" ? 10 : 120}
                              onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        ))}
                      </div>

                      {!editingAddressId && (
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id="save-address"
                            checked={saveForFuture}
                            onCheckedChange={(c) => setSaveForFuture(c as boolean)}
                          />
                          <label
                            htmlFor="save-address"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Save this address for future orders
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 1 && (
            <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-4">
              {[
                { id: "standard", label: "Standard delivery", note: "4–6 days", price: shipping },
                { id: "express", label: "Express delivery", note: "2–3 days", price: 149 },
              ].map((d) => (
                <label
                  key={d.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-4"
                >
                  <RadioGroupItem value={d.id} id={d.id} />
                  <span className="flex-1">
                    <span className="block text-sm">{d.label}</span>
                    <span className="block text-xs text-muted-foreground">{d.note}</span>
                  </span>
                  <span className="text-sm">{d.price === 0 ? "Free" : formatINR(d.price)}</span>
                </label>
              ))}
            </RadioGroup>
          )}

          {step === 2 && (
            <>
              <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
                {(
                  [
                    ["upi", "UPI — GPay, PhonePe, Paytm"],
                    ["credit", "Credit Card"],
                    ["debit", "Debit Card"],
                    ["netbanking", "Net Banking"],
                    ["cod", "Cash on Delivery"],
                  ] as const
                ).map(([id, label]) => (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-4 text-sm"
                  >
                    <RadioGroupItem value={id} id={id} />
                    {label}
                  </label>
                ))}
              </RadioGroup>
              <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> 256-bit encrypted · we never store card details
              </p>
            </>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            <Button
              disabled={!canContinue || saving || loadingAddresses}
              onClick={async () => {
                if (step === 0 && !canContinue) return;

                if (step === 0) {
                  if (selectedAddressId === "manual") {
                    if (editingAddressId && user) {
                      setSaving(true);
                      try {
                        const updated = await updateAddress(editingAddressId, {
                          full_name: address.name,
                          phone: address.mobile,
                          line1: address.line1,
                          line2: address.line2,
                          city: address.city,
                          state: address.state,
                          pincode: address.pincode,
                        });
                        setSavedAddresses((prev) =>
                          prev.map((a) => (a.id === updated.id ? updated : a)),
                        );
                        setSelectedAddressId(updated.id);
                        setEditingAddressId(null);
                      } catch {
                        toast.error("Failed to update address");
                        setSaving(false);
                        return;
                      }
                      setSaving(false);
                    } else if (saveForFuture && user) {
                      setSaving(true);
                      try {
                        const saved = await saveAddress(user.id, {
                          full_name: address.name,
                          phone: address.mobile,
                          line1: address.line1,
                          line2: address.line2,
                          city: address.city,
                          state: address.state,
                          pincode: address.pincode,
                        });
                        setSavedAddresses([saved, ...savedAddresses]);
                        setSelectedAddressId(saved.id);
                      } catch {
                        toast.error("Failed to save address");
                        setSaving(false);
                        return;
                      }
                      setSaving(false);
                    }
                  }
                  setStep((s) => s + 1);
                  return;
                }

                if (step < 2) {
                  setStep((s) => s + 1);
                  return;
                }

                setSaving(true);
                const lines = cartProducts.map(({ product, qty, size }) => ({
                  product,
                  qty,
                  size,
                }));

                let finalShippingAddress;
                if (selectedAddressId !== "manual") {
                  const sAddr = savedAddresses.find((a) => a.id === selectedAddressId)!;
                  finalShippingAddress = {
                    name: sAddr.full_name,
                    mobile: sAddr.phone,
                    email: user?.email || "customer@example.com",
                    line1: sAddr.line1,
                    line2: sAddr.line2 || "",
                    city: sAddr.city,
                    state: sAddr.state,
                    pincode: sAddr.pincode,
                  };
                } else {
                  finalShippingAddress = address;
                }

                const placed = placeOrder(total);
                if (user) {
                  try {
                    await saveOrder({
                      userId: user.id,
                      orderNumber: placed.id,
                      paymentMethod: payment,
                      deliveryMethod: delivery,
                      subtotal,
                      discount: 0,
                      shipping: shipping + express,
                      total,
                      address: finalShippingAddress,
                      lines,
                    });
                  } catch {
                    toast.error("Order placed, but we couldn't save it to your account.");
                  }
                }
                setSaving(false);
                setOrder(placed);
                setStep(3);
                toast.success("Order placed — confirmation sent to your email");
              }}
            >
              {step < 2 ? "Continue" : saving ? "Placing order…" : `Pay ${formatINR(total)}`}
            </Button>
          </div>
          {step === 0 && selectedAddressId === "manual" && !canContinue && (
            <p className="mt-3 text-xs text-muted-foreground">
              Please fill your name, a 10-digit mobile, email, address, city, state and 6-digit
              pincode.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-md bg-secondary/50 p-6">
          <p className="eyebrow">Your order</p>
          <ul className="mt-4 space-y-3 text-sm">
            {cartProducts.map(({ product, qty, size }) => (
              <li key={product.id + (size || "")} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {product.name} {size ? `(${size})` : ""} × {qty}
                </span>
                <span>{formatINR(getProductPrice(product, size) * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{shipping + express === 0 ? "Free" : formatINR(shipping + express)}</dd>
            </div>
            <div className="flex justify-between border-t pt-3">
              <dt>Total</dt>
              <dd className="font-display text-xl">{formatINR(total)}</dd>
            </div>
          </dl>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" /> Secure payments · easy 7-day returns
          </p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
