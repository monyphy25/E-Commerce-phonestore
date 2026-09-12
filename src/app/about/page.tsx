"use client";

import Link from "next/link";
import { ShieldCheck, Truck, QrCode, Award, Users, ArrowRight, PhoneCall, Sparkles, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Official Smartphone Authorized Retailer
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Connecting You to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Future of Technology</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            PhoneStore is your premier destination for authentic, latest-generation smartphones, flagship devices, and premium mobile accessories in Cambodia.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 text-sm"
            >
              Explore Catalog <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-7 py-3.5 rounded-full border border-slate-700 transition-all text-sm flex items-center gap-2"
            >
              <PhoneCall size={16} /> Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-slate-200 bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Authentic Devices</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">25,000+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">24 Hours</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Express Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">1 Year</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Official Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Advantages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Customers Choose PhoneStore</h2>
          <p className="text-slate-500 text-sm mt-2">We combine authentic products, local payments, and exceptional customer service.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Official Brand Warranty</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every Apple, Samsung, Google, Vivo, and Oppo smartphone sold at PhoneStore is 100% brand new, sealed, and covered by official manufacturer warranties.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <QrCode size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Instant KHQR / Bakong Payment</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Enjoy seamless payment integration. Scan our KHQR code directly using Bakong or any major mobile banking app in Cambodia.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Nationwide Express Delivery</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              We provide fast, door-to-door delivery across Phnom Penh, Siem Reap, Battambang, Sihanoukville, and all 25 provinces.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Story Section */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Our Journey
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Building Cambodia's Most Trusted Mobile Ecosystem
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Founded in Phnom Penh, PhoneStore was created with a clear mission: to eliminate fake products, provide transparent pricing, and offer top-tier customer care for smartphone enthusiasts.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                "100% Factory sealed original smartphones",
                "Transparent price matching & exclusive trade-in discounts",
                "Instant technical support & diagnostic assistance",
                "Dedicated customer accounts and order management",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="text-blue-600" size={22} /> Our Quality Commitment
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              "We believe technology should empower everyday life. That's why every product in our store undergoes strict quality control checks before reaching your hands."
            </p>
            <div className="border-t border-slate-100 pt-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                PS
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">PhoneStore Management</div>
                <div className="text-xs text-slate-500">Phnom Penh, Cambodia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900">Ready to Upgrade Your Smartphone?</h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Discover the newest flagship phones with unbeatable prices, official warranty, and fast local delivery.
        </p>
        <div className="pt-2">
          <Link
            href="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-blue-600/20 inline-flex items-center gap-2 text-sm"
          >
            Shop All Smartphones Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
