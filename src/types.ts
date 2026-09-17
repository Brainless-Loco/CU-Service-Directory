export interface ServiceGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
  iconName?: string;
  color?: string;
}

export type LogoRatio = '16:9' | '2:1' | '3:2' | '16:10';

export type ServiceStatus = 'ACTIVE' | 'DISABLED' | 'COMING_SOON';

export interface ServiceItem {
  id: string;
  title: string;
  description: string; // Max 50 words enforced
  groupId: string;
  portalUrl?: string; // Optional for COMING_SOON
  logoUrl: string; // URL link or base64 data string
  logoRatio: LogoRatio;
  bgColor?: string; // Hex color code or gradient background for card header/logo container
  tags?: string[];
  isFeatured?: boolean;
  status: ServiceStatus;
  badgeText?: string;
  updatedAt: string;
}

export interface ServiceClickEvent {
  id: string;
  serviceId: string;
  serviceTitle: string;
  portalUrl: string;
  timestamp: string; // ISO 8601 string e.g. 2026-09-16T11:00:00.000Z
  deviceType: 'desktop' | 'mobile' | 'tablet';
  ipAddress?: string;
}

export interface ServiceHealthStatus {
  serviceId: string;
  portalUrl: string;
  isLive: boolean; // 200 OK / reachable
  statusCode: number | string; // e.g. 200, 'ERR_OFFLINE', 'TIMEOUT'
  latencyMs: number;
  lastChecked: string;
  isChecking?: boolean;
  errorMessage?: string;
}

export interface AdminAuditLog {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  targetTable: string;
  targetId: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PortalFontSettings {
  englishPresetId: string;
  banglaPresetId: string;
  lastUpdated?: string;
  englishFontId?: string;
  banglaFontId?: string;
  baseFontSize?: number;
  updatedAt?: string;
}

export type NoticeType = 'info' | 'warning' | 'alert' | 'coming_soon' | 'maintenance';
export type NoticeStatus = 'ACTIVE' | 'DISABLED';

export interface PortalNotice {
  id: string;
  title: string;
  message: string;
  type: NoticeType;
  badgeText?: string;
  linkText?: string;
  linkUrl?: string;
  startTime: string; // ISO or YYYY-MM-DDTHH:mm string
  endTime: string;   // ISO or YYYY-MM-DDTHH:mm string
  status: NoticeStatus;
  createdAt: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'MAINTENANCE_SERVICES'
  | 'MAINTENANCE_NOTICES'
  | 'MAINTENANCE_GROUPS'
  | 'MAINTENANCE_VIEWER';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: UserRole;
  passwordPlain: string; // Auto-generated/managed password available to superadmin
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  role: UserRole;
  fullName?: string;
  token?: string;
  lastLogin?: string;
}

export interface PortalAnalyticsSummary {
  totalServices: number;
  activeServices: number;
  disabledServices: number;
  comingSoonServices: number;
  totalGroups: number;
  activeNotices: number;
  totalUsers: number;
}
