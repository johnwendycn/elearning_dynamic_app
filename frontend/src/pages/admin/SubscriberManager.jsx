import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Filter,
  Users, UserCheck, UserX, Download, ToggleLeft, ToggleRight,
  Send, Megaphone, CheckCircle2, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import api from '../../services/api';

const SubscriberManager = () => {
  const { hasPermission } = useAuth();

  // ── List state ──────────────────────────────────────────────────────────────
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });

  // ── Modal state: Add / Edit Subscriber ──────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    email: '', name: '', status: 'active', source: 'website'
  });

  // ── Modal state: Broadcast Push Announcement ────────────────────────────────
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    title: '',
    type: 'news',
    content: '',
    recipientType: 'all' // 'all' or 'selected'
  });

  const canCreate = hasPermission('subscribers', 'create');
  const canUpdate = hasPermission('subscribers', 'update');
  const canDelete = hasPermission('subscribers', 'delete');

  const fmtDate = (str) => {
    try { return str ? new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }
    catch { return '—'; }
  };

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchSubscribers = useCallback(() => {
    setLoading(true);
    let url = `/subscribers?page=${page}&limit=20&search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setSubscribers(res.data.subscribers || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  const fetchStats = useCallback(() => {
    api.get('/subscribers/stats')
      .then(res => { if (res.data.success) setStats(res.data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Add/Edit Handlers ───────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setFormData({ email: '', name: '', status: 'active', source: 'website' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({ email: item.email, name: item.name || '', status: item.status, source: item.source || 'website' });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return setFormError('Email is required.');
    setSaving(true); setFormError('');
    try {
      if (editing) {
        await api.put(`/subscribers/${editing.id}`, formData);
      } else {
        await api.post('/subscribers/subscribe', formData);
      }
      setModalOpen(false);
      fetchSubscribers();
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  // ── Broadcast Push Handlers ─────────────────────────────────────────────────
  const openBroadcast = (mode = 'all') => {
    setBroadcastData({
      subject: '',
      title: '',
      type: 'news',
      content: '',
      recipientType: mode === 'selected' && selectedIds.length > 0 ? 'selected' : 'all'
    });
    setBroadcastError('');
    setBroadcastSuccess(null);
    setBroadcastOpen(true);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.subject.trim()) return setBroadcastError('Subject line is required.');
    if (!broadcastData.content.trim()) return setBroadcastError('Message content is required.');

    if (broadcastData.recipientType === 'selected' && selectedIds.length === 0) {
      return setBroadcastError('Please select at least one subscriber or choose "All Active Subscribers".');
    }

    setBroadcastSending(true);
    setBroadcastError('');
    setBroadcastSuccess(null);

    try {
      const payload = {
        subject: broadcastData.subject.trim(),
        title: broadcastData.title.trim() || broadcastData.subject.trim(),
        type: broadcastData.type,
        content: broadcastData.content.trim(),
        recipientType: broadcastData.recipientType,
        subscriberIds: broadcastData.recipientType === 'selected' ? selectedIds : []
      };

      const res = await api.post('/subscribers/broadcast', payload);
      if (res.data?.success) {
        setBroadcastSuccess(res.data);
      } else {
        setBroadcastError(res.data?.error || 'Failed to dispatch broadcast.');
      }
    } catch (err) {
      setBroadcastError(err.response?.data?.error || 'Failed to dispatch broadcast email.');
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return;
    try {
      await api.delete(`/subscribers/${id}`);
      fetchSubscribers();
      fetchStats();
    } catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} subscriber(s)?`)) return;
    try {
      await api.post('/subscribers/bulk-delete', { ids: selectedIds });
      setSelectedIds([]);
      fetchSubscribers();
      fetchStats();
    } catch { alert('Bulk delete failed'); }
  };

  const quickToggleStatus = async (item) => {
    const next = item.status === 'active' ? 'unsubscribed' : 'active';
    try {
      await api.put(`/subscribers/${item.id}`, {
        ...item,
        status: next,
        unsubscribedAt: next === 'unsubscribed' ? new Date().toISOString() : null
      });
      fetchSubscribers();
      fetchStats();
    } catch { alert('Status update failed'); }
  };

  // Export to CSV
  const exportCSV = () => {
    const rows = [['ID', 'Email', 'Name', 'Status', 'Source', 'Subscribed At']];
    subscribers.forEach(s => rows.push([s.id, s.email, s.name || '', s.status, s.source || '', fmtDate(s.subscribedAt)]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === subscribers.length ? [] : subscribers.map(s => s.id));

  const statusBadge = (s) => s === 'active' ? 'badge-success' : 'badge-secondary';

  return (
    <div>
      {/* Page Header */}
      <div className="content-header">
        <h1>Subscribers <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Newsletter & Mailing List</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Subscribers</span>
        </div>
      </div>

      <div className="main-content">
        {/* ── Stats Cards ──────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stats.total}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Total Subscribers</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: 'var(--success)' }}>{stats.active}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Active Recipients</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-muted)' }}>{stats.unsubscribed}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Unsubscribed</div>
            </div>
          </div>
        </div>

        {/* ── Broadcast Push Quick Callout ─────────────────────────────────── */}
        <div 
          className="card" 
          style={{
            background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Megaphone size={24} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px 0', color: '#fff' }}>
                Instant Newsletter &amp; Announcement Broadcast
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                Push curated news, upcoming events, academic releases, and alerts to all <strong>{stats.active}</strong> active subscribers in one click.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => openBroadcast('all')}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                boxShadow: '0 4px 14px rgba(0,123,255,0.4)'
              }}
            >
              <Send size={15} />
              <span>Broadcast to All ({stats.active})</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => openBroadcast('selected')}
                className="btn btn-secondary"
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#ffffff',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
              >
                <Mail size={14} />
                <span>Send to Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Main Table Card ───────────────────────────────────────────────── */}
        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={17} /> All Subscribers ({totalItems})
            </h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              {/* Status filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ minHeight: '34px', width: 160 }} value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </div>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search email / name..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '210px' }} />
              </div>
              {/* Bulk delete */}
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete ({selectedIds.length})</span>
                </button>
              )}
              {/* Export */}
              <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <Download size={14} /><span>Export CSV</span>
              </button>
              {/* Refresh */}
              <button onClick={() => { fetchSubscribers(); fetchStats(); }} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {/* Add */}
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Subscriber</span>
                </button>
              )}
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input type="checkbox"
                        checked={subscribers.length > 0 && selectedIds.length === subscribers.length}
                        onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Email</th>
                    <th style={{ width: '160px' }}>Name</th>
                    <th style={{ width: '100px' }}>Source</th>
                    <th style={{ width: '180px' }}>Subscribed At</th>
                    <th style={{ width: '120px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading subscribers...' : 'No subscribers found.'}
                      </td>
                    </tr>
                  ) : subscribers.map(item => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{item.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                          }}>
                            {item.email[0].toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{item.email}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.name || '—'}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{item.source || 'website'}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{fmtDate(item.subscribedAt)}</td>
                      <td>
                        <button onClick={() => quickToggleStatus(item)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}
                          title="Click to toggle status">
                          {item.status === 'active'
                            ? <ToggleRight size={18} color="var(--success)" />
                            : <ToggleLeft size={18} color="var(--secondary)" />}
                          <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <button onClick={() => openEdit(item)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> &nbsp;|&nbsp; Total <strong>{totalItems}</strong> subscribers
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                    className="btn btn-secondary btn-sm" style={{ opacity: page === 1 ? 0.5 : 1 }}>
                    <ChevronLeft size={14} /><span>Prev</span>
                  </button>
                  <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                    className="btn btn-secondary btn-sm" style={{ opacity: page === totalPages ? 0.5 : 1 }}>
                    <span>Next</span><ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Broadcast Push Announcement Modal ───────────────────────────────── */}
      {broadcastOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem', borderRadius: '18px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Megaphone size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Push Broadcast Announcement
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Send rich newsletter updates directly to subscribers' mailboxes
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastOpen(false)}
                style={{ border: 'none', background: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {broadcastSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Broadcast Dispatched Successfully!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {broadcastSuccess.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', background: 'var(--bg-app)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{broadcastSuccess.totalTargeted}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Targeted</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{broadcastSuccess.sentCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivered</div>
                  </div>
                  {broadcastSuccess.failedCount > 0 && (
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>{broadcastSuccess.failedCount}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed</div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setBroadcastOpen(false); setBroadcastSuccess(null); }}
                  className="btn btn-primary w-full"
                  style={{ padding: '0.75rem', fontWeight: 700, borderRadius: '10px' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="flex flex-col gap-3">
                {broadcastError && (
                  <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.88rem' }}>
                    <AlertCircle size={16} />
                    <span>{broadcastError}</span>
                  </div>
                )}

                {/* Recipient Audience Target */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Recipient Target Audience *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <label 
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: broadcastData.recipientType === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: broadcastData.recipientType === 'all' ? 'rgba(0,123,255,0.06)' : 'var(--bg-app)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <input
                        type="radio"
                        name="recipientType"
                        value="all"
                        checked={broadcastData.recipientType === 'all'}
                        onChange={() => setBroadcastData(p => ({ ...p, recipientType: 'all' }))}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>All Active ({stats.active})</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Broadcast to entire list</div>
                      </div>
                    </label>

                    <label 
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: broadcastData.recipientType === 'selected' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: broadcastData.recipientType === 'selected' ? 'rgba(0,123,255,0.06)' : 'var(--bg-app)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                      }}
                    >
                      <input
                        type="radio"
                        name="recipientType"
                        value="selected"
                        checked={broadcastData.recipientType === 'selected'}
                        onChange={() => setBroadcastData(p => ({ ...p, recipientType: 'selected' }))}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Selected Rows ({selectedIds.length})</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Only checked subscribers</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Broadcast Category & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Category / Header Badge *
                    </label>
                    <select
                      className="form-select"
                      value={broadcastData.type}
                      onChange={e => setBroadcastData(p => ({ ...p, type: e.target.value }))}
                    >
                      <option value="news">📰 Tech News &amp; Insights</option>
                      <option value="event">📅 Upcoming Event / Workshop</option>
                      <option value="course">🎓 Course / Academic Update</option>
                      <option value="announcement">📢 Official Announcement</option>
                      <option value="custom">✨ Community Update</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Announcement Title (optional)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. New AI Bootcamp Cohort"
                      value={broadcastData.title}
                      onChange={e => setBroadcastData(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Subject Line */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Email Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 🚀 Exciting Update: Applications Now Open for Summer 2026!"
                    value={broadcastData.subject}
                    onChange={e => setBroadcastData(p => ({ ...p, subject: e.target.value }))}
                  />
                </div>

                {/* Message Content */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Message Body Content * (paragraphs separated by blank lines)
                  </label>
                  <textarea
                    required
                    rows={6}
                    className="form-input"
                    placeholder="Type the message you want to push to all subscribers here...&#10;&#10;We are thrilled to announce that registration for our next Artificial Intelligence and Full-Stack Engineering bootcamp is now officially open!&#10;&#10;Early bird discounts apply until the end of the month."
                    value={broadcastData.content}
                    onChange={e => setBroadcastData(p => ({ ...p, content: e.target.value }))}
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span>Each email automatically includes JONIKWIRIA brand styling and a 1-click unsubscribe footer for full compliance.</span>
                </div>

                <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setBroadcastOpen(false)}
                    className="btn btn-secondary btn-sm"
                    disabled={broadcastSending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={broadcastSending || !broadcastData.subject.trim() || !broadcastData.content.trim()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                  >
                    {broadcastSending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Dispatch Push Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────────────────── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={20} />
              {editing ? `Edit: ${editing.email}` : 'Add Subscriber'}
            </h2>
            {formError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input type="email" required className="form-input" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="user@example.com"
                  disabled={!!editing} />
                {editing && <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Email cannot be changed after subscription.</small>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name (optional)</label>
                <input type="text" className="form-input" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Subscriber's name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Source</label>
                  <input type="text" className="form-input" value={formData.source}
                    onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                    placeholder="e.g. website, import" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Subscriber' : 'Add Subscriber')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriberManager;
