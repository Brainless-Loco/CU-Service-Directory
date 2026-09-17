import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Briefcase,
  Award,
  Server,
  BookOpen,
  Compass,
  FolderPlus,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';
import {
  ServiceItem,
  ServiceGroup,
  PortalNotice,
  AdminUser,
  AdminAuthState,
  ServiceClickEvent,
  ServiceHealthStatus,
  PortalFontSettings,
  AdminAuditLog,
} from './types';
import {
  INITIAL_GROUPS,
  INITIAL_SERVICES,
  INITIAL_NOTICES,
  INITIAL_USERS,
} from './data/seedData';
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { ServiceCard } from './components/ServiceCard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPageView } from './components/AdminPageView';
import { ServiceModal } from './components/ServiceModal';
import { NoticeModal } from './components/NoticeModal';
import { UserModal } from './components/UserModal';
import { GroupModal } from './components/GroupModal';
import { Footer } from './components/Footer';
import { getStoredClicks, recordServiceClick, resetClickLogs } from './services/clickTrackingService';
import { getStoredHealthStatuses, pingServicePortal, pingAllServices } from './services/healthCheckService';
import { getStoredAuditLogs, recordAuditLog, resetAuditLogs } from './services/auditLogService';
import { loadPersistedFonts, persistFontSettings, applyFontsGlobally } from './config/fonts';
import { api } from './services/api';

const STORAGE_KEY_SERVICES = 'cu_services_items_v3';
const STORAGE_KEY_GROUPS = 'cu_services_groups_v3';
const STORAGE_KEY_NOTICES = 'cu_services_notices_v3';
const STORAGE_KEY_USERS = 'cu_services_users_v3';
const STORAGE_KEY_AUTH = 'cu_services_admin_auth_v3';
type AppRoute = '/' | '/admin/auth' | '/admin/dashboard' | '/not-found';

const getCurrentRoute = (): AppRoute => {
  if (window.location.pathname === '/admin/auth') return '/admin/auth';
  if (window.location.pathname === '/admin/dashboard') return '/admin/dashboard';
  if (window.location.pathname === '/') return '/';
  return '/not-found';
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getCurrentRoute);

  const navigate = (route: AppRoute, replace = false) => {
    if (window.location.pathname !== route) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', route);
    }
    setCurrentRoute(route);
  };

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SERVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved services', e);
    }
    return INITIAL_SERVICES;
  });

  // Groups State
  const [groups, setGroups] = useState<ServiceGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GROUPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved groups', e);
    }
    return INITIAL_GROUPS;
  });

  // Notices State
  const [notices, setNotices] = useState<PortalNotice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved notices', e);
    }
    return INITIAL_NOTICES;
  });

  // Users State
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved users', e);
    }
    return INITIAL_USERS;
  });

  // Admin Authentication State
  const [adminAuth, setAdminAuth] = useState<AdminAuthState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load auth', e);
    }
    return {
      isAuthenticated: false,
      userEmail: null,
      role: 'MAINTENANCE_VIEWER',
    };
  });

  // Portal UI Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string>('all');

  // Modal Visibility States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState<PortalNotice | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<ServiceGroup | null>(null);

  // Click tracking state
  const [clicks, setClicks] = useState<ServiceClickEvent[]>(() => getStoredClicks());

  // Health status state (200 OK pinging)
  const [healthStatuses, setHealthStatuses] = useState<Record<string, ServiceHealthStatus>>(() =>
    getStoredHealthStatuses()
  );

  // Dynamic typography font settings state
  const [fontSettings, setFontSettings] = useState<PortalFontSettings>(() => loadPersistedFonts());

  // Administrative Audit Ledger state (admin_audit_logs)
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => getStoredAuditLogs());

  // Apply fonts globally on mount and whenever fontSettings changes
  useEffect(() => {
    applyFontsGlobally(fontSettings);
  }, [fontSettings]);

  // Hydrate the local UI from the API and initialize the file-backed store once.
  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const publicData = await api.getPublicBootstrap();
        if (!publicData.initialized) {
          await api.initializeBootstrap({
            services,
            groups,
            notices,
            users,
            clicks,
            auditLogs,
            fontSettings,
            healthStatuses,
          });
        } else if (active) {
          setServices(publicData.services);
          setGroups(publicData.groups);
          setNotices(publicData.notices);
          if (publicData.fontSettings) setFontSettings(publicData.fontSettings);
        }

        if (adminAuth.token) {
          const adminData = await api.getAdminBootstrap(adminAuth.token);
          if (!active) return;
          setServices(adminData.services);
          setGroups(adminData.groups);
          setNotices(adminData.notices);
          setUsers(adminData.users);
          setClicks(adminData.clicks);
          setAuditLogs(adminData.auditLogs);
          setHealthStatuses(adminData.healthStatuses);
          if (adminData.fontSettings) setFontSettings(adminData.fontSettings);
        }
      } catch (error) {
        console.error('API unavailable; continuing with local fallback data.', error);
        if (adminAuth.token && error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem(STORAGE_KEY_AUTH);
          setAdminAuth({ isAuthenticated: false, userEmail: null, role: 'MAINTENANCE_VIEWER' });
          navigate('/admin/auth', true);
        }
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentRoute(getCurrentRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentRoute === '/admin/dashboard' && !adminAuth.isAuthenticated) {
      navigate('/admin/auth', true);
    }
  }, [currentRoute, adminAuth.isAuthenticated]);

  // Initial network health probe for active web services
  useEffect(() => {
    pingAllServices(services).then((results) => {
      setHealthStatuses((prev) => ({ ...prev, ...results }));
    });
  }, []);

  // Click tracking handler
  const handleTrackClick = (service: ServiceItem) => {
    const recorded = recordServiceClick(service.id, service.title, service.portalUrl);
    setClicks((prev) => [recorded, ...prev]);
    api.recordClick(recorded).catch((error) => console.error('Failed to record click with API', error));
  };

  const handleRefreshClicks = async () => {
    if (adminAuth.token) {
      try {
        setClicks(await api.getClicks(adminAuth.token));
        return;
      } catch (error) {
        console.error('Failed to refresh clicks from API', error);
      }
    }
    setClicks(getStoredClicks());
  };

  // Health check ping handlers
  const handlePingService = async (serviceId: string, url: string) => {
    setHealthStatuses((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {
          serviceId,
          portalUrl: url,
          isLive: false,
          statusCode: 'Checking',
          latencyMs: 0,
          lastChecked: new Date().toISOString(),
        }),
        isChecking: true,
      },
    }));

    const res = await pingServicePortal(serviceId, url);
    setHealthStatuses((prev) => ({ ...prev, [serviceId]: res }));
    if (adminAuth.token) {
      api.saveHealthStatuses({ ...healthStatuses, [serviceId]: res }, adminAuth.token)
        .catch((error) => console.error('Failed to save health status', error));
    }
  };

  const handlePingAllServices = async () => {
    const results = await pingAllServices(services);
    setHealthStatuses(results);
    if (adminAuth.token) {
      api.saveHealthStatuses(results, adminAuth.token)
        .catch((error) => console.error('Failed to save health statuses', error));
    }
  };

  // Font settings handler
  const handleUpdateFontSettings = (newSettings: PortalFontSettings) => {
    setFontSettings(newSettings);
    persistFontSettings(newSettings);
    applyFontsGlobally(newSettings);
    if (adminAuth.token) {
      api.saveFontSettings(newSettings, adminAuth.token).catch((error) => console.error('Failed to save font settings', error));
    }

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'FONT_CONFIG_UPDATE',
      targetTable: 'portal_settings',
      targetId: 'typography',
      details: {
        englishPreset: newSettings.englishPresetId || newSettings.englishFontId,
        banglaPreset: newSettings.banglaPresetId || newSettings.banglaFontId,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleClearAuditLogs = () => {
    const fresh = resetAuditLogs();
    setAuditLogs(fresh);
    if (adminAuth.token) {
      api.clearAuditLogs(adminAuth.token).catch((error) => console.error('Failed to clear audit logs', error));
    }
  };

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(services));
    } catch (e) {
      console.error('Failed to persist services', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
    } catch (e) {
      console.error('Failed to persist groups', e);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(notices));
    } catch (e) {
      console.error('Failed to persist notices', e);
    }
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users', e);
    }
  }, [users]);

  // Auth Handlers
  const handleLoginSuccess = (auth: AdminAuthState) => {
    setAdminAuth(auth);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(auth));
    
    // Record login audit event
    const log = recordAuditLog({
      userEmail: auth.userEmail,
      action: 'ADMIN_LOGIN',
      targetTable: 'users',
      targetId: auth.userEmail || 'admin',
      details: { role: auth.role, status: 'SUCCESS' },
    });
    setAuditLogs((prev) => [log, ...prev]);

    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    if (adminAuth.userEmail) {
      const log = recordAuditLog({
        userEmail: adminAuth.userEmail,
        action: 'ADMIN_LOGOUT',
        targetTable: 'users',
        targetId: adminAuth.userEmail,
        details: { role: adminAuth.role },
      });
      setAuditLogs((prev) => [log, ...prev]);
    }

    if (adminAuth.token) {
      api.logout(adminAuth.token).catch((error) => console.error('Failed to record API logout', error));
    }
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setAdminAuth({
      isAuthenticated: false,
      userEmail: null,
      role: 'MAINTENANCE_VIEWER',
    });
    navigate('/');
  };

  // Service CRUD & Status Toggle Handlers
  const handleOpenAddService = () => {
    setServiceToEdit(null);
    setIsServiceModalOpen(true);
  };

  const handleEditService = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (savedService: ServiceItem) => {
    const isNew = !services.some((s) => s.id === savedService.id);
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === savedService.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedService;
        return next;
      }
      return [savedService, ...prev];
    });

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: isNew ? 'SERVICE_CREATE' : 'SERVICE_UPDATE',
      targetTable: 'services',
      targetId: savedService.id,
      details: {
        title: savedService.title,
        status: savedService.status,
        url: savedService.portalUrl,
        bgColor: savedService.bgColor,
        groupId: savedService.groupId,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.save('services', savedService, adminAuth.token).catch((error) => console.error('Failed to save service', error));
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const existing = services.find((s) => s.id === serviceId);
    setServices((prev) => prev.filter((s) => s.id !== serviceId));

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'SERVICE_DELETE',
      targetTable: 'services',
      targetId: serviceId,
      details: { title: existing?.title || serviceId },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.remove('services', serviceId, adminAuth.token).catch((error) => console.error('Failed to delete service', error));
    }
  };

  const handleToggleServiceStatus = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    const newStatus = s?.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

    setServices((prev) =>
      prev.map((srv) => {
        if (srv.id !== serviceId) return srv;
        return { ...srv, status: newStatus, updatedAt: new Date().toISOString() };
      })
    );

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'SERVICE_STATUS_TOGGLE',
      targetTable: 'services',
      targetId: serviceId,
      details: {
        title: s?.title,
        oldStatus: s?.status,
        newStatus,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    const updatedService = services.find((service) => service.id === serviceId);
    if (updatedService && adminAuth.token) {
      api.save('services', { ...updatedService, status: newStatus, updatedAt: new Date().toISOString() }, adminAuth.token)
        .catch((error) => console.error('Failed to update service status', error));
    }
  };

  // Notice CRUD & Status Handlers
  const handleOpenAddNotice = () => {
    setNoticeToEdit(null);
    setIsNoticeModalOpen(true);
  };

  const handleEditNotice = (notice: PortalNotice) => {
    setNoticeToEdit(notice);
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = (savedNotice: PortalNotice) => {
    const isNew = !notices.some((n) => n.id === savedNotice.id);
    setNotices((prev) => {
      const idx = prev.findIndex((n) => n.id === savedNotice.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedNotice;
        return next;
      }
      return [savedNotice, ...prev];
    });

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: isNew ? 'NOTICE_CREATE' : 'NOTICE_UPDATE',
      targetTable: 'portal_notices',
      targetId: savedNotice.id,
      details: {
        title: savedNotice.title,
        status: savedNotice.status,
        type: savedNotice.type,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.save('notices', savedNotice, adminAuth.token).catch((error) => console.error('Failed to save notice', error));
    }
  };

  const handleDeleteNotice = (noticeId: string) => {
    const n = notices.find((item) => item.id === noticeId);
    setNotices((prev) => prev.filter((item) => item.id !== noticeId));

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'NOTICE_DELETE',
      targetTable: 'portal_notices',
      targetId: noticeId,
      details: { title: n?.title },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.remove('notices', noticeId, adminAuth.token).catch((error) => console.error('Failed to delete notice', error));
    }
  };

  const handleToggleNoticeStatus = (noticeId: string) => {
    const n = notices.find((item) => item.id === noticeId);
    const newStatus = n?.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

    setNotices((prev) =>
      prev.map((item) => {
        if (item.id !== noticeId) return item;
        return {
          ...item,
          status: newStatus,
        };
      })
    );

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'NOTICE_STATUS_TOGGLE',
      targetTable: 'portal_notices',
      targetId: noticeId,
      details: {
        title: n?.title,
        oldStatus: n?.status,
        newStatus,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    const updatedNotice = notices.find((notice) => notice.id === noticeId);
    if (updatedNotice && adminAuth.token) {
      api.save('notices', { ...updatedNotice, status: newStatus }, adminAuth.token)
        .catch((error) => console.error('Failed to update notice status', error));
    }
  };

  // User CRUD & Status Handlers
  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (savedUser: AdminUser) => {
    const isNew = !users.some((u) => u.id === savedUser.id);
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === savedUser.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedUser;
        return next;
      }
      return [...prev, savedUser];
    });

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: isNew ? 'USER_CREATE' : 'USER_UPDATE',
      targetTable: 'users',
      targetId: savedUser.id,
      details: {
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.save('users', savedUser, adminAuth.token).catch((error) => console.error('Failed to save user', error));
    }
  };

  const handleDeleteUser = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'USER_DELETE',
      targetTable: 'users',
      targetId: userId,
      details: { email: u?.email },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.remove('users', userId, adminAuth.token).catch((error) => console.error('Failed to delete user', error));
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    const newActive = !u?.isActive;

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        return { ...user, isActive: newActive };
      })
    );

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'USER_STATUS_TOGGLE',
      targetTable: 'users',
      targetId: userId,
      details: {
        email: u?.email,
        oldStatus: u?.isActive ? 'ACTIVE' : 'INACTIVE',
        newStatus: newActive ? 'ACTIVE' : 'INACTIVE',
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    const updatedUser = users.find((user) => user.id === userId);
    if (updatedUser && adminAuth.token) {
      api.save('users', { ...updatedUser, isActive: newActive }, adminAuth.token)
        .catch((error) => console.error('Failed to update user status', error));
    }
  };

  // Group CRUD Handlers
  const handleOpenAddGroup = () => {
    setGroupToEdit(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: ServiceGroup) => {
    setGroupToEdit(group);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (savedGroup: ServiceGroup) => {
    const isNew = !groups.some((g) => g.id === savedGroup.id);
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === savedGroup.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedGroup;
        return next;
      }
      return [...prev, savedGroup];
    });

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: isNew ? 'GROUP_CREATE' : 'GROUP_UPDATE',
      targetTable: 'service_groups',
      targetId: savedGroup.id,
      details: {
        name: savedGroup.name,
        order: savedGroup.order,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.save('groups', savedGroup, adminAuth.token).catch((error) => console.error('Failed to save group', error));
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const g = groups.find((grp) => grp.id === groupId);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));

    const log = recordAuditLog({
      userEmail: adminAuth.userEmail,
      action: 'GROUP_DELETE',
      targetTable: 'service_groups',
      targetId: groupId,
      details: { name: g?.name },
    });
    setAuditLogs((prev) => [log, ...prev]);
    if (adminAuth.token) {
      api.remove('groups', groupId, adminAuth.token).catch((error) => console.error('Failed to delete group', error));
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all portal records, notices, and users to factory seed state?')) {
      setServices(INITIAL_SERVICES);
      setGroups(INITIAL_GROUPS);
      setNotices(INITIAL_NOTICES);
      setUsers(INITIAL_USERS);
      const freshClicks = resetClickLogs();
      setClicks(freshClicks);
      const freshLogs = resetAuditLogs();
      setAuditLogs(freshLogs);
      localStorage.removeItem(STORAGE_KEY_SERVICES);
      localStorage.removeItem(STORAGE_KEY_GROUPS);
      localStorage.removeItem(STORAGE_KEY_NOTICES);
      localStorage.removeItem(STORAGE_KEY_USERS);

      const log = recordAuditLog({
        userEmail: adminAuth.userEmail,
        action: 'PORTAL_FACTORY_RESET',
        targetTable: 'portal_settings',
        targetId: 'factory_reset',
        details: { reset: true },
      });
      setAuditLogs((prev) => [log, ...prev]);
      if (adminAuth.token) {
        api.resetPortal({ services: INITIAL_SERVICES, groups: INITIAL_GROUPS, notices: INITIAL_NOTICES, users: INITIAL_USERS, clicks: freshClicks }, adminAuth.token)
          .catch((error) => console.error('Failed to reset portal through API', error));
      }
    }
  };

  // Icon mapping helper
  const getGroupIcon = (name?: string) => {
    switch (name) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'Server':
        return <Server className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      default:
        return <GraduationCap className="w-5 h-5" />;
    }
  };

  // On Public Portal: Filter out DISABLED services unless admin is authenticated
  const portalVisibleServices = useMemo(() => {
    return services.filter((s) => {
      // If admin is authenticated, allow admin to see disabled services with badge
      if (!adminAuth.isAuthenticated && s.status === 'DISABLED') {
        return false;
      }
      return true;
    });
  }, [services, adminAuth.isAuthenticated]);

  // Filtered Services for Public Search / Category View
  const filteredServices = useMemo(() => {
    return portalVisibleServices.filter((s) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.portalUrl && s.portalUrl.toLowerCase().includes(query)) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(query)));

      const matchesGroup = activeGroupId === 'all' || s.groupId === activeGroupId;

      return matchesSearch && matchesGroup;
    });
  }, [portalVisibleServices, searchQuery, activeGroupId]);

  // Grouped Services for organized display
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.order - b.order);
  }, [groups]);

  // =========================================================================
  // VIEW 1: ADMIN DASHBOARD
  // =========================================================================
  if (currentRoute === '/admin/dashboard' && adminAuth.isAuthenticated) {
    return (
      <>
        <AdminPageView
          auth={adminAuth}
          services={services}
          groups={groups}
          notices={notices}
          users={users}
          clicks={clicks}
          healthStatuses={healthStatuses}
          fontSettings={fontSettings}
          auditLogs={auditLogs}
          onRefreshClicks={handleRefreshClicks}
          onUpdateFontSettings={handleUpdateFontSettings}
          onPingService={handlePingService}
          onPingAllServices={handlePingAllServices}
          onClearAuditLogs={handleClearAuditLogs}
          onBackToPortal={() => navigate('/')}
          onLogout={handleLogout}
          onAddService={handleOpenAddService}
          onEditService={handleEditService}
          onDeleteService={handleDeleteService}
          onToggleServiceStatus={handleToggleServiceStatus}
          onAddNotice={handleOpenAddNotice}
          onEditNotice={handleEditNotice}
          onDeleteNotice={handleDeleteNotice}
          onToggleNoticeStatus={handleToggleNoticeStatus}
          onAddUser={handleOpenAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onToggleUserStatus={handleToggleUserStatus}
          onAddGroup={handleOpenAddGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={handleDeleteGroup}
          onResetToDefaults={handleResetToDefaults}
        />

        {/* Modals rendered on Admin Page */}
        <ServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={handleSaveService}
          serviceToEdit={serviceToEdit}
          groups={groups}
        />

        <NoticeModal
          isOpen={isNoticeModalOpen}
          onClose={() => setIsNoticeModalOpen(false)}
          onSave={handleSaveNotice}
          noticeToEdit={noticeToEdit}
        />

        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
          userToEdit={userToEdit}
        />

        <GroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onSave={handleSaveGroup}
          groupToEdit={groupToEdit}
        />
      </>
    );
  }

  if (currentRoute === '/admin/auth') {
    if (adminAuth.isAuthenticated) {
      navigate('/admin/dashboard', true);
      return null;
    }

    return (
      <AdminLoginModal
        isOpen
        isPage
        onClose={() => navigate('/')}
        onLoginSuccess={handleLoginSuccess}
        users={users}
      />
    );
  }

  if (currentRoute === '/not-found') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <main className="w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileQuestion className="h-8 w-8" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Error 404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The page you requested does not exist or may have moved.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to portal
          </button>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PUBLIC CENTRAL SERVICES PORTAL (services.cu.ac.bd)
  // =========================================================================
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Official Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        adminAuth={adminAuth}
        onOpenAdmin={() => navigate('/admin/dashboard')}
        onOpenLogin={() => navigate('/admin/auth')}
        onLogout={handleLogout}
        onAddNewService={handleOpenAddService}
        totalServicesCount={portalVisibleServices.length}
      />

      {/* Official Notice Broadcast Bar (Rendered Directly After Header) */}
      <NoticeBanner notices={notices} />

      {/* Main Portal Canvas - Clean White Background */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-white">
        {/* Welcome & Domain Identity Card */}
        <section className="mb-8 p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                University of Chittagong Central Services Gateway
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Official centralized portal for all CU digital platforms. Access student email services, alias handles, SIS course registration, faculty directories, certificate verification, and campus logistics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden lg:block">
              <span className="text-2xs font-semibold text-slate-600 uppercase tracking-wider block">Official Host</span>
              <span className="font-mono text-xs font-bold text-emerald-800">services.cu.ac.bd</span>
            </div>
            {adminAuth.isAuthenticated && (
              <button
                id="portal-switch-to-admin-btn"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Open Admin Management Page →</span>
              </button>
            )}
          </div>
        </section>

        {/* Category Navigation Pills Bar */}
        <section className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                Browse Portals by Group
              </h2>
            </div>
            {adminAuth.isAuthenticated && (
              <button
                id="add-category-group-header-btn"
                onClick={handleOpenAddGroup}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Add Category Group</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="filter-group-all"
              onClick={() => setActiveGroupId('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                activeGroupId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Portals ({portalVisibleServices.length})
            </button>

            {sortedGroups.map((grp) => {
              const count = portalVisibleServices.filter((s) => s.groupId === grp.id).length;
              const isSelected = activeGroupId === grp.id;
              return (
                <button
                  key={grp.id}
                  id={`filter-group-${grp.id}`}
                  onClick={() => setActiveGroupId(grp.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{grp.name}</span>
                  <span
                    className={`text-2xs px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Service Cards Display Section */}
        {activeGroupId === 'all' && !searchQuery ? (
          /* Render grouped sections clearly as requested: "shown in cards with groups such as Student Services - There will be Institutional Email Service, Alias Email Service and so on." */
          <div className="space-y-12">
            {sortedGroups.map((group) => {
              const groupServices = portalVisibleServices.filter((s) => s.groupId === group.id);
              if (groupServices.length === 0) return null;

              return (
                <section
                  key={group.id}
                  id={`section-${group.id}`}
                  className="space-y-4 pt-2"
                >
                  {/* Group Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                        {getGroupIcon(group.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                            {group.name}
                          </h2>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            {groupServices.length} {groupServices.length === 1 ? 'portal' : 'portals'}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {adminAuth.isAuthenticated && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleOpenAddService}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to {group.name}</span>
                        </button>
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-md"
                        >
                          Edit Group
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Service Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        group={group}
                        isAdmin={adminAuth.isAuthenticated}
                        healthStatus={healthStatuses[service.id]}
                        clickCount={clicks.filter((c) => c.serviceId === service.id).length}
                        onEdit={handleEditService}
                        onDelete={handleDeleteService}
                        onToggleStatus={handleToggleServiceStatus}
                        onTrackClick={handleTrackClick}
                        onPing={handlePingService}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Filtered or Searched Flat Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {searchQuery
                    ? `Search results for "${searchQuery}"`
                    : sortedGroups.find((g) => g.id === activeGroupId)?.name || 'Service Portals'}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredServices.length} portal{filteredServices.length !== 1 ? 's' : ''}
                </p>
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    group={groups.find((g) => g.id === service.groupId)}
                    isAdmin={adminAuth.isAuthenticated}
                    healthStatus={healthStatuses[service.id]}
                    clickCount={clicks.filter((c) => c.serviceId === service.id).length}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                    onToggleStatus={handleToggleServiceStatus}
                    onTrackClick={handleTrackClick}
                    onPing={handlePingService}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search State */
              <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl p-8">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No matching service portals found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  We couldn't find any CU portals matching your criteria. Try different keywords or browse all categories.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveGroupId('all');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Reset All Filters
                  </button>
                  {adminAuth.isAuthenticated && (
                    <button
                      onClick={handleOpenAddService}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Add New Portal Card
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Official Footer */}
      <Footer />

      {/* Service Create / Edit Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
        groups={groups}
      />

      {/* Notice Broadcast Modal */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onSave={handleSaveNotice}
        noticeToEdit={noticeToEdit}
      />

      {/* User Provisioning Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />

      {/* Group Create / Edit Modal */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleSaveGroup}
        groupToEdit={groupToEdit}
      />
    </div>
  );
}
