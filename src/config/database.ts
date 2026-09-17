/**
 * Database Configuration & Connection Client Helper
 * University of Chittagong - Central Services Portal (services.cu.ac.bd)
 * 
 * Target Engine: MySQL 8.0+ (InnoDB, utf8mb4)
 * Client Driver: mysql2
 */

export interface DatabaseConfig {
  client: 'mysql2' | 'pg';
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  jwtSecret: string;
  appUrl: string;
}

// Read from import.meta.env (client-safe) or process.env (server-side)
const getEnv = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaKey = `VITE_${key}`;
    return (import.meta as any).env[metaKey] || (import.meta as any).env[key] || defaultValue;
  }
  return defaultValue;
};

export const databaseConfig: DatabaseConfig = {
  client: (getEnv('DB_CLIENT', 'mysql2') as 'mysql2' | 'pg'),
  host: getEnv('DB_HOST', 'localhost'),
  port: parseInt(getEnv('DB_PORT', '3306'), 10), // MySQL standard port 3306
  database: getEnv('DB_NAME', 'cu_services_portal'),
  user: getEnv('DB_USER', 'cu_admin'),
  password: getEnv('DB_PASSWORD', 'secret_cu_mysql_pwd_2026'),
  ssl: getEnv('DB_SSL', 'false') === 'true',
  pool: {
    min: parseInt(getEnv('DB_POOL_MIN', '2'), 10),
    max: parseInt(getEnv('DB_POOL_MAX', '20'), 10),
    idleTimeoutMillis: parseInt(getEnv('DB_IDLE_TIMEOUT', '30000'), 10),
    connectionTimeoutMillis: parseInt(getEnv('DB_CONN_TIMEOUT', '5000'), 10),
  },
  jwtSecret: getEnv('JWT_SECRET', 'cu_services_jwt_secret_key_super_secure'),
  appUrl: getEnv('APP_URL', 'https://services.cu.ac.bd'),
};

export const DEFAULT_DATABASE_CONFIG = databaseConfig;

/**
 * Returns formatted MySQL URI connection string (masking password if requested)
 */
export const getDatabaseConnectionString = (maskPassword = false): string => {
  const protocol = 'mysql';
  const pwd = maskPassword
    ? '••••••••'
    : encodeURIComponent(databaseConfig.password || '');
  const sslParam = databaseConfig.ssl ? '?ssl=true' : '';
  return `${protocol}://${databaseConfig.user}:${pwd}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}${sslParam}`;
};

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

/**
 * Complete MySQL 8.0+ Production DDL Schema
 * Includes Service Clicks Infographics tracking, Live Health Monitoring, Admin Audit Logs, and Views
 */
export const MYSQL_PORTAL_DDL = `-- ============================================================================
-- UNIVERSITY OF CHITTAGONG CENTRAL SERVICES PORTAL (services.cu.ac.bd)
-- COMPLETE MYSQL 8.0+ PRODUCTION DDL SCHEMA
-- ============================================================================

CREATE DATABASE IF NOT EXISTS \`cu_services_portal\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`cu_services_portal\`;

-- 1. ROLES TABLE (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS \`roles\` (
  \`role_id\` VARCHAR(32) NOT NULL,
  \`role_name\` VARCHAR(64) NOT NULL,
  \`description\` TEXT NULL,
  \`permissions\` JSON NOT NULL,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`role_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS TABLE (Administrative & Maintenance Officers)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`user_id\` CHAR(36) NOT NULL,
  \`email\` VARCHAR(128) NOT NULL,
  \`full_name\` VARCHAR(100) NOT NULL,
  \`department\` VARCHAR(100) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`password_plain\` VARCHAR(255) NOT NULL,
  \`role_id\` VARCHAR(32) NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  \`last_login\` DATETIME(3) NULL,
  PRIMARY KEY (\`user_id\`),
  UNIQUE KEY \`uk_users_email\` (\`email\`),
  KEY \`idx_users_role\` (\`role_id\`),
  CONSTRAINT \`fk_users_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`role_id\`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SERVICE_GROUPS TABLE (Category Sections)
CREATE TABLE IF NOT EXISTS \`service_groups\` (
  \`group_id\` VARCHAR(64) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`icon_name\` VARCHAR(64) DEFAULT 'GraduationCap',
  \`color_theme\` VARCHAR(32) DEFAULT 'emerald',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`group_id\`),
  KEY \`idx_groups_order\` (\`display_order\`),
  KEY \`idx_groups_active\` (\`is_active\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SERVICES_GROUP COMPATIBILITY VIEW
CREATE OR REPLACE VIEW \`services_group\` AS 
SELECT 
  \`group_id\`, 
  \`name\`, 
  \`description\`, 
  \`display_order\`, 
  \`icon_name\`, 
  \`color_theme\`, 
  \`is_active\`, 
  \`created_at\`, 
  \`updated_at\` 
FROM \`service_groups\`;

-- 5. SERVICES TABLE (University Digital Portals)
CREATE TABLE IF NOT EXISTS \`services\` (
  \`service_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(128) NOT NULL,
  \`description\` VARCHAR(400) NOT NULL,
  \`group_id\` VARCHAR(64) NOT NULL,
  \`portal_url\` TEXT NULL, -- NULLABLE when status is 'COMING_SOON'
  \`logo_url\` MEDIUMTEXT NOT NULL,
  \`logo_ratio\` VARCHAR(10) NOT NULL DEFAULT '16:9',
  \`bg_color\` VARCHAR(32) NULL DEFAULT '#0f172a',
  \`tags\` JSON NULL,
  \`badge_text\` VARCHAR(32) NULL,
  \`status\` ENUM('ACTIVE', 'DISABLED', 'COMING_SOON') NOT NULL DEFAULT 'ACTIVE',
  \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`created_by\` CHAR(36) NULL,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`service_id\`),
  KEY \`idx_services_group\` (\`group_id\`),
  KEY \`idx_services_status\` (\`status\`),
  KEY \`idx_services_order\` (\`display_order\`),
  CONSTRAINT \`fk_services_group\` FOREIGN KEY (\`group_id\`) REFERENCES \`service_groups\` (\`group_id\`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT \`fk_services_user\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PORTAL_NOTICES TABLE (Time-Windowed Broadcast Banners)
CREATE TABLE IF NOT EXISTS \`portal_notices\` (
  \`notice_id\` VARCHAR(64) NOT NULL,
  \`title\` VARCHAR(160) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`notice_type\` ENUM('info', 'warning', 'alert', 'coming_soon', 'maintenance') NOT NULL DEFAULT 'info',
  \`badge_text\` VARCHAR(32) NULL,
  \`link_url\` TEXT NULL,
  \`link_text\` VARCHAR(64) NULL,
  \`start_time\` DATETIME(3) NOT NULL,
  \`end_time\` DATETIME(3) NOT NULL,
  \`status\` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
  \`created_by\` CHAR(36) NULL,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`notice_id\`),
  KEY \`idx_notices_window\` (\`status\`, \`start_time\`, \`end_time\`),
  CONSTRAINT \`fk_notices_user\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. SERVICE_CLICKS TABLE (Click Tracking & Infographics Analytics)
CREATE TABLE IF NOT EXISTS \`service_clicks\` (
  \`click_id\` BIGINT NOT NULL AUTO_INCREMENT,
  \`service_id\` VARCHAR(64) NOT NULL,
  \`service_title\` VARCHAR(128) NOT NULL,
  \`portal_url\` TEXT NOT NULL,
  \`clicked_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`ip_address\` VARCHAR(45) NULL,
  \`user_agent\` VARCHAR(255) NULL,
  \`device_type\` ENUM('desktop', 'mobile', 'tablet') NOT NULL DEFAULT 'desktop',
  PRIMARY KEY (\`click_id\`),
  KEY \`idx_clicks_service\` (\`service_id\`, \`clicked_at\`),
  KEY \`idx_clicks_date\` (\`clicked_at\`),
  CONSTRAINT \`fk_clicks_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`service_id\`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SERVICE_HEALTH_CHECKS TABLE (Live Pinging & Uptime Status Logs)
CREATE TABLE IF NOT EXISTS \`service_health_checks\` (
  \`check_id\` BIGINT NOT NULL AUTO_INCREMENT,
  \`service_id\` VARCHAR(64) NOT NULL,
  \`portal_url\` TEXT NOT NULL,
  \`is_live\` TINYINT(1) NOT NULL DEFAULT 1,
  \`status_code\` VARCHAR(32) NOT NULL DEFAULT '200 OK',
  \`latency_ms\` INT NOT NULL DEFAULT 0,
  \`checked_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`error_message\` TEXT NULL,
  PRIMARY KEY (\`check_id\`),
  KEY \`idx_health_service\` (\`service_id\`, \`checked_at\`),
  CONSTRAINT \`fk_health_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\` (\`service_id\`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ADMIN_AUDIT_LOGS TABLE (Administrative Actions Ledger)
CREATE TABLE IF NOT EXISTS \`admin_audit_logs\` (
  \`log_id\` BIGINT NOT NULL AUTO_INCREMENT,
  \`user_id\` CHAR(36) NULL,
  \`user_email\` VARCHAR(128) NOT NULL,
  \`action\` VARCHAR(64) NOT NULL,
  \`target_table\` VARCHAR(64) NOT NULL,
  \`target_id\` VARCHAR(64) NOT NULL,
  \`details\` JSON NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`log_id\`),
  KEY \`idx_audit_user\` (\`user_id\`),
  KEY \`idx_audit_action\` (\`action\`, \`created_at\`),
  CONSTRAINT \`fk_audit_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PORTAL_SETTINGS TABLE (Dynamic Fonts & System Config)
CREATE TABLE IF NOT EXISTS \`portal_settings\` (
  \`setting_key\` VARCHAR(64) NOT NULL,
  \`setting_value\` JSON NOT NULL,
  \`updated_by\` CHAR(36) NULL,
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (\`setting_key\`),
  CONSTRAINT \`fk_settings_user\` FOREIGN KEY (\`updated_by\`) REFERENCES \`users\` (\`user_id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;
