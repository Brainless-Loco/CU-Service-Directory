export const SQLITE_DB_LOCATION = 'server/portal.sqlite';

/**
 * Role-Based Access Control (RBAC) Permission Matrix
 */
export interface RolePermissions {
  services: { create: boolean; read: boolean; update: boolean; delete: boolean };
  groups: { create: boolean; read: boolean; update: boolean; delete: boolean };
  notices: { create: boolean; read: boolean; update: boolean; delete: boolean };
  users: { create: boolean; read: boolean; update: boolean; delete: boolean; viewPasswords: boolean };
  clicks: { viewAnalytics: boolean; export: boolean; reset: boolean };
  health: { pingAll: boolean; viewStatus: boolean };
  system: { backup: boolean; restore: boolean; config: boolean };
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  SUPER_ADMIN: {
    services: { create: true, read: true, update: true, delete: true },
    groups: { create: true, read: true, update: true, delete: true },
    notices: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true, viewPasswords: true },
    clicks: { viewAnalytics: true, export: true, reset: true },
    health: { pingAll: true, viewStatus: true },
    system: { backup: true, restore: true, config: true },
  },
  MAINTENANCE_SERVICES: {
    services: { create: true, read: true, update: true, delete: true },
    groups: { create: false, read: true, update: false, delete: false },
    notices: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false, viewPasswords: false },
    clicks: { viewAnalytics: true, export: true, reset: false },
    health: { pingAll: true, viewStatus: true },
    system: { backup: false, restore: false, config: false },
  },
  MAINTENANCE_NOTICES: {
    services: { create: false, read: true, update: false, delete: false },
    groups: { create: false, read: true, update: false, delete: false },
    notices: { create: true, read: true, update: true, delete: true },
    users: { create: false, read: false, update: false, delete: false, viewPasswords: false },
    clicks: { viewAnalytics: true, export: false, reset: false },
    health: { pingAll: false, viewStatus: true },
    system: { backup: false, restore: false, config: false },
  },
  MAINTENANCE_GROUPS: {
    services: { create: false, read: true, update: false, delete: false },
    groups: { create: true, read: true, update: true, delete: true },
    notices: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false, viewPasswords: false },
    clicks: { viewAnalytics: true, export: false, reset: false },
    health: { pingAll: false, viewStatus: true },
    system: { backup: false, restore: false, config: false },
  },
  MAINTENANCE_VIEWER: {
    services: { create: false, read: true, update: false, delete: false },
    groups: { create: false, read: true, update: false, delete: false },
    notices: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false, viewPasswords: false },
    clicks: { viewAnalytics: true, export: false, reset: false },
    health: { pingAll: false, viewStatus: true },
    system: { backup: false, restore: false, config: false },
  },
};

export const SQLITE_PORTAL_DDL = `PRAGMA foreign_keys = ON;

CREATE TABLE service_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  icon_name TEXT,
  color TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  group_id INTEGER,
  portal_url TEXT,
  logo_url TEXT NOT NULL DEFAULT '',
  logo_ratio TEXT NOT NULL DEFAULT '16:9',
  bg_color TEXT,
  badge_text TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'DISABLED', 'COMING_SOON')),
  is_featured INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES service_groups(id) ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX idx_services_group_order ON services(group_id, display_order, id);

CREATE TABLE service_tags (
  service_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (service_id, position),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE portal_notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notice_type TEXT NOT NULL,
  badge_text TEXT,
  link_url TEXT,
  link_text TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL,
  password_plain TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_login TEXT
);

CREATE TABLE service_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER,
  service_title TEXT NOT NULL,
  portal_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT NOT NULL DEFAULT 'desktop'
    CHECK (device_type IN ('desktop', 'mobile', 'tablet'))
);
CREATE INDEX idx_service_clicks_created_at ON service_clicks(created_at);
CREATE INDEX idx_service_clicks_service_time ON service_clicks(service_id, created_at);

CREATE TABLE admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT CHECK (details IS NULL OR json_valid(details)),
  ip_address TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

CREATE TABLE service_health_checks (
  service_id INTEGER PRIMARY KEY,
  portal_url TEXT NOT NULL,
  is_live INTEGER NOT NULL,
  status_code TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  checked_at TEXT NOT NULL,
  error_message TEXT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE portal_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  english_preset_id TEXT,
  bangla_preset_id TEXT,
  last_updated TEXT,
  english_font_id TEXT,
  bangla_font_id TEXT,
  base_font_size INTEGER,
  updated_at TEXT NOT NULL
);`;
