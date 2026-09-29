import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, ShieldCheck, Mail, Phone, Calendar, MapPin, Briefcase, CreditCard, Building } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const data = await api.getProfile(currentUser.id, currentUser.token);
      setProfile(data);
    } catch {
      // fallback to currentUser
      setProfile(currentUser);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !profile) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading profile data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-sm space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {profile.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.fullName}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                <span>Customer ID: {profile.customerId}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 font-semibold">{profile.status}</span>
              </div>
            </div>
          </div>

          <div className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>KYC Verified</span>
          </div>
        </div>

        {/* Section 1: Contact & Identification */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Contact &amp; Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </span>
              <span className="font-semibold text-slate-900">{profile.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </span>
              <span className="font-semibold text-slate-900 font-mono">{profile.phoneNumber}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Date of Birth
              </span>
              <span className="font-semibold text-slate-900 font-mono">{profile.dateOfBirth}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5" /> Gender &amp; Nationality
              </span>
              <span className="font-semibold text-slate-900">{profile.gender} · {profile.nationality}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Masked Financial Credentials (PCI-DSS & Privacy Standards) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Masked Statutory &amp; Banking Records
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3.5 h-3.5" /> Masked Aadhaar
              </span>
              <span className="font-bold text-slate-900 font-mono tracking-wider">{profile.aadhaarMasked}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5" /> Linked Bank Account
              </span>
              <span className="font-bold text-slate-900 font-mono tracking-wider">{profile.bankAccountNumberMasked}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5" /> Occupation
              </span>
              <span className="font-semibold text-slate-900">{profile.occupation}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 sm:col-span-2">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5" /> Residential Address
              </span>
              <span className="font-medium text-slate-700 leading-relaxed">{profile.residentialAddress}</span>
            </div>
          </div>
        </div>

        {/* Wallet Metadata */}
        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-blue-600 font-semibold block font-mono text-[11px]">PayCore Wallet Account</span>
            <span className="font-bold font-mono text-slate-900 text-sm">
              {profile.walletAccountNumber || 'Pending Approval'}
            </span>
          </div>
          <div>
            <span className="text-blue-600 font-semibold block font-mono text-[11px]">Member Since</span>
            <span className="font-medium text-slate-700 font-mono">
              {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
