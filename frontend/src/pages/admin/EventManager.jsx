import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Filter, MapPin,
  Users, Mail, X, Send, CheckCircle2, AlertCircle, Download, Ticket, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import MediaImageUploader, { getFullMediaUrl } from '../../components/admin/MediaImageUploader';

const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed', 'cancelled'];
const STATUS_BADGE = { upcoming: 'badge-primary', ongoing: 'badge-success', completed: 'badge-secondary', cancelled: 'badge-danger' };

const EventManager = () => {
  const { hasPermission } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', imageUrl: '', location: '',
    startDate: '', endDate: '', category: '', status: 'upcoming'
  });

  const canCreate = hasPermission('events', 'create');
  const canUpdate = hasPermission('events', 'update');
  const canDelete = hasPermission('events', 'delete');

  // ── Registrations Modal State ──────────────────────────────────────
  const [regModal, setRegModal] = useState(null); // event object
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [emailModal, setEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailAlert, setEmailAlert] = useState({ type: '', msg: '' });

  const loadRegistrations = useCallback(async (eventId) => {
    setRegLoading(true);
    try {
      const res = await api.get(`/event-registrations/event/${eventId}?limit=200`);
      if (res.data.success) setRegistrations(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setRegLoading(false); }
  }, []);

  const openRegModal = (ev) => {
    setRegModal(ev);
    setRegistrations([]);
    setRegSearch('');
    loadRegistrations(ev.id);
  };

  const sendBulkEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailAlert({ type: 'error', msg: 'Subject and body are required.' }); return;
    }
    setEmailSending(true); setEmailAlert({ type: '', msg: '' });
    try {
      const res = await api.post(`/event-registrations/event/${regModal.id}/send-email`, { subject: emailSubject, body: emailBody });
      setEmailAlert({ type: 'success', msg: `Email sent to ${res.data.data?.sent || 0} registrants!` });
      setTimeout(() => { setEmailModal(false); setEmailSubject(''); setEmailBody(''); setEmailAlert({ type: '', msg: '' }); }, 2000);
    } catch (err) {
      setEmailAlert({ type: 'error', msg: err?.response?.data?.error || 'Failed to send email.' });
    } finally { setEmailSending(false); }
  };

  const deleteRegistration = async (id) => {
    if (!window.confirm('Remove this registration?')) return;
    try {
      await api.delete(`/event-registrations/${id}`);
      setRegistrations(r => r.filter(x => x.id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const toggleStatus = async (reg) => {
    const newStatus = reg.status === 'confirmed' ? 'cancelled' : 'confirmed';
    try {
      await api.put(`/event-registrations/${reg.id}/status`, { status: newStatus });
      setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert('Failed to update registration status');
    }
  };

  const exportCSV = () => {
    if (!registrations || registrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Organization', 'Ticket Type', 'Status', 'Registered Date'];
    const rows = registrations.map(r => [
      r.id,
      `"${(r.firstName || '').replace(/"/g, '""')}"`,
      `"${(r.lastName || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.organization || '').replace(/"/g, '""')}"`,
      `"${r.ticketType || 'free'}"`,
      `"${r.status || 'confirmed'}"`,
      `"${new Date(r.createdAt).toLocaleString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${regModal?.slug || 'event'}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const toInputDate = (str) => { try { return str ? new Date(str).toISOString().slice(0, 16) : ''; } catch { return ''; } };
  const fmtDate = (str) => { try { return str ? new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; } catch { return '—'; } };

  const fetchEvents = () => {
    setLoading(true);
    let url = `/events?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setEvents(res.data.events || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, [page, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', slug: '', description: '', imageUrl: '', location: '', startDate: '', endDate: '', category: '', status: 'upcoming' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (ev) => {
    setEditing(ev);
    setFormData({
      title: ev.title, slug: ev.slug, description: ev.description || '',
      imageUrl: ev.imageUrl || '', location: ev.location || '',
      startDate: toInputDate(ev.startDate), endDate: toInputDate(ev.endDate),
      category: ev.category || '',
      status: ev.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setFormError('Title is required.');
    if (!formData.slug.trim()) return setFormError('Slug is required.');
    setSaving(true); setFormError('');
    const payload = { ...formData, startDate: formData.startDate || null, endDate: formData.endDate || null };
    try {
      if (editing) { await api.put(`/events/${editing.id}`, payload); }
      else { await api.post('/events', payload); }
      setModalOpen(false); fetchEvents();
    } catch (err) { setFormError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await api.delete(`/events/${id}`); fetchEvents(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} event(s)?`)) return;
    try { await api.post('/events/bulk-delete', { ids: selectedIds }); setSelectedIds([]); fetchEvents(); }
    catch (err) { alert('Failed'); }
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === events.length ? [] : events.map(e => e.id));

  return (
    <div>
      <div className="content-header">
        <h1>Events <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Workshops, Seminars & Programmes</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Events</span>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} /><span>Event Management Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>Create and manage events, workshops, seminars, and academic programmes displayed on the public site.</p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Status:</strong> Set to <em>Upcoming</em>, <em>Ongoing</em>, <em>Completed</em>, or <em>Cancelled</em> to control visibility.</li>
              <li><strong>Registration URL:</strong> Link to an external form (e.g. Google Forms) for attendee registration.</li>
              <li><strong>Location:</strong> Can be a physical address or "Online (Zoom)" for virtual events.</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}>All Events</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ minHeight: '34px', width: 150 }} value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search events..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }} />
              </div>
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete ({selectedIds.length})</span>
                </button>
              )}
              <button onClick={fetchEvents} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Event</span>
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
                      <input type="checkbox" checked={events.length > 0 && selectedIds.length === events.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Event</th>
                    <th style={{ width: '150px' }}>Location</th>
                    <th style={{ width: '120px' }}>Start Date</th>
                    <th style={{ width: '120px' }}>End Date</th>
                    <th style={{ width: '110px' }}>Category</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading events...' : 'No events found. Click "Add Event" to create one.'}
                      </td>
                    </tr>
                  ) : events.map(ev => (
                    <tr key={ev.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(ev.id)} onChange={() => handleSelectRow(ev.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{ev.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {ev.imageUrl ? (
                            <img src={getFullMediaUrl(ev.imageUrl)} alt="" style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div style={{ width: 52, height: 36, background: 'var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <CalendarDays size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{ev.title}</div>
                            <a href={`/events/${ev.slug}/register`} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3, textDecoration: 'none' }} title="Preview In-App Registration Page">
                              <ExternalLink size={10} /> Public Registration Page
                            </a>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {ev.location ? (
                          <div className="flex items-center gap-1"><MapPin size={11} />{ev.location.substring(0, 30)}{ev.location.length > 30 ? '…' : ''}</div>
                        ) : '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fmtDate(ev.startDate)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fmtDate(ev.endDate)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ev.category || '—'}</td>
                      <td><span className={`badge ${STATUS_BADGE[ev.status] || 'badge-secondary'}`}>{ev.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openRegModal(ev)}
                            className="btn btn-sm"
                            style={{
                              padding: '0.25rem 0.6rem',
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title="Manage Registrants & Broadcast Email"
                          >
                            <Users size={12} />
                            <span>{ev.registrations?.length ?? 0} Registrants</span>
                          </button>
                          {canUpdate && <button onClick={() => openEdit(ev)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Edit2 size={13} /></button>}
                          {canDelete && <button onClick={() => handleDelete(ev.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Trash2 size={13} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> events)
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="btn btn-secondary btn-sm" style={{ opacity: page === 1 ? 0.5 : 1 }}>
                    <ChevronLeft size={14} /><span>Prev</span>
                  </button>
                  <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="btn btn-secondary btn-sm" style={{ opacity: page === totalPages ? 0.5 : 1 }}>
                    <span>Next</span><ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create / Edit Event Modal ─────────────────────────────────── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{editing ? 'Edit Event' : 'Add New Event'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Event Title *</label>
                <input type="text" className="form-input" value={formData.title}
                  onChange={e => {
                    const title = e.target.value;
                    setFormData(p => ({ ...p, title, slug: editing ? p.slug : slugify(title) }));
                  }} required placeholder="e.g. Annual Tech Summit 2026" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">URL Slug *</label>
                <input type="text" className="form-input" value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: slugify(e.target.value) }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description / Agenda</label>
                <textarea rows={4} className="form-input" value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} placeholder="Full event description, schedule, speaker details..." />
              </div>
              <MediaImageUploader
                label="Event Banner / Cover Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                module="events"
                helpText="Drag & drop or choose event banner image from Media Library."
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Date &amp; Time</label>
                  <input type="datetime-local" className="form-input" value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">End Date &amp; Time</label>
                  <input type="datetime-local" className="form-input" value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Venue / Mode</label>
                <input type="text" className="form-input" value={formData.location}
                  onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Main Auditorium, Block A or Online (Zoom)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Workshop, Seminar" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* In-App Registration Notice */}
              <div style={{ padding: '0.85rem 1rem', borderRadius: 10, background: 'rgba(0,123,255,0.06)', border: '1px solid rgba(0,123,255,0.2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <Ticket size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--primary)' }}>In-App Registration Active</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Attendees register directly via your internal website at <code>/events/{formData.slug || '[slug]'}/register</code>. No external links or Google Forms are used.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Registrations Modal ──────────────────────────────────────── */}
      {regModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 780, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={19} color="#10b981" /> Registrants — {regModal.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  Total: <strong>{registrations.length}</strong> attendees registered in-app
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`/events/${regModal.slug}/register`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', textDecoration: 'none' }}
                  title="Open live public registration form"
                >
                  <ExternalLink size={13} /> View Form ↗
                </a>
                <button
                  onClick={exportCSV}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}
                  title="Download attendee roster as CSV"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button
                  onClick={() => setEmailModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700 }}
                  title="Send announcement, reminder, or broadcast email to all attendees"
                >
                  <Mail size={13} /> Email Attendees
                </button>
                <button
                  onClick={() => setRegModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8 }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div style={{ padding: '0.65rem 1.5rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ticket Breakdown:</span>
              <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}>
                Free: {registrations.filter(r => r.ticketType === 'free').length}
              </span>
              <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 700 }}>
                Standard: {registrations.filter(r => r.ticketType === 'standard').length}
              </span>
              <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }}>
                VIP: {registrations.filter(r => r.ticketType === 'vip').length}
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                Confirmed: <strong>{registrations.filter(r => r.status === 'confirmed').length}</strong>
              </span>
            </div>

            {/* Search */}
            <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  placeholder="Search attendees by name, email, organization..."
                  value={regSearch}
                  onChange={e => setRegSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 36px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {regLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
                  Loading registrants...
                </div>
              ) : registrations.length === 0 ? (
                <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={44} style={{ opacity: 0.25, marginBottom: 12 }} />
                  <h4 style={{ fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main)' }}>No Registrations Yet</h4>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 1rem 0' }}>When visitors register via the internal event page, their entries will appear here.</p>
                  <a href={`/events/${regModal.slug}/register`} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                    <Ticket size={14} /> Test Registration Form
                  </a>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
                      {['Attendee', 'Contact', 'Organization', 'Ticket', 'Status', 'Registered', ''].map(h => (
                        <th key={h} style={{ padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations
                      .filter(r => !regSearch || `${r.firstName} ${r.lastName} ${r.email} ${r.organization || ''}`.toLowerCase().includes(regSearch.toLowerCase()))
                      .map(reg => (
                        <tr key={reg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{reg.firstName} {reg.lastName}</div>
                            {reg.notes && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>
                                Note: {reg.notes.substring(0, 45)}{reg.notes.length > 45 ? '…' : ''}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem' }}>
                            <div><a href={`mailto:${reg.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{reg.email}</a></div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 1 }}>{reg.phone || '—'}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{reg.organization || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700, background: reg.ticketType === 'vip' ? 'rgba(245,158,11,0.1)' : reg.ticketType === 'standard' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', color: reg.ticketType === 'vip' ? '#f59e0b' : reg.ticketType === 'standard' ? '#6366f1' : '#10b981', textTransform: 'capitalize' }}>
                              {reg.ticketType || 'Free'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <button
                              onClick={() => toggleStatus(reg)}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: reg.status === 'confirmed' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                color: reg.status === 'confirmed' ? '#10b981' : '#ef4444'
                              }}
                              title="Click to toggle Confirmed / Cancelled"
                            >
                              ● {reg.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                            </button>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => deleteRegistration(reg.id)}
                              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                              title="Delete registration"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Email Compose Modal ──────────────────────────────────── */}
      {emailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={18} color="var(--primary)" />Compose Bulk Email
              </div>
              <button onClick={() => setEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                This email will be sent to all <strong>{registrations.filter(r => r.status === 'confirmed').length}</strong> confirmed registrants of <strong>{regModal?.title}</strong>.
              </p>

              {emailAlert.msg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', background: emailAlert.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${emailAlert.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: emailAlert.type === 'success' ? '#10b981' : '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
                  {emailAlert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {emailAlert.msg}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Subject *</label>
                <input
                  type="text" placeholder="Email subject..."
                  value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Message Body *</label>
                <textarea
                  rows={8} placeholder="Write your email message here..."
                  value={emailBody} onChange={e => setEmailBody(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setEmailModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>Cancel</button>
                <button onClick={sendBulkEmail} disabled={emailSending} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.5rem', borderRadius: 10, fontWeight: 700 }}>
                  <Send size={15} />{emailSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
