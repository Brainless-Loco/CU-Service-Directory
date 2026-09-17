import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Layers,
  Bell,
  Users,
  Database,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Clock,
  KeyRound,
  ExternalLink,
  RefreshCw,
  Download,
  AlertTriangle,
  FolderPlus,
  ShieldCheck,
  UserPlus,
  Lock,
  Type,
  BarChart3,
  Activity,
  MousePointerClick,
  Sliders,
  FileText,
} from 'lucide-react';
import {
  ServiceItem,
  ServiceGroup,
  PortalNotice,
  AdminUser,
  AdminAuthState,
  ServiceStatus,
  NoticeStatus,
  UserRole,
  ServiceClickEvent,
  ServiceHealthStatus,
  PortalFontSettings,
  AdminAuditLog,
} from '../types';
import { ROLE_PERMISSIONS, DEFAULT_DATABASE_CONFIG, MYSQL_PORTAL_DDL, getDatabaseConnectionString } from '../config/database';
import { formatAuthenticationInfo, formatPortalDisplayUrl } from '../utils/textUtils';
import {
  ACTIVE_FONTS,
  ENGLISH_FONT_PRESETS,
  BANGLA_FONT_PRESETS,
  FONT_SAMPLES,
} from '../config/fonts';
import { ClicksInfographicsView } from './admin/ClicksInfographicsView';
import { ServiceHealthView } from './admin/ServiceHealthView';
import { DynamicFontManagerView } from './admin/DynamicFontManagerView';
import { AuditLogsView } from './admin/AuditLogsView';

interface AdminPageViewProps {
  auth: AdminAuthState;
  services: ServiceItem[];
  groups: ServiceGroup[];
  notices: PortalNotice[];
  users: AdminUser[];
  clicks?: ServiceClickEvent[];
  healthStatuses?: Record<string, ServiceHealthStatus>;
  fontSettings?: PortalFontSettings;
  auditLogs?: AdminAuditLog[];
  onRefreshClicks?: () => void;
  onUpdateFontSettings?: (settings: PortalFontSettings) => void;
  onPingService?: (serviceId: string, url: string) => Promise<void>;
  onPingAllServices?: () => Promise<void>;
  onClearAuditLogs?: () => void;
  onBackToPortal: () => void;
  onLogout: () => void;
  onAddService: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (serviceId: string) => void;
  onToggleServiceStatus: (serviceId: string) => void;
  onAddNotice: () => void;
  onEditNotice: (notice: PortalNotice) => void;
  onDeleteNotice: (noticeId: string) => void;
  onToggleNoticeStatus: (noticeId: string) => void;
  onAddUser: () => void;
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onAddGroup: () => void;
  onEditGroup: (group: ServiceGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onResetToDefaults: () => void;
}

type AdminTab =
  | 'services'
  | 'notices'
  | 'groups'
  | 'users'
  | 'analytics'
  | 'health'
  | 'typography'
  | 'audit_logs'
  | 'database';

const FULL_SQL_DDL = MYSQL_PORTAL_DDL;

export const AdminPageView: React.FC<AdminPageViewProps> = ({
  auth,
  services,
  groups,
  notices,
  users,
  clicks,
  healthStatuses,
  fontSettings,
  auditLogs,
  onRefreshClicks,
  onUpdateFontSettings,
  onPingService,
  onPingAllServices,
  onClearAuditLogs,
  onBackToPortal,
  onLogout,
  onAddService,
  onEditService,
  onDeleteService,
  onToggleServiceStatus,
  onAddNotice,
  onEditNotice,
  onDeleteNotice,
  onToggleNoticeStatus,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ServiceStatus>('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [copiedDDL, setCopiedDDL] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [testTextEn, setTestTextEn] = useState('Chittagong University Central Services Gateway 2026');
  const [testTextBn, setTestTextBn] = useState('চট্টগ্রাম বিশ্ববিদ্যালয় কেন্দ্রীয় সেবা পোর্টাল (services.cu.ac.bd)');
  const [testFontSize, setTestFontSize] = useState<number>(18);

  // RBAC permissions for the logged-in user
  const permissions = ROLE_PERMISSIONS[auth.role as UserRole] || ROLE_PERMISSIONS.MAINTENANCE_VIEWER;
  const isSuperAdmin = auth.role === 'SUPER_ADMIN';

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesGroup = groupFilter === 'ALL' || s.groupId === groupFilter;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [services, searchQuery, statusFilter, groupFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === 'ACTIVE').length;
    const disabled = services.filter((s) => s.status === 'DISABLED').length;
    const comingSoon = services.filter((s) => s.status === 'COMING_SOON').length;
    const activeNotices = notices.filter((n) => n.status === 'ACTIVE').length;
    const totalUsers = users.length;
    return { total, active, disabled, comingSoon, activeNotices, totalUsers };
  }, [services, notices, users]);

  // Handle copying authentication info for user
  const handleCopyAuthInfo = (user: AdminUser) => {
    const formatted = formatAuthenticationInfo({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      passwordPlain: user.passwordPlain,
    });
    navigator.clipboard.writeText(formatted);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 2500);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Export full portal database JSON backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      institution: 'University of Chittagong',
      domain: 'services.cu.ac.bd',
      services,
      groups,
      notices,
      users: users.map((u) => ({ ...u, passwordPlain: '***HIDDEN***' })),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cu-services-portal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDDL = () => {
    navigator.clipboard.writeText(FULL_SQL_DDL);
    setCopiedDDL(true);
    setTimeout(() => setCopiedDDL(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Administrative Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand & Return button */}
            <div className="flex items-center gap-4">
              <button
                id="admin-return-portal-top-btn"
                onClick={onBackToPortal}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Public Portal</span>
              </button>

              <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  CU
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Central Administration Console</span>
                    <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                      services.cu.ac.bd
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Right User & Role Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block">{auth.userEmail}</span>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded inline-block mt-0.5 ${
                    isSuperAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {auth.role}
                </span>
              </div>

              <button
                id="admin-logout-btn"
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-900/40 rounded-lg transition-colors border border-slate-700 hover:border-rose-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb & Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Portal Infrastructure Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure service links, toggle active visibility, manage time-bound broadcast notices, and provision maintenance roles.
            </p>
          </div>

          {/* Role Access Scope Badge */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">Permissions:</span>
              <span className="font-bold text-slate-900">
                {isSuperAdmin ? 'Full Superadmin' : auth.role.replace('MAINTENANCE_', '')}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-2xs font-semibold uppercase text-slate-500">Total Services</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
            <span className="text-2xs font-semibold uppercase text-emerald-700">Active Live</span>
            <p className="text-xl font-bold text-emerald-800 mt-1">{stats.active}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-300 shadow-2xs bg-slate-50">
            <span className="text-2xs font-semibold uppercase text-slate-500">Disabled (Hidden)</span>
            <p className="text-xl font-bold text-slate-700 mt-1">{stats.disabled}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
            <span className="text-2xs font-semibold uppercase text-amber-700">Coming Soon</span>
            <p className="text-xl font-bold text-amber-800 mt-1">{stats.comingSoon}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-sky-200 shadow-2xs bg-sky-50/20">
            <span className="text-2xs font-semibold uppercase text-sky-700">Active Notices</span>
            <p className="text-xl font-bold text-sky-800 mt-1">{stats.activeNotices}</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-2xs bg-indigo-50/20">
            <span className="text-2xs font-semibold uppercase text-indigo-700">Users & Roles</span>
            <p className="text-xl font-bold text-indigo-800 mt-1">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 overflow-x-auto pb-1">
          <button
            id="admin-tab-services-btn"
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'services'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Service Catalog ({services.length})</span>
          </button>

          <button
            id="admin-tab-notices-btn"
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'notices'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Header Broadcast Notices ({notices.length})</span>
          </button>

          <button
            id="admin-tab-groups-btn"
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'groups'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Category Groups ({groups.length})</span>
          </button>

          <button
            id="admin-tab-users-btn"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Credentials ({users.length})</span>
            {isSuperAdmin && (
              <span className="px-1.5 py-0.5 text-3xs font-bold uppercase rounded bg-emerald-100 text-emerald-800">
                Superadmin
              </span>
            )}
          </button>

          <button
            id="admin-tab-analytics-btn"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Click Infographics</span>
            {clicks && clicks.length > 0 && (
              <span className="px-1.5 py-0.5 text-3xs font-mono font-bold rounded bg-emerald-100 text-emerald-800">
                {clicks.length}
              </span>
            )}
          </button>

          <button
            id="admin-tab-health-btn"
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'health'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Health & Uptime (200 OK)</span>
          </button>

          <button
            id="admin-tab-typography-btn"
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'typography'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Dynamic Font Manager</span>
          </button>

          <button
            id="admin-tab-database-btn"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'database'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>MySQL Database & DDL</span>
          </button>

          <button
            id="admin-tab-audit-btn"
            onClick={() => setActiveTab('audit_logs')}
            className={`flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'audit_logs'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Ledger</span>
            {auditLogs && auditLogs.length > 0 && (
              <span className="px-1.5 py-0.5 text-3xs font-mono font-bold rounded bg-slate-100 text-slate-700">
                {auditLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Filter and Action Toolbar */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services by title or tag..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status & Group Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {/* Status Filter */}
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'ALL' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    All ({services.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'ACTIVE' ? 'bg-white shadow-2xs text-emerald-800' : 'text-slate-600'
                    }`}
                  >
                    Active ({stats.active})
                  </button>
                  <button
                    onClick={() => setStatusFilter('DISABLED')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'DISABLED' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    Disabled ({stats.disabled})
                  </button>
                  <button
                    onClick={() => setStatusFilter('COMING_SOON')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      statusFilter === 'COMING_SOON' ? 'bg-white shadow-2xs text-amber-800' : 'text-slate-600'
                    }`}
                  >
                    Coming Soon ({stats.comingSoon})
                  </button>
                </div>

                {/* Group Selector Filter */}
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium"
                >
                  <option value="ALL">All Categories</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                {/* Add Service Button */}
                {permissions.services.create && (
                  <button
                    id="admin-create-service-btn"
                    onClick={onAddService}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </button>
                )}
              </div>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-2xs tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Service & Logo</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Portal URL</th>
                      <th className="py-3 px-4">Status & Visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                          No services match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredServices.map((service) => {
                        const group = groups.find((g) => g.id === service.groupId);
                        const isComingSoon = service.status === 'COMING_SOON';
                        const isDisabled = service.status === 'DISABLED';

                        return (
                          <tr
                            key={service.id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              isDisabled ? 'bg-slate-50/40 opacity-70' : ''
                            }`}
                          >
                            {/* Service and Logo */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-9 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                  <img
                                    src={service.logoUrl}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 line-clamp-1">{service.title}</p>
                                  <p className="text-2xs text-slate-500 line-clamp-1 mt-0.5">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {group?.name || 'General'}
                              </span>
                            </td>

                            {/* Portal URL */}
                            <td className="py-3 px-4">
                              {service.portalUrl ? (
                                <a
                                  href={service.portalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-emerald-700 font-mono text-2xs inline-flex items-center gap-1 max-w-[200px] truncate"
                                >
                                  <span>{formatPortalDisplayUrl(service.portalUrl)}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : isComingSoon ? (
                                <span className="text-2xs font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  Optional (Coming Soon)
                                </span>
                              ) : (
                                <span className="text-2xs text-slate-400 italic">No link specified</span>
                              )}
                            </td>

                            {/* Status with Quick Toggle */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 text-2xs font-bold rounded-full inline-flex items-center gap-1 ${
                                    service.status === 'ACTIVE'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : service.status === 'COMING_SOON'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {service.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                                  {service.status === 'COMING_SOON' && <Sparkles className="w-3 h-3 text-amber-700" />}
                                  {service.status === 'DISABLED' && <EyeOff className="w-3 h-3 text-slate-600" />}
                                  <span>{service.status}</span>
                                </span>

                                {/* Quick Toggle ACTIVE <-> DISABLED */}
                                {permissions.services.update && (
                                  <button
                                    onClick={() => onToggleServiceStatus(service.id)}
                                    className={`p-1 rounded text-2xs font-semibold border transition-colors ${
                                      isDisabled
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                    title={isDisabled ? 'Re-enable on public portal' : 'Hide from portal without deleting'}
                                  >
                                    {isDisabled ? 'Enable' : 'Disable'}
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {permissions.services.update && (
                                  <button
                                    id={`table-edit-${service.id}`}
                                    onClick={() => onEditService(service)}
                                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                    title="Edit Service"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}

                                {permissions.services.delete && (
                                  <button
                                    id={`table-delete-${service.id}`}
                                    onClick={() => onDeleteService(service.id)}
                                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    title="Delete Service"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTAL NOTICES & BROADCASTS */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Header Broadcast Notices</h3>
                <p className="text-xs text-slate-500">
                  Broadcast time-windowed alerts, Coming Soon launches, and scheduled maintenance windows.
                </p>
              </div>

              {permissions.notices.create && (
                <button
                  id="admin-create-notice-btn"
                  onClick={onAddNotice}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Broadcast Notice</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {notices.map((notice) => {
                const start = new Date(notice.startTime);
                const end = new Date(notice.endTime);
                const now = new Date();
                const isCurrentlyActive = notice.status === 'ACTIVE' && now >= start && now <= end;

                return (
                  <div
                    key={notice.id}
                    className={`p-4 bg-white rounded-xl border transition-all ${
                      isCurrentlyActive
                        ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
                        : notice.status === 'DISABLED'
                        ? 'border-slate-200 opacity-60 bg-slate-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-2xs font-bold uppercase rounded ${
                              notice.type === 'coming_soon'
                                ? 'bg-amber-100 text-amber-900'
                                : notice.type === 'maintenance'
                                ? 'bg-orange-100 text-orange-900'
                                : notice.type === 'alert'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {notice.badgeText || notice.type}
                          </span>

                          <span
                            className={`px-2 py-0.5 text-2xs font-semibold rounded ${
                              isCurrentlyActive
                                ? 'bg-emerald-600 text-white font-bold'
                                : notice.status === 'ACTIVE'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isCurrentlyActive
                              ? 'LIVE ON PORTAL'
                              : notice.status === 'ACTIVE'
                              ? 'SCHEDULED / EXPIRED'
                              : 'DISABLED'}
                          </span>

                          <h4 className="text-sm font-bold text-slate-900">{notice.title}</h4>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{notice.message}</p>

                        <div className="flex flex-wrap items-center gap-4 text-2xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            From: {start.toLocaleString()} — To: {end.toLocaleString()}
                          </span>

                          {notice.linkUrl && (
                            <a
                              href={notice.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <span>Link: {notice.linkText || notice.linkUrl}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Notice Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        {permissions.notices.update && (
                          <button
                            onClick={() => onToggleNoticeStatus(notice.id)}
                            className={`px-2.5 py-1 text-2xs font-semibold rounded-lg border transition-colors ${
                              notice.status === 'ACTIVE'
                                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                                : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {notice.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}

                        {permissions.notices.update && (
                          <button
                            onClick={() => onEditNotice(notice)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Notice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {permissions.notices.delete && (
                          <button
                            onClick={() => onDeleteNotice(notice.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORY GROUPS */}
        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Portal Category Groups</h3>
                <p className="text-xs text-slate-500">
                  Organize service cards into dedicated thematic sections on the home portal.
                </p>
              </div>

              {permissions.groups.create && (
                <button
                  id="admin-create-group-btn"
                  onClick={onAddGroup}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category Group</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const groupServices = services.filter((s) => s.groupId === group.id);
                return (
                  <div
                    key={group.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Order #{group.order}
                        </span>
                        <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {groupServices.length} Services
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{group.name}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                        {group.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-2xs text-slate-600 font-mono">ID: {group.id}</span>
                      <div className="flex items-center gap-1">
                        {permissions.groups.update && (
                          <button
                            onClick={() => onEditGroup(group)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Edit Group"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {permissions.groups.delete && (
                          <button
                            onClick={() => onDeleteGroup(group.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete Group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: USERS & ROLE CREDENTIALS (SUPERADMIN ONLY) */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    System Administrators & Role Credentials
                  </h3>
                  <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Superadmin Console
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage user accounts, auto-generate strong passwords, and copy ready-to-send credentials to maintenance officers.
                </p>
              </div>

              {permissions.users.create && (
                <button
                  id="admin-create-user-btn"
                  onClick={onAddUser}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision New User</span>
                </button>
              )}
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-2xs tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User Officer</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">System Role</th>
                      <th className="py-3 px-4">Stored Passcode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Authentication Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const isRevealed = visiblePasswords[user.id];
                      const isCopied = copiedUserId === user.id;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* User Officer */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                                {user.fullName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{user.fullName}</span>
                                <span className="text-2xs text-slate-500 font-mono">{user.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                            {user.department}
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 text-2xs font-bold rounded ${
                                user.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-100 text-purple-900'
                                  : user.role === 'MAINTENANCE_SERVICES'
                                  ? 'bg-blue-100 text-blue-900'
                                  : user.role === 'MAINTENANCE_NOTICES'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>

                          {/* Passcode with Reveal/Hide */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isSuperAdmin ? (
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {isRevealed ? user.passwordPlain : '••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="p-1 text-slate-400 hover:text-slate-700"
                                  title={isRevealed ? 'Hide password' : 'Show password'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Protected</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              disabled={!isSuperAdmin || user.role === 'SUPER_ADMIN'}
                              onClick={() => onToggleUserStatus(user.id)}
                              className={`px-2 py-0.5 text-2xs font-bold rounded-full ${
                                user.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {user.isActive ? 'Active' : 'Disabled'}
                            </button>
                          </td>

                          {/* Copy Authentication Info Button */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isSuperAdmin && (
                                <button
                                  id={`copy-auth-btn-${user.id}`}
                                  onClick={() => handleCopyAuthInfo(user)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-2xs font-bold rounded-lg border transition-colors shadow-2xs ${
                                    isCopied
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                                  }`}
                                  title="Copy complete credentials dossier to clipboard"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{isCopied ? 'Copied' : 'Copy Auth Info'}</span>
                                </button>
                              )}

                              {isSuperAdmin && (
                                <>
                                  <button
                                    onClick={() => onEditUser(user)}
                                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                                    title="Edit User"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {user.role !== 'SUPER_ADMIN' && (
                                    <button
                                      onClick={() => onDeleteUser(user.id)}
                                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CLICK INFOGRAPHICS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <ClicksInfographicsView
            services={services}
            clicks={clicks || []}
            onRefreshClicks={onRefreshClicks || (() => {})}
          />
        )}

        {/* TAB 6: HEALTH & UPTIME MONITOR (200 OK) */}
        {activeTab === 'health' && (
          <ServiceHealthView
            services={services}
            healthStatuses={healthStatuses || {}}
            onPingService={onPingService || (async () => {})}
            onPingAll={onPingAllServices || (async () => {})}
          />
        )}

        {/* TAB 7: DYNAMIC FONT MANAGER */}
        {activeTab === 'typography' && (
          <DynamicFontManagerView
            currentSettings={fontSettings || { englishPresetId: 'plus-jakarta-sans', banglaPresetId: 'hind-siliguri' }}
            onUpdateSettings={onUpdateFontSettings || (() => {})}
          />
        )}

        {/* TAB 8: DATABASE CONFIG & MYSQL DDL DOCUMENTATION */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Database Environment Card */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Production MySQL 8.0+ Database Environment</span>
                      <span className="text-2xs font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                        MySQL Engine
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Loaded from <code className="font-mono text-emerald-700">src/config/database.ts</code> with connection pooling & utf8mb4 collation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON Backup</span>
                  </button>

                  {isSuperAdmin && (
                    <button
                      onClick={onResetToDefaults}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to Defaults</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Config Parameter Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-2xs uppercase text-slate-500 block">RDBMS Engine</span>
                  <span className="font-bold text-slate-900">MySQL 8.0+ ({DEFAULT_DATABASE_CONFIG.client})</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-2xs uppercase text-slate-500 block">Host & Port</span>
                  <span className="font-bold text-slate-900">
                    {DEFAULT_DATABASE_CONFIG.host}:{DEFAULT_DATABASE_CONFIG.port}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-2xs uppercase text-slate-500 block">Database Name</span>
                  <span className="font-bold text-slate-900">{DEFAULT_DATABASE_CONFIG.database}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-2xs uppercase text-slate-500 block">Charset / Collation</span>
                  <span className="font-bold text-emerald-700">utf8mb4_unicode_ci</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-900 text-emerald-400 font-mono text-2xs rounded-lg flex items-center justify-between overflow-x-auto">
                <div>
                  <span className="text-slate-500 mr-2">Connection URI:</span>
                  <span>{getDatabaseConnectionString()}</span>
                </div>
                <span className="text-3xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                  Connection Pool: Max 10
                </span>
              </div>
            </div>

            {/* DDL Documentation Preview Card */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>MySQL 8.0+ Production DDL Schema</span>
                    <span className="text-2xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      DATABASE_DESIGN.md
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Complete MySQL DDL with <code className="font-mono font-bold text-emerald-800">service_clicks</code>, <code className="font-mono font-bold text-emerald-800">service_health_checks</code>, <code className="font-mono font-bold text-emerald-800">admin_audit_logs</code>, <code className="font-mono font-bold text-emerald-800">portal_settings</code>, and <code className="font-mono text-slate-700">services_group</code> compatibility view.
                  </p>
                </div>
                <button
                  id="admin-copy-full-ddl-btn"
                  onClick={handleCopyDDL}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-lg shadow-2xs shrink-0 transition-colors"
                >
                  {copiedDDL ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied MySQL DDL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Full MySQL DDL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-2xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-96 overflow-y-auto">
                <pre>{FULL_SQL_DDL}</pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LEDGER */}
        {activeTab === 'audit_logs' && (
          <AuditLogsView logs={auditLogs || []} onClearLogs={onClearAuditLogs} />
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 University of Chittagong — ICT Cell Administration Console</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-2xs">System Status: Operational</span>
            <button
              onClick={onBackToPortal}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Back to Services Portal →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
