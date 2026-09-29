import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types';
import { ShieldCheck, AlertCircle, CheckCircle2, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  setCurrentTab: (tab: string) => void;
  autofillData?: any;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentTab, autofillData }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    aadhaarNumber: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Indian',
    residentialAddress: '',
    bankAccountNumber: '',
    occupation: '',
    transactionPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showTxnPassword, setShowTxnPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ customerId: string; fullName: string } | null>(null);

  useEffect(() => {
    if (autofillData) {
      setFormData(prev => ({ ...prev, ...autofillData }));
    }
  }, [autofillData]);

  const autofillRahul = () => {
    setFormData({
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
    setError(null);
  };

  const autofillAmit = () => {
    setFormData({
      fullName: 'Amit Sharma',
      email: 'amit@example.com',
      password: 'Amit@123',
      phoneNumber: '9876543211',
      aadhaarNumber: '123456784321',
      dateOfBirth: '1996-08-20',
      gender: 'Male',
      nationality: 'Indian',
      residentialAddress: 'B-12, Sector 62, Noida',
      bankAccountNumber: '9876543210',
      occupation: 'Product Manager',
      transactionPassword: '654321'
    });
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const validate = (): string | null => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'A valid email address is required';
    if (formData.password.length < 6) return 'Login password must be at least 6 characters';
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) return 'Phone number must be a valid 10-digit Indian mobile number';
    const cleanAadhaar = formData.aadhaarNumber.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) return 'Aadhaar card must be a 12-digit number';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.nationality.trim()) return 'Nationality is required';
    if (!formData.residentialAddress.trim()) return 'Residential address is required';
    if (!/^\d{9,18}$/.test(formData.bankAccountNumber.trim())) return 'Bank account number must be between 9 and 18 digits';
    if (!formData.occupation.trim()) return 'Occupation is required';
    if (formData.transactionPassword.length < 4) return 'Transaction password must be at least 4 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await register(formData);
      setSuccessInfo({ customerId: res.customerId, fullName: res.fullName });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successInfo) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
              Registration Successful
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Welcome, {successInfo.fullName}
            </h2>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Auto-Generated Customer ID:</span>
              <span className="font-mono font-bold text-blue-600 text-sm">{successInfo.customerId}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Account Status:</span>
              <span className="font-semibold text-amber-600">VERIFICATION_PENDING</span>
            </div>
            <p className="text-xs text-slate-600 pt-2 border-t border-slate-200 leading-relaxed">
              Your registration has been submitted to the compliance officer. You can log in to view your pending status, and your wallet will be activated immediately upon admin approval.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setCurrentTab('login')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Registration</h1>
            <p className="text-xs text-slate-500 mt-1">
              Create your PayCore digital wallet account. All fields are verified by compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={autofillRahul}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              title="Autofill acceptance test customer: Rahul Sharma"
            >
              Autofill Rahul
            </button>
            <button
              type="button"
              onClick={autofillAmit}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Autofill second customer: Amit Sharma"
            >
              Autofill Amit
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
              01. Personal Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Login Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Phone Number (India) *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Identity & KYC */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
              02. Statutory Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Aadhaar Card Number *
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="12-digit Aadhaar number"
                  maxLength={14}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6. Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  7. Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  8. Nationality *
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Indian"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Address Profile */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
              03. Banking &amp; Security Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  9. Residential Address *
                </label>
                <textarea
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  10. Bank Account Number *
                </label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  11. Occupation *
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>

              <div className="sm:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-blue-950">
                    12. Transaction Password (Crucial) *
                  </label>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Separate from login password
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showTxnPassword ? 'text' : 'password'}
                    name="transactionPassword"
                    value={formData.transactionPassword}
                    onChange={handleChange}
                    placeholder="Enter 4-20 digit transaction password (e.g. 123456)"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowTxnPassword(!showTxnPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showTxnPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-blue-700/80 mt-1">
                  Required every time you authorize a money transfer. Never stored in plain text.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentTab('login')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Already registered? Log in
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
