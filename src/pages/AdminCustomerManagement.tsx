import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CustomerAdminResponse } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Check, 
  X, 
  ShieldAlert,
  Calendar,
  Wallet,
  Building,
  RefreshCw
} from 'lucide-react';

export const AdminCustomerManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<CustomerAdminResponse[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAdminResponse | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [currentUser]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminCustomers(search, statusFilter, currentUser?.token);
      setCustomers(data);
    } catch {
      // empty
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await api.approveCustomer(id, currentUser?.token);
      setActionMessage(`Customer ${res.fullName} approved! Wallet ${res.walletAccountNumber} activated.`);
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(res);
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectCustomer(id, currentUser?.token);
      setActionMessage(`Customer marked as REJECTED.`);
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer((prev: CustomerAdminResponse | null) => prev ? { ...prev, status: 'REJECTED' } : null);
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Reject failed');
    }
  };

  const handleSuspend = async (id: number) => {
    try {
      await api.suspendCustomer(id, currentUser?.token);
      setActionMessage(`Customer account SUSPENDED and wallet frozen.`);
      loadCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer((prev: CustomerAdminResponse | null) => prev ? { ...prev, status: 'SUSPENDED' } : null);
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Suspend failed');
    }
  };

  const filtered = customers.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Management</h1>
          <p className="text-xs text-slate-500">
            Review applicant identity, manage KYC verification lifecycle, and audit wallet statuses
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>Refresh Customers</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex justify-between items-center">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-blue-600 hover:text-blue-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar: Search and Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer ID, name, email, phone..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Tabular Segmented Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          {['ALL', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'VERIFICATION_PENDING' ? 'Pending' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading customer records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No customers found matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">KYC Occupation</th>
                  <th className="py-3 px-4">Wallet Account</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {c.customerId}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{c.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Aadhaar: {c.aadhaarMasked}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-800">{c.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.phoneNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <div>{c.occupation}</div>
                      <div className="text-[11px] text-slate-400">{c.gender} · {c.nationality}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      {c.walletAccountNumber ? (
                        <span className="font-semibold text-slate-800">{c.walletAccountNumber}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Provisioned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      ₹{Number(c.walletBalance || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        c.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        c.status === 'VERIFICATION_PENDING' ? 'bg-amber-50 text-amber-700' :
                        c.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Full Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {c.status === 'VERIFICATION_PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(c.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                              title="Approve and Provision Wallet"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(c.id)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition-all"
                              title="Reject Application"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {c.status === 'APPROVED' && (
                          <button
                            onClick={() => handleSuspend(c.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg text-[11px] font-medium transition-colors"
                            title="Suspend and Freeze Wallet"
                          >
                            Suspend
                          </button>
                        )}

                        {c.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-medium transition-colors"
                            title="Re-activate Account"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Customer Audit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.fullName}</h3>
                <span className="text-xs text-blue-600 font-mono font-semibold">
                  Customer ID: {selectedCustomer.customerId}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block font-mono">Account Status</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">PayCore Wallet</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedCustomer.walletAccountNumber || 'Not Active'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Current Balance</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{Number(selectedCustomer.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Registration Date</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedCustomer.registrationDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Email Address</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.email}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Phone Number</span>
                  <span className="font-semibold font-mono text-slate-900">{selectedCustomer.phoneNumber}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Masked Aadhaar</span>
                  <span className="font-bold font-mono text-slate-900">{selectedCustomer.aadhaarMasked}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Masked Bank Account</span>
                  <span className="font-bold font-mono text-slate-900">{selectedCustomer.bankAccountNumberMasked}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Date of Birth</span>
                  <span className="font-mono text-slate-900">{selectedCustomer.dateOfBirth}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400 block">Occupation</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.occupation}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Residential Address</span>
                <span className="font-medium text-slate-800 leading-relaxed">{selectedCustomer.residentialAddress}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close Audit View
              </button>

              <div className="flex items-center gap-2">
                {selectedCustomer.status === 'VERIFICATION_PENDING' && (
                  <button
                    onClick={() => handleApprove(selectedCustomer.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Approve Customer
                  </button>
                )}
                {selectedCustomer.status === 'APPROVED' && (
                  <button
                    onClick={() => handleSuspend(selectedCustomer.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                  >
                    Suspend Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
