import React, { useState } from 'react';
import {
  X, Plus, Edit, Trash2, FolderPlus, Download, Upload, RotateCcw,
  CheckCircle, AlertCircle, Shield, Globe, Layers, KeyRound, ExternalLink,
  Search, ArrowUpDown
} from 'lucide-react';
import { ServiceItem, ServiceGroup, AdminAuthState } from '../types';
import { countWords } from '../utils/textUtils';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminAuth: AdminAuthState;
  onLogout: () => void;
  services: ServiceItem[];
  groups: ServiceGroup[];
  onAddService: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
  onAddGroup: () => void;
  onEditGroup: (group: ServiceGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetDefaults: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  adminAuth,
  onLogout,
  services,
  groups,
  onAddService,
  onEditService,
  onDeleteService,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onExportData,
  onImportData,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'groups' | 'settings'>('services');
  const [searchFilter, setSearchFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showFeedback('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('error', 'Passwords do not match.');
      return;
    }
    localStorage.setItem('cu_admin_custom_password', newPassword);
    setNewPassword('');
    setConfirmPassword('');
    showFeedback('success', 'Admin password updated successfully!');
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.portalUrl.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesGroup = groupFilter === 'all' || s.groupId === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const getGroupName = (gid: string) => {
    return groups.find((g) => g.id === gid)?.name || 'Uncategorized';
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      showFeedback('success', 'Portals configuration imported successfully!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="admin-management-panel"
        className="relative w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        {/* Admin Header */}
        <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">CU Services Admin Console</h2>
                <span className="text-2xs font-semibold uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                  Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <span className="text-slate-200 font-mono">{adminAuth.userEmail}</span> (ICT Cell)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-panel-logout-btn"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 hover:text-white text-slate-300 transition-colors"
            >
              Sign Out
            </button>
            <button
              id="close-admin-panel-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`p-3 mx-6 mt-4 text-xs rounded-xl flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Sub Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 text-sm font-medium">
            <button
              id="admin-tab-services-btn"
              onClick={() => setActiveTab('services')}
              className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Portals & Services ({services.length})</span>
            </button>

            <button
              id="admin-tab-groups-btn"
              onClick={() => setActiveTab('groups')}
              className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'groups'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categories / Groups ({groups.length})</span>
            </button>

            <button
              id="admin-tab-settings-btn"
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-3 border-b-2 font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Backup & Security</span>
            </button>
          </div>

          {/* Tab specific primary CTA */}
          <div className="pb-3">
            {activeTab === 'services' && (
              <button
                id="admin-panel-add-service-btn"
                onClick={onAddService}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            )}

            {activeTab === 'groups' && (
              <button
                id="admin-panel-add-group-btn"
                onClick={onAddGroup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Category Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SERVICES MANAGER */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, description or URL..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="all">All Category Groups</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Services List Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-2xs uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Landscape Logo</th>
                        <th className="py-3 px-4">Portal Title & Link</th>
                        <th className="py-3 px-4">Category Group</th>
                        <th className="py-3 px-4">Description (Max 50w)</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredServices.map((srv) => {
                        const words = countWords(srv.description);
                        return (
                          <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-24 aspect-[16/9] rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <img
                                  src={srv.logoUrl}
                                  alt={srv.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <div className="font-semibold text-slate-900">{srv.title}</div>
                              <a
                                href={srv.portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-2xs text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span className="truncate">{srv.portalUrl}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </td>

                            <td className="py-3 px-4">
                              <span className="inline-block px-2 py-0.5 text-2xs font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {getGroupName(srv.groupId)}
                              </span>
                            </td>

                            <td className="py-3 px-4 max-w-sm">
                              <p className="text-xs text-slate-600 line-clamp-2">{srv.description}</p>
                              <span className="text-2xs text-slate-600 mt-0.5 block">
                                {words} / 50 words
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  id={`edit-srv-${srv.id}`}
                                  onClick={() => onEditService(srv)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Edit Portal"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  id={`delete-srv-${srv.id}`}
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${srv.title}"?`)) {
                                      onDeleteService(srv.id);
                                      showFeedback('success', `Deleted "${srv.title}"`);
                                    }
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Delete Portal"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredServices.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                            No service portals found matching your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GROUPS MANAGER */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((grp) => {
                  const servicesInGroup = services.filter((s) => s.groupId === grp.id);
                  return (
                    <div
                      key={grp.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                            <h3 className="font-bold text-slate-900">{grp.name}</h3>
                          </div>
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Order: #{grp.order}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">
                          {grp.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          {servicesInGroup.length} portal{servicesInGroup.length !== 1 ? 's' : ''} assigned
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            id={`edit-group-${grp.id}`}
                            onClick={() => onEditGroup(grp)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                            title="Edit group"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-group-${grp.id}`}
                            onClick={() => {
                              if (servicesInGroup.length > 0) {
                                if (
                                  !confirm(
                                    `This group currently contains ${servicesInGroup.length} service portal(s). Deleting it will reassign them to general. Proceed?`
                                  )
                                ) {
                                  return;
                                }
                              }
                              onDeleteGroup(grp.id);
                              showFeedback('success', `Deleted group "${grp.name}"`);
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                            title="Delete group"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & SECURITY */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              {/* Change Admin Password */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  Update Administrative Password
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Set a new confidential passcode for services.cu.ac.bd admin console
                </p>

                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-semibold text-slate-700 mb-1">
                        New Password (min 6 characters)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-semibold text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Save New Password
                  </button>
                </form>
              </div>

              {/* Export & Import Backup */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Data Persistence, Export & Import
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Export all CU portal cards and categories to a portable JSON file, or restore from a previous backup
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    id="export-json-btn"
                    onClick={onExportData}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Backup (JSON)
                  </button>

                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>

                  <button
                    id="reset-defaults-btn"
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to restore the official default University of Chittagong portals? Any custom portals added will be reloaded to default.'
                        )
                      ) {
                        onResetDefaults();
                        showFeedback('success', 'Reset to official CU service portals.');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Official Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
