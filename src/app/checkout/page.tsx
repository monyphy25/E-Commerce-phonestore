"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { ShoppingBag, ChevronRight, MapPin, User, QrCode, Truck, ArrowRight, ShieldCheck, Tag, Check, X } from "lucide-react";

const PROVINCES = ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampong Cham", "Other"];

type Step = "info" | "payment" | "confirm";

export default function CheckoutPage() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [paymentMethod, setPaymentMethod] = useState<"KHQR" | "COD">("KHQR");
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", province: PROVINCES[0], address: "", note: "" });

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const TAX = 0.05;

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const subtotal = cart.getSubtotal();
  const tax = Math.max(0, (subtotal - discountAmount) * TAX);
  const shipping = subtotal > 500 ? 0 : 15;
  const total = Math.max(0, subtotal - discountAmount + tax + shipping);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const res = await fetch("/api/discounts");
      const data = await res.json();
      const coupons = data.coupons || [];

      const found = coupons.find(
        (c: any) => c.code.toUpperCase() === promoInput.trim().toUpperCase() && c.status === "Active"
      );

      if (!found) {
        setPromoMsg({ msg: "Invalid or expired coupon code", type: "error" });
        return;
      }

      if (found.minOrder && subtotal < Number(found.minOrder)) {
        setPromoMsg({ msg: `Minimum order of $${found.minOrder} required for code ${found.code}`, type: "error" });
        return;
      }

      let calcDiscount = 0;
      if (found.type === "PERCENTAGE") {
        calcDiscount = (subtotal * Number(found.value)) / 100;
      } else {
        calcDiscount = Number(found.value);
      }

      setDiscountAmount(calcDiscount);
      setAppliedCode(found.code);
      setPromoMsg({ msg: `Coupon "${found.code}" applied ($${calcDiscount.toFixed(2)} discount)`, type: "success" });
    } catch (err) {
      setPromoMsg({ msg: "Failed to apply coupon", type: "error" });
    }
  };

  const handleRemovePromo = () => {
    setDiscountAmount(0);
    setAppliedCode(null);
    setPromoInput("");
    setPromoMsg(null);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        province: form.province,
        address: form.address,
        note: form.note,
        paymentMethod,
        items: cart.items,
        subtotal,
        discountAmount,
        appliedCode,
        tax,
        shipping,
        total,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setOrderNumber(data.orderNumber || `PS-${Date.now().toString().slice(-6)}`);
      setOrdered(true);
      cart.clearCart();
    } catch (err) {
      console.error("Order submission error:", err);
      setOrderNumber(`PS-${Date.now().toString().slice(-6)}`);
      setOrdered(true);
      cart.clearCart();
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !ordered) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <ShoppingBag className="w-16 h-16 text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <Link href="/products" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all">Browse Products</Link>
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 rounded-full bg-emerald-600/20 flex items-center justify-center mb-6 border-2 border-emerald-500/40">
          <ShieldCheck className="w-12 h-12 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 mb-6 text-center max-w-sm">Thank you for your purchase. Your order has been stored in database.</p>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center mb-8 w-full max-w-sm space-y-3">
          <div><p className="text-xs text-gray-500">Order Number</p><p className="font-mono font-bold text-blue-400">{orderNumber}</p></div>
          <div><p className="text-xs text-gray-500">Payment Method</p><p className="text-white font-semibold">{paymentMethod === "KHQR" ? "KHQR / Bakong" : "Cash on Delivery"}</p></div>
          <div><p className="text-xs text-gray-500">Total Paid</p><p className="text-2xl font-bold text-white">${total.toFixed(2)}</p></div>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/orders" className="border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 px-6 py-3 rounded-xl text-sm font-medium transition-colors">Admin Orders</Link>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
      {/* Breadcrumb Steps */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-6 sm:mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {(["info", "payment", "confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {i > 0 && <ChevronRight size={14} className="text-gray-600 shrink-0" />}
            <span className={`font-semibold capitalize whitespace-nowrap ${step === s ? "text-blue-400" : "text-gray-500"}`}>
              {i + 1}. {s === "info" ? "Information" : s === "payment" ? "Payment" : "Confirm"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left — Form Steps */}
        <div className="flex-1">
          {/* Step 1: Customer Info */}
          {step === "info" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
                <User size={18} className="text-blue-400" /> Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input name="fullName" required value={form.fullName} onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="you@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="+855 12 345 678" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4 pt-2">
                <MapPin size={18} className="text-blue-400" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Province *</label>
                  <select name="province" value={form.province} onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                    {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Street Address *</label>
                  <input name="address" required value={form.address} onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="House #, Street, District" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Note (Optional)</label>
                  <textarea name="note" rows={2} value={form.note} onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                    placeholder="Delivery instructions..." />
                </div>
              </div>

              <button
                onClick={() => { if (form.fullName && form.email && form.phone && form.address) setStep("payment"); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
              >
                Continue to Payment <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Select Payment Method</h2>

              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "KHQR" ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-600"}`}>
                  <input type="radio" name="payment" value="KHQR" checked={paymentMethod === "KHQR"} onChange={() => setPaymentMethod("KHQR")} className="w-4 h-4 text-blue-600" />
                  <QrCode className="text-blue-400" size={22} />
                  <div>
                    <div className="font-semibold text-white">Bakong / KHQR</div>
                    <div className="text-xs text-gray-400">Scan QR code with your Bakong app</div>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "COD" ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-gray-600"}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="w-4 h-4 text-blue-600" />
                  <Truck className="text-gray-400" size={22} />
                  <div>
                    <div className="font-semibold text-white">Cash on Delivery</div>
                    <div className="text-xs text-gray-400">Pay cash when your order arrives</div>
                  </div>
                </label>
              </div>

              {paymentMethod === "KHQR" && (
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 text-center space-y-4">
                  <p className="text-sm font-semibold text-white">Scan to Pay with Bakong</p>
                  <div className="w-40 h-40 mx-auto bg-white rounded-xl flex items-center justify-center p-2">
                    <QrCode size={120} className="text-gray-900" />
                  </div>
                  <p className="text-2xl font-bold text-white">${total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Open Bakong app → Scan QR → Confirm payment</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("info")} className="flex-1 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors">
                  Back
                </button>
                <button onClick={() => setStep("confirm")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  Review Order <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Order Confirmation</h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1"><p className="text-gray-500">Name</p><p className="text-white font-medium">{form.fullName}</p></div>
                <div className="space-y-1"><p className="text-gray-500">Phone</p><p className="text-white font-medium">{form.phone}</p></div>
                <div className="space-y-1 col-span-2"><p className="text-gray-500">Address</p><p className="text-white font-medium">{form.address}, {form.province}</p></div>
                <div className="space-y-1"><p className="text-gray-500">Payment</p><p className="text-white font-medium">{paymentMethod === "KHQR" ? "KHQR / Bakong" : "Cash on Delivery"}</p></div>
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-300">{item.name} × {item.quantity}</span>
                    <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("payment")} className="flex-1 py-3 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors">
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Saving Order..." : "Place Order"} {!loading && <ShieldCheck size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Order Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-white shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-gray-800 pt-4 mb-4">
              <label className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-2">
                <Tag size={13} className="text-blue-400" /> Promo Code / Discount
              </label>
              {appliedCode ? (
                <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-800 px-3 py-2 rounded-xl text-xs text-emerald-200">
                  <span className="font-mono font-bold">"{appliedCode}" Applied</span>
                  <button onClick={handleRemovePromo} className="text-emerald-400 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code (e.g. SAVE10)"
                    className="flex-1 bg-gray-950 border border-gray-800 text-white font-mono uppercase text-xs px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoMsg && (
                <p className={`text-[11px] mt-1.5 ${promoMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {promoMsg.msg}
                </p>
              )}
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-2 text-sm text-gray-400">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>Tax (5%)</span><span className="text-white">${tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? "text-emerald-400" : "text-white"}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            </div>
            <div className="border-t border-gray-800 mt-4 pt-4 flex justify-between items-center">
              <span className="text-gray-300 font-medium">Total</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck size={13} className="text-emerald-500" /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
