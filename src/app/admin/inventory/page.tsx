"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, XCircle, RefreshCw, Loader2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductInventory {
  id: string | number;
  name: string;
  sku?: string;
  brand?: string;
  stock: number;
  threshold?: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  price: number;
}

const STATUS_STYLE: Record<string, string> = {
  "In Stock": "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Low Stock": "text-amber-700 bg-amber-50 border-amber-200",
  "Out of Stock": "text-red-700 bg-red-50 border-red-200",
};

const ITEMS_PER_PAGE = 8;

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        const mapped = data.products.map((p: any) => {
          const stockCount = typeof p.stock === "number" ? p.stock : 12;
          let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
          if (stockCount === 0) status = "Out of Stock";
          else if (stockCount <= 5) status = "Low Stock";

          return {
            id: p.id,
            name: p.name,
            sku: p.sku || `SKU-${String(p.id).slice(-4)}`,
            brand: p.brand || "Smartphones",
            stock: stockCount,
            threshold: 5,
            status,
            price: p.price,
          };
        });
        setInventory(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch inventory products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Reset pagination to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestock = async (id: string | number) => {
    const item = inventory.find((i) => String(i.id) === String(id));
    if (!item) return;

    const newStock = item.stock + 5;
    let newStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (newStock === 0) newStatus = "Out of Stock";
    else if (newStock <= 5) newStatus = "Low Stock";

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          sku: item.sku,
          brand: item.brand,
          price: item.price,
          stock: newStock,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update stock");

      setInventory((prev) =>
        prev.map((i) => (String(i.id) === String(id) ? { ...i, stock: newStock, status: newStatus } : i))
      );
      showToast("Restocked +5 units successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to restock");
    }
  };

  const inStock = inventory.filter((p) => p.status === "In Stock").length;
  const lowStock = inventory.filter((p) => p.status === "Low Stock").length;
  const outOfStock = inventory.filter((p) => p.status === "Out of Stock").length;

  const filtered = inventory.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  // 8 Products Per Page Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInventory = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 bg-white min-h-screen p-2 rounded-2xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real stock levels matched with live store products ({inventory.length} total)
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors w-fit flex items-center gap-2 text-xs font-semibold shadow-sm"
          title="Refresh inventory"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Stock
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Package className="text-emerald-600" size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{inStock}</div>
            <div className="text-sm font-medium text-slate-500">In Stock</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-amber-600" size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{lowStock}</div>
            <div className="text-sm font-medium text-slate-500">Low Stock (&le; 5)</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <XCircle className="text-red-600" size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{outOfStock}</div>
            <div className="text-sm font-medium text-slate-500">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search inventory by product name, brand, or SKU..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                <th className="text-left px-6 py-4">Product Name</th>
                <th className="text-left px-6 py-4">SKU</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Stock Count</th>
                <th className="text-left px-6 py-4">Level</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
                    Loading real store inventory...
                  </td>
                </tr>
              ) : paginatedInventory.length > 0 ? (
                paginatedInventory.map((p) => {
                  const pct = Math.min(100, Math.round((p.stock / 25) * 100));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.brand}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{p.sku}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${p.price}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900 text-base">{p.stock}</td>
                      <td className="px-6 py-4 w-36">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.status === "In Stock"
                                ? "bg-emerald-500"
                                : p.status === "Low Stock"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                            STATUS_STYLE[p.status]
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRestock(p.id)}
                          className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 shadow-sm"
                        >
                          <Plus size={13} /> Restock +5
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No matching products found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 8 Products Per Page Pagination Controls */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              of <span className="font-bold text-slate-900">{filtered.length}</span> products
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
