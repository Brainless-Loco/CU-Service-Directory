import { ServiceClickEvent } from '../types';

export const STORAGE_KEY_CLICKS = 'cu_services_clicks_v3';

// Helper to determine device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
};

/**
 * Load locally cached click events.
 */
export const getStoredClicks = (): ServiceClickEvent[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CLICKS);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load stored clicks', e);
  }

  return [];
};

/**
 * Record a new click event for a service
 */
export const recordServiceClick = (
  serviceId: string,
  serviceTitle: string,
  portalUrl?: string
): ServiceClickEvent => {
  const newEvent: ServiceClickEvent = {
    id: `click-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    serviceId,
    serviceTitle,
    portalUrl: portalUrl || 'https://services.cu.ac.bd',
    timestamp: new Date().toISOString(),
    deviceType: getDeviceType(),
  };

  try {
    const existing = getStoredClicks();
    const updated = [newEvent, ...existing].slice(0, 5000); // retain up to 5000 recent clicks
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record click event', e);
  }

  return newEvent;
};

/**
 * Clear all recorded clicks to empty array
 */
export const clearRecordedClicks = (): ServiceClickEvent[] => {
  try {
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear clicks', e);
  }
  return [];
};

/**
 * Clear locally cached click logs.
 */
export const resetClickLogs = (): ServiceClickEvent[] => {
  return clearRecordedClicks();
};

/**
 * Compute aggregate statistics for infographics
 */
export interface ClickAnalyticsSummary {
  totalClicks: number;
  todayClicks: number;
  yesterdayClicks: number;
  sevenDayClicks: number;
  dailyAverageClicks: number;
  peakHour: { hour: string; count: number } | null;
  topService: { title: string; count: number; percentage: number } | null;
  topServices: {
    serviceId: string;
    title: string;
    serviceTitle: string;
    portalUrl: string;
    count: number;
    percentage: number;
    lastClicked: string;
  }[];
  dailyTrend: {
    date: string;
    label: string;
    formattedDate: string;
    count: number;
    clicks: number;
  }[];
  dailyTrends: {
    date: string;
    label: string;
    formattedDate: string;
    count: number;
    clicks: number;
  }[];
  hourlyDistribution: {
    hour: string;
    label: string;
    count: number;
    clicks: number;
  }[];
  deviceBreakdown: {
    desktop: number;
    desktopPct: number;
    mobile: number;
    mobilePct: number;
    tablet: number;
    tabletPct: number;
  };
}

export const computeClickAnalytics = (clicks: ServiceClickEvent[], days: number = 14): ClickAnalyticsSummary => {
  const totalClicks = clicks.length;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  let todayClicks = 0;
  let yesterdayClicks = 0;
  let sevenDayClicks = 0;

  const serviceCounts: Record<string, { title: string; url: string; count: number; lastClicked: string }> = {};
  const dailyCounts: Record<string, number> = {};
  const hourlyCounts: number[] = new Array(24).fill(0);
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };

  clicks.forEach((click) => {
    const clickDate = new Date(click.timestamp);
    const dateStr = click.timestamp.slice(0, 10);

    // Day counts
    if (dateStr === todayStr) todayClicks++;
    if (dateStr === yesterdayStr) yesterdayClicks++;
    if (clickDate >= sevenDaysAgo) sevenDayClicks++;

    // Daily trends map
    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;

    // Hourly distribution
    const hour = clickDate.getHours();
    if (hour >= 0 && hour < 24) {
      hourlyCounts[hour]++;
    }

    // Devices
    if (click.deviceType && deviceCounts[click.deviceType] !== undefined) {
      deviceCounts[click.deviceType]++;
    } else {
      deviceCounts.desktop++;
    }

    // Services
    if (!serviceCounts[click.serviceId]) {
      serviceCounts[click.serviceId] = {
        title: click.serviceTitle,
        url: click.portalUrl,
        count: 0,
        lastClicked: click.timestamp,
      };
    }
    serviceCounts[click.serviceId].count++;
    if (new Date(click.timestamp) > new Date(serviceCounts[click.serviceId].lastClicked)) {
      serviceCounts[click.serviceId].lastClicked = click.timestamp;
    }
  });

  // Top services sorted by count
  const topServices = Object.entries(serviceCounts)
    .map(([id, info]) => ({
      serviceId: id,
      title: info.title,
      serviceTitle: info.title,
      portalUrl: info.url,
      count: info.count,
      percentage: totalClicks > 0 ? Math.round((info.count / totalClicks) * 100) : 0,
      lastClicked: info.lastClicked,
    }))
    .sort((a, b) => b.count - a.count);

  // Daily Average
  const dailyAverageClicks = totalClicks > 0 ? Math.round(totalClicks / Math.max(days, 1)) : 0;

  // Peak Hour calculation
  let maxHour = 10;
  let maxHourClicks = 0;
  hourlyCounts.forEach((count, hour) => {
    if (count > maxHourClicks) {
      maxHourClicks = count;
      maxHour = hour;
    }
  });
  const peakHourStr = maxHour === 0 ? '12:00 AM' : maxHour === 12 ? '12:00 PM' : maxHour > 12 ? `${maxHour - 12}:00 PM` : `${maxHour}:00 AM`;
  const peakHour = totalClicks > 0 ? { hour: peakHourStr, count: maxHourClicks } : null;

  // Top Service
  const topService = topServices.length > 0
    ? { title: topServices[0].title, count: topServices[0].count, percentage: topServices[0].percentage }
    : null;

  // Build daily trends for specified days chronologically
  const dailyTrends: { date: string; label: string; formattedDate: string; count: number; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = dailyCounts[dStr] || 0;
    dailyTrends.push({
      date: dStr,
      label,
      formattedDate: label,
      count,
      clicks: count,
    });
  }

  // Hourly distribution
  const hourlyDistribution = hourlyCounts.map((count, hour) => {
    const hour12 = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    const hour24 = `${hour.toString().padStart(2, '0')}:00`;
    return {
      hour: hour24,
      label: hour12,
      count,
      clicks: count,
    };
  });

  // Device Percentages
  const totalDevices = deviceCounts.desktop + deviceCounts.mobile + deviceCounts.tablet;
  const desktopPct = totalDevices > 0 ? Math.round((deviceCounts.desktop / totalDevices) * 100) : 0;
  const mobilePct = totalDevices > 0 ? Math.round((deviceCounts.mobile / totalDevices) * 100) : 0;
  const tabletPct = totalDevices > 0 ? Math.max(0, 100 - desktopPct - mobilePct) : 0;

  return {
    totalClicks,
    todayClicks,
    yesterdayClicks,
    sevenDayClicks,
    dailyAverageClicks,
    peakHour,
    topService,
    topServices,
    dailyTrend: dailyTrends,
    dailyTrends,
    hourlyDistribution,
    deviceBreakdown: {
      ...deviceCounts,
      desktopPct,
      mobilePct,
      tabletPct,
    },
  };
};

// Aliases for compatibility
export const computeClickStats = computeClickAnalytics;


