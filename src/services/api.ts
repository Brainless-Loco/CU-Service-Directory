import {
  AdminAuthState,
  AdminAuditLog,
  AdminUser,
  PortalFontSettings,
  PortalNotice,
  ServiceClickEvent,
  ServiceGroup,
  ServiceHealthStatus,
  ServiceItem,
} from '../types';

const API_BASE = (((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_URL) || '/api').replace(/\/$/, '');

export interface PublicBootstrap {
  initialized: boolean;
  services: ServiceItem[];
  groups: ServiceGroup[];
  notices: PortalNotice[];
  fontSettings: PortalFontSettings | null;
}

export interface AdminBootstrap extends PublicBootstrap {
  users: AdminUser[];
  clicks: ServiceClickEvent[];
  auditLogs: AdminAuditLog[];
  healthStatuses: Record<string, ServiceHealthStatus>;
}

const request = async <T>(path: string, options: RequestInit = {}, token?: string): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const api = {
  getPublicBootstrap: () => request<PublicBootstrap>('/bootstrap'),
  initializeBootstrap: (payload: Omit<AdminBootstrap, 'initialized'>) => request<{ initialized: boolean }>('/bootstrap', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (email: string, password: string) => request<AdminAuthState>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  logout: (token: string) => request<void>('/auth/logout', { method: 'POST' }, token),
  getAdminBootstrap: (token: string) => request<AdminBootstrap>('/admin/bootstrap', {}, token),
  save: <T>(collection: 'services' | 'groups' | 'notices' | 'users', item: T, token: string) => request<T>(`/admin/${collection}`, {
    method: 'POST',
    body: JSON.stringify(item),
  }, token),
  remove: (collection: 'services' | 'groups' | 'notices' | 'users', id: string, token: string) => request<void>(`/admin/${collection}/${id}`, {
    method: 'DELETE',
  }, token),
  recordClick: (click: ServiceClickEvent) => request<ServiceClickEvent>('/clicks', {
    method: 'POST',
    body: JSON.stringify(click),
  }),
  getClicks: (token: string) => request<ServiceClickEvent[]>('/admin/clicks', {}, token),
  clearClicks: (token: string) => request<void>('/admin/clicks', { method: 'DELETE' }, token),
  getAuditLogs: (token: string) => request<AdminAuditLog[]>('/admin/audit-logs', {}, token),
  clearAuditLogs: (token: string) => request<void>('/admin/audit-logs', { method: 'DELETE' }, token),
  resetPortal: (payload: Pick<AdminBootstrap, 'services' | 'groups' | 'notices' | 'users' | 'clicks'>, token: string) => request<{ ok: boolean }>('/admin/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token),
  saveFontSettings: (settings: PortalFontSettings, token: string) => request<PortalFontSettings>('/admin/font-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }, token),
  saveHealthStatuses: (statuses: Record<string, ServiceHealthStatus>, token: string) => request<Record<string, ServiceHealthStatus>>('/admin/health-statuses', {
    method: 'PUT',
    body: JSON.stringify(statuses),
  }, token),
};
