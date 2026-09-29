import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getEngineConfig, saveEngineConfig } from '../services/api';
import { 
  Wallet, 
  ArrowLeftRight, 
  ArrowDownToLine, 
  History, 
  User, 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Server,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [engineConfig, setEngineConfig] = useState(getEngineConfig());
  const [showConfigModal, setShowConfigModal] = useState(false);

  const toggleBackendMode = (mode: 'in_browser_spring' | 'localhost_8080') => {
    const next = { ...engineConfig, backendMode: mode };
    saveEngineConfig(next);
    setEngineConfig(next);
    setShowConfigModal(false);
  };

  const navItemClass = (tab: string) => `
    px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap
    ${currentTab === tab 
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600' 
      : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'}
  `;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button 
            onClick={() => setCurrentTab('home')} 
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-950 group-hover:text-blue-600 transition-colors">
                PayCore
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono -mt-1">
                Digital Wallet
              </span>
            </div>
          </button>

          {/* Zone 2: 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-4">
            {!currentUser ? (
              <>
                <button onClick={() => setCurrentTab('home')} className={navItemClass('home')}>
                  Overview
                </button>
                <button onClick={() => setCurrentTab('register')} className={navItemClass('register')}>
                  Open Account
                </button>
                <button onClick={() => setCurrentTab('login')} className={navItemClass('login')}>
                  Sign In
                </button>
              </>
            ) : role === 'ROLE_ADMIN' ? (
              <>
                <button onClick={() => setCurrentTab('admin-dashboard')} className={navItemClass('admin-dashboard')}>
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    Dashboard
                  </span>
                </button>
                <button onClick={() => setCurrentTab('admin-customers')} className={navItemClass('admin-customers')}>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    Customers
                  </span>
                </button>
                <button onClick={() => setCurrentTab('admin-transactions')} className={navItemClass('admin-transactions')}>
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                    Transactions
                  </span>
                </button>
                <button onClick={() => setCurrentTab('admin-reports')} className={navItemClass('admin-reports')}>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Reports
                  </span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setCurrentTab('dashboard')} className={navItemClass('dashboard')}>
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-slate-500" />
                    Dashboard
                  </span>
                </button>
                <button onClick={() => setCurrentTab('deposit')} className={navItemClass('deposit')}>
                  <span className="flex items-center gap-1.5">
                    <ArrowDownToLine className="w-4 h-4 text-slate-500" />
                    Cash Deposit
                  </span>
                </button>
                <button onClick={() => setCurrentTab('transfer')} className={navItemClass('transfer')}>
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                    Transfer Money
                  </span>
                </button>
                <button onClick={() => setCurrentTab('transactions')} className={navItemClass('transactions')}>
                  <span className="flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-500" />
                    History
                  </span>
                </button>
                <button onClick={() => setCurrentTab('profile')} className={navItemClass('profile')}>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" />
                    Profile
                  </span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Engine Selector */}
             {/*<button
              onClick={() => setShowConfigModal(true)}
              title="Click to toggle Spring Boot Backend Engine"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-blue-600" />
             <span className="hidden xl:inline text-slate-500">Engine:</span> 
              <span className="font-semibold text-slate-900">
                {engineConfig.backendMode === 'in_browser_spring' ? 'Spring Core' : 'localhost:8080'}
              </span>
            </button>
            */}

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {currentUser.customerId}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {!currentUser ? (
            <>
              <button
                onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Overview
              </button>
              <button
                onClick={() => { setCurrentTab('register'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Open Account
              </button>
              <button
                onClick={() => { setCurrentTab('login'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Sign In
              </button>
            </>
          ) : role === 'ROLE_ADMIN' ? (
            <>
              <button
                onClick={() => { setCurrentTab('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => { setCurrentTab('admin-customers'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Customer Management
              </button>
              <button
                onClick={() => { setCurrentTab('admin-transactions'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Transaction Ledger
              </button>
              <button
                onClick={() => { setCurrentTab('admin-reports'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                System Reports
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-red-600"
              >
                Logout ({currentUser.fullName})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Dashboard
              </button>
              <button
                onClick={() => { setCurrentTab('deposit'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Cash Deposit
              </button>
              <button
                onClick={() => { setCurrentTab('transfer'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Transfer Money
              </button>
              <button
                onClick={() => { setCurrentTab('transactions'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Transaction History
              </button>
              <button
                onClick={() => { setCurrentTab('profile'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-slate-700"
              >
                Profile
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-medium text-red-600"
              >
                Logout ({currentUser.fullName})
              </button>
            </>
          )}
        </div>
      )}

      {/* Backend Engine Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 mb-2">Backend Architecture Mode</h3>
            <p className="text-xs text-slate-500 mb-4">
              PayCore includes both a full Java Spring Boot 3.3 / MySQL backend codebase (in <code>/backend</code>) and an identical in-browser engine for instant cloud preview execution.
            </p>

            <div className="space-y-3 mb-6">
              <label 
                onClick={() => toggleBackendMode('in_browser_spring')}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  engineConfig.backendMode === 'in_browser_spring' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="mode" 
                  checked={engineConfig.backendMode === 'in_browser_spring'} 
                  onChange={() => {}} 
                  className="mt-1 text-blue-600" 
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">In-Browser Spring Engine (Default)</div>
                  <div className="text-xs text-slate-500">
                    Runs the exact Spring Boot transactional rules, BigDecimal precision, and BCrypt security in-browser without needing local MySQL.
                  </div>
                </div>
              </label>

              <label 
                onClick={() => toggleBackendMode('localhost_8080')}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  engineConfig.backendMode === 'localhost_8080' 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="mode" 
                  checked={engineConfig.backendMode === 'localhost_8080'} 
                  onChange={() => {}} 
                  className="mt-1 text-blue-600" 
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Local Spring Boot (http://localhost:8080)</div>
                  <div className="text-xs text-slate-500">
                    Connects directly to the Maven Spring Boot application running on your machine with MySQL on port 3306.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
