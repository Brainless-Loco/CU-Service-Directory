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

// Realistic seed data across the last 14 days so infographics have rich visual charts right away
export const generateSeedClicks = (customServices?: any[], countMultiplier: number = 1): ServiceClickEvent[] => {
  const seeds: ServiceClickEvent[] = [];
  const defaultServices = [
    { id: 'srv-admission', title: 'Undergraduate Admission Portal', url: 'https://admission.cu.ac.bd', baseWeight: 45 },
    { id: 'srv-student-portal', title: 'Student Management System (CU-SMS)', url: 'https://sms.cu.ac.bd', baseWeight: 50 },
    { id: 'srv-fac-staff', title: 'Faculty & Employee Portal', url: 'https://staff.cu.ac.bd', baseWeight: 28 },
    { id: 'srv-exam-controller', title: 'Exam Controller Results Portal', url: 'https://results.cu.ac.bd', baseWeight: 40 },
    { id: 'srv-ict-email', title: 'CU Webmail & G-Suite Gateway', url: 'https://mail.cu.ac.bd', baseWeight: 35 },
    { id: 'srv-digital-library', title: 'Central Library E-Repository', url: 'https://library.cu.ac.bd', baseWeight: 22 },
    { id: 'srv-research-journal', title: 'Research & Publications Repository', url: 'https://journal.cu.ac.bd', baseWeight: 15 },
    { id: 'srv-convocation', title: 'Convocation Portal (Coming Soon)', url: 'https://convocation.cu.ac.bd', baseWeight: 8 },
  ];

  const services = customServices && customServices.length > 0
    ? customServices.map((s) => ({ id: s.id, title: s.title, url: s.portalUrl || 'https://services.cu.ac.bd', baseWeight: 30 }))
    : defaultServices;

  const now = Date.now();
  const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'desktop', 'mobile', 'mobile', 'tablet'];

  // Spread events over past 14 days
  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const dayTimestamp = now - dayOffset * 86400000;
    const isWeekend = new Date(dayTimestamp).getDay() === 5 || new Date(dayTimestamp).getDay() === 6; // Friday/Saturday in BD
    const dayMultiplier = (isWeekend ? 0.6 : 1.2) * (countMultiplier > 1 ? countMultiplier / 20 : 1);

    services.forEach((service) => {
      const clickCount = Math.max(1, Math.floor((service.baseWeight * dayMultiplier * (0.7 + Math.random() * 0.6)) / 3));
      for (let i = 0; i < clickCount; i++) {
        // Random hour distributed around university working hours (8 AM - 10 PM)
        const hour = Math.floor(Math.random() * 14) + 8; // 8:00 to 22:00
        const minute = Math.floor(Math.random() * 60);
        const eventDate = new Date(dayTimestamp);
        eventDate.setHours(hour, minute, Math.floor(Math.random() * 60));

        seeds.push({
          id: `click-${dayOffset}-${service.id}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          serviceId: service.id,
          serviceTitle: service.title,
          portalUrl: service.url,
          timestamp: eventDate.toISOString(),
          deviceType: devices[Math.floor(Math.random() * devices.length)],
          ipAddress: `103.113.152.${Math.floor(Math.random() * 220) + 10}`,
        });
      }
    });
  }

  // Sort by timestamp descending
  return seeds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Load stored click events from localStorage or initialize with seed data
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

  const initialSeeds = generateSeedClicks();
  try {
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(initialSeeds));
  } catch (e) {
    console.error('Failed to save initial seed clicks', e);
  }
  return initialSeeds;
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
    ipAddress: `103.113.152.${Math.floor(Math.random() * 220) + 10}`,
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
 * Reset click logs with fresh seed data
 */
export const resetClickLogs = (): ServiceClickEvent[] => {
  const seeds = generateSeedClicks();
  try {
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(seeds));
  } catch (e) {
    console.error('Failed to reset clicks', e);
  }
  return seeds;
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


