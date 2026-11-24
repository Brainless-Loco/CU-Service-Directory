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
database.pragma('foreign_keys = ON');
database.pragma('busy_timeout = 5000');

database.exec(`
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
  );
`);

export const sqliteTableNames = [
  'services',
  'service_groups',
  'portal_notices',
  'users',
  'service_clicks',
  'admin_audit_logs',
  'portal_settings',
];

export const getRecords = (table) => {
  const ordering = table === 'service_clicks' || table === 'admin_audit_logs'
    ? 'created_at DESC, rowid DESC'
    : 'rowid DESC';
  return database.prepare(`SELECT payload FROM ${table} ORDER BY ${ordering}`).all()
    .map((row) => JSON.parse(row.payload));
};

export const getRecord = (table, id) => {
  const row = database.prepare(`SELECT payload FROM ${table} WHERE id = ?`).get(id);
  return row ? JSON.parse(row.payload) : null;
};

export const saveRecord = (table, record) => {
  if (table === 'users') {
    database.prepare(`
      INSERT INTO users (id, email, payload) VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET email = excluded.email, payload = excluded.payload
    `).run(record.id, record.email, JSON.stringify(record));
  } else if (table === 'service_clicks' || table === 'admin_audit_logs') {
    const timestamp = record.timestamp || new Date().toISOString();
    database.prepare(`
      INSERT INTO ${table} (id, created_at, payload) VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET created_at = excluded.created_at, payload = excluded.payload
    `).run(record.id, timestamp, JSON.stringify(record));
  } else {
    database.prepare(`
      INSERT INTO ${table} (id, payload) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload
    `).run(record.id, JSON.stringify(record));
  }
  return record;
};

export const deleteRecord = (table, id) => {
  const result = database.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return result.changes > 0;
};

export const clearRecords = (table) => {
  database.prepare(`DELETE FROM ${table}`).run();
};

export const getSetting = (key, fallback = null) => {
  const row = database.prepare('SELECT value FROM portal_settings WHERE setting_key = ?').get(key);
  return row ? JSON.parse(row.value) : fallback;
};

export const saveSetting = (key, value) => {
  database.prepare(`
    INSERT INTO portal_settings (setting_key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(setting_key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, JSON.stringify(value), new Date().toISOString());
  return value;
};

export const getDatabaseStatus = () => ({
  engine: 'SQLite',
  file: databasePath,
  tables: Object.fromEntries(sqliteTableNames.map((table) => [
    table,
    database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count,
  ])),
});

export const initializeConfiguredAdmin = () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return false;

  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return false;

  const usersExist = database.prepare('SELECT 1 FROM users LIMIT 1').get();
  if (usersExist) return false;

  saveRecord('users', {
    id: 'configured-super-admin',
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
