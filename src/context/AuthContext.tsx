import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest, Role, AccountStatus, Wallet } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: AuthResponse | null;
  role: Role | null;
  status: AccountStatus | null;
  wallet: Wallet | null;
  balance: number;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<AuthResponse>;
  adminLogin: (req: LoginRequest) => Promise<AuthResponse>;
  register: (req: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
  updateUserStatus: (newStatus: AccountStatus) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'paycore_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthResponse | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AuthResponse = JSON.parse(saved);
        setCurrentUser(parsed);
        setBalance(parsed.balance || 0);
        if (parsed.role === 'ROLE_CUSTOMER' && parsed.status === 'APPROVED') {
          fetchWallet(parsed.id, parsed.token);
        }
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const fetchWallet = async (userId: number, token?: string) => {
    try {
      const w = await api.getWallet(userId, token);
      setWallet(w);
      setBalance(Number(w.balance));
    } catch {
      // Wallet might not be active yet
    }
  };

  const login = async (req: LoginRequest): Promise<AuthResponse> => {
    const res = await api.login(req);
    setCurrentUser(res);
    setBalance(res.balance || 0);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res));

    if (res.status === 'APPROVED') {
      await fetchWallet(res.id, res.token);
    }
    return res;
  };

  const adminLogin = async (req: LoginRequest): Promise<AuthResponse> => {
    const res = await api.adminLogin(req);
    setCurrentUser(res);
    setBalance(0);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res));
    return res;
  };

  const register = async (req: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.register(req);
    setCurrentUser(res);
    setBalance(0);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res));
    return res;
  };

  const logout = () => {
    setCurrentUser(null);
    setWallet(null);
    setBalance(0);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const refreshBalance = async () => {
    if (!currentUser || currentUser.role !== 'ROLE_CUSTOMER') return;
    try {
      const profile = await api.getProfile(currentUser.id, currentUser.token);
      setBalance(profile.balance || 0);
      if (profile.walletAccountNumber) {
        setWallet(prev => prev ? { ...prev, balance: profile.balance || 0 } : {
          id: Date.now(),
          accountNumber: profile.walletAccountNumber!,
          userId: profile.id,
          balance: profile.balance || 0,
          status: 'ACTIVE',
          createdAt: profile.createdAt,
          updatedAt: new Date().toISOString()
        });
      }
      // Update session status if changed by admin
      if (profile.status !== currentUser.status) {
        const updated = { ...currentUser, status: profile.status, walletAccountNumber: profile.walletAccountNumber, balance: profile.balance || 0 };
        setCurrentUser(updated);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      // Failed to refresh balance
    }
  };

  const updateUserStatus = (newStatus: AccountStatus) => {
    if (!currentUser) return;
    const updated = { ...currentUser, status: newStatus };
    setCurrentUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        status: currentUser?.status || null,
        wallet,
        balance,
        isLoading,
        login,
        adminLogin,
        register,
        logout,
        refreshBalance,
        updateUserStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
