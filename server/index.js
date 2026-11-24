import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import {
  clearRecords,
  deleteRecord,
  getDatabaseStatus,
  getRecords,
  getRecord,
  getSetting,
  initializeConfiguredAdmin,
  saveRecord,
  saveSetting,
} from './database.js';

const port = Number(process.env.API_PORT || 4000);
const tokens = new Map();
const configuredAdminCreated = initializeConfiguredAdmin();
const timestamp = () => new Date().toISOString();

if (configuredAdminCreated) {
  console.log(`Created the configured SQLite administrator account for ${process.env.ADMIN_EMAIL}.`);
}

if (getRecords('users').length === 0) {
  console.warn('No administrator is configured. Set ADMIN_EMAIL and ADMIN_PASSWORD to enable admin login.');
}

const addAuditLog = ({ userEmail, action, targetTable, targetId, details, ipAddress }) => {
  const log = {
    id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    userEmail: userEmail || 'system@cu.ac.bd',
    action,
    targetTable,
    targetId,
    details: typeof details === 'string' ? details : JSON.stringify(details || {}),
    ipAddress: ipAddress || null,
    timestamp: timestamp(),
  };
  saveRecord('admin_audit_logs', log);
  const oldLogs = getRecords('admin_audit_logs');
  for (const oldLog of oldLogs.slice(1000)) deleteRecord('admin_audit_logs', oldLog.id);
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

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', timestamp: timestamp(), database: 'sqlite' });
});

app.get('/api/bootstrap', (_request, response) => {
  response.json({
    initialized: true,
    services: getRecords('services'),
    groups: getRecords('service_groups'),
    notices: getRecords('portal_notices'),
    fontSettings: getSetting('fontSettings'),
  });
});

app.get('/api/admin/bootstrap', requireAuth, (_request, response) => {
  response.json({
    services: getRecords('services'),
    groups: getRecords('service_groups'),
    notices: getRecords('portal_notices'),
    users: getRecords('users'),
    clicks: getRecords('service_clicks'),
    auditLogs: getRecords('admin_audit_logs'),
    fontSettings: getSetting('fontSettings'),
    healthStatuses: getSetting('healthStatuses', {}),
  });
});

app.get('/api/admin/database-status', requireAuth, requireSuperAdmin, (_request, response) => {
  response.json(getDatabaseStatus());
});

app.post('/api/auth/login', (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');
  const matchedUser = getRecords('users').find((user) => user.email.toLowerCase() === email);
  if (!matchedUser || !matchedUser.isActive || matchedUser.passwordPlain !== password) {
    return response.status(401).json({ error: 'Invalid administrative credentials.' });
  }

  matchedUser.lastLogin = timestamp();
  saveRecord('users', matchedUser);

  const token = crypto.randomBytes(32).toString('hex');
  const auth = {
    isAuthenticated: true,
    userEmail: email,
    role: matchedUser.role,
    fullName: matchedUser.fullName,
    token,
    lastLogin: matchedUser.lastLogin,
  };
  tokens.set(token, auth);
  addAuditLog({
    userEmail: email,
    action: 'ADMIN_LOGIN',
    targetTable: 'users',
    targetId: matchedUser.id,
    details: { role: matchedUser.role, status: 'SUCCESS' },
    ipAddress: request.ip,
  });
  response.json(auth);
});

app.post('/api/auth/logout', requireAuth, (request, response) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  tokens.delete(token);
  addAuditLog({
    userEmail: request.adminUser.userEmail,
    action: 'ADMIN_LOGOUT',
    targetTable: 'users',
    targetId: request.adminUser.userEmail,
    details: { role: request.adminUser.role },
    ipAddress: request.ip,
  });
  response.status(204).end();
});

const collectionConfig = {
  services: { table: 'services', create: 'SERVICE_CREATE', update: 'SERVICE_UPDATE', delete: 'SERVICE_DELETE' },
  groups: { table: 'service_groups', create: 'GROUP_CREATE', update: 'GROUP_UPDATE', delete: 'GROUP_DELETE' },
  notices: { table: 'portal_notices', create: 'NOTICE_CREATE', update: 'NOTICE_UPDATE', delete: 'NOTICE_DELETE' },
  users: { table: 'users', create: 'USER_CREATE', update: 'USER_UPDATE', delete: 'USER_DELETE', superadmin: true },
};

for (const [collection, config] of Object.entries(collectionConfig)) {
  const table = config.table;
  const authorization = config.superadmin
    ? [requireAuth, requireSuperAdmin]
    : [requireAuth];

  app.post(`/api/admin/${collection}`, ...authorization, (request, response) => {
    const item = request.body;
    if (!item?.id) return response.status(400).json({ error: 'A record id is required.' });

    const exists = Boolean(getRecord(table, item.id));
    const savedItem = saveRecord(table, item);
    const auditDetails = collection === 'users'
      ? { ...savedItem, passwordPlain: '***' }
      : savedItem;
    addAuditLog({
      userEmail: request.adminUser.userEmail,
      action: exists ? config.update : config.create,
      targetTable: table,
      targetId: savedItem.id,
      details: auditDetails,
      ipAddress: request.ip,
    });
    response.json(savedItem);
  });

  app.delete(`/api/admin/${collection}/:id`, ...authorization, (request, response) => {
    const existing = getRecord(table, request.params.id);
    if (!existing) return response.status(404).json({ error: 'Record not found.' });

    deleteRecord(table, request.params.id);
    addAuditLog({
      userEmail: request.adminUser.userEmail,
      action: config.delete,
      targetTable: table,
      targetId: request.params.id,
      details: collection === 'users' ? { ...existing, passwordPlain: '***' } : existing,
      ipAddress: request.ip,
    });
    response.status(204).end();
  });
}

app.get('/api/admin/audit-logs', requireAuth, (_request, response) => {
  response.json(getRecords('admin_audit_logs'));
});

app.delete('/api/admin/audit-logs', requireAuth, (_request, response) => {
  clearRecords('admin_audit_logs');
  response.status(204).end();
});

app.post('/api/admin/reset', requireAuth, requireSuperAdmin, (request, response) => {
  clearRecords('services');
  clearRecords('service_groups');
  clearRecords('portal_notices');
  clearRecords('service_clicks');
  clearRecords('admin_audit_logs');
  saveSetting('fontSettings', null);
  saveSetting('healthStatuses', {});
  addAuditLog({
    userEmail: request.adminUser.userEmail,
    action: 'PORTAL_RESET',
    targetTable: 'portal_settings',
    targetId: 'factory_reset',
    details: { reset: true },
    ipAddress: request.ip,
  });
  response.json({ ok: true });
});

app.post('/api/clicks', (request, response) => {
  const click = {
    ...request.body,
    id: request.body?.id || `click-${Date.now()}`,
    timestamp: request.body?.timestamp || timestamp(),
    ipAddress: request.ip,
    userAgent: request.get('user-agent') || null,
  };
  const savedClick = saveRecord('service_clicks', click);
  const clicks = getRecords('service_clicks');
  for (const oldClick of clicks.slice(5000)) deleteRecord('service_clicks', oldClick.id);
  response.status(201).json(savedClick);
});

app.get('/api/admin/clicks', requireAuth, (_request, response) => {
  response.json(getRecords('service_clicks'));
});

app.delete('/api/admin/clicks', requireAuth, (_request, response) => {
  clearRecords('service_clicks');
  response.status(204).end();
});

app.put('/api/admin/font-settings', requireAuth, (request, response) => {
  const fontSettings = saveSetting('fontSettings', request.body);
  addAuditLog({
    userEmail: request.adminUser.userEmail,
    action: 'FONT_CONFIG_UPDATE',
    targetTable: 'portal_settings',
    targetId: 'typography',
    details: fontSettings,
    ipAddress: request.ip,
  });
  response.json(fontSettings);
});

app.put('/api/admin/health-statuses', requireAuth, (request, response) => {
  response.json(saveSetting('healthStatuses', request.body || {}));
});

app.use((error, _request, response, _next) => {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return response.status(409).json({ error: 'A record with that email already exists.' });
  }
  console.error('API request failed:', error);
  response.status(500).json({ error: 'The request could not be completed.' });
});

app.listen(port, () => {
  console.log(`CU Services API listening on http://localhost:${port} (SQLite: ${getDatabaseStatus().file})`);
});
