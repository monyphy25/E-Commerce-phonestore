"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const TAX_RATE = 0.05;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = cart.getSubtotal();
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal > 0 ? (subtotal > 500 ? 0 : 15) : 0;
  const total = subtotal + tax + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-white">
        <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-11 h-11 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 text-center max-w-sm text-sm leading-relaxed">
          Looks like you haven&apos;t added any premium smartphones or accessories to your cart yet.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all text-sm shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
        <p className="text-sm text-slate-500 mb-8">{cart.getTotalItems()} item{cart.getTotalItems() !== 1 ? "s" : ""} in your cart</p>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-row items-center gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl relative group shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 p-2 flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-blue-600 font-bold uppercase tracking-widest">{item.brand}</div>
                      <h3 className="text-sm sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1">{item.name}</h3>
                    </div>

                    <button
                      onClick={() => cart.removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-3 my-1.5 text-xs text-slate-500 font-medium">
                    {item.storage && <span>Storage: <span className="text-slate-700">{item.storage}</span></span>}
                    {item.color && <span>Color: <span className="text-slate-700">{item.color}</span></span>}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <div className="text-base sm:text-xl font-extrabold text-slate-900">${item.price.toLocaleString()}</div>

                    {/* Quantity */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 border border-slate-200 rounded-full p-1">
                      <button
                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-500 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="w-5 sm:w-6 text-center font-semibold text-xs sm:text-sm text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white text-slate-500 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 sticky top-24 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.getTotalItems()} items)</span>
                  <span className="font-semibold text-slate-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (5%)</span>
                  <span className="font-semibold text-slate-900">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 mb-7 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Total</span>
                <span className="text-3xl font-bold text-slate-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-4 group shadow-sm"
              >
                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure Checkout powered by Bakong</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
