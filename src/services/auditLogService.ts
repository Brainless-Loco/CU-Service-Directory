import { AdminAuditLog, UserRole } from '../types';

const STORAGE_KEY_AUDIT_LOGS = 'cu_admin_audit_logs_v3';

/**
 * Get all stored administrative audit logs from localStorage
 */
export const getStoredAuditLogs = (): AdminAuditLog[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load audit logs from localStorage', e);
  }

  return [];
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
    ipAddress: params.ipAddress,
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
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear audit logs', e);
  }
  return [];
};
