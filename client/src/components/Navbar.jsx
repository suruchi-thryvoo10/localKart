import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLocation } from '../context/LocationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { LanguageSelector } from './LanguageSelector.jsx';
import {
  ShoppingBag,
  MapPin,
  Search,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Store,
  Bike,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchDemoAccount } = useAuth();
  const { summary, setIsDrawerOpen } = useCart();
  const { selectedLocation, setIsLocationModalOpen } = useLocation();
  const { t } = useLanguage();
  const { unreadCount, notifications } = useNotification();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDemoBarOpen, setIsDemoBarOpen] = useState(true);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Demo Role Switcher Bar for Seamless Review */}
      {isDemoBarOpen && (
        <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-brand-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
              Quick Role Switch
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Switch instant test persona:
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={async () => {
                await switchDemoAccount('CUSTOMER');
                navigate('/');
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-brand-600 transition font-semibold text-[11px]"
            >
              🛒 Customer
            </button>
            <button
              onClick={async () => {
                await switchDemoAccount('VENDOR');
                navigate('/vendor/dashboard');
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-brand-600 transition font-semibold text-[11px]"
            >
              🏪 Vendor
            </button>
            <button
              onClick={async () => {
                await switchDemoAccount('DELIVERY_AGENT');
                navigate('/delivery/dashboard');
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-brand-600 transition font-semibold text-[11px]"
            >
              🛵 Delivery Agent
            </button>
            <button
              onClick={async () => {
                await switchDemoAccount('ADMIN');
                navigate('/admin/dashboard');
              }}
              className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-brand-600 transition font-semibold text-[11px]"
            >
              👑 Admin
            </button>
            <button
              onClick={() => setIsDemoBarOpen(false)}
              className="text-slate-400 hover:text-white ml-2 text-[10px]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Hyperlocal Address */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🥬</span>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Local<span className="text-brand-600">Kart</span>
                </span>
                <span className="text-[10px] block font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  Hyperlocal Market
                </span>
              </div>
            </Link>

            {/* Hyperlocal Location Pill */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2.5 py-2 px-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition group"
            >
              <div className="p-1.5 bg-brand-100 text-brand-700 rounded-xl">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  Delivery in 25-35m <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition" />
                </div>
                <div className="text-xs font-bold text-slate-800 truncate max-w-[170px]">
                  {selectedLocation?.name || 'Saheed Nagar, Bhubaneswar'}
                </div>
              </div>
            </button>
          </div>

          {/* Center Links (Customer View) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600">
            <Link
              to="/"
              className={`hover:text-brand-600 transition ${
                routerLocation.pathname === '/' ? 'text-brand-600' : ''
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/fresh-today"
              className={`hover:text-brand-600 transition flex items-center gap-1.5 ${
                routerLocation.pathname === '/fresh-today' ? 'text-brand-600' : ''
              }`}
            >
              <span className="text-sm">🥬</span> {t('nav.freshToday')}
            </Link>
            <Link
              to="/orders"
              className={`hover:text-brand-600 transition ${
                routerLocation.pathname === '/orders' ? 'text-brand-600' : ''
              }`}
            >
              {t('nav.orders')}
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Notifications */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                      <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      <span className="text-xs text-brand-600 font-semibold">{unreadCount} new</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-2.5 rounded-xl text-xs ${
                              n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-brand-50 text-brand-900 font-semibold'
                            }`}
                          >
                            <div className="font-bold">{n.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-2xl font-bold text-xs flex items-center gap-2.5 shadow-lg shadow-brand-600/30 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-slate-950 font-black rounded-full text-[10px] flex items-center justify-center">
                    {summary.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {summary.itemCount > 0 ? `₹${summary.finalAmount}` : t('nav.cart')}
              </span>
            </button>

            {/* User Account / Role Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-700 text-white font-bold flex items-center justify-center text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden md:inline truncate max-w-[100px]">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-50 animate-fade-in">
                    <div className="p-3 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-800 font-bold rounded-md text-[9px] uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'VENDOR' && (
                      <Link
                        to="/vendor/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 rounded-xl"
                      >
                        <Store className="w-4 h-4" />
                        Vendor Dashboard
                      </Link>
                    )}

                    {user.role === 'DELIVERY_AGENT' && (
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50 rounded-xl"
                      >
                        <Bike className="w-4 h-4" />
                        Delivery Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      My Orders
                    </Link>

                    <Link
                      to="/addresses"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Saved Addresses
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl mt-1 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
