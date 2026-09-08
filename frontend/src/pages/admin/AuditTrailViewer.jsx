import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  Home,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  X,
  Activity,
  Layers,
  FileCode,
  Download
} from 'lucide-react';
import api from '../../services/api';
import { useAlert } from '../../context/AlertContext';

const MODULE_OPTIONS = [
  { value: '', label: 'All Modules' },
  { value: 'pages', label: 'Dynamic Pages' },
  { value: 'carousels', label: 'Sliders & Carousel' },
  { value: 'menus', label: 'Menu Management' },
  { value: 'headers', label: 'Header Settings' },
  { value: 'footers', label: 'Footer Settings' },
  { value: 'users', label: 'User Accounts' },
  { value: 'roles', label: 'Roles & Privileges' },
  { value: 'auth', label: 'Authentication' },
  { value: 'media', label: 'Media Library' },
  { value: 'settings', label: 'System Settings' }
];

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'BULK_DELETE', label: 'BULK DELETE' },
  { value: 'LOGIN', label: 'LOGIN' },
  { value: 'LOGOUT', label: 'LOGOUT' },
  { value: 'APPROVE', label: 'APPROVE' }
];

const AuditTrailViewer = () => {
  const { showSuccess, showError } = useAlert();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, successEvents: 0, failedEvents: 0 });

  // Filter States
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch Statistics
  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    api.get('/audit-trails/stats')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setStats(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load audit statistics:', err);
      })
      .finally(() => setStatsLoading(false));
  }, []);

  // Fetch Audit Logs with full filtering
  const fetchLogs = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (search.trim()) params.append('search', search.trim());
    if (moduleFilter) params.append('module', moduleFilter);
    if (actionFilter) params.append('action', actionFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    api.get(`/audit-trails?${params.toString()}`)
      .then((res) => {
        if (res.data.success) {
          const list = res.data.data || res.data.auditLogs || [];
          setLogs(list);
          setTotalPages(res.data.totalPages || 1);
          setTotalItems(res.data.totalItems || list.length);
          setErrorMsg(null);
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to retrieve audit trail entries.';
        console.error('Failed to load audit logs:', err);
        setErrorMsg(msg);
        showError(msg);
      })
      .finally(() => setLoading(false));
  }, [page, limit, search, moduleFilter, actionFilter, statusFilter, startDate, endDate, showError]);

  // Export Audit Logs as CSV
  const handleExportCSV = () => {
    if (!logs.length) {
      showError('No audit records to export.');
      return;
    }
    const headers = ['ID', 'Action', 'Module', 'User', 'IP Address', 'Status', 'Timestamp'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => {
        const user = log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''} (${log.user.email})` : (log.userName || 'System');
        return [
          log.id,
          `"${log.action || ''}"`,
          `"${log.module || ''}"`,
          `"${user.replace(/"/g, '""')}"`,
          `"${log.ipAddress || ''}"`,
          `"${log.status || ''}"`,
          `"${new Date(log.createdAt).toISOString()}"`
        ].join(',');
      })
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_trail_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Audit trail CSV report downloaded.');
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle filter reset
  const handleResetFilters = () => {
    setSearch('');
    setModuleFilter('');
    setActionFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || moduleFilter || actionFilter || statusFilter || startDate || endDate
  );

  // Copy Payload to Clipboard
  const handleCopyPayload = (payload) => {
    try {
      const text = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload);
      navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess('Forensic payload copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError('Unable to copy to clipboard.');
    }
  };

  // Calculate entry range for display
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  // Generate numbered page buttons (sliding window)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="admin-page-container">
      {/* AdminLTE Content Header */}
      <div className="content-header">
        <h1>
          Audit Trail & Activity Logs{' '}
          <small style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            Tamper-Proof Ledger
          </small>
        </h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Audit Logs</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{ padding: '0 0.5rem 2rem 0.5rem' }}>
        
        {/* Immutability Banner */}
        <div
          className="card"
          style={{
            background: 'rgba(0, 123, 255, 0.05)',
            borderLeft: '4px solid #007bff',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            borderRadius: '6px'
          }}
        >
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <ShieldAlert size={20} color="#007bff" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Cryptographically Protected Immutable Ledger: Every mutation, permission check, and auth event is irreversibly archived.
            </span>
          </div>
        </div>

        {/* ── SUMMARY STATS METRICS GRID ──────────────────────────────────── */}
        <div className="admin-stats-grid" style={{ marginBottom: '1.25rem' }}>
          {/* Card 1: Total Events */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(0, 123, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007bff', flexShrink: 0 }}>
              <Activity size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Total Mutations
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {statsLoading ? '...' : (stats.totalEvents || totalItems).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Card 2: Successful Operations */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(40, 167, 69, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#28a745', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Success Rate
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#28a745' }}>
                {statsLoading ? '...' : (stats.successEvents || 0).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Card 3: Security & Failures */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(220, 53, 69, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc3545', flexShrink: 0 }}>
              <AlertTriangle size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Failed / Blocked
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#dc3545' }}>
                {statsLoading ? '...' : (stats.failedEvents || 0).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Card 4: Filtered Matches */}
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(111, 66, 193, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f42c1', flexShrink: 0 }}>
              <Layers size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Current Query Rows
              </span>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {loading ? '...' : totalItems.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* ── MAIN AUDIT LOG CARD ─────────────────────────────────────────── */}
        <div className="card card-primary card-outline" style={{ overflow: 'hidden' }}>
          
          {/* Card Header */}
          <div className="admin-card-header-responsive">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ClipboardList size={18} color="var(--primary)" />
              <span>Event & Mutation Ledger</span>
            </h3>
            <div className="admin-card-header-tools">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm"
                  title="Reset all filters"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <X size={14} />
                  <span>Clear Filters</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={loading || !logs.length}
                className="btn btn-secondary btn-sm"
                title="Export Ledger as CSV"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  fetchStats();
                  fetchLogs();
                }}
                disabled={loading}
                className="btn btn-primary btn-sm"
                title="Refresh Logs"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* ── MULTI-PARAMETER PROFESSIONAL FILTER BAR ───────────────────── */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-app)'
            }}
          >
            <div className="admin-form-grid-3" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
              
              {/* Search Keywords */}
              <div className="flex items-center gap-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.65rem' }}>
                <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search user, action, ip, module..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X size={14} color="var(--text-muted)" />
                  </button>
                )}
              </div>

              {/* Module Filter */}
              <select
                className="form-select"
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.85rem', height: '36px' }}
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Action Filter */}
              <select
                className="form-select"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.85rem', height: '36px' }}
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Filters: Status, Date From, Date To, Limit */}
            <div className="admin-form-grid-3" style={{ gap: '0.75rem' }}>
              
              {/* Status Filter */}
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{ fontSize: '0.85rem', height: '36px' }}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed / Blocked</option>
              </select>

              {/* Start Date */}
              <div className="flex items-center gap-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.2rem 0.65rem' }}>
                <Calendar size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.8rem' }}
                />
              </div>

              {/* End Date */}
              <div className="flex items-center gap-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.2rem 0.65rem' }}>
                <Calendar size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* ── LOGS TABLE ─────────────────────────────────────────────────── */}
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th style={{ width: '100px' }}>Action</th>
                    <th>Module</th>
                    <th>User / Identity</th>
                    <th>IP Origin</th>
                    <th>Recorded Timestamp</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '80px' }}>Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => {
                      const badgeClass =
                        log.action === 'DELETE' || log.action === 'BULK_DELETE'
                          ? 'badge-danger'
                          : log.action === 'CREATE' || log.action === 'REGISTER' || log.action === 'APPROVE'
                          ? 'badge-success'
                          : log.action === 'UPDATE'
                          ? 'badge-warning'
                          : 'badge-info';

                      const moduleName = log.module || log.moduleCode || 'system';
                      const userDisplay = log.user
                        ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email
                        : log.userName || 'System Engine';

                      const userSub = log.user ? log.user.email : '';

                      return (
                        <tr key={log.id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{log.id}</td>
                          <td>
                            <span className={`badge ${badgeClass}`}>{log.action}</span>
                          </td>
                          <td>
                            <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>
                              {moduleName}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{userDisplay}</div>
                            {userSub && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{userSub}</div>
                            )}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                            {log.ipAddress || '127.0.0.1'}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`badge ${log.status === 'failed' ? 'badge-danger' : 'badge-success'}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              {log.status === 'failed' ? (
                                <>
                                  <AlertTriangle size={10} />
                                  <span>Failed</span>
                                </>
                              ) : (
                                <>
                                  <Check size={10} />
                                  <span>Success</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="btn btn-secondary btn-sm"
                              title="Inspect Forensic Payload"
                              style={{ padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Eye size={13} />
                              <span style={{ fontSize: '0.75rem' }}>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                        {loading ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={18} className="animate-spin" />
                            <span>Querying system ledger...</span>
                          </div>
                        ) : errorMsg ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <AlertTriangle size={22} />
                            </div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>{errorMsg}</p>
                            <button
                              type="button"
                              onClick={() => {
                                fetchStats();
                                fetchLogs();
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}
                            >
                              <RefreshCw size={14} />
                              <span>Retry Retrieval</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>No audit trail records matched the criteria.</p>
                            {hasActiveFilters && (
                              <button type="button" onClick={handleResetFilters} className="btn btn-primary btn-xs">
                                Reset Filters
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── CARD FOOTER WITH RESPONSIVE PAGINATION ─────────────────────── */}
          <div
            className="card-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '0.85rem 1.25rem'
            }}
          >
            {/* Counter and Limit Picker */}
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div>
                Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
              </div>
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.15rem 0.5rem', minHeight: '30px', fontSize: '0.8rem' }}
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>rows</span>
              </div>
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="table-action-btn-group" style={{ flexWrap: 'wrap' }}>
                {/* First Page */}
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                  className="btn btn-secondary btn-sm"
                  title="First Page"
                  style={{ padding: '0.25rem 0.45rem' }}
                >
                  <ChevronsLeft size={14} />
                </button>

                {/* Previous Page */}
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-secondary btn-sm"
                  title="Previous Page"
                  style={{ padding: '0.25rem 0.45rem' }}
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Numbered Page Buttons */}
                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      minWidth: '32px',
                      padding: '0.25rem 0.5rem',
                      fontWeight: p === page ? 700 : 500
                    }}
                  >
                    {p}
                  </button>
                ))}

                {/* Next Page */}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-secondary btn-sm"
                  title="Next Page"
                  style={{ padding: '0.25rem 0.45rem' }}
                >
                  <ChevronRight size={14} />
                </button>

                {/* Last Page */}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="btn btn-secondary btn-sm"
                  title="Last Page"
                  style={{ padding: '0.25rem 0.45rem' }}
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FORENSIC PAYLOAD INSPECTOR MODAL ──────────────────────────────── */}
      {selectedLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '0.5rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', background: 'var(--bg-surface)' }}>
            
            {/* Modal Header */}
            <div className="admin-card-header-responsive" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <FileCode size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Audit Record #{selectedLog.id} Payload
                </h3>
              </div>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={12} />
                <span>Verified Immutable</span>
              </span>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              
              {/* Record Metadata Grid */}
              <div className="admin-form-grid-2" style={{ gap: '0.75rem', marginBottom: '1rem', background: 'var(--bg-app)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Action Type:</span>
                  <strong>{selectedLog.action}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Target Module:</span>
                  <code style={{ fontSize: '0.82rem' }}>{selectedLog.module || selectedLog.moduleCode || 'system'}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Author / Account:</span>
                  <strong>
                    {selectedLog.user ? `${selectedLog.user.firstName || ''} ${selectedLog.user.lastName || ''} (${selectedLog.user.email})` : selectedLog.userName || 'System Engine'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>IP & Origin:</span>
                  <code>{selectedLog.ipAddress || '127.0.0.1'}</code>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Exact Timestamp:</span>
                  <span>{new Date(selectedLog.createdAt).toUTCString()} ({new Date(selectedLog.createdAt).toLocaleString()})</span>
                </div>
                {selectedLog.userAgent && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>User Agent:</span>
                    <span style={{ wordBreak: 'break-all', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {selectedLog.userAgent}
                    </span>
                  </div>
                )}
              </div>

              {/* Payload Code Block */}
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>
                  Payload Data & Parameters:
                </h4>
                <button
                  type="button"
                  onClick={() => handleCopyPayload(selectedLog.details || {})}
                  className="btn btn-secondary btn-xs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {copied ? <Check size={12} color="#28a745" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre
                style={{
                  background: '#0e1726',
                  color: '#e2e8f0',
                  padding: '1rem',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  fontSize: '0.82rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  border: '1px solid var(--border)',
                  maxHeight: '260px'
                }}
              >
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailViewer;
