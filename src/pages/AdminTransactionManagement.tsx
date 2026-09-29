import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X, 
  ArrowDownToLine, 
  ArrowUpRight, 
  Clock,
  RefreshCw
} from 'lucide-react';

export const AdminTransactionManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [currentUser]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminTransactions(search, typeFilter, statusFilter, currentUser?.token);
      setTransactions(data);
    } catch {
      // empty
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = transactions.filter(t => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.transactionReference.toLowerCase().includes(q) ||
        (t.toCustomerName && t.toCustomerName.toLowerCase().includes(q)) ||
        (t.fromCustomerName && t.fromCustomerName.toLowerCase().includes(q)) ||
        (t.toAccount && t.toAccount.toLowerCase().includes(q)) ||
        (t.fromAccount && t.fromAccount.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Transaction Ledger</h1>
          <p className="text-xs text-slate-500">
            Real-time audit log of all monetary transfers, cash deposits, and clearance events
          </p>
        </div>

        <button
          onClick={loadTransactions}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, sender, receiver, account..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['ALL', 'TRANSFER', 'DEPOSIT'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === type
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type === 'TRANSFER' ? 'Transfers' : 'Deposits'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['ALL', 'SUCCESS', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No transactions recorded in the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Sender Account</th>
                  <th className="py-3 px-4">Receiver Account</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {t.transactionReference}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{t.type}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.fromAccount ? (
                        <div>
                          <div className="font-medium text-slate-900">{t.fromCustomerName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{t.fromAccount}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-mono">Cash Counter</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-slate-900">{t.toCustomerName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{t.toAccount}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap text-sm text-slate-900">
                      ₹{Number(t.amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        t.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Transaction Audit Info"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Transaction Audit View</h3>
                <span className="text-xs text-blue-600 font-mono font-semibold">
                  Ref: {selectedTxn.transactionReference}
                </span>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono">Settlement Amount:</span>
                  <span className="text-lg font-bold text-slate-950 font-mono tabular-nums">
                    ₹{Number(selectedTxn.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Operation Type:</span>
                  <span className="font-bold text-slate-800">{selectedTxn.type}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Execution Status:</span>
                  <span className="font-bold text-emerald-700">{selectedTxn.status}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Sender Counterparty</span>
                <div className="font-semibold text-slate-900">{selectedTxn.fromCustomerName || 'Direct Cash Credit'}</div>
                <div className="font-mono text-slate-500 text-[11px]">{selectedTxn.fromAccount || 'Cash Inflow'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Receiver Counterparty</span>
                <div className="font-semibold text-slate-900">{selectedTxn.toCustomerName}</div>
                <div className="font-mono text-slate-500 text-[11px]">{selectedTxn.toAccount}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Description / Audit Memo</span>
                <div className="text-slate-700">{selectedTxn.description || 'N/A'}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Database Timestamp</span>
                <div className="font-mono text-slate-700">{new Date(selectedTxn.createdAt).toISOString()}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
