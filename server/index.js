import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'data.json');
const port = Number(process.env.API_PORT || 4000);
const tokens = new Map();

const emptyStore = () => ({
  initialized: false,
  services: [],
  groups: [],
  notices: [],
  users: [],
  clicks: [],
  auditLogs: [],
  fontSettings: null,
  healthStatuses: {},
});

const readStore = () => {
  try {
    if (fs.existsSync(dataFile)) return { ...emptyStore(), ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) };
  } catch (error) {
    console.error('Failed to read API data store:', error);
  }
  return emptyStore();
};

let store = readStore();
const saveStore = () => fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
const now = () => new Date().toISOString();

const addAuditLog = ({ userEmail, action, targetTable, targetId, details }) => {
  const log = {
    id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    userEmail: userEmail || 'system@cu.ac.bd',
    action,
    targetTable,
    targetId,
    details: typeof details === 'string' ? details : JSON.stringify(details || {}),
    ipAddress: 'server',
    timestamp: now(),
  };
  store.auditLogs = [log, ...store.auditLogs].slice(0, 1000);
  saveStore();
  return log;
};

const getUserFromRequest = (request) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  return token ? tokens.get(token) : null;
};

const requireAuth = (request, response, next) => {
  const user = getUserFromRequest(request);
  if (!user) return response.status(401).json({ error: 'Authentication required.' });
  request.adminUser = user;
  next();
};

const requireSuperAdmin = (request, response, next) => {
  if (request.adminUser.role !== 'SUPER_ADMIN') {
    return response.status(403).json({ error: 'Superadmin permission required.' });
  }
  next();
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_request, response) => response.json({ status: 'ok', timestamp: now() }));

app.get('/api/bootstrap', (_request, response) => {
  response.json({
    initialized: store.initialized,
    services: store.services,
    groups: store.groups,
    notices: store.notices,
    fontSettings: store.fontSettings,
  });
});

app.post('/api/bootstrap', (request, response) => {
  if (!store.initialized) {
    const payload = request.body || {};
    store = {
      ...store,
      initialized: true,
      services: Array.isArray(payload.services) ? payload.services : [],
      groups: Array.isArray(payload.groups) ? payload.groups : [],
      notices: Array.isArray(payload.notices) ? payload.notices : [],
      users: Array.isArray(payload.users) ? payload.users : [],
      clicks: Array.isArray(payload.clicks) ? payload.clicks : [],
      auditLogs: Array.isArray(payload.auditLogs) ? payload.auditLogs : [],
      fontSettings: payload.fontSettings || null,
      healthStatuses: payload.healthStatuses || {},
    };
    saveStore();
  }
  response.json({ initialized: store.initialized });
});

app.post('/api/auth/login', (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '').trim();
  const matchedUser = store.users.find((user) => user.email.toLowerCase() === email);
  let role = null;
  let fullName = email;

  if (matchedUser) {
    if (!matchedUser.isActive) return response.status(403).json({ error: 'This administrative user account is inactive.' });
    if (matchedUser.passwordPlain === password) {
      role = matchedUser.role;
      fullName = matchedUser.fullName;
    }
  } else if ((email === 'tonmoy.ict@cu.ac.bd' || email === 'admin@cu.ac.bd') && (password === 'cu@admin2026' || password === 'admin123')) {
    role = 'SUPER_ADMIN';
    fullName = 'Tonmoy (Lead System Architect)';
  }

  if (!role) return response.status(401).json({ error: 'Invalid administrative credentials.' });

  const token = crypto.randomBytes(32).toString('hex');
  const auth = {
    isAuthenticated: true,
    userEmail: email,
    role,
    fullName,
    token,
    lastLogin: now(),
  };
  tokens.set(token, auth);
  addAuditLog({ userEmail: email, action: 'ADMIN_LOGIN', targetTable: 'users', targetId: email, details: { role, status: 'SUCCESS' } });
  response.json(auth);
});

app.post('/api/auth/logout', requireAuth, (request, response) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  tokens.delete(token);
  addAuditLog({ userEmail: request.adminUser.userEmail, action: 'ADMIN_LOGOUT', targetTable: 'users', targetId: request.adminUser.userEmail, details: { role: request.adminUser.role } });
  response.status(204).end();
});

app.get('/api/admin/bootstrap', requireAuth, (request, response) => {
  response.json({
    services: store.services,
    groups: store.groups,
    notices: store.notices,
    users: store.users,
    clicks: store.clicks,
    auditLogs: store.auditLogs,
    fontSettings: store.fontSettings,
    healthStatuses: store.healthStatuses,
  });
});

const collectionConfig = {
  services: { table: 'services', create: 'SERVICE_CREATE', update: 'SERVICE_UPDATE', delete: 'SERVICE_DELETE' },
  groups: { table: 'service_groups', create: 'GROUP_CREATE', update: 'GROUP_UPDATE', delete: 'GROUP_DELETE' },
  notices: { table: 'portal_notices', create: 'NOTICE_CREATE', update: 'NOTICE_UPDATE', delete: 'NOTICE_DELETE' },
  users: { table: 'users', create: 'USER_CREATE', update: 'USER_UPDATE', delete: 'USER_DELETE', superadmin: true },
};

for (const [collection, config] of Object.entries(collectionConfig)) {
  app.post(`/api/admin/${collection}`, requireAuth, config.superadmin ? requireSuperAdmin : (_request, _response, next) => next(), (request, response) => {
    const item = request.body;
    if (!item?.id) return response.status(400).json({ error: 'A record id is required.' });
    const exists = store[collection].some((entry) => entry.id === item.id);
    store[collection] = exists
      ? store[collection].map((entry) => (entry.id === item.id ? item : entry))
      : [item, ...store[collection]];
    saveStore();
    addAuditLog({ userEmail: request.adminUser.userEmail, action: exists ? config.update : config.create, targetTable: config.table, targetId: item.id, details: item });
    response.json(item);
  });

  app.delete(`/api/admin/${collection}/:id`, requireAuth, config.superadmin ? requireSuperAdmin : (_request, _response, next) => next(), (request, response) => {
    const existing = store[collection].find((entry) => entry.id === request.params.id);
    if (!existing) return response.status(404).json({ error: 'Record not found.' });
    store[collection] = store[collection].filter((entry) => entry.id !== request.params.id);
    saveStore();
    addAuditLog({ userEmail: request.adminUser.userEmail, action: config.delete, targetTable: config.table, targetId: request.params.id, details: existing });
    response.status(204).end();
  });
}

app.get('/api/admin/audit-logs', requireAuth, (request, response) => response.json(store.auditLogs));
app.delete('/api/admin/audit-logs', requireAuth, (request, response) => {
  store.auditLogs = [];
  saveStore();
  response.status(204).end();
});

app.post('/api/admin/reset', requireAuth, requireSuperAdmin, (request, response) => {
  const payload = request.body || {};
  store.services = Array.isArray(payload.services) ? payload.services : [];
  store.groups = Array.isArray(payload.groups) ? payload.groups : [];
  store.notices = Array.isArray(payload.notices) ? payload.notices : [];
  store.users = Array.isArray(payload.users) ? payload.users : [];
  store.clicks = Array.isArray(payload.clicks) ? payload.clicks : [];
  store.auditLogs = [];
  saveStore();
  addAuditLog({ userEmail: request.adminUser.userEmail, action: 'PORTAL_FACTORY_RESET', targetTable: 'portal_settings', targetId: 'factory_reset', details: { reset: true } });
  response.json({ ok: true });
});

app.post('/api/clicks', (request, response) => {
  const click = { ...request.body, id: request.body?.id || `click-${Date.now()}`, timestamp: request.body?.timestamp || now() };
  store.clicks = [click, ...store.clicks].slice(0, 5000);
  saveStore();
  response.status(201).json(click);
});

app.get('/api/admin/clicks', requireAuth, (_request, response) => response.json(store.clicks));
app.delete('/api/admin/clicks', requireAuth, (_request, response) => {
  store.clicks = [];
  saveStore();
  response.status(204).end();
});

app.put('/api/admin/font-settings', requireAuth, (request, response) => {
  store.fontSettings = request.body;
  saveStore();
  addAuditLog({ userEmail: request.adminUser.userEmail, action: 'FONT_CONFIG_UPDATE', targetTable: 'portal_settings', targetId: 'typography', details: request.body });
  response.json(store.fontSettings);
});

app.put('/api/admin/health-statuses', requireAuth, (request, response) => {
  store.healthStatuses = request.body || {};
  saveStore();
  response.json(store.healthStatuses);
});

app.listen(port, () => console.log(`CU Services API listening on http://localhost:${port}`));
