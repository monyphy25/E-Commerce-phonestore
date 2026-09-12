import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.12V9.4a6.27 6.27 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.12z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Phone<span className="text-blue-600">Store</span></h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Discover the latest smartphones, unbeatable prices, and trusted quality. Your ultimate destination for mobile technology.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><a href="/products" className="hover:text-blue-600 transition-colors">All Products</a></li>
              <li><a href="/categories/iphone" className="hover:text-blue-600 transition-colors">iPhone</a></li>
              <li><a href="/categories/samsung" className="hover:text-blue-600 transition-colors">Samsung</a></li>
            </ul>
          </div>

          {/* Support / Contact Us */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href="tel:0962682899"
                  className="flex items-center gap-2.5 hover:text-blue-600 transition-colors group"
                >
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Phone className="w-4 h-4" />
                  </span>
                  <span>0962682899</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/phymony"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-sky-600 transition-colors group"
                >
                  <span className="p-1.5 rounded-lg bg-sky-50 text-sky-500 group-hover:bg-sky-100 transition-colors">
                    <TelegramIcon className="w-4 h-4" />
                  </span>
                  <span>@phymony</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:monyphy04@gmail.com"
                  className="flex items-center gap-2.5 hover:text-rose-600 transition-colors group"
                >
                  <span className="p-1.5 rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span>monyphy04@gmail.com</span>
                </a>
              </li>
              {/* <li>
                <a
                  href="https://www.tiktok.com/@phymuny"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-slate-900 transition-colors group"
                >
                  <span className="p-1.5 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-200 transition-colors">
                    <TikTokIcon className="w-4 h-4" />
                  </span>
                  <span>@phymuny</span>
                </a>
              </li> */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><a href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} PhoneStore. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <span className="text-slate-400 text-sm font-semibold tracking-widest">BAKONG</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
