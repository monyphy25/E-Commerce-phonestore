"use client";

import { useState, useEffect } from "react";
import { Globe, Shield, DollarSign, Save, Check, X, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Store information
  const [storeName, setStoreName] = useState("PhoneStore");
  const [contactEmail, setContactEmail] = useState("admin@phonestore.com");
  const [phoneNumber, setPhoneNumber] = useState("+855 12 345 678");
  const [location, setLocation] = useState("Phnom Penh, Cambodia");

  // Payment settings
  const [enableKhqr, setEnableKhqr] = useState(true);
  const [enableCod, setEnableCod] = useState(true);

  // Security password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.settings) {
        setStoreName(data.settings.storeName || "PhoneStore");
        setContactEmail(data.settings.contactEmail || "admin@phonestore.com");
        setPhoneNumber(data.settings.phoneNumber || "+855 12 345 678");
        setLocation(data.settings.location || "Phnom Penh, Cambodia");
        setEnableKhqr(data.settings.enableKhqr ?? true);
        setEnableCod(data.settings.enableCod ?? true);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        storeName,
        contactEmail,
        phoneNumber,
        location,
        enableKhqr,
        enableCod,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      showToast("Store settings saved successfully!");
      if (password) {
        setPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully!");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 bg-white min-h-screen rounded-2xl">
        <Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-600" />
        <p className="text-sm">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl bg-white min-h-screen p-2 rounded-2xl">
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

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your store settings and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Globe size={18} className="text-blue-600" /> Store Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <DollarSign size={18} className="text-blue-600" /> Payment Settings
          </h2>
          <div className="space-y-3">
            <div
              onClick={() => setEnableKhqr(!enableKhqr)}
              className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Enable Bakong / KHQR</div>
                <div className="text-xs text-slate-500 mt-0.5">Accept KHQR QR Code payments at checkout</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${enableKhqr ? "bg-blue-600" : "bg-slate-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${enableKhqr ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>

            <div
              onClick={() => setEnableCod(!enableCod)}
              className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Enable Cash on Delivery</div>
                <div className="text-xs text-slate-500 mt-0.5">Allow customers to pay in cash upon receiving order</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${enableCod ? "bg-blue-600" : "bg-slate-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${enableCod ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Shield size={18} className="text-blue-600" /> Security & Admin Credentials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving Settings..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
