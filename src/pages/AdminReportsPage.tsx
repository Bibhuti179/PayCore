import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AdminReportResponse } from '../types';
import { 
  FileText, 
  ArrowLeftRight, 
  Users, 
  Wallet, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Download,
  RefreshCw,
  Printer
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [report, setReport] = useState<AdminReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [currentUser]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminReports(currentUser?.token);
      setReport(data);
    } catch {
      // empty
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System &amp; Financial Reports</h1>
          <p className="text-xs text-slate-500">
            Official aggregated audit summary generated directly from MySQL persistence layer
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {isLoading || !report ? (
        <div className="py-16 text-center text-xs text-slate-400">Compiling financial metrics...</div>
      ) : (
        <div className="space-y-6">
          {/* Report 1: Transaction Performance Report */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">01. Transaction Performance Report</h3>
                <p className="text-xs text-slate-500">Settlement volume and execution success rates</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block font-mono text-[11px]">Total Transactions</span>
                <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">{report.totalTransactions}</span>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                <span className="text-emerald-700 block font-mono text-[11px]">Successful</span>
                <span className="text-xl font-bold text-emerald-800 font-mono tabular-nums">{report.successfulTransactions}</span>
              </div>

              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200/80">
                <span className="text-red-700 block font-mono text-[11px]">Failed / Rejected</span>
                <span className="text-xl font-bold text-red-800 font-mono tabular-nums">{report.failedTransactions}</span>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80">
                <span className="text-blue-700 block font-mono text-[11px]">Success Rate</span>
                <span className="text-xl font-bold text-blue-800 font-mono tabular-nums">
                  {report.totalTransactions > 0 
                    ? `${((report.successfulTransactions / report.totalTransactions) * 100).toFixed(1)}%` 
                    : '100%'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 font-mono">Total Peer Transfer Volume</span>
                  <div className="text-lg font-bold text-slate-950 font-mono tabular-nums mt-0.5">
                    ₹{Number(report.totalTransferAmount || 0).toFixed(2)}
                  </div>
                </div>
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 font-mono">Total Cash Inflow Volume</span>
                  <div className="text-lg font-bold text-slate-950 font-mono tabular-nums mt-0.5">
                    ₹{Number(report.totalDepositAmount || 0).toFixed(2)}
                  </div>
                </div>
                <Coins className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Report 2: Customer Lifecycle & KYC Report */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">02. Customer Verification &amp; Compliance Report</h3>
                <p className="text-xs text-slate-500">Distribution of user accounts across compliance states</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block font-mono text-[11px]">Total Applicants</span>
                <span className="text-lg font-bold text-slate-900 font-mono">{report.totalCustomers}</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80">
                <span className="text-emerald-700 block font-mono text-[11px]">Approved Active</span>
                <span className="text-lg font-bold text-emerald-800 font-mono">{report.approvedCustomers}</span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80">
                <span className="text-amber-700 block font-mono text-[11px]">Pending Review</span>
                <span className="text-lg font-bold text-amber-800 font-mono">{report.pendingCustomers}</span>
              </div>

              <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200/80">
                <span className="text-red-700 block font-mono text-[11px]">Rejected</span>
                <span className="text-lg font-bold text-red-800 font-mono">{report.rejectedCustomers}</span>
              </div>

              <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200">
                <span className="text-slate-500 block font-mono text-[11px]">Suspended</span>
                <span className="text-lg font-bold text-slate-700 font-mono">{report.suspendedCustomers}</span>
              </div>
            </div>
          </div>

          {/* Report 3: Wallet Liquidity & Solvency Report */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">03. Wallet Liquidity &amp; System Solvency</h3>
                <p className="text-xs text-slate-500">Aggregate ledger solvency verification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block font-mono text-[11px]">Total Created Wallets</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{report.totalWallets}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-400 block font-mono text-[11px]">Active Operational Wallets</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{report.activeWallets}</span>
              </div>

              <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800">
                <span className="text-emerald-400 block font-mono text-[11px]">Total System Solvency Balance</span>
                <span className="text-xl font-bold text-white font-mono tabular-nums">
                  ₹{Number(report.totalSystemBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
