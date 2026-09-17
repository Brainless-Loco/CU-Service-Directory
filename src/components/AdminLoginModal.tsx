import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, X, KeyRound, ShieldCheck } from 'lucide-react';
import { AdminAuthState, AdminUser } from '../types';
import { api } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  isPage?: boolean;
  onClose: () => void;
  onLoginSuccess: (auth: AdminAuthState) => void;
  users: AdminUser[];
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  isPage = false,
  onClose,
  onLoginSuccess,
  users,
}) => {
  const [email, setEmail] = useState('tonmoy.ict@cu.ac.bd');
  const [password, setPassword] = useState('cu@admin2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth: AdminAuthState = await api.login(email, password);
      localStorage.setItem('cu_services_admin_auth', JSON.stringify(auth));
      onLoginSuccess(auth);
      if (!isPage) onClose();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Invalid administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickAccount = (user: AdminUser) => {
    setEmail(user.email);
    setPassword(user.passwordPlain);
    setError(null);
  };

  return (
    <div className={`${isPage ? 'min-h-screen' : 'fixed inset-0'} z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto`}>
      <div
        id="admin-login-dialog"
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 my-8"
      >
        {/* Close Button */}
        <button
          id="close-login-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={isPage ? 'Return to public portal' : 'Close login'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Portal Authentication</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access University of Chittagong Administrative Management Console
          </p>
        </div>

        {/* Quick Credentials Tester Bar */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Quick Fill Test Accounts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectQuickAccount(u)}
                className={`text-left p-1.5 rounded-lg border text-2xs transition-colors ${
                  email.toLowerCase() === u.email.toLowerCase()
                    ? 'border-emerald-500 bg-emerald-50/80 font-bold text-emerald-950'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="block truncate font-semibold">{u.fullName.split(' ')[0]}</span>
                <span className="block text-3xs font-mono text-slate-500 truncate">
                  {u.role.replace('MAINTENANCE_', '')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Administrative Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@cu.ac.bd"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Secret Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Management Console'}
          </button>
        </form>
      </div>
    </div>
  );
};
