import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ReceiverLookupResponse, TransferResponse } from '../types';
import { TransactionPasswordModal } from '../components/TransactionPasswordModal';
import { 
  ArrowLeftRight, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Wallet,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TransferPageProps {
  setCurrentTab: (tab: string) => void;
}

export const TransferPage: React.FC<TransferPageProps> = ({ setCurrentTab }) => {
  const { currentUser, balance, refreshBalance } = useAuth();

  const [receiverAccount, setReceiverAccount] = useState('');
  const [receiverInfo, setReceiverInfo] = useState<ReceiverLookupResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [amount, setAmount] = useState('400');
  const [description, setDescription] = useState('Lunch & groceries');

  // Confirmation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<TransferResponse | null>(null);

  // Dynamic Lookup Debounce
  useEffect(() => {
    const clean = receiverAccount.trim().toUpperCase();
    if (clean.length < 10) {
      setReceiverInfo(null);
      setLookupError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLookingUp(true);
      setLookupError(null);
      try {
        const info = await api.lookupReceiver(clean, currentUser?.token);
        setReceiverInfo(info);
      } catch (err: any) {
        setReceiverInfo(null);
        setLookupError(err.message || 'Receiver account not found.');
      } finally {
        setIsLookingUp(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [receiverAccount, currentUser]);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    if (!receiverInfo) {
      setTransferError('Please specify a verified receiver account.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    if (currentUser?.walletAccountNumber && 
        currentUser.walletAccountNumber.toUpperCase() === receiverAccount.trim().toUpperCase()) {
      setTransferError('Cannot transfer money to your own wallet account.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleExecuteTransfer = async (password: string) => {
    if (!currentUser) return;
    setIsTransferring(true);
    setTransferError(null);

    const numAmount = parseFloat(amount);

    try {
      const res = await api.transfer(currentUser.id, {
        receiverAccountNumber: receiverAccount.trim().toUpperCase(),
        amount: numAmount,
        transactionPassword: password,
        description: description.trim()
      }, currentUser.token);

      await refreshBalance();
      setSuccessResponse(res);
      setIsModalOpen(false);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setTransferError(err.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = numAmount > balance;

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Send Money</h1>
            <p className="text-xs text-slate-500">Atomic peer-to-peer transfer protected by 2FA</p>
          </div>
        </div>

        {/* Available Balance Header */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Available Balance:</span>
          </div>
          <span className="text-base font-bold text-slate-950 font-mono tabular-nums">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {transferError && !isModalOpen && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="whitespace-pre-line font-medium leading-relaxed">{transferError}</div>
          </div>
        )}

        {successResponse ? (
          <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold text-sm">Transfer Successful!</span>
            </div>

            <p className="text-xs text-emerald-900">
              <strong>₹{successResponse.amount.toFixed(2)}</strong> sent successfully to{' '}
              <strong>{successResponse.receiverName}</strong>.
            </p>

            <div className="space-y-2 text-xs font-mono pt-3 border-t border-emerald-200/60 text-slate-700">
              <div className="flex justify-between">
                <span>Transaction Reference:</span>
                <span className="font-bold text-slate-900">{successResponse.transactionReference}</span>
              </div>
              <div className="flex justify-between">
                <span>Recipient Account:</span>
                <span>{successResponse.receiverAccountNumber}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-emerald-200/60">
                <span>Updated Available Balance:</span>
                <span className="text-emerald-700 font-mono">₹{successResponse.updatedBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSuccessResponse(null);
                  setAmount('');
                }}
                className="w-full py-2 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Send Another Transfer
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
          <form onSubmit={handleOpenConfirm} className="space-y-5">
            {/* Receiver Account Input with Dynamic Lookup */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Receiver Account Number *
                </label>
                <button
                  type="button"
                  onClick={() => setReceiverAccount('PAYWALLET100002')}
                  className="text-[11px] text-blue-600 hover:underline font-mono"
                >
                  Test: Amit (PAYWALLET100002)
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={receiverAccount}
                  onChange={(e) => setReceiverAccount(e.target.value.toUpperCase())}
                  placeholder="e.g. PAYWALLET100002"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono uppercase"
                  required
                />
                {isLookingUp && (
                  <div className="absolute right-3.5 top-3">
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Dynamic Receiver Found Card */}
              {receiverInfo && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-emerald-800 font-bold">{receiverInfo.receiverName}</span>
                      <span className="text-slate-500 font-mono text-[11px] ml-2">
                        ({receiverInfo.accountNumber})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>
              )}

              {lookupError && (
                <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{lookupError}</span>
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount (₹) *
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
                  placeholder="400.00"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-base font-bold bg-white border rounded-xl focus:outline-none focus:ring-2 font-mono tabular-nums ${
                    isInsufficient 
                      ? 'border-red-300 text-red-700 focus:ring-red-500/20 focus:border-red-600' 
                      : 'border-slate-300 text-slate-900 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                  required
                />
              </div>

              {isInsufficient && (
                <p className="text-[11px] text-red-600 mt-1.5 font-medium">
                  Amount exceeds available balance (₹{balance.toFixed(2)})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Memo (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch &amp; groceries"
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={!receiverInfo || isInsufficient || numAmount <= 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Send Money</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Confirmation Modal asking for Transaction Password */}
      <TransactionPasswordModal
        isOpen={isModalOpen}
        amount={numAmount}
        receiverName={receiverInfo?.receiverName || ''}
        receiverAccount={receiverAccount}
        onConfirm={handleExecuteTransfer}
        onClose={() => setIsModalOpen(false)}
        isLoading={isTransferring}
        error={transferError}
      />
    </div>
  );
};
