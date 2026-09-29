import React from 'react';
import { ShieldCheck, Zap, Lock, ArrowRight, Wallet, CheckCircle2, Building, RefreshCw } from 'lucide-react';

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-8 sm:p-14 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          {/*<div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-4 font-mono">
            <span>Enterprise Digital Wallet</span>
            <span aria-hidden="true">·</span>
            <span>Java 21 Spring Boot Backend</span>
          </div>
          */}

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight text-balance">
            Digital Wallet &amp; Payment Management Platform
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
            PayCore empowers customers with instant peer-to-peer money transfers, secure multi-factor transaction authentication, atomic cash deposits, and comprehensive compliance administration.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setCurrentTab('register')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 text-sm"
            >
              <span>Create Customer Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab('login')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-all text-sm"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Live Liquidity Overview Card */}
        {/*
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Backend Engine</div>
            <div className="text-lg font-bold text-white mt-1">Spring Boot 3.3</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Database</div>
            <div className="text-lg font-bold text-white mt-1">MySQL 8.x + JPA</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Authorization</div>
            <div className="text-lg font-bold text-white mt-1">Dual-Password + JWT</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">Concurrency</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">Pessimistic Lock</div>
          </div>
        </div>
        */}
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Engineered for High-Reliability Financial Flows
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every operation is strictly enforced on the server with transactional consistency and precision accounting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Atomic Money Transfers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Debit and credit operations run inside isolated database transactions using <code>BigDecimal</code> math, ensuring zero rounding anomalies or race-condition double spends.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Admin Approval Lifecycle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              New customer registrations undergo compliance review. Wallets are activated only after administrator verification, preventing unauthorized operations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Two-Tier Password Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Separate passwords for account sign-in and fund transfer authorization. Both are individually hashed using BCrypt and never stored in plain text.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Seamless Customer Journey</h3>
              <p className="text-xs text-slate-500 mt-1">From onboarding to atomic peer-to-peer remittance</p>
            </div>
            <button
              onClick={() => setCurrentTab('register')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors self-start sm:self-auto"
            >
              Get Started Free
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-mono text-xs font-bold mb-2">01. Register</div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">KYC Intake</h4>
              <p className="text-xs text-slate-500">Submit Aadhaar, banking, and occupation details.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-mono text-xs font-bold mb-2">02. Verify</div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Admin Audit</h4>
              <p className="text-xs text-slate-500">Administrator reviews and activates unique wallet.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-mono text-xs font-bold mb-2">03. Deposit</div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Credit Funds</h4>
              <p className="text-xs text-slate-500">Deposit money with real-time balance refresh.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-blue-600 font-mono text-xs font-bold mb-2">04. Transfer</div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Instant Pay</h4>
              <p className="text-xs text-slate-500">Authorize peer transfers with secure transaction pin.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
