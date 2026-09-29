import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ArrowDownToLine, CheckCircle2, AlertCircle, ArrowRight, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DepositPageProps {
  setCurrentTab: (tab: string) => void;
}

export const DepositPage: React.FC<DepositPageProps> = ({ setCurrentTab }) => {
  const { currentUser, balance, refreshBalance } = useAuth();
  const [amount, setAmount] = useState<string>('1000');
  const [description, setDescription] = useState<string>('Cash Deposit via PayCore Cash Services');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    previousBalance: number;
    depositAmount: number;
    newBalance: number;
  } | null>(null);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid deposit amount greater than zero.');
      return;
    }

    if (!currentUser) return;

    setIsLoading(true);
    setError(null);

    const prevBal = balance;

    try {
      const updatedWallet = await api.deposit(currentUser.id, {
        amount: numAmount,
        description: description.trim()
      }, currentUser.token);

      await refreshBalance();
      setSuccessData({
        previousBalance: prevBal,
        depositAmount: numAmount,
        newBalance: Number(updatedWallet.balance)
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowDownToLine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cash Deposit</h1>
            <p className="text-xs text-slate-500">Credit funds directly into your PayCore digital wallet</p>
          </div>
        </div>

        {/* Current Balance Ribbon */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Current Balance:</span>
          </div>
          <span className="text-base font-bold text-slate-950 font-mono tabular-nums">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold text-sm">Deposit Successful!</span>
            </div>

            <div className="space-y-2 text-xs font-mono pt-2 border-t border-emerald-200/60 text-slate-700">
              <div className="flex justify-between">
                <span>Previous Balance:</span>
                <span>₹{successData.previousBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Deposit Amount:</span>
                <span>+₹{successData.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-emerald-200/60">
                <span>New Available Balance:</span>
                <span className="text-emerald-700">₹{successData.newBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSuccessData(null)}
                className="w-full py-2 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Deposit More Funds
              </button>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deposit Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000.00"
                  className="w-full pl-9 pr-3.5 py-2.5 text-base font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono tabular-nums"
                  required
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors font-mono"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Reference (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Branch Cash Deposit"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Atomic Credit...</span>
                </>
              ) : (
                <>
                  <span>Deposit Funds</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
