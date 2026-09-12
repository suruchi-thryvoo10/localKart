import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogIn, Store, Bike, Shield, ShoppingBag, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, switchDemoAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const userRole = res.data.user.role;
      if (redirect !== '/') {
        navigate(redirect);
      } else if (userRole === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else if (userRole === 'DELIVERY_AGENT') {
        navigate('/delivery/dashboard');
      } else if (userRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setLoading(true);
    try {
      await switchDemoAccount(role);
      if (role === 'VENDOR') navigate('/vendor/dashboard');
      else if (role === 'DELIVERY_AGENT') navigate('/delivery/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 text-2xl shadow-xl shadow-brand-500/30">
            🥬
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome to LocalKart</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your account & local market
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@localkart.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-extrabold rounded-2xl shadow-xl shadow-brand-600/30 text-sm flex items-center justify-center gap-2 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Test Logins */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Instant One-Click Demo Personas
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoLogin('CUSTOMER')}
              className="p-2.5 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl font-semibold text-slate-700 flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
              Customer
            </button>
            <button
              onClick={() => handleQuickDemoLogin('VENDOR')}
              className="p-2.5 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl font-semibold text-slate-700 flex items-center gap-2 transition"
            >
              <Store className="w-3.5 h-3.5 text-brand-600" />
              Vendor
            </button>
            <button
              onClick={() => handleQuickDemoLogin('DELIVERY_AGENT')}
              className="p-2.5 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl font-semibold text-slate-700 flex items-center gap-2 transition"
            >
              <Bike className="w-3.5 h-3.5 text-brand-600" />
              Delivery Boy
            </button>
            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-xl font-semibold text-slate-700 flex items-center gap-2 transition"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Admin
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
