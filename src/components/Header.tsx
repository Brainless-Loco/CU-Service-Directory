import React from 'react';
import { Search, ShieldCheck, LogIn, LogOut, PlusCircle, ExternalLink, Globe } from 'lucide-react';
import { AdminAuthState } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  adminAuth: AdminAuthState;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onAddNewService: () => void;
  totalServicesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  adminAuth,
  onOpenAdmin,
  onOpenLogin,
  onLogout,
  onAddNewService,
  totalServicesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top University ICT Cell Notification Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Official Service Directory
            </span>
            {/* <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-mono tracking-tight flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              services.cu.ac.bd
            </span> */}
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <a
              href="https://cu.ac.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              CU Official Portal <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="mailto:support.ict@cu.ac.bd"
              className="hover:text-white transition-colors"
            >
              ICT Cell Support
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* University Branding */}
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-16 shrink-0 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-lg shadow-xs">
              <img
                src="/cu-logo.svg"
                alt="University of Chittagong Seal"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Service Directory
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {totalServicesCount} Portals Online
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>University of Chittagong</span>
                <span className="text-sm sm:text-base font-medium text-slate-500 font-bangla-serif">
                  (চট্টগ্রাম বিশ্ববিদ্যালয়)
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Single Sign-On & Central Directory for All Academic, Student & Administrative Services
              </p>
            </div>
          </div>

          {/* Search and Admin Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="portal-search-input"
                type="text"
                placeholder="Search portals, emails, SIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Admin Controls */}
            {adminAuth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  id="quick-add-service-btn"
                  onClick={onAddNewService}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                  title="Add new portal card"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Service</span>
                </button>

                <button
                  id="open-admin-panel-btn"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Panel</span>
                </button>

                <button
                  id="admin-logout-btn"
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout from Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="admin-login-modal-open-btn"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
