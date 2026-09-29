import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface TransactionPasswordModalProps {
  isOpen: boolean;
  amount: number;
  receiverName: string;
  receiverAccount: string;
  onConfirm: (password: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const TransactionPasswordModal: React.FC<TransactionPasswordModalProps> = ({
  isOpen,
  amount,
  receiverName,
  receiverAccount,
  onConfirm,
  onClose,
  isLoading,
  error
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    onConfirm(password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Authorize Transfer</h3>
            <p className="text-xs text-slate-500">Enter your secure transaction password</p>
          </div>
        </div>

        {/* Transfer Summary */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-5 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Recipient:</span>
            <span className="font-semibold text-slate-900">{receiverName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Account:</span>
            <span className="font-mono text-slate-700">{receiverAccount}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="font-medium text-slate-700">Amount:</span>
            <span className="text-base font-bold text-slate-950 font-mono tabular-nums">
              ₹{amount.toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter 4-20 char transaction password"
                autoFocus
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Separate from your login password. Demo default for Rahul: <code className="text-slate-600">123456</code>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Confirm Transfer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
