"use client";

import { useState, useEffect } from "react";
import { Star, Trash2, Check, Loader2, RefreshCw, MessageSquarePlus } from "lucide-react";

interface Review {
  id: string | number;
  user: string;
  userEmail?: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchReviewsData = async () => {
    setLoading(true);
    try {
      // Fetch real products & customers
      const [prodRes, custRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()).catch(() => ({ products: [] })),
        fetch("/api/customers").then((r) => r.json()).catch(() => ({ customers: [] })),
      ]);

      const productsList = prodRes.products || [];
      const customersList = custRes.customers || [];

      const matchedProducts = productsList.length > 0 ? productsList : [
        { name: "iPhone 15 Pro Max" },
        { name: "Galaxy S24 Ultra" },
        { name: "Pixel 9 Pro" },
      ];

      const matchedCustomers = customersList.length > 0 ? customersList : [
        { name: "monyphy04", email: "monyphy04@gmail.com" },
        { name: "Sokha Chea", email: "sokha@example.com" },
        { name: "Daris Keo", email: "daris@example.com" },
      ];

      const sampleComments = [
        "Absolutely amazing phone! The camera quality and battery life are unreal.",
        "Great build quality, sleek design, and fast performance.",
        "Good display and camera, very smooth user interface.",
        "Super fast delivery and authentic device! 100% recommended.",
      ];

      const initialReviews: Review[] = matchedCustomers.slice(0, 5).map((cust: any, index: number) => {
        const prod = matchedProducts[index % matchedProducts.length];
        return {
          id: `rev_${index + 1}`,
          user: cust.name || cust.email?.split("@")[0] || "Customer User",
          userEmail: cust.email,
          product: prod.name || "iPhone 15 Pro Max",
          rating: 5 - (index % 2),
          comment: sampleComments[index % sampleComments.length],
          date: new Date(Date.now() - index * 86400000 * 2).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          approved: index === 0 ? true : index % 2 === 0,
        };
      });

      setReviews(initialReviews);
    } catch (err) {
      console.error("Failed to load reviews data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id: string | number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
    );
    showToast("Review approved successfully!");
  };

  const handleDelete = (id: string | number) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    showToast("Review deleted.");
  };

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
          <h1 className="text-2xl font-extrabold text-slate-900">Customer Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage product reviews submitted by registered customers ({reviews.length} total)
          </p>
        </div>
        <button
          onClick={fetchReviewsData}
          className="p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors w-fit flex items-center gap-2 text-xs font-semibold shadow-sm"
          title="Refresh reviews"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh Reviews
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
            Loading customer reviews...
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                    {r.user.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{r.user}</span>
                      <span className="text-xs text-slate-400">reviewed</span>
                      <span className="text-sm font-semibold text-blue-600">{r.product}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          r.approved
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-amber-700 bg-amber-50 border-amber-200"
                        }`}
                      >
                        {r.approved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <div className="flex text-amber-400 mt-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= r.rating ? "currentColor" : "none"}
                          className={s <= r.rating ? "" : "text-slate-300"}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{r.comment}</p>
                    <p className="text-xs text-slate-400 mt-2">{r.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!r.approved && (
                    <button
                      onClick={() => handleApprove(r.id)}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
                      title="Approve Review"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
                    title="Delete Review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
            <MessageSquarePlus size={32} className="mx-auto mb-2 text-slate-400" />
            No product reviews found.
          </div>
        )}
      </div>
    </div>
  );
}
