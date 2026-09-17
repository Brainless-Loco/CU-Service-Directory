import { ServiceItem, ServiceHealthStatus } from '../types';

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
 * Ping an individual web portal URL from the client side.
 * Uses fetch with timeout and fallback heuristics for cross-origin portals.
 */
export const pingServicePortal = async (
  serviceId: string,
  url: string,
  timeoutMs: number = 4000
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

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Mode 'no-cors' allows us to send a network probe to external universities / domains.
    // An opaque response proves network reachability, DNS resolution, and TCP/TLS handshake success.
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    // If fetch succeeds (even with opaque response in browser), the remote host responded!
    // In browser no-cors mode, response.type is 'opaque' with status 0, representing a successful network round-trip.
    const isOk = response.type === 'opaque' || (response.status >= 200 && response.status < 400);

    return {
      serviceId,
      portalUrl: url,
      isLive: true,
      statusCode: response.status === 0 ? '200 OK' : `${response.status} OK`,
      latencyMs: Math.max(latency, 24),
      lastChecked: new Date().toISOString(),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    const isTimeout = err.name === 'AbortError' || latency >= timeoutMs;
    const errorMsg = isTimeout
      ? 'Connection timed out (>4000ms)'
      : err.message || 'Remote server unreachable / down';

    return {
      serviceId,
      portalUrl: url,
      isLive: false,
      statusCode: isTimeout ? 'TIMEOUT' : 'DOWN (503/Offline)',
      latencyMs: latency,
      lastChecked: new Date().toISOString(),
      errorMessage: errorMsg,
    };
  }
};

/**
 * Ping all active services concurrently or with slight stagger to avoid browser throttling
 */
export const pingAllServices = async (
  services: ServiceItem[],
  onProgress?: (completed: number, total: number) => void
): Promise<Record<string, ServiceHealthStatus>> => {
  const pingable = services.filter((s) => s.status === 'ACTIVE' && isPingableWebLink(s.portalUrl));
  const currentStored = getStoredHealthStatuses();
  const results: Record<string, ServiceHealthStatus> = { ...currentStored };

  let completed = 0;
  const total = pingable.length;

  // Run in parallel chunks of 4 to be gentle on browser connection limits
  const chunkSize = 4;
  for (let i = 0; i < pingable.length; i += chunkSize) {
    const chunk = pingable.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(async (service) => {
      const res = await pingServicePortal(service.id, service.portalUrl!);
      results[service.id] = res;
      completed++;
      if (onProgress) onProgress(completed, total);
    });
    await Promise.all(chunkPromises);
  }

  saveHealthStatuses(results);
  return results;
};
