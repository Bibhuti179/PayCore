export type Role = 'ROLE_ADMIN' | 'ROLE_CUSTOMER';

export type AccountStatus = 'VERIFICATION_PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type TransactionType = 'DEPOSIT' | 'TRANSFER';

export type TransactionStatus = 'SUCCESS' | 'FAILED';

export interface User {
  id: number;
  customerId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  aadhaarMasked: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  residentialAddress: string;
  bankAccountNumberMasked: string;
  occupation: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: number;
  accountNumber: string;
  userId: number;
  balance: number; // Stored with 2 decimal precision
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  transactionReference: string;
  type: TransactionType;
  direction?: 'SENT' | 'RECEIVED' | 'SELF_DEPOSIT';
  senderWalletId?: number | null;
  receiverWalletId: number;
  fromAccount?: string;
  fromCustomerName?: string;
  toAccount?: string;
  toCustomerName?: string;
  amount: number;
  status: TransactionStatus;
  failureReason?: string;
  description?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  customerId: string;
  fullName: string;
  email: string;
  role: Role;
  status: AccountStatus;
  walletAccountNumber?: string;
  balance: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  aadhaarNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  residentialAddress: string;
  bankAccountNumber: string;
  occupation: string;
  transactionPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

export interface TransferRequest {
  receiverAccountNumber: string;
  amount: number;
  transactionPassword: string;
  description?: string;
}

export interface TransferResponse {
  transactionReference: string;
  amount: number;
  senderAccountNumber: string;
  senderName: string;
  receiverAccountNumber: string;
  receiverName: string;
  updatedBalance: number;
  status: string;
  timestamp: string;
}

export interface ReceiverLookupResponse {
  accountNumber: string;
  receiverName: string;
  valid: boolean;
}

export interface AdminDashboardResponse {
  totalCustomers: number;
  approvedCustomers: number;
  pendingCustomers: number;
  rejectedCustomers: number;
  suspendedCustomers: number;
  totalWallets: number;
  totalSystemBalance: number;
  totalTransactions: number;
  todayTransactions: number;
}

export interface AdminReportResponse {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalTransferAmount: number;
  totalDepositAmount: number;
  totalCustomers: number;
  approvedCustomers: number;
  pendingCustomers: number;
  rejectedCustomers: number;
  suspendedCustomers: number;
  totalWallets: number;
  activeWallets: number;
  totalSystemBalance: number;
}

export interface CustomerAdminResponse {
  id: number;
  customerId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  aadhaarMasked: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  residentialAddress: string;
  bankAccountNumberMasked: string;
  occupation: string;
  walletAccountNumber?: string;
  walletBalance: number;
  status: AccountStatus;
  registrationDate: string;
}
