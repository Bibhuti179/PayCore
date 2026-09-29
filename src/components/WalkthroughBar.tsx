import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlayCircle, RotateCcw, CheckCircle2, ChevronRight, HelpCircle, X } from 'lucide-react';

interface WalkthroughBarProps {
  setCurrentTab: (tab: string) => void;
  onAutofillRegister?: (data: any) => void;
}

export const WalkthroughBar: React.FC<WalkthroughBarProps> = ({ setCurrentTab, onAutofillRegister }) => {
  const { login, adminLogin, logout, refreshBalance } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleStepAction = async (step: number) => {
    try {
      if (step === 1) {
        // Step 1: Login as Admin using unified login
        await login({ username: 'admin', password: 'admin' });
        setCurrentTab('admin-dashboard');
        notify('Logged in as Administrator (admin / admin). Redirected to Admin Dashboard.');
        setCurrentStep(2);
      } else if (step === 2) {
        // Step 2: Open Register page and autofill Rahul Sharma
        logout();
        setCurrentTab('register');
        if (onAutofillRegister) {
          onAutofillRegister({
            fullName: 'Rahul Sharma',
            email: 'rahul@example.com',
            password: 'Rahul@123',
            phoneNumber: '9876543210',
            aadhaarNumber: '123456787890',
            dateOfBirth: '1995-05-15',
            gender: 'Male',
            nationality: 'Indian',
            residentialAddress: 'Flat 402, Green Glen Heights, Bengaluru',
            bankAccountNumber: '1234567890',
            occupation: 'Software Engineer',
            transactionPassword: '123456'
          });
        }
        notify('Autofilled Rahul Sharma registration details. Click Submit to register.');
        setCurrentStep(3);
      } else if (step === 3) {
        // Step 3: Login as Rahul (Pending state)
        await login({ username: 'rahul@example.com', password: 'Rahul@123' });
        setCurrentTab('dashboard');
        notify('Logged in as Rahul Sharma. Account is pending verification.');
        setCurrentStep(4);
      } else if (step === 4) {
        // Step 4: Admin approves Rahul
        await login({ username: 'admin', password: 'admin' });
        setCurrentTab('admin-customers');
        notify('Logged in as Admin. Find Rahul Sharma and click "Approve".');
        setCurrentStep(5);
      } else if (step === 5) {
        // Step 5: Fast Seed Full Scenario
        api.seedScenario();
        await login({ username: 'rahul@example.com', password: 'Rahul@123' });
        await refreshBalance();
        setCurrentTab('dashboard');
        notify('Pre-loaded Rahul (₹1,000) & Amit (₹0.00). Ready for transfer!');
        setCurrentStep(6);
      } else if (step === 6) {
        // Step 6: Transfer Money
        setCurrentTab('transfer');
        notify('Transfer screen opened. Enter Amit account PAYWALLET100002.');
        setCurrentStep(7);
      } else if (step === 7) {
        // Step 7: View Admin Dashboard
        await adminLogin({ username: 'admin', password: 'admin' });
        setCurrentTab('admin-dashboard');
        notify('Admin dashboard metrics and system liquidity loaded.');
        setCurrentStep(8);
      }
    } catch (e: any) {
      notify(e.message || 'Action failed');
    }
  };

  const handleReset = () => {
    logout();
    api.resetDb();
    setCurrentStep(1);
    setCurrentTab('home');
    notify('Database reset to fresh state with default admin account.');
  };

  return (
    <aside aria-label="Acceptance Test Scenario Guide" className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/*<div className="flex items-center gap-2">
            <span className="font-semibold text-blue-400">Acceptance Test Scenario:</span>
            <span className="text-slate-300 hidden sm:inline">
              Complete 16-step fintech verification flow (Registration → Approval → Deposit → Transfer)
            </span>
          </div>
          

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepAction(5)}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-1.5"
              title="1-Click Seed Rahul (₹1,000) & Amit (₹0)"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>1-Click Seed Rahul &amp; Amit</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isExpanded ? 'Hide Steps' : 'Step-by-Step Guide'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 transition-colors flex items-center gap-1"
              title="Reset all database records"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
          */}
        </div>
        

        {statusMessage && (
          <div className="mt-2 py-1.5 px-3 bg-blue-900/60 border border-blue-700/50 rounded text-blue-200 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => handleStepAction(1)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">1. Admin Login</div>
              <div className="text-[11px] text-slate-400">admin / admin</div>
            </button>

            <button
              onClick={() => handleStepAction(2)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">2. Register Rahul</div>
              <div className="text-[11px] text-slate-400">Autofills Rahul Sharma form</div>
            </button>

            <button
              onClick={() => handleStepAction(3)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">3. Rahul Pending State</div>
              <div className="text-[11px] text-slate-400">Logs in &amp; shows Pending Card</div>
            </button>

            <button
              onClick={() => handleStepAction(4)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">4. Admin Approves Rahul</div>
              <div className="text-[11px] text-slate-400">Provisions PAYWALLET100001</div>
            </button>

            <button
              onClick={() => handleStepAction(5)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">5. Rahul Deposits ₹1,000</div>
              <div className="text-[11px] text-slate-400">Balance becomes ₹1,000.00</div>
            </button>

            <button
              onClick={() => handleStepAction(6)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">6. Send ₹400 to Amit</div>
              <div className="text-[11px] text-slate-400">PAYWALLET100002 (Pwd: 123456)</div>
            </button>

            <button
              onClick={() => handleStepAction(7)}
              className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all"
            >
              <div className="font-semibold text-slate-200">7. Check Admin System Balance</div>
              <div className="text-[11px] text-slate-400">Displays ₹1,000 liquidity sum</div>
            </button>

            <div className="p-2 rounded bg-slate-800/40 border border-slate-800 text-slate-400 text-[11px]">
              <div className="font-semibold text-slate-300">Guard Test</div>
              Try sending ₹700 with ₹600 balance on Transfer page to verify insufficient balance error.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
