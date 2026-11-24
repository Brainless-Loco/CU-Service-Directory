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

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);

CREATE TABLE IF NOT EXISTS service_groups (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);

CREATE TABLE IF NOT EXISTS portal_notices (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);

CREATE TABLE IF NOT EXISTS service_clicks (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);
CREATE INDEX IF NOT EXISTS idx_service_clicks_created_at ON service_clicks(created_at);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload))
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

CREATE TABLE IF NOT EXISTS portal_settings (
  setting_key TEXT PRIMARY KEY,
  value TEXT NOT NULL CHECK (json_valid(value)),
  updated_at TEXT NOT NULL
);`;
