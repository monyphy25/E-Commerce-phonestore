"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Check, X, Loader2, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number | string;
  expires: string;
  status: "Active" | "Expired" | "Inactive";
}

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // New coupon form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState<number | "">(10);
  const [minOrder, setMinOrder] = useState<number | "">(100);
  const [expires, setExpires] = useState("2026-12-31");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/discounts");
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Failed to load discounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      showToast("Coupon code and value are required", "error");
      return;
    }
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, type, value, minOrder, expires }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setCoupons((prev) => [data.coupon, ...prev]);
      setCreateModal(false);
      setCode("");
      setValue(10);
      showToast(`Coupon "${code.toUpperCase()}" created successfully!`);
    } catch (err: any) {
      showToast(err.message || "Failed to create coupon", "error");
    }
  };

  const handleToggleStatus = async (c: Coupon) => {
    const newStatus = c.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch("/api/discounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setCoupons((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: newStatus as any } : item))
      );
      showToast(`Coupon status changed to ${newStatus}`);
    } catch (err: any) {
      showToast(err.message || "Failed to update coupon status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/discounts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast("Coupon deleted successfully");
    } catch (err: any) {
      showToast(err.message || "Failed to delete coupon", "error");
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-screen p-2 rounded-2xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 border ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-red-600 text-white border-red-500"
          }`}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />} {toast.msg}
        </div>
      )}

      {/* Create Coupon Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">Create New Coupon</h3>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 uppercase font-mono px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Min Order ($)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Discounts & Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">Manage store promotional codes and coupons</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh coupons"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <th className="text-left px-6 py-4">Code</th>
                <th className="text-left px-6 py-4">Type</th>
                <th className="text-left px-6 py-4">Value</th>
                <th className="text-left px-6 py-4">Min Order</th>
                <th className="text-left px-6 py-4">Expires</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                    Loading discount coupons...
                  </td>
                </tr>
              ) : coupons.length > 0 ? (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={15} className="text-blue-600" />
                        <span className="font-mono font-bold text-slate-900">{c.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-semibold">{c.type}</td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">
                      {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `$${c.value} OFF`}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {typeof c.minOrder === "number" ? `$${c.minOrder}` : c.minOrder}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">{c.expires}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase transition-colors flex items-center gap-1.5 ${
                          c.status === "Active"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                            : "text-slate-500 bg-slate-100 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {c.status === "Active" ? <ToggleRight size={14} className="text-emerald-600" /> : <ToggleLeft size={14} />}
                        {c.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No discount coupons found. Click <span className="text-blue-600 font-semibold">"Create Coupon"</span> to create one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
