import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { 
  Wallet, 
  Copy, 
  Check, 
  ArrowDownToLine, 
  ArrowLeftRight, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface CustomerDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ setCurrentTab }) => {
  const { currentUser, balance, refreshBalance } = useAuth();
  const [copied, setCopied] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    setIsLoadingTxns(true);
    try {
      await refreshBalance();
      const txns = await api.getCustomerTransactions(currentUser.id, currentUser.token);
      setRecentTransactions(txns.slice(0, 5));
    } catch {
      // transactions empty or error
    } finally {
      setIsLoadingTxns(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleCopyAccount = () => {
    if (!currentUser?.walletAccountNumber) return;
    navigator.clipboard.writeText(currentUser.walletAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            PayCore Customer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Welcome, {currentUser?.fullName}
          </h1>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Grid: Wallet Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance & Account Card (Fintech Gradient) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-7 sm:p-9 border border-slate-800 shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  Primary Digital Wallet
                </div>
                <div className="text-sm font-semibold text-white">
                  Account Name: {currentUser?.fullName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ACTIVE</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                Available Balance
              </span>
              <div className="text-3xl sm:text-5xl font-extrabold text-white font-mono tabular-nums tracking-tight mt-1">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-mono">Wallet Account Number</span>
                <span className="text-sm font-mono font-bold tracking-wide text-slate-200">
                  {currentUser?.walletAccountNumber || 'Provisioning...'}
                </span>
              </div>

              <button
                onClick={handleCopyAccount}
                disabled={!currentUser?.walletAccountNumber}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Account number copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 mb-6">Execute real-time funds movements</p>

            <div className="space-y-3">
              <button
                onClick={() => setCurrentTab('deposit')}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Cash Deposit
                    </div>
                    <div className="text-[11px] text-slate-500">Credit money to your wallet</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">→</span>
              </button>

              <button
                onClick={() => setCurrentTab('transfer')}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Send Money
                    </div>
                    <div className="text-[11px] text-slate-500">Instant peer transfer with 2FA</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">→</span>
              </button>

              <button
                onClick={() => setCurrentTab('transactions')}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 bg-slate-50/50 hover:bg-blue-50/30 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      View History
                    </div>
                    <div className="text-[11px] text-slate-500">Audit-grade statement ledger</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">→</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-mono">
              KYC Verified · Customer ID: {currentUser?.customerId}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Ledger Activity</h3>
            <p className="text-xs text-slate-500">Directly synchronized with backend database</p>
          </div>

          <button
            onClick={() => setCurrentTab('transactions')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All Transactions →
          </button>
        </div>

        {isLoadingTxns ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500">No transactions recorded yet in your wallet.</p>
            <button
              onClick={() => setCurrentTab('deposit')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Make First Deposit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Party</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((t) => {
                  const isSent = t.direction === 'SENT';
                  const isDeposit = t.type === 'DEPOSIT';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isDeposit ? (
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </div>
                          ) : isSent ? (
                            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-900">
                            {isDeposit ? 'Deposit' : isSent ? 'Sent' : 'Received'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {t.transactionReference}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        {isDeposit 
                          ? 'Cash Counter' 
                          : isSent 
                            ? `To: ${t.toCustomerName || t.toAccount}` 
                            : `From: ${t.fromCustomerName || t.fromAccount}`}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                        isSent ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {isSent ? '-' : '+'}₹{Number(t.amount).toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          t.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
