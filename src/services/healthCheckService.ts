import { ServiceItem, ServiceHealthStatus } from '../types';
import { api } from './api';

const STORAGE_KEY_HEALTH = 'cu_services_health_status_v3';

/**
 * Checks if a service has an actual web HTTP/HTTPS link (not an email or empty)
 */
export const isPingableWebLink = (url?: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed === '' || trimmed === 'https://') {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

/**
 * Get cached health statuses from localStorage
 */
export const getStoredHealthStatuses = (): Record<string, ServiceHealthStatus> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HEALTH);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load health status cache', e);
  }
  return {};
};

/**
 * Save health statuses to localStorage
 */
export const saveHealthStatuses = (statuses: Record<string, ServiceHealthStatus>) => {
  try {
    localStorage.setItem(STORAGE_KEY_HEALTH, JSON.stringify(statuses));
  } catch (e) {
    console.error('Failed to persist health statuses', e);
  }
};

/**
 * Requests an exact HTTP status check from the API, which can read cross-origin responses.
 */
export const pingServicePortal = async (
  serviceId: string,
  url: string,
  token: string
): Promise<ServiceHealthStatus> => {
  if (!isPingableWebLink(url)) {
    return {
      serviceId,
      portalUrl: url,
      isLive: false,
      statusCode: 'N/A (No Web Link)',
      latencyMs: 0,
      lastChecked: new Date().toISOString(),
      errorMessage: 'Service does not have an active HTTP/HTTPS web address.',
    };
  }

  const status = await api.checkServiceHealth(serviceId, token);
  saveHealthStatuses({ ...getStoredHealthStatuses(), [serviceId]: status });
  return status;
};

/**
 * Requests the API to check active portals and persists the returned statuses locally.
 */
export const pingAllServices = async (
  services: ServiceItem[],
  onProgress?: (completed: number, total: number) => void,
  token?: string
): Promise<Record<string, ServiceHealthStatus>> => {
  const pingable = services.filter((s) => s.status === 'ACTIVE' && isPingableWebLink(s.portalUrl));
  if (pingable.length === 0) return {};

  const results = token
    ? await api.checkAllHealthStatuses(token)
    : await api.getPublicHealthStatuses();
  const pingableIds = new Set(pingable.map((service) => service.id));
  const checkedStatuses = Object.fromEntries(
    Object.entries(results).filter(([serviceId]) => pingableIds.has(serviceId))
  );
  saveHealthStatuses({ ...getStoredHealthStatuses(), ...checkedStatuses });
  onProgress?.(pingable.length, pingable.length);
  return checkedStatuses;
};
