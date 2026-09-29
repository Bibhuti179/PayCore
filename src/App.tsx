import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { WalkthroughBar } from './components/WalkthroughBar';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { VerificationPendingPage } from './pages/VerificationPendingPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { DepositPage } from './pages/DepositPage';
import { TransferPage } from './pages/TransferPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCustomerManagement } from './pages/AdminCustomerManagement';
import { AdminTransactionManagement } from './pages/AdminTransactionManagement';
import { AdminReportsPage } from './pages/AdminReportsPage';

const MainLayout: React.FC = () => {
  const { currentUser, role, status } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [autofillData, setAutofillData] = useState<any>(null);

  // Sync tab with authentication role & status
  useEffect(() => {
    if (!currentUser) {
      if (['dashboard', 'deposit', 'transfer', 'transactions', 'profile', 'admin-dashboard', 'admin-customers', 'admin-transactions', 'admin-reports', 'pending'].includes(currentTab)) {
        setCurrentTab('home');
      }
    } else if (role === 'ROLE_ADMIN') {
      if (!['admin-dashboard', 'admin-customers', 'admin-transactions', 'admin-reports'].includes(currentTab)) {
        setCurrentTab('admin-dashboard');
      }
    } else if (role === 'ROLE_CUSTOMER') {
      if (status === 'VERIFICATION_PENDING') {
        setCurrentTab('pending');
      } else if (['home', 'login', 'register', 'pending'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser, role, status]);

  const handleAutofillRegister = (data: any) => {
    setAutofillData(data);
    setCurrentTab('register');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Interactive Acceptance Test Guide Stepper */}
      <WalkthroughBar
        setCurrentTab={setCurrentTab}
        onAutofillRegister={handleAutofillRegister}
      />

      {/* Top Bar Contract Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {currentTab === 'home' && <LandingPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'register' && (
          <RegisterPage setCurrentTab={setCurrentTab} autofillData={autofillData} />
        )}
        {currentTab === 'login' && <LoginPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'pending' && <VerificationPendingPage setCurrentTab={setCurrentTab} />}

        {/* Customer Protected Pages */}
        {currentTab === 'dashboard' && <CustomerDashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'deposit' && <DepositPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'transfer' && <TransferPage setCurrentTab={setCurrentTab} />}
        {currentTab === 'transactions' && <TransactionHistoryPage />}
        {currentTab === 'profile' && <CustomerProfilePage />}

        {/* Admin Protected Pages */}
        {currentTab === 'admin-dashboard' && <AdminDashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'admin-customers' && <AdminCustomerManagement />}
        {currentTab === 'admin-transactions' && <AdminTransactionManagement />}
        {currentTab === 'admin-reports' && <AdminReportsPage />}
      </main>

      {/* Quiet Corporate Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">PayCore</span>
            <span>·</span>
            <span>Digital Wallet &amp; Payment Management Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Spring Boot 3.3.4</span>
            <span>·</span>
            <span>MySQL 8.x + JPA</span>
            <span>·</span>
            <span>BCrypt Dual-Password Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
