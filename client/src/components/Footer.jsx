import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg">
                🥬
              </div>
              <span className="text-2xl font-black text-white">
                Local<span className="text-brand-400">Kart</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering local vegetable vendors, kirana merchants & neighborhood delivery boys. 100% farm-fresh daily harvests directly from Nimapada & riverbed mandis to your kitchen.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-bold">
              <span>🇮🇳 Built for Local Indian Businesses</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/" className="hover:text-white transition">Home & Shops</Link>
              </li>
              <li>
                <Link to="/fresh-today" className="hover:text-white transition">🥬 Today's Fresh Harvests</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">Track My Orders</Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-white transition">Saved Addresses</Link>
              </li>
            </ul>
          </div>

          {/* Business Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Business & Partners
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link to="/vendor/dashboard" className="hover:text-white transition">🏪 Vendor Partner App</Link>
              </li>
              <li>
                <Link to="/delivery/dashboard" className="hover:text-white transition">🛵 Delivery Boy Portal</Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-white transition">👑 Admin Management</Link>
              </li>
              <li>
                <Link to="/register?role=VENDOR" className="hover:text-white transition">Register Your Shop</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Hyperlocal Hub
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>Daily Mandi Road, Saheed Nagar, Bhubaneswar, Odisha 751007</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>+91 98610 12345 (6 AM - 10 PM)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>support@localkart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 LocalKart Hyperlocal Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>English • हिन्दी • ଓଡ଼ିଆ</span>
            <span>Made with ❤️ for Local Vendors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
