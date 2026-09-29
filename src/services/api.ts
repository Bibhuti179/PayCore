import {
  AuthResponse,
  CustomerAdminResponse,
  AdminDashboardResponse,
  AdminReportResponse,
  DepositRequest,
  LoginRequest,
  ReceiverLookupResponse,
  RegisterRequest,
  Transaction,
  TransferRequest,
  TransferResponse,
  User,
  Wallet
} from '../types';

// Storage keys
const USERS_KEY = 'paycore_users';
const WALLETS_KEY = 'paycore_wallets';
const TRANSACTIONS_KEY = 'paycore_transactions';
const CONFIG_KEY = 'paycore_config';
const TOKEN_KEY = 'paycore_token';

// Simple hashing simulation matching BCrypt behavior
function mockHash(plain: string): string {
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    hash = (hash << 5) - hash + plain.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${plain.length}`;
}

function verifyHash(plain: string, hashed: string): boolean {
  return mockHash(plain) === hashed;
}

// Initial Database Seeder
function initializeDatabase() {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const adminUser = {
      id: 1,
      customerId: 'admin',
      fullName: 'PayCore System Administrator',
      email: 'admin@paycore.com',
      passwordHash: mockHash('admin'),
      phoneNumber: '9999999999',
      aadhaarMasked: 'XXXX XXXX 0000',
      aadhaarHash: mockHash('000000000000'),
      dateOfBirth: '1990-01-01',
      gender: 'Other',
      nationality: 'Indian',
      residentialAddress: 'PayCore HQ, Financial Tower, Level 14',
      bankAccountNumberMasked: 'XXXXXX0000',
      occupation: 'Administrator',
      transactionPasswordHash: mockHash('admin'),
      role: 'ROLE_ADMIN',
      status: 'APPROVED',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
    localStorage.setItem(WALLETS_KEY, JSON.stringify([]));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
  }
}

initializeDatabase();

export interface EngineConfig {
  backendMode: 'in_browser_spring' | 'localhost_8080';
  apiUrl: string;
}

export function getEngineConfig(): EngineConfig {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  return {
    backendMode: 'in_browser_spring',
    apiUrl: 'http://localhost:8080/api'
  };
}

export function saveEngineConfig(config: EngineConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function resetDatabase() {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(WALLETS_KEY);
  localStorage.removeItem(TRANSACTIONS_KEY);
  localStorage.removeItem(TOKEN_KEY);
  initializeDatabase();
}

// Internal Mock Database Engine (Spring-Boot-Compliant)
class InBrowserSpringEngine {
  private getUsers(): any[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  private saveUsers(users: any[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  private getWallets(): Wallet[] {
    return JSON.parse(localStorage.getItem(WALLETS_KEY) || '[]');
  }

  private saveWallets(wallets: Wallet[]) {
    localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
  }

  private getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  }

  private saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  register(req: RegisterRequest): AuthResponse {
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === req.email.toLowerCase().trim())) {
      throw new Error(`An account with email ${req.email} already exists.`);
    }

    if (users.some(u => u.phoneNumber === req.phoneNumber.trim())) {
      throw new Error(`An account with phone number ${req.phoneNumber} already exists.`);
    }

    // Auto-generate customerId: PAY100001
    const customerCount = users.filter(u => u.role === 'ROLE_CUSTOMER').length;
    const customerId = `PAY${100001 + customerCount}`;

    const cleanAadhaar = req.aadhaarNumber.replace(/\s+/g, '');
    const cleanBank = req.bankAccountNumber.trim();

    const newUser = {
      id: Date.now(),
      customerId,
      fullName: req.fullName.trim(),
      email: req.email.trim().toLowerCase(),
      passwordHash: mockHash(req.password),
      phoneNumber: req.phoneNumber.trim(),
      aadhaarMasked: `XXXX XXXX ${cleanAadhaar.slice(-4)}`,
      aadhaarHash: mockHash(cleanAadhaar),
      dateOfBirth: req.dateOfBirth,
      gender: req.gender,
      nationality: req.nationality.trim(),
      residentialAddress: req.residentialAddress.trim(),
      bankAccountNumberMasked: `XXXXXX${cleanBank.slice(-4)}`,
      occupation: req.occupation.trim(),
      transactionPasswordHash: mockHash(req.transactionPassword),
      role: 'ROLE_CUSTOMER',
      status: 'VERIFICATION_PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return {
      token: `jwt_token_${newUser.id}_${Date.now()}`,
      tokenType: 'Bearer',
      id: newUser.id,
      customerId: newUser.customerId,
      fullName: newUser.fullName,
      email: newUser.email,
      role: 'ROLE_CUSTOMER',
      status: 'VERIFICATION_PENDING',
      balance: 0.00
    };
  }

  login(req: LoginRequest): AuthResponse {
    const users = this.getUsers();
    const identifier = req.username.trim().toLowerCase();

    const user = users.find(u =>
      u.customerId.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );

    if (!user || !verifyHash(req.password, user.passwordHash)) {
      throw new Error('Invalid username/customer ID or password');
    }

    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === user.id);

    return {
      token: `jwt_token_${user.id}_${Date.now()}`,
      tokenType: 'Bearer',
      id: user.id,
      customerId: user.customerId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      walletAccountNumber: wallet?.accountNumber,
      balance: wallet ? Number(wallet.balance) : 0.00
    };
  }

  adminLogin(req: LoginRequest): AuthResponse {
    const users = this.getUsers();
    const identifier = req.username.trim().toLowerCase();

    const admin = users.find(u =>
      (u.customerId.toLowerCase() === identifier || u.email.toLowerCase() === identifier) &&
      u.role === 'ROLE_ADMIN'
    );

    if (!admin || !verifyHash(req.password, admin.passwordHash)) {
      throw new Error('Invalid administrator credentials');
    }

    return {
      token: `jwt_admin_token_${admin.id}_${Date.now()}`,
      tokenType: 'Bearer',
      id: admin.id,
      customerId: admin.customerId,
      fullName: admin.fullName,
      email: admin.email,
      role: 'ROLE_ADMIN',
      status: 'APPROVED',
      balance: 0.00
    };
  }

  getProfile(userId: number): User & { walletAccountNumber?: string; balance?: number } {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === userId);

    return {
      id: user.id,
      customerId: user.customerId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      aadhaarMasked: user.aadhaarMasked,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      nationality: user.nationality,
      residentialAddress: user.residentialAddress,
      bankAccountNumberMasked: user.bankAccountNumberMasked,
      occupation: user.occupation,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      walletAccountNumber: wallet?.accountNumber,
      balance: wallet ? Number(wallet.balance) : 0.00
    };
  }

  getWallet(userId: number): Wallet {
    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === userId);
    if (!wallet) throw new Error('Wallet not found');
    return wallet;
  }

  lookupReceiver(accountNumber: string): ReceiverLookupResponse {
    const cleanAcc = accountNumber.trim().toUpperCase();
    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.accountNumber === cleanAcc);
    if (!wallet) {
      throw new Error('Receiver account not found.');
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === wallet.userId);
    if (!user) {
      throw new Error('Receiver customer record not found.');
    }

    if (user.status !== 'APPROVED') {
      throw new Error(`Cannot transfer to this account: Receiver status is ${user.status}.`);
    }

    return {
      accountNumber: wallet.accountNumber,
      receiverName: user.fullName,
      valid: true
    };
  }

  deposit(userId: number, req: DepositRequest): Wallet {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    if (user.status !== 'APPROVED') {
      throw new Error(`Cannot perform cash deposit. Your account is ${user.status}`);
    }

    const amount = Number(Number(req.amount).toFixed(2));
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Deposit amount must be strictly greater than zero');
    }

    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === userId);
    if (!wallet) throw new Error('Active wallet not found');

    const previousBalance = Number(wallet.balance);
    const newBalance = Number((previousBalance + amount).toFixed(2));
    wallet.balance = newBalance;
    wallet.updatedAt = new Date().toISOString();
    this.saveWallets(wallets);

    // Record Transaction
    const ref = `PCX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const txn: Transaction = {
      id: Date.now(),
      transactionReference: ref,
      type: 'DEPOSIT',
      direction: 'SELF_DEPOSIT',
      senderWalletId: null,
      receiverWalletId: wallet.id,
      toAccount: wallet.accountNumber,
      toCustomerName: user.fullName,
      amount,
      status: 'SUCCESS',
      description: req.description?.trim() || 'Cash Deposit via PayCore Cash Services',
      createdAt: new Date().toISOString()
    };

    const txns = this.getTransactions();
    txns.unshift(txn);
    this.saveTransactions(txns);

    return wallet;
  }

  transfer(senderUserId: number, req: TransferRequest): TransferResponse {
    const users = this.getUsers();
    const sender = users.find(u => u.id === senderUserId);
    if (!sender) throw new Error('Sender user not found');

    // 1. Verify sender approval status
    if (sender.status !== 'APPROVED') {
      throw new Error('Your account has not yet been approved by the administrator.');
    }

    // 2. Verify transaction password
    if (!verifyHash(req.transactionPassword, sender.transactionPasswordHash)) {
      throw new Error('Incorrect transaction password.');
    }

    const amount = Number(Number(req.amount).toFixed(2));
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Transfer amount must be strictly greater than zero');
    }

    const wallets = this.getWallets();
    const senderWallet = wallets.find(w => w.userId === senderUserId);
    if (!senderWallet) throw new Error('Sender wallet not found');

    const receiverAcc = req.receiverAccountNumber.trim().toUpperCase();

    // 3. Self-transfer protection
    if (senderWallet.accountNumber.toUpperCase() === receiverAcc) {
      throw new Error('Cannot transfer money to your own wallet account');
    }

    // 4. Verify receiver exists & approved
    const receiverWallet = wallets.find(w => w.accountNumber.toUpperCase() === receiverAcc);
    if (!receiverWallet) {
      throw new Error('Receiver account not found.');
    }

    const receiver = users.find(u => u.id === receiverWallet.userId);
    if (!receiver || receiver.status !== 'APPROVED') {
      throw new Error('Receiver account is not active or approved.');
    }

    // 5. Verify sufficient balance
    const availableBalance = Number(senderWallet.balance);
    if (availableBalance < amount) {
      throw new Error(`Insufficient balance.\n\nAvailable: ₹${availableBalance.toFixed(2)}\nRequested: ₹${amount.toFixed(2)}`);
    }

    // 6. Execute atomic transfer
    senderWallet.balance = Number((availableBalance - amount).toFixed(2));
    senderWallet.updatedAt = new Date().toISOString();

    receiverWallet.balance = Number((Number(receiverWallet.balance) + amount).toFixed(2));
    receiverWallet.updatedAt = new Date().toISOString();

    this.saveWallets(wallets);

    // 7. Record Transaction
    const ref = `PCX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const txn: Transaction = {
      id: Date.now(),
      transactionReference: ref,
      type: 'TRANSFER',
      senderWalletId: senderWallet.id,
      receiverWalletId: receiverWallet.id,
      fromAccount: senderWallet.accountNumber,
      fromCustomerName: sender.fullName,
      toAccount: receiverWallet.accountNumber,
      toCustomerName: receiver.fullName,
      amount,
      status: 'SUCCESS',
      description: req.description?.trim() || `Money Transfer to ${receiver.fullName}`,
      createdAt: new Date().toISOString()
    };

    const txns = this.getTransactions();
    txns.unshift(txn);
    this.saveTransactions(txns);

    return {
      transactionReference: ref,
      amount,
      senderAccountNumber: senderWallet.accountNumber,
      senderName: sender.fullName,
      receiverAccountNumber: receiverWallet.accountNumber,
      receiverName: receiver.fullName,
      updatedBalance: senderWallet.balance,
      status: 'SUCCESS',
      timestamp: txn.createdAt
    };
  }

  getCustomerTransactions(userId: number): Transaction[] {
    const wallets = this.getWallets();
    const myWallet = wallets.find(w => w.userId === userId);
    if (!myWallet) return [];

    const txns = this.getTransactions();
    return txns
      .filter(t => t.senderWalletId === myWallet.id || t.receiverWalletId === myWallet.id)
      .map(t => {
        let direction: 'SENT' | 'RECEIVED' | 'SELF_DEPOSIT' = 'SELF_DEPOSIT';
        if (t.type === 'DEPOSIT') {
          direction = 'SELF_DEPOSIT';
        } else if (t.senderWalletId === myWallet.id) {
          direction = 'SENT';
        } else {
          direction = 'RECEIVED';
        }
        return { ...t, direction };
      });
  }

  // Admin Operations
  getAdminDashboard(): AdminDashboardResponse {
    const users = this.getUsers().filter(u => u.role === 'ROLE_CUSTOMER');
    const wallets = this.getWallets().filter(w => w.status === 'ACTIVE');
    const transactions = this.getTransactions();

    const totalSystemBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayTransactions = transactions.filter(t => t.createdAt.startsWith(today)).length;

    return {
      totalCustomers: users.length,
      approvedCustomers: users.filter(u => u.status === 'APPROVED').length,
      pendingCustomers: users.filter(u => u.status === 'VERIFICATION_PENDING').length,
      rejectedCustomers: users.filter(u => u.status === 'REJECTED').length,
      suspendedCustomers: users.filter(u => u.status === 'SUSPENDED').length,
      totalWallets: wallets.length,
      totalSystemBalance: Number(totalSystemBalance.toFixed(2)),
      totalTransactions: transactions.length,
      todayTransactions
    };
  }

  getAdminCustomers(search?: string, status?: string): CustomerAdminResponse[] {
    const users = this.getUsers().filter(u => u.role === 'ROLE_CUSTOMER');
    const wallets = this.getWallets();

    return users
      .filter(u => {
        if (status && status !== 'ALL' && u.status !== status) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            u.fullName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.customerId.toLowerCase().includes(q) ||
            u.phoneNumber.includes(q)
          );
        }
        return true;
      })
      .map(u => {
        const w = wallets.find(wall => wall.userId === u.id);
        return {
          id: u.id,
          customerId: u.customerId,
          fullName: u.fullName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          aadhaarMasked: u.aadhaarMasked,
          dateOfBirth: u.dateOfBirth,
          gender: u.gender,
          nationality: u.nationality,
          residentialAddress: u.residentialAddress,
          bankAccountNumberMasked: u.bankAccountNumberMasked,
          occupation: u.occupation,
          walletAccountNumber: w?.accountNumber,
          walletBalance: w ? Number(w.balance) : 0.00,
          status: u.status,
          registrationDate: u.createdAt
        };
      });
  }

  approveCustomer(userId: number): CustomerAdminResponse {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Customer not found');

    user.status = 'APPROVED';
    user.updatedAt = new Date().toISOString();
    this.saveUsers(users);

    // Auto-create & activate wallet if not already existing
    const wallets = this.getWallets();
    let wallet = wallets.find(w => w.userId === userId);
    if (!wallet) {
      const activeCount = wallets.length;
      wallet = {
        id: Date.now(),
        accountNumber: `PAYWALLET${100001 + activeCount}`,
        userId: user.id,
        balance: 0.00,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      wallets.push(wallet);
      this.saveWallets(wallets);
    }

    return {
      id: user.id,
      customerId: user.customerId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      aadhaarMasked: user.aadhaarMasked,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      nationality: user.nationality,
      residentialAddress: user.residentialAddress,
      bankAccountNumberMasked: user.bankAccountNumberMasked,
      occupation: user.occupation,
      walletAccountNumber: wallet.accountNumber,
      walletBalance: wallet.balance,
      status: user.status,
      registrationDate: user.createdAt
    };
  }

  rejectCustomer(userId: number): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Customer not found');
    user.status = 'REJECTED';
    user.updatedAt = new Date().toISOString();
    this.saveUsers(users);
  }

  suspendCustomer(userId: number): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('Customer not found');
    user.status = 'SUSPENDED';
    user.updatedAt = new Date().toISOString();
    this.saveUsers(users);

    const wallets = this.getWallets();
    const wallet = wallets.find(w => w.userId === userId);
    if (wallet) {
      wallet.status = 'FROZEN';
      this.saveWallets(wallets);
    }
  }

  getAdminTransactions(search?: string, type?: string, status?: string): Transaction[] {
    const txns = this.getTransactions();
    return txns.filter(t => {
      if (type && type !== 'ALL' && t.type !== type) return false;
      if (status && status !== 'ALL' && t.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.transactionReference.toLowerCase().includes(q) ||
          (t.fromCustomerName && t.fromCustomerName.toLowerCase().includes(q)) ||
          (t.toCustomerName && t.toCustomerName.toLowerCase().includes(q)) ||
          (t.fromAccount && t.fromAccount.toLowerCase().includes(q)) ||
          (t.toAccount && t.toAccount.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  getAdminReports(): AdminReportResponse {
    const users = this.getUsers().filter(u => u.role === 'ROLE_CUSTOMER');
    const wallets = this.getWallets();
    const activeWallets = wallets.filter(w => w.status === 'ACTIVE');
    const txns = this.getTransactions();

    const totalTransferAmount = txns
      .filter(t => t.type === 'TRANSFER' && t.status === 'SUCCESS')
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalDepositAmount = txns
      .filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalSystemBalance = activeWallets.reduce((s, w) => s + Number(w.balance), 0);

    return {
      totalTransactions: txns.length,
      successfulTransactions: txns.filter(t => t.status === 'SUCCESS').length,
      failedTransactions: txns.filter(t => t.status === 'FAILED').length,
      totalTransferAmount: Number(totalTransferAmount.toFixed(2)),
      totalDepositAmount: Number(totalDepositAmount.toFixed(2)),
      totalCustomers: users.length,
      approvedCustomers: users.filter(u => u.status === 'APPROVED').length,
      pendingCustomers: users.filter(u => u.status === 'VERIFICATION_PENDING').length,
      rejectedCustomers: users.filter(u => u.status === 'REJECTED').length,
      suspendedCustomers: users.filter(u => u.status === 'SUSPENDED').length,
      totalWallets: wallets.length,
      activeWallets: activeWallets.length,
      totalSystemBalance: Number(totalSystemBalance.toFixed(2))
    };
  }

  // Pre-seed Helper for acceptance test scenario
  seedAcceptanceScenario() {
    resetDatabase();
    const users = this.getUsers();
    const wallets = this.getWallets();
    const txns = this.getTransactions();

    // 1. Rahul Sharma (Approved, balance: 1000)
    const rahulUser = {
      id: 101,
      customerId: 'PAY100001',
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      passwordHash: mockHash('Rahul@123'),
      phoneNumber: '9876543210',
      aadhaarMasked: 'XXXX XXXX 7890',
      aadhaarHash: mockHash('123456787890'),
      dateOfBirth: '1995-05-15',
      gender: 'Male',
      nationality: 'Indian',
      residentialAddress: 'Flat 402, Green Glen Heights, Bengaluru',
      bankAccountNumberMasked: 'XXXXXX5432',
      occupation: 'Software Engineer',
      transactionPasswordHash: mockHash('123456'),
      role: 'ROLE_CUSTOMER',
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const rahulWallet: Wallet = {
      id: 1001,
      accountNumber: 'PAYWALLET100001',
      userId: rahulUser.id,
      balance: 1000.00,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 2. Amit Sharma (Approved, balance: 0)
    const amitUser = {
      id: 102,
      customerId: 'PAY100002',
      fullName: 'Amit Sharma',
      email: 'amit@example.com',
      passwordHash: mockHash('Amit@123'),
      phoneNumber: '9876543211',
      aadhaarMasked: 'XXXX XXXX 4321',
      aadhaarHash: mockHash('123456784321'),
      dateOfBirth: '1996-08-20',
      gender: 'Male',
      nationality: 'Indian',
      residentialAddress: 'B-12, Sector 62, Noida',
      bankAccountNumberMasked: 'XXXXXX9876',
      occupation: 'Product Manager',
      transactionPasswordHash: mockHash('654321'),
      role: 'ROLE_CUSTOMER',
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const amitWallet: Wallet = {
      id: 1002,
      accountNumber: 'PAYWALLET100002',
      userId: amitUser.id,
      balance: 0.00,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. Deposit transaction for Rahul
    const depositTxn: Transaction = {
      id: 201,
      transactionReference: 'PCX8A92K72',
      type: 'DEPOSIT',
      direction: 'SELF_DEPOSIT',
      senderWalletId: null,
      receiverWalletId: rahulWallet.id,
      toAccount: rahulWallet.accountNumber,
      toCustomerName: rahulUser.fullName,
      amount: 1000.00,
      status: 'SUCCESS',
      description: 'Cash Deposit via PayCore Cash Services',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
    };

    users.push(rahulUser, amitUser);
    wallets.push(rahulWallet, amitWallet);
    txns.push(depositTxn);

    this.saveUsers(users);
    this.saveWallets(wallets);
    this.saveTransactions(txns);
  }
}

const engine = new InBrowserSpringEngine();

// Export unified API client that supports both In-Browser Engine and HTTP Spring Boot REST API
export const api = {
  // Config
  getConfig: getEngineConfig,
  saveConfig: saveEngineConfig,
  resetDb: resetDatabase,
  seedScenario: () => engine.seedAcceptanceScenario(),

  // Auth
  async register(req: RegisterRequest): Promise<AuthResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data.data;
    }
    return engine.register(req);
  },

  async login(req: LoginRequest): Promise<AuthResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data.data;
    }
    return engine.login(req);
  },

  async adminLogin(req: LoginRequest): Promise<AuthResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Admin login failed');
      return data.data;
    }
    return engine.adminLogin(req);
  },

  // Customer
  async getProfile(userId: number, token?: string) {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.getProfile(userId);
  },

  async getWallet(userId: number, token?: string): Promise<Wallet> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.getWallet(userId);
  },

  async getBalance(userId: number, token?: string): Promise<number> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.balance;
    }
    const wallet = engine.getWallet(userId);
    return wallet ? Number(wallet.balance) : 0.00;
  },

  async lookupReceiver(accountNumber: string, token?: string): Promise<ReceiverLookupResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/receiver/${accountNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.lookupReceiver(accountNumber);
  },

  async deposit(userId: number, req: DepositRequest, token?: string): Promise<Wallet> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.deposit(userId, req);
  },

  async transfer(senderUserId: number, req: TransferRequest, token?: string): Promise<TransferResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(req)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.transfer(senderUserId, req);
  },

  async getCustomerTransactions(userId: number, token?: string): Promise<Transaction[]> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/customer/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.content || data.data;
    }
    return engine.getCustomerTransactions(userId);
  },

  // Admin
  async getAdminDashboard(token?: string): Promise<AdminDashboardResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.getAdminDashboard();
  },

  async getAdminCustomers(search?: string, status?: string, token?: string): Promise<CustomerAdminResponse[]> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'ALL') params.append('status', status);
      const res = await fetch(`${config.apiUrl}/admin/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.content || data.data;
    }
    return engine.getAdminCustomers(search, status);
  },

  async approveCustomer(userId: number, token?: string): Promise<CustomerAdminResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/admin/customers/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.approveCustomer(userId);
  },

  async rejectCustomer(userId: number, token?: string): Promise<void> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/admin/customers/${userId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return;
    }
    engine.rejectCustomer(userId);
  },

  async suspendCustomer(userId: number, token?: string): Promise<void> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/admin/customers/${userId}/suspend`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return;
    }
    engine.suspendCustomer(userId);
  },

  async getAdminTransactions(search?: string, type?: string, status?: string, token?: string): Promise<Transaction[]> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const params = new URLSearchParams();
      if (search) params.append('reference', search);
      if (type && type !== 'ALL') params.append('type', type);
      if (status && status !== 'ALL') params.append('status', status);
      const res = await fetch(`${config.apiUrl}/admin/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.content || data.data;
    }
    return engine.getAdminTransactions(search, type, status);
  },

  async getAdminReports(token?: string): Promise<AdminReportResponse> {
    const config = getEngineConfig();
    if (config.backendMode === 'localhost_8080') {
      const res = await fetch(`${config.apiUrl}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    }
    return engine.getAdminReports();
  }
};
