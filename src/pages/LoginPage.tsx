import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginRequest } from '../types';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillCredentials = (username: string, pass: string) => {
    setFormData({ username, password: pass });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please provide your username or customer ID and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await login(formData);
      // Auto-route based on account role
      if (res.role === 'ROLE_ADMIN') {
        setCurrentTab('admin-dashboard');
      } else if (res.status === 'VERIFICATION_PENDING') {
        setCurrentTab('pending');
      } else {
        setCurrentTab('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Login</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your customer account ID, email, or administrator credentials
          </p>
        </div>

        {/* Quick Demo Autofill Chips */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 mb-2">Quick Test Accounts:</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
              title="Sign in as Administrator"
            >
              Admin (admin/admin)
            </button>
            {/*<button
              type="button"
              onClick={() => fillCredentials('rahul@example.com', 'Rahul@123')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              Rahul Sharma
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('amit@example.com', 'Amit@123')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              Amit Sharma
            </button>*/}
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username / Customer ID / Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. admin or PAY100001 or rahul@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-sans"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-sans"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Need a digital wallet?</span>
          <button
            type="button"
            onClick={() => setCurrentTab('register')}
            className="text-blue-600 font-semibold hover:underline"
          >
            Open New Account →
          </button>
        </div>
      </div>
    </div>
  );
};
