import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AdminDashboardResponse } from '../types';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Wallet, 
  Coins, 
  ArrowLeftRight, 
  Calendar,
  RefreshCw,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [currentUser]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminDashboard(currentUser?.token);
      setData(res);
    } catch {
      // empty
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Executive Compliance Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Admin Intelligence Dashboard
          </h1>
        </div>

        <button
          onClick={loadDashboard}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Main System Balance Liquidity Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-7 sm:p-9 border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
              <Coins className="w-4 h-4" />
              <span>Real-Time System Liquidity</span>
            </div>
            <div className="text-3xl sm:text-5xl font-black text-white font-mono tabular-nums tracking-tight">
              ₹{(data?.totalSystemBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-lg">
              Dynamic aggregate balance computed across all active customer wallets (<code>SUM(active wallet balances)</code> in MySQL).
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentTab('admin-customers')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>Review Pending KYC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentTab('admin-reports')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Full Audit Reports
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {data?.totalCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Registered applicants</div>
        </div>

        {/* Approved Customers */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Approved Active</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
            {data?.approvedCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Wallets provisioned</div>
        </div>

        {/* Pending Verification */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Pending Audit</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
            {data?.pendingCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires compliance sign-off</div>
        </div>

        {/* Total Wallets */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Active Wallets</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {data?.totalWallets || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unique accounts</div>
        </div>

        {/* Total Transactions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Total Transactions</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
            {data?.totalTransactions || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Lifetime ledger entries</div>
        </div>

        {/* Today's Transactions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Today's Transactions</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono tabular-nums">
            {data?.todayTransactions || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Settled today</div>
        </div>

        {/* Rejected Customers */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Rejected Applicants</span>
            <UserX className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 font-mono tabular-nums">
            {data?.rejectedCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Non-compliant applications</div>
        </div>

        {/* Suspended Accounts */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Suspended Accounts</span>
            <UserX className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-700 font-mono tabular-nums">
            {data?.suspendedCustomers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Frozen wallets</div>
        </div>
      </div>
    </div>
  );
};
