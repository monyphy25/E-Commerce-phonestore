"use client";

import { useState, useRef } from "react";
import { ArrowLeft, ImagePlus, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BRANDS = ["Apple", "Samsung", "Google", "Xiaomi", "Oppo", "Vivo", "Accessories"];
const CATEGORIES = ["Flagship", "Beast Performance", "Beast Camera ", "Budget Friendly", "Power-Bank", "Cable", "Charger", "Headphones", "Case"];

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    brand: BRANDS[0],
    category: CATEGORIES[0],
    price: "",
    discountPrice: "",
    sku: "",
    stock: "",
    storage: "256GB",
    color: "",
    status: "In Stock",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.secure_url) {
        return data.secure_url;
      }
    } catch (err) {
      console.warn("Upload endpoint failed, falling back to base64 reader", err);
    }

    // Fallback: Read as Data URL directly in browser
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      showToast("Please fill in all required fields (*)", "error");
      return;
    }

    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      const payload = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        price: Number(form.price),
        discount_price: form.discountPrice ? Number(form.discountPrice) : null,
        sku: form.sku || `SKU-${Date.now().toString().slice(-4)}`,
        stock: Number(form.stock),
        storage: form.storage,
        color: form.color,
        status: form.status,
        image_url: imageUrl || imagePreview || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
        image: imageUrl || imagePreview || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product to Supabase");
      }

      showToast("Product created & saved to Supabase successfully!", "success");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      console.error("Submit error:", err);
      showToast(err.message || "Failed to create product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Notification Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 border ${toast.type === "success" ? "bg-emerald-950 border-emerald-500 text-emerald-200" : "bg-red-950 border-red-500 text-red-200"}`}>
          {toast.type === "success" ? <CheckCircle size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Product</h1>
          <p className="text-gray-400 text-sm mt-0.5">Create a new product and save permanently to database</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-white border-b border-gray-800 pb-4">Product Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. iPhone 16 Pro Max"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Brand *</label>
                  <select
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {BRANDS.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>


            </div>

            {/* Pricing & Stock */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-white border-b border-gray-800 pb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (USD) *</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="999.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discount Price (USD)</label>
                  <input
                    name="discountPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountPrice}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="899.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">SKU</label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g. IP16PM-256GB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity *</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-white border-b border-gray-800 pb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Storage</label>
                  <input
                    name="storage"
                    value={form.storage}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g. 256GB or 512GB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color (comma separated)</label>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g. Black, White, Blue"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Image Upload & Status */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white border-b border-gray-800 pb-4">Product Image</h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-blue-500/70 rounded-xl aspect-square flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-gray-950 overflow-hidden relative group"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img src={imagePreview} alt="preview" className="object-contain w-full h-full p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      Click to Change Image
                    </div>
                  </div>
                ) : (
                  <>
                    <ImagePlus size={36} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <div className="text-center px-4">
                      <p className="text-sm font-medium text-gray-300">Click to Select Image</p>
                      <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, WEBP</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">Images are processed & stored automatically</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white border-b border-gray-800 pb-4">Status</h2>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving to Supabase..." : "Save Product"}
            </button>
            <Link
              href="/admin/products"
              className="block w-full text-center py-3 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 rounded-xl transition-colors text-sm"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
