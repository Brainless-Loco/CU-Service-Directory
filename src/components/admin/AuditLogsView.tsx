import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Clock,
  ShieldCheck,
  Database,
  ArrowUpDown,
  Check,
  Copy,
  UserCheck,
  Terminal,
} from 'lucide-react';
import { AdminAuditLog } from '../../types';

interface AuditLogsViewProps {
  logs: AdminAuditLog[];
  onClearLogs?: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tableFilter, setTableFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered & sorted logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          log.userEmail.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.targetTable.toLowerCase().includes(query) ||
          log.targetId.toLowerCase().includes(query) ||
          (log.details && log.details.toLowerCase().includes(query));

        const matchesTable = tableFilter === 'ALL' || log.targetTable === tableFilter;

        return matchesSearch && matchesTable;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, searchQuery, tableFilter, sortOrder]);

  // Distinct tables found in logs
  const tables = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.targetTable) set.add(l.targetTable);
    });
    return Array.from(set);
  }, [logs]);

  const handleCopyLog = (log: AdminAuditLog) => {
    const formatted = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(formatted);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cu_admin_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('PROVISION')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('TOGGLE') || act.includes('UPDATE') || act.includes('EDIT')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Administrative Audit Ledger (admin_audit_logs)
            </h3>
            <span className="px-2 py-0.5 text-2xs font-mono font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              MySQL 8.0+
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Immutable tracking ledger recording administrative CRUD mutations, status toggles, user provisioning, and portal configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
              title="Reset audit logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Log</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-semibold uppercase text-slate-500">Total Audit Entries</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{logs.length}</p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-semibold uppercase text-slate-500">Tracked Tables</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{tables.length}</p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-semibold uppercase text-slate-500">Latest Activity</span>
          <p className="text-xs font-semibold text-emerald-700 mt-2 truncate">
            {logs[0] ? new Date(logs[0].timestamp).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-2xs font-semibold uppercase text-slate-500">Primary Admin</span>
          <p className="text-xs font-mono font-bold text-slate-800 mt-2 truncate">
            {logs[0]?.userEmail || 'tonmoy.ict@cu.ac.bd'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, email, table, or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Table:</span>
          </div>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Tables ({logs.length})</option>
            {tables.map((tbl) => (
              <option key={tbl} value={tbl}>
                {tbl} ({logs.filter((l) => l.targetTable === tbl).length})
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Logs Table Display */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-2xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Administrator</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Table & ID</th>
                  <th className="px-4 py-3">Audit Details</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredLogs.map((log) => {
                  let parsedDetails: any = null;
                  if (log.details) {
                    try {
                      parsedDetails = JSON.parse(log.details);
                    } catch {
                      parsedDetails = log.details;
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-2xs text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Administrator */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-900">{log.userEmail}</span>
                        </div>
                        {log.ipAddress && (
                          <span className="text-3xs font-mono text-slate-400 block mt-0.5">
                            {log.ipAddress}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-2xs font-mono font-bold rounded-md border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Target Table & ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-2xs">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-800">{log.targetTable}</span>
                        </div>
                        <span className="text-3xs font-mono text-slate-400 block truncate max-w-[140px]">
                          ID: {log.targetId}
                        </span>
                      </td>

                      {/* Audit Details */}
                      <td className="px-4 py-3">
                        {parsedDetails && typeof parsedDetails === 'object' ? (
                          <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-2xs font-mono max-w-sm overflow-x-auto text-slate-800 space-y-0.5">
                            {Object.entries(parsedDetails).map(([k, v]) => (
                              <div key={k} className="flex items-center gap-1 truncate">
                                <span className="text-slate-400 font-semibold">{k}:</span>
                                <span className="text-emerald-800 font-bold">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-2xs text-slate-600 font-mono line-clamp-1">
                            {log.details || 'No additional payload metadata'}
                          </span>
                        )}
                      </td>

                      {/* Copy Log */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleCopyLog(log)}
                          className="px-2 py-1 text-2xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="Copy JSON entry"
                        >
                          {copiedId === log.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No audit logs matching query</p>
            <p className="text-xs text-slate-400 mt-1">
              Administrative actions (service edits, notice updates, user creation) are logged here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
