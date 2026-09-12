"use client";

import { useState, useEffect } from "react";
import { Search, Eye, RefreshCw, Loader2, Trash2, X, Package, MapPin, Phone, Mail } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  total: number;
  status: string;
  payment_status: string;
  phone: string;
  shipping_address?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    province?: string;
    items?: any[];
  };
  created_at: string;
  order_items?: OrderItem[];
}

const STATUS_STYLE: Record<string, string> = {
  DELIVERED: "text-emerald-700 bg-emerald-50 border-emerald-200",
  PROCESSING: "text-blue-700 bg-blue-50 border-blue-200",
  PENDING: "text-amber-700 bg-amber-50 border-amber-200",
  SHIPPED: "text-indigo-700 bg-indigo-50 border-indigo-200",
  CANCELLED: "text-red-700 bg-red-50 border-red-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleClearOrders = async () => {
    if (!confirm("Are you sure you want to delete all order records from database?")) return;
    try {
      await fetch("/api/orders", { method: "DELETE" });
      setOrders([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orders.filter((o) => {
    const customerName = o.shipping_address?.fullName || "Guest Customer";
    const orderNum = o.order_number || "";
    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      orderNum.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            View customer orders stored in Supabase ({orders.length} orders)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <button
              onClick={handleClearOrders}
              className="flex items-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-xl transition-all"
            >
              <Trash2 size={15} /> Clear Orders
            </button>
          )}
          <button
            onClick={fetchOrders}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search orders by customer or order #..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder-slate-400 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="All">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs text-slate-500 uppercase tracking-wider">
                <th className="text-left px-6 py-4">Order ID</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Items</th>
                <th className="text-left px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Payment</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-sm">Fetching orders from Supabase...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((o) => {
                  const customerName = o.shipping_address?.fullName || "Customer";
                  const email = o.shipping_address?.email || o.phone || "No Email";
                  const itemsList = (o.order_items && o.order_items.length > 0)
                    ? o.order_items
                    : (o.shipping_address?.items || []);
                  const itemCount = itemsList.length;
                  const firstItemName = itemsList[0]?.product_name || itemsList[0]?.name || itemsList[0]?.title || "Smartphone";
                  const itemSummary = itemCount > 0
                    ? `${firstItemName}${itemCount > 1 ? ` (+${itemCount - 1} more)` : ""}`
                    : "Phone Order";
                  const dateStr = new Date(o.created_at || Date.now()).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-blue-600 text-xs font-semibold">{o.order_number}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{customerName}</div>
                        <div className="text-xs text-slate-500">{email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{itemSummary}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">${Number(o.total).toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {o.phone || o.shipping_address?.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                            o.payment_status === "PAID"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-amber-700 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{dateStr}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400 text-sm">
                    No order records found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Order Details</h2>
                <p className="text-sm text-slate-500 font-mono mt-1">#{selectedOrder.order_number}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: Customer & Shipping */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Phone size={16} className="text-blue-500" /> Contact Info
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="font-semibold text-slate-900">{selectedOrder.shipping_address?.fullName || "Guest Customer"}</p>
                      <p className="text-slate-600 mt-1 flex items-center gap-2"><Phone size={14}/> {selectedOrder.phone}</p>
                      {selectedOrder.shipping_address?.email && (
                        <p className="text-slate-600 mt-1 flex items-center gap-2"><Mail size={14}/> {selectedOrder.shipping_address.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-500" /> Shipping Address
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                      {selectedOrder.shipping_address?.address || "No address provided"}
                      {selectedOrder.shipping_address?.province && `, ${selectedOrder.shipping_address.province}`}
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Order Items */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package size={16} className="text-purple-500" /> Order Items
                  </h3>
                  <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
                      {(() => {
                        const itemsList = (selectedOrder.order_items && selectedOrder.order_items.length > 0)
                          ? selectedOrder.order_items
                          : (selectedOrder.shipping_address?.items || []);
                        return itemsList.length > 0 ? (
                          itemsList.map((item: any, idx: number) => {
                            const pName = item.product_name || item.name || item.title || "Smartphone";
                            const pQty = item.quantity || 1;
                            const pPrice = Number(item.price || 0);
                            return (
                              <div key={idx} className="flex justify-between items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{pName}</p>
                                  <p className="text-xs text-slate-500 mt-1">Qty: {pQty} × ${pPrice.toFixed(2)}</p>
                                </div>
                                <p className="font-bold text-slate-900 text-sm">${(pQty * pPrice).toFixed(2)}</p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-slate-500 text-center py-4">No items details found</p>
                        );
                      })()}
                    </div>
                    
                    <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-900">${Number(selectedOrder.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Shipping</span>
                        <span className="font-semibold text-slate-900">Free</span>
                      </div>
                      <div className="flex justify-between text-base pt-2 border-t border-slate-200 mt-2">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-bold text-blue-600">${Number(selectedOrder.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Pills */}
                  <div className="flex gap-3 mt-6">
                    <div className={`flex-1 text-center py-2 rounded-lg border text-xs font-bold uppercase ${STATUS_STYLE[selectedOrder.status.toUpperCase()] || STATUS_STYLE["PENDING"]}`}>
                      Status: {selectedOrder.status}
                    </div>
                    <div className={`flex-1 text-center py-2 rounded-lg border text-xs font-bold uppercase ${selectedOrder.payment_status === "PAID" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                      Payment: {selectedOrder.payment_status}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
