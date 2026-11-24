import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const databasePath = process.env.SQLITE_DB_PATH || path.join(serverDirectory, 'portal.sqlite');

if (databasePath !== ':memory:') {
  fs.mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true });
}

export const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.pragma('busy_timeout = 5000');

const schema = `
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
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED', 'COMING_SOON')),
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
    device_type TEXT NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet'))
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
  );
`;

const schemaVersion = database.pragma('user_version', { simple: true });
if (schemaVersion !== 2) {
  database.pragma('foreign_keys = OFF');
  const rebuild = database.transaction(() => {
    database.exec(`
      DROP TABLE IF EXISTS service_health_checks;
      DROP TABLE IF EXISTS service_clicks;
      DROP TABLE IF EXISTS admin_audit_logs;
      DROP TABLE IF EXISTS service_tags;
      DROP TABLE IF EXISTS services;
      DROP TABLE IF EXISTS portal_notices;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS service_groups;
      DROP TABLE IF EXISTS portal_settings;
    `);
    database.exec(schema);
    database.pragma('user_version = 2');
  });
  rebuild();
}
database.pragma('foreign_keys = ON');
database.pragma('journal_mode = WAL');
database.pragma('busy_timeout = 5000');

const tableNames = [
  'service_groups',
  'services',
  'portal_notices',
  'users',
  'service_clicks',
  'admin_audit_logs',
  'service_health_checks',
  'service_tags',
  'portal_settings',
];

const asId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const mapGroup = (row) => ({
  id: String(row.id),
  name: row.name,
  description: row.description || undefined,
  order: row.display_order,
  iconName: row.icon_name || undefined,
  color: row.color || undefined,
});

const mapService = (row) => ({
  id: String(row.id),
  title: row.title,
  description: row.description,
  groupId: row.group_id === null ? '' : String(row.group_id),
  portalUrl: row.portal_url || undefined,
  logoUrl: row.logo_url,
  logoRatio: row.logo_ratio,
  bgColor: row.bg_color || undefined,
  tags: database.prepare('SELECT tag FROM service_tags WHERE service_id = ? ORDER BY position')
    .all(row.id).map((tagRow) => tagRow.tag),
  badgeText: row.badge_text || undefined,
  status: row.status,
  isFeatured: Boolean(row.is_featured),
  displayOrder: row.display_order,
  updatedAt: row.updated_at,
});

const mapNotice = (row) => ({
  id: String(row.id),
  title: row.title,
  message: row.message,
  type: row.notice_type,
  badgeText: row.badge_text || undefined,
  linkUrl: row.link_url || undefined,
  linkText: row.link_text || undefined,
  startTime: row.start_time,
  endTime: row.end_time,
  status: row.status,
  createdAt: row.created_at,
});

const mapUser = (row) => ({
  id: String(row.id),
  email: row.email,
  fullName: row.full_name,
  department: row.department,
  role: row.role,
  passwordPlain: row.password_plain,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  lastLogin: row.last_login || undefined,
});

const mapClick = (row) => ({
  id: String(row.id),
  serviceId: row.service_id === null ? '' : String(row.service_id),
  serviceTitle: row.service_title,
  portalUrl: row.portal_url,
  timestamp: row.created_at,
  ipAddress: row.ip_address || undefined,
  deviceType: row.device_type,
});

const mapAuditLog = (row) => ({
  id: String(row.id),
  userEmail: row.user_email,
  action: row.action,
  targetTable: row.target_table,
  targetId: row.target_id,
  details: row.details || undefined,
  ipAddress: row.ip_address || undefined,
  timestamp: row.created_at,
});

const getRows = (table) => {
  switch (table) {
    case 'service_groups':
      return database.prepare('SELECT * FROM service_groups ORDER BY display_order, id').all().map(mapGroup);
    case 'services':
      return database.prepare('SELECT * FROM services ORDER BY display_order, id DESC').all().map(mapService);
    case 'portal_notices':
      return database.prepare('SELECT * FROM portal_notices ORDER BY id DESC').all().map(mapNotice);
    case 'users':
      return database.prepare('SELECT * FROM users ORDER BY id').all().map(mapUser);
    case 'service_clicks':
      return database.prepare('SELECT * FROM service_clicks ORDER BY created_at DESC, id DESC').all().map(mapClick);
    case 'admin_audit_logs':
      return database.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC, id DESC').all().map(mapAuditLog);
    default:
      throw new Error(`Unsupported database collection: ${table}`);
  }
};

export const getRecords = getRows;

export const getRecord = (table, id) => {
  const targetId = asId(id);
  if (targetId === null) return null;
  return getRows(table).find((record) => record.id === String(targetId)) || null;
};

const saveGroup = (group) => {
  const id = asId(group.id);
  const now = new Date().toISOString();
  if (id === null) {
    const result = database.prepare(`
      INSERT INTO service_groups (name, description, display_order, icon_name, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(group.name, group.description || null, group.order || 0, group.iconName || null, group.color || null, now, now);
    return { ...group, id: String(result.lastInsertRowid) };
  }
  database.prepare(`
    INSERT INTO service_groups (id, name, description, display_order, icon_name, color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, description = excluded.description,
      display_order = excluded.display_order, icon_name = excluded.icon_name,
      color = excluded.color, updated_at = excluded.updated_at
  `).run(id, group.name, group.description || null, group.order || 0, group.iconName || null, group.color || null, group.createdAt || now, now);
  return { ...group, id: String(id) };
};

const saveService = (service) => {
  const id = asId(service.id);
  const groupId = asId(service.groupId);
  if (groupId === null) throw new Error('A valid service group id is required.');
  const now = new Date().toISOString();
  const values = [
    service.title, service.description || '', groupId, service.portalUrl || null,
    service.logoUrl || '', service.logoRatio || '16:9', service.bgColor || null,
    service.badgeText || null, service.status || 'ACTIVE', service.isFeatured ? 1 : 0,
    service.displayOrder || 0, service.updatedAt || now,
  ];
  let serviceId = id;
  const persist = database.transaction(() => {
    if (serviceId === null) {
      const result = database.prepare(`
        INSERT INTO services
          (title, description, group_id, portal_url, logo_url, logo_ratio, bg_color, badge_text, status, is_featured, display_order, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(...values);
      serviceId = Number(result.lastInsertRowid);
    } else {
      database.prepare(`
        INSERT INTO services
          (id, title, description, group_id, portal_url, logo_url, logo_ratio, bg_color, badge_text, status, is_featured, display_order, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title, description = excluded.description, group_id = excluded.group_id,
          portal_url = excluded.portal_url, logo_url = excluded.logo_url, logo_ratio = excluded.logo_ratio,
          bg_color = excluded.bg_color, badge_text = excluded.badge_text, status = excluded.status,
          is_featured = excluded.is_featured, display_order = excluded.display_order, updated_at = excluded.updated_at
      `).run(serviceId, ...values);
    }
    database.prepare('DELETE FROM service_tags WHERE service_id = ?').run(serviceId);
    const insertTag = database.prepare('INSERT INTO service_tags (service_id, position, tag) VALUES (?, ?, ?)');
    (service.tags || []).forEach((tag, position) => insertTag.run(serviceId, position, tag));
  });
  persist();
  return { ...service, id: String(serviceId), groupId: String(groupId), updatedAt: service.updatedAt || now };
};

const saveNotice = (notice) => {
  const id = asId(notice.id);
  const now = new Date().toISOString();
  const values = [
    notice.title, notice.message, notice.type, notice.badgeText || null, notice.linkUrl || null,
    notice.linkText || null, notice.startTime, notice.endTime, notice.status || 'ACTIVE',
    notice.createdAt || now,
  ];
  if (id === null) {
    const result = database.prepare(`
      INSERT INTO portal_notices
        (title, message, notice_type, badge_text, link_url, link_text, start_time, end_time, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values);
    return { ...notice, id: String(result.lastInsertRowid), createdAt: notice.createdAt || now };
  }
  database.prepare(`
    INSERT INTO portal_notices
      (id, title, message, notice_type, badge_text, link_url, link_text, start_time, end_time, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title, message = excluded.message, notice_type = excluded.notice_type,
      badge_text = excluded.badge_text, link_url = excluded.link_url, link_text = excluded.link_text,
      start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status
  `).run(id, ...values);
  return { ...notice, id: String(id) };
};

const saveUser = (user) => {
  const id = asId(user.id);
  const now = new Date().toISOString();
  const values = [
    user.email, user.fullName, user.department, user.role, user.passwordPlain,
    user.isActive === false ? 0 : 1, user.createdAt || now, user.lastLogin || null,
  ];
  if (id === null) {
    const result = database.prepare(`
      INSERT INTO users (email, full_name, department, role, password_plain, is_active, created_at, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...values);
    return { ...user, id: String(result.lastInsertRowid), createdAt: user.createdAt || now };
  }
  database.prepare(`
    INSERT INTO users (id, email, full_name, department, role, password_plain, is_active, created_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      email = excluded.email, full_name = excluded.full_name, department = excluded.department,
      role = excluded.role, password_plain = excluded.password_plain,
      is_active = excluded.is_active, last_login = excluded.last_login
  `).run(id, ...values);
  return { ...user, id: String(id) };
};

export const saveRecord = (table, record) => {
  switch (table) {
    case 'service_groups': return saveGroup(record);
    case 'services': return saveService(record);
    case 'portal_notices': return saveNotice(record);
    case 'users': return saveUser(record);
    case 'service_clicks': {
      const serviceId = asId(record.serviceId);
      const result = database.prepare(`
        INSERT INTO service_clicks (service_id, service_title, portal_url, created_at, ip_address, user_agent, device_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        serviceId,
        record.serviceTitle,
        record.portalUrl || '',
        record.timestamp || new Date().toISOString(),
        record.ipAddress || null,
        record.userAgent || null,
        record.deviceType || 'desktop',
      );
      return { ...record, id: String(result.lastInsertRowid), serviceId: serviceId === null ? '' : String(serviceId) };
    }
    case 'admin_audit_logs': {
      const result = database.prepare(`
        INSERT INTO admin_audit_logs (user_email, action, target_table, target_id, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        record.userEmail,
        record.action,
        record.targetTable,
        record.targetId,
        record.details || null,
        record.ipAddress || null,
        record.timestamp || new Date().toISOString(),
      );
      return { ...record, id: String(result.lastInsertRowid) };
    }
    default:
      throw new Error(`Unsupported database collection: ${table}`);
  }
};

export const deleteRecord = (table, id) => {
  const targetId = asId(id);
  if (targetId === null) return false;
  const result = database.prepare(`DELETE FROM ${table} WHERE id = ?`).run(targetId);
  return result.changes > 0;
};

export const clearRecords = (table) => {
  if (!tableNames.includes(table)) throw new Error(`Unsupported database table: ${table}`);
  database.prepare(`DELETE FROM ${table}`).run();
};

export const getSetting = (key, fallback = null) => {
  if (key === 'fontSettings') {
    const row = database.prepare('SELECT * FROM portal_settings WHERE id = 1').get();
    if (!row || !row.english_preset_id || !row.bangla_preset_id) return fallback;
    return {
      englishPresetId: row.english_preset_id,
      banglaPresetId: row.bangla_preset_id,
      lastUpdated: row.last_updated || undefined,
      englishFontId: row.english_font_id || undefined,
      banglaFontId: row.bangla_font_id || undefined,
      baseFontSize: row.base_font_size || undefined,
      updatedAt: row.updated_at,
    };
  }
  if (key === 'healthStatuses') {
    return Object.fromEntries(database.prepare('SELECT * FROM service_health_checks').all().map((row) => [
      String(row.service_id),
      {
        serviceId: String(row.service_id),
        portalUrl: row.portal_url,
        isLive: Boolean(row.is_live),
        statusCode: row.status_code,
        latencyMs: row.latency_ms,
        lastChecked: row.checked_at,
        errorMessage: row.error_message || undefined,
      },
    ]));
  }
  return fallback;
};

export const saveSetting = (key, value) => {
  if (key === 'fontSettings') {
    if (!value) {
      database.prepare('DELETE FROM portal_settings WHERE id = 1').run();
      return null;
    }
    const now = new Date().toISOString();
    database.prepare(`
      INSERT INTO portal_settings
        (id, english_preset_id, bangla_preset_id, last_updated, english_font_id, bangla_font_id, base_font_size, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        english_preset_id = excluded.english_preset_id, bangla_preset_id = excluded.bangla_preset_id,
        last_updated = excluded.last_updated, english_font_id = excluded.english_font_id,
        bangla_font_id = excluded.bangla_font_id, base_font_size = excluded.base_font_size,
        updated_at = excluded.updated_at
    `).run(
      value.englishPresetId,
      value.banglaPresetId,
      value.lastUpdated || now,
      value.englishFontId || null,
      value.banglaFontId || null,
      value.baseFontSize || null,
      value.updatedAt || now,
    );
    return value;
  }
  if (key === 'healthStatuses') {
    const statuses = Object.values(value || {});
    const replace = database.transaction(() => {
      database.prepare('DELETE FROM service_health_checks').run();
      const insert = database.prepare(`
        INSERT INTO service_health_checks (service_id, portal_url, is_live, status_code, latency_ms, checked_at, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const status of statuses) {
        const serviceId = asId(status.serviceId);
        if (serviceId === null) throw new Error('Health status requires a valid service id.');
        insert.run(
          serviceId,
          status.portalUrl || '',
          status.isLive ? 1 : 0,
          String(status.statusCode),
          status.latencyMs || 0,
          status.lastChecked || new Date().toISOString(),
          status.errorMessage || null,
        );
      }
    });
    replace();
    return value || {};
  }
  throw new Error(`Unsupported portal setting: ${key}`);
};

export const getDatabaseStatus = () => ({
  engine: 'SQLite',
  file: databasePath,
  tables: Object.fromEntries(tableNames.map((table) => [
    table,
    database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count,
  ])),
});

export const initializeConfiguredAdmin = () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return false;

  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing || database.prepare('SELECT 1 FROM users LIMIT 1').get()) return false;

  saveRecord('users', {
    id: '',
    email,
    fullName: process.env.ADMIN_FULL_NAME || 'Portal Administrator',
    department: process.env.ADMIN_DEPARTMENT || 'ICT Cell',
    role: 'SUPER_ADMIN',
    passwordPlain: password,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  return true;
};
