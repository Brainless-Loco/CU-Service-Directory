import { AdminAuditLog, UserRole } from '../types';

const STORAGE_KEY_AUDIT_LOGS = 'cu_admin_audit_logs_v3';

/**
  * Seed realistic audit log entries for demonstration and ledger history
  */
const generateSeedAuditLogs = (): AdminAuditLog[] => {
  const now = Date.now();
  return [
    {
      id: `log-seed-1`,
      userEmail: 'tonmoy.ict@cu.ac.bd',
      action: 'SYSTEM_BOOT',
      targetTable: 'portal_settings',
      targetId: 'config_init',
      details: JSON.stringify({ event: 'Portal initialized with MySQL 8.0+ configuration', rdbms: 'mysql' }),
      ipAddress: '103.114.96.12',
      timestamp: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: `log-seed-2`,
      userEmail: 'tonmoy.ict@cu.ac.bd',
      action: 'ROLE_PROVISION',
      targetTable: 'roles',
      targetId: 'SUPER_ADMIN',
      details: JSON.stringify({ roleName: 'Super Administrator', permissions: 'ALL' }),
      ipAddress: '103.114.96.12',
      timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: `log-seed-3`,
      userEmail: 'tonmoy.ict@cu.ac.bd',
      action: 'NOTICE_BROADCAST_CREATE',
      targetTable: 'portal_notices',
      targetId: 'notice-1',
      details: JSON.stringify({ title: 'Undergraduate Admission 2025-2026', type: 'info', status: 'ACTIVE' }),
      ipAddress: '103.114.96.12',
      timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: `log-seed-4`,
      userEmail: 'tonmoy.ict@cu.ac.bd',
      action: 'FONT_CONFIG_UPDATE',
      targetTable: 'portal_settings',
      targetId: 'typography',
      details: JSON.stringify({ english: 'Plus Jakarta Sans', bangla: 'Noto Sans Bengali' }),
      ipAddress: '103.114.96.12',
      timestamp: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    },
  ];
};

/**
 * Get all stored administrative audit logs from localStorage
 */
export const getStoredAuditLogs = (): AdminAuditLog[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load audit logs from localStorage', e);
  }

  const initial = generateSeedAuditLogs();
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(initial));
  } catch (e) {
    console.error('Failed to save initial audit logs', e);
  }
  return initial;
};

/**
 * Record an administrative audit log event
 */
export const recordAuditLog = (params: {
  userEmail?: string | null;
  userId?: string;
  action: string;
  targetTable: 'services' | 'portal_notices' | 'service_groups' | 'users' | 'roles' | 'portal_settings';
  targetId: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}): AdminAuditLog => {
  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userEmail: params.userEmail || 'system@cu.ac.bd',
    userId: params.userId,
    action: params.action,
    targetTable: params.targetTable,
    targetId: params.targetId,
    details: typeof params.details === 'object' ? JSON.stringify(params.details) : params.details,
    ipAddress: params.ipAddress || '103.114.96.12 (Internal LAN)',
    timestamp: new Date().toISOString(),
  };

  try {
    const logs = getStoredAuditLogs();
    const updated = [newLog, ...logs].slice(0, 1000); // keep up to 1000 logs
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record audit log', e);
  }

  return newLog;
};

/**
 * Clear or reset audit logs
 */
export const resetAuditLogs = (): AdminAuditLog[] => {
  const fresh = generateSeedAuditLogs();
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(fresh));
  } catch (e) {
    console.error('Failed to reset audit logs', e);
  }
  return fresh;
};
