import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

interface VerificationPendingPageProps {
  setCurrentTab: (tab: string) => void;
}

export const VerificationPendingPage: React.FC<VerificationPendingPageProps> = ({ setCurrentTab }) => {
  const { currentUser, refreshBalance, logout } = useAuth();
  const [isChecking, setIsChecking] = React.useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    await refreshBalance();
    setIsChecking(false);
    if (currentUser?.status === 'APPROVED') {
      setCurrentTab('dashboard');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200/60">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-amber-600 font-bold font-mono">
            Status: VERIFICATION_PENDING
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Verification Pending
          </h1>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-4 text-xs leading-relaxed text-slate-700">
          <p className="font-medium text-slate-900">
            Your registration has been submitted successfully.
          </p>
          <p>
            Your account is currently waiting for administrator approval.
          </p>
          <p className="text-slate-500">
            You will be able to use your wallet after your registration is approved. Money deposits, peer-to-peer transfers, and live ledger capabilities are paused until compliance clearance.
          </p>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-slate-400">Customer ID:</span>
              <div className="font-bold text-slate-800">{currentUser?.customerId}</div>
            </div>
            <div>
              <span className="text-slate-400">Account Name:</span>
              <div className="font-bold text-slate-800">{currentUser?.fullName}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={() => { logout(); setCurrentTab('login'); }}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Tip for testers: Log in as <code>admin</code> in another tab to approve this account.
        </p>
      </div>
    </div>
  );
};
