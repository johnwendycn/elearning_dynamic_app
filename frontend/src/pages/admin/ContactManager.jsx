import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Mail, Phone, Eye, Trash2, Send, CheckCircle2,
  AlertCircle, Search, RefreshCw, ChevronDown, X, Clock, Reply,
  Inbox, Filter
} from 'lucide-react';
import api from '../../services/api';

/* ── Status badge ─────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = {
    new: { label: 'New', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
    read: { label: 'Read', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
    replied: { label: 'Replied', bg: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'rgba(16,185,129,0.25)' }
  };
  const s = cfg[status] || cfg.new;
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

/* ── View/Reply Modal ──────────────────────────────────────────────── */
const MessageModal = ({ contact, onClose, onReplied }) => {
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ type: '', msg: '' });

  if (!contact) return null;

  const sendReply = async () => {
    if (!reply.trim()) { setAlert({ type: 'error', msg: 'Please enter a reply message.' }); return; }
    setSending(true);
    setAlert({ type: '', msg: '' });
    try {
      await api.post(`/contact/${contact.id}/reply`, { replyMessage: reply });
      setAlert({ type: 'success', msg: 'Reply sent successfully via email!' });
      onReplied(contact.id);
      setTimeout(onClose, 1500);
    } catch (err) {
      setAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to send reply.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Modal Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={20} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{contact.subject}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>from {contact.name} &lt;{contact.email}&gt;</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8 }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Contact Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: 12 }}>
            {[
              { icon: Mail, label: 'Email', val: contact.email },
              { icon: Phone, label: 'Phone', val: contact.phone || '—' },
              { icon: Clock, label: 'Received', val: new Date(contact.createdAt).toLocaleString() },
              { icon: CheckCircle2, label: 'Status', val: <StatusBadge status={contact.status} /> }
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Original message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Message</div>
            <div style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border)', lineHeight: 1.7, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {contact.message}
            </div>
          </div>

          {/* Previous reply */}
          {contact.replyMessage && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Reply size={13} />Your Previous Reply
              </div>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{contact.replyMessage}</div>
            </div>
          )}

          {/* Alert */}
          {alert.msg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', background: alert.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${alert.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: alert.type === 'success' ? '#10b981' : '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
              {alert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {alert.msg}
            </div>
          )}

          {/* Reply input */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              {contact.replyMessage ? 'Send Another Reply' : 'Reply to this message'}
            </div>
            <textarea
              rows={5}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={`Reply to ${contact.name}...`}
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.5rem', borderRadius: 10, fontWeight: 700, opacity: !reply.trim() ? 0.6 : 1 }}>
            <Send size={15} />{sending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════ */
const ContactManager = () => {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState([]);
  const [viewMessage, setViewMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/contact?${params}`);
      if (res.data.success) {
        setMessages(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/contact/${id}`);
      setMessages(m => m.filter(x => x.id !== id));
      setTotal(t => t - 1);
    } catch (err) {
      alert(err?.response?.data?.error || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReplied = (id) => {
    setMessages(m => m.map(x => x.id === id ? { ...x, status: 'replied' } : x));
  };

  const newCount = messages.filter(m => m.status === 'new').length;

  return (
    <div>
      <MessageModal contact={viewMessage} onClose={() => setViewMessage(null)} onReplied={handleReplied} />

      {/* Content Header */}
      <div className="content-header">
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          Contact Messages
          {newCount > 0 && <span style={{ padding: '2px 10px', borderRadius: 20, background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>{newCount} new</span>}
        </h1>
        <ol className="breadcrumb">
          <li><a href="/admin">Dashboard</a></li>
          <li className="active">Contact Messages</li>
        </ol>
      </div>

      <div className="main-content">
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Messages', value: total, color: '#007bff', icon: Inbox },
            { label: 'New / Unread', value: messages.filter(m => m.status === 'new').length, color: '#3b82f6', icon: MessageSquare },
            { label: 'Replied', value: messages.filter(m => m.status === 'replied').length, color: '#10b981', icon: Reply }
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card" style={{ padding: '1.25rem', borderRadius: 14, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: 14, border: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Search by name, email, subject..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 36px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--text-muted)" />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}>
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
          <button onClick={load} style={{ padding: '0.6rem 0.85rem', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <RefreshCw size={14} />Refresh
          </button>
        </div>

        {/* Table */}
        <div className="card" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No messages found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                    {['Sender', 'Subject', 'Phone', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg, idx) => (
                    <tr key={msg.id} style={{ borderBottom: '1px solid var(--border)', background: msg.status === 'new' ? 'rgba(59,130,246,0.03)' : 'transparent' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: msg.status === 'new' ? 800 : 600, fontSize: '0.88rem' }}>{msg.name}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{msg.email}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', maxWidth: 240 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message?.slice(0, 60)}...</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{msg.phone || '—'}</td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(msg.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={msg.status} /></td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setViewMessage(msg)} title="View & Reply" style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600 }}>
                            <Reply size={13} />Reply
                          </button>
                          <button onClick={() => handleDelete(msg.id)} disabled={deletingId === msg.id} title="Delete" style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages} &bull; {total} total</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontSize: '0.85rem', fontWeight: 600 }}>Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontSize: '0.85rem', fontWeight: 600 }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
