import React, { useState, useEffect } from 'react';
import { X, UserCheck, KeyRound, RefreshCw, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { AdminUser, UserRole } from '../types';
import { generateSecurePassword } from '../utils/textUtils';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: AdminUser) => void;
  userToEdit?: AdminUser | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('ICT Cell');
  const [role, setRole] = useState<UserRole>('MAINTENANCE_SERVICES');
  const [passwordPlain, setPasswordPlain] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [copiedPass, setCopiedPass] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setFullName(userToEdit.fullName);
      setEmail(userToEdit.email);
      setDepartment(userToEdit.department);
      setRole(userToEdit.role);
      setPasswordPlain(userToEdit.passwordPlain);
      setIsActive(userToEdit.isActive);
    } else {
      setFullName('');
      setEmail('');
      setDepartment('ICT Cell');
      setRole('MAINTENANCE_SERVICES');
      setPasswordPlain(generateSecurePassword(14));
      setIsActive(true);
    }
    setFormError(null);
    setCopiedPass(false);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleRegeneratePassword = () => {
    const newPass = generateSecurePassword(14);
    setPasswordPlain(newPass);
    setCopiedPass(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordPlain);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full name of administrator is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('Valid administrative email address is required.');
      return;
    }

    if (!passwordPlain || passwordPlain.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    const savedUser: AdminUser = {
      id: userToEdit ? userToEdit.id : 'usr-' + Date.now(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      role,
      passwordPlain: passwordPlain.trim(),
      isActive,
      createdAt: userToEdit ? userToEdit.createdAt : new Date().toISOString(),
      lastLogin: userToEdit?.lastLogin,
    };

    onSave(savedUser);
    onClose();
  };

  const getRoleDescription = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return 'Unrestricted administrative access. Full CRUD on all tables, user management, backups, and secret configuration.';
      case 'MAINTENANCE_SERVICES':
        return 'Maintenance access scoped strictly to Services table (Add, Edit, Disable, and Delete service cards).';
      case 'MAINTENANCE_NOTICES':
        return 'Maintenance access scoped strictly to Notices table (Broadcast announcements, coming soon alerts, and maintenance windows).';
      case 'MAINTENANCE_GROUPS':
        return 'Maintenance access scoped strictly to Category Groups table (Order, rename, and add categories).';
      case 'MAINTENANCE_VIEWER':
        return 'Read-only maintenance inspection. Cannot create, edit, or delete records.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="user-modal-dialog"
        className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {userToEdit ? 'Edit Administrative User' : 'Provision New System User'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Auto-generate credentials and configure role-based table CRUD permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Full Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Mahmudul Hasan"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Cell <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. ICT Cell / Registrar Office"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institutional Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. officer@cu.ac.bd"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              System Authorization Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 font-semibold"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN — Full System Access (All Tables & Users)</option>
              <option value="MAINTENANCE_SERVICES">MAINTENANCE_SERVICES — Manage Services Table Only</option>
              <option value="MAINTENANCE_NOTICES">MAINTENANCE_NOTICES — Manage Notices Table Only</option>
              <option value="MAINTENANCE_GROUPS">MAINTENANCE_GROUPS — Manage Category Groups Table Only</option>
              <option value="MAINTENANCE_VIEWER">MAINTENANCE_VIEWER — Read-Only Auditor Access</option>
            </select>

            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{getRoleDescription(role)}</span>
            </div>
          </div>

          {/* Auto-Generated Password Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Auto-Generated Strong Password</span>
              </label>
              <button
                type="button"
                onClick={handleRegeneratePassword}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-1 rounded border border-emerald-200 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New</span>
              </button>
            </div>

            <p className="text-2xs text-emerald-800">
              This password will be securely stored in the user table and accessible to the Superadmin to copy and share with the maintenance user.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={passwordPlain}
                onChange={(e) => setPasswordPlain(e.target.value)}
                className="flex-1 font-mono text-sm px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 font-bold tracking-wider"
              />
              <button
                type="button"
                onClick={handleCopyPassword}
                className="px-3 py-2 text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-2xs"
                title="Copy password to clipboard"
              >
                {copiedPass ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPass ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* User Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Account Status</span>
              <span className="text-2xs text-slate-500">Allow user to sign in to their administrative maintenance scope</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            {userToEdit ? 'Save User Changes' : 'Provision User Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
