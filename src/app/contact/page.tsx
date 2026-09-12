"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formDataState, setFormDataState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setResult("Sending your message...");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.append("access_key", "d914846f-1eed-42e7-a9a1-36139fe22163");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setResult("Your message has been sent successfully! We will get back to you shortly.");
        toast.success("Message sent successfully!");
        setFormDataState({ name: "", email: "", subject: "", message: "" });
        formElement.reset();
      } else {
        setStatus("error");
        setResult(data.message || "Failed to send message. Please try again.");
        toast.error("Failed to send message.");
      }
    } catch (error) {
      console.error("Contact form submit error:", error);
      setStatus("error");
      setResult("An unexpected error occurred. Please check your network and try again.");
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 sm:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb / Top header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Our Team
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Have questions about a smartphone, your order, or need technical support?
            Send us a message and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Side: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">

            {/* Quick Contact Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900">
                Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Reach out to us directly or fill out the email form. We respond within 24 hours.
              </p>

              <div className="space-y-4 pt-2">
                {/* Phone */}
                <a
                  href="tel:0962682899"
                  className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Support</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 group-hover:text-blue-600 transition-colors">0962682899</p>
                    <p className="text-xs text-slate-500 mt-0.5">Mon - Sun from 8am to 8pm</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:monyphy04@gmail.com"
                  className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Inquiry</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 group-hover:text-blue-600 transition-colors">monyphy04@gmail.com</p>
                    <p className="text-xs text-slate-500 mt-0.5">Direct customer support inbox</p>
                  </div>
                </a>

                {/* Telegram */}
                <a
                  href="https://t.me/phymony"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telegram</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 group-hover:text-sky-600 transition-colors">@phymony</p>
                    <p className="text-xs text-slate-500 mt-0.5">Instant fast chat support</p>
                  </div>
                </a>

                {/* Store Location */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Store Location</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Phnom Penh</p>
                    <p className="text-xs text-slate-500 mt-0.5">Cambodia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl p-6 text-white shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-sm tracking-wide">Business Working Hours</h3>
              </div>
              <div className="space-y-1 text-xs text-blue-100">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Monday – Sunday:</span>
                  <span className="font-semibold text-white">24/7 Available</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Online Orders:</span>
                  <span className="font-semibold text-emerald-300">24/7 Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Web3Forms Email Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                Fill in the form below and your message will be delivered straight to our team.
              </p>

              {/* Status Alert */}
              {status === "success" && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800 font-medium">
                    {result}
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 font-medium">
                    {result}
                  </div>
                </div>
              )}

              {/* Contact Form with Web3Forms */}
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Honeypot Spam Protection */}
                <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. John Doe"
                    value={formDataState.name}
                    onChange={(e) => setFormDataState((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="e.g. johndoe@example.com"
                    value={formDataState.email}
                    onChange={(e) => setFormDataState((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                {/* Subject (Optional) */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="e.g. Inquiry about iPhone 15 Pro Max"
                    value={formDataState.subject}
                    onChange={(e) => setFormDataState((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Write your question, feedback, or inquiry here..."
                    value={formDataState.message}
                    onChange={(e) => setFormDataState((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 placeholder-slate-400 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Message</span>
                    </>
                  )}
                </button>

                {/* Result note */}
                {result && status !== "loading" && (
                  <p className={`text-xs mt-3 font-medium ${status === "success" ? "text-emerald-600" : "text-red-500"}`}>
                    {result}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
