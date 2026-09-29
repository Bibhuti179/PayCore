import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowDownToLine, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

export const TransactionHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [currentUser]);

  const loadTransactions = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.getCustomerTransactions(currentUser.id, currentUser.token);
      setTransactions(data);
    } catch {
      // empty
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.transactionReference.toLowerCase().includes(q) ||
        (t.toCustomerName && t.toCustomerName.toLowerCase().includes(q)) ||
        (t.fromCustomerName && t.fromCustomerName.toLowerCase().includes(q)) ||
        (t.toAccount && t.toAccount.toLowerCase().includes(q)) ||
        (t.fromAccount && t.fromAccount.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-500">
            Comprehensive audit-grade financial statement for your PayCore wallet
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

      {/* Filters & Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference, name, or account..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Tabular Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          {['ALL', 'TRANSFER', 'DEPOSIT'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === type
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All Transactions' : type === 'TRANSFER' ? 'Transfers' : 'Deposits'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No matching transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Direction / Type</th>
                  <th className="py-3 px-4">Transaction Reference</th>
                  <th className="py-3 px-4">Counterparty Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => {
                  const isSent = t.direction === 'SENT';
                  const isDeposit = t.type === 'DEPOSIT';
                  const isReceived = t.direction === 'RECEIVED';

                  const dateObj = new Date(t.createdAt);
                  const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {isDeposit ? (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <ArrowDownToLine className="w-4 h-4" />
                            </div>
                          ) : isSent ? (
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <ArrowDownLeft className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">
                              {isDeposit ? 'Deposit' : isSent ? 'Money Sent' : 'Money Received'}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-mono">
                              {t.type}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {t.transactionReference}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isDeposit ? (
                          <div>
                            <div className="font-medium text-slate-900">PayCore Cash Services</div>
                            <div className="text-[11px] text-slate-400 font-mono">Direct Wallet Credit</div>
                          </div>
                        ) : isSent ? (
                          <div>
                            <div className="font-medium text-slate-900">To: {t.toCustomerName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{t.toAccount}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-slate-900">From: {t.fromCustomerName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{t.fromAccount}</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <div>{formattedDate}</div>
                        <div className="text-slate-400">{formattedTime}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {t.description || '—'}
                      </td>

                      <td className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap text-sm ${
                        isSent ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {isSent ? '-' : '+'}₹{Number(t.amount).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold font-mono ${
                          t.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {t.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-600" />
                          )}
                          <span>{t.status}</span>
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
