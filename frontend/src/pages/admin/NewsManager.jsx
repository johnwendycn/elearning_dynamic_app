


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Newspaper, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Tag, Filter
} from 'lucide-react';
import api from '../../services/api';
import MediaImageUploader, { getFullMediaUrl } from '../../components/admin/MediaImageUploader';

const NewsManager = () => {
  const { hasPermission } = useAuth();

  const [news, setNews] = useState([]);
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
    title: '', slug: '', excerpt: '', content: '', imageUrl: '',
    author: '', category: '', tags: '', publishedAt: '', status: 'draft'
  });

  const canCreate = hasPermission('news', 'create');
  const canUpdate = hasPermission('news', 'update');
  const canDelete = hasPermission('news', 'delete');

  const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const toInputDate = (str) => { try { return str ? new Date(str).toISOString().slice(0, 16) : ''; } catch { return ''; } };
  const fmtDate = (str) => { try { return str ? new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; } catch { return '—'; } };

  const fetchNews = () => {
    setLoading(true);
    let url = `/news?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setNews(res.data.news || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNews(); }, [page, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', slug: '', excerpt: '', content: '', imageUrl: '', author: '', category: '', tags: '', publishedAt: '', status: 'draft' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      title: item.title, slug: item.slug, excerpt: item.excerpt || '',
      content: item.content || '', imageUrl: item.imageUrl || '',
      author: item.author || '', category: item.category || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      publishedAt: toInputDate(item.publishedAt),
      status: item.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setFormError('Title is required.');
    if (!formData.slug.trim()) return setFormError('Slug is required.');
    setSaving(true); setFormError('');
    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      publishedAt: formData.publishedAt || null
    };
    try {
      if (editing) { await api.put(`/news/${editing.id}`, payload); }
      else { await api.post('/news', payload); }
      setModalOpen(false); fetchNews();
    } catch (err) { setFormError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news article?')) return;
    try { await api.delete(`/news/${id}`); fetchNews(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} news article(s)?`)) return;
    try { await api.post('/news/bulk-delete', { ids: selectedIds }); setSelectedIds([]); fetchNews(); }
    catch (err) { alert('Failed'); }
  };

  const quickToggleStatus = async (item) => {
    const next = item.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/news/${item.id}`, {
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        status: next,
        publishedAt: next === 'published' ? new Date().toISOString() : item.publishedAt
      });
      fetchNews();
    } catch { alert('Status update failed'); }
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === news.length ? [] : news.map(n => n.id));

  const statusBadge = (s) => ({ published: 'badge-success', draft: 'badge-secondary', archived: 'badge-warning' }[s] || 'badge-secondary');

  return (
    <div>
      <div className="content-header">
        <h1>News <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Articles & Announcements</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>News</span>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} /><span>News Management Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>Manage news articles and announcements that appear on the public-facing website.</p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Status Toggle:</strong> Click a status badge in the table to instantly toggle between Draft and Published.</li>
              <li><strong>Tags:</strong> Enter comma-separated tags, e.g. <code>education, 2024, scholarship</code>.</li>
              <li><strong>Published At:</strong> Leave blank to use current time when publishing, or set a specific future date.</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}>All News Articles</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ minHeight: '34px', width: 150 }} value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search news..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }} />
              </div>
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete ({selectedIds.length})</span>
                </button>
              )}
              <button onClick={fetchNews} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Article</span>
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
                      <input type="checkbox" checked={news.length > 0 && selectedIds.length === news.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Article</th>
                    <th style={{ width: '120px' }}>Author</th>
                    <th style={{ width: '110px' }}>Category</th>
                    <th style={{ width: '130px' }}>Published</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading articles...' : 'No news articles found. Click "Add Article" to create one.'}
                      </td>
                    </tr>
                  ) : news.map(item => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectRow(item.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{item.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {item.imageUrl ? (
                            <img src={getFullMediaUrl(item.imageUrl)} alt="" style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div style={{ width: 52, height: 36, background: 'var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Newspaper size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{item.slug}</div>
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="flex items-center gap-1" style={{ marginTop: 2, flexWrap: 'wrap' }}>
                                {item.tags.slice(0, 3).map((t, i) => (
                                  <span key={i} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.author || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.category || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fmtDate(item.publishedAt)}</td>
                      <td>
                        <button onClick={() => quickToggleStatus(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} title="Click to toggle status">
                          <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && <button onClick={() => openEdit(item)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Edit2 size={13} /></button>}
                          {canDelete && <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Trash2 size={13} /></button>}
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
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> articles)
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

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editing ? `Edit: ${editing.title}` : 'Add New Article'}
            </h2>
            {formError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Title *</label>
                <input type="text" required className="form-input" value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value, slug: p.slug || slugify(e.target.value) }))}
                  placeholder="Article title..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slug *</label>
                <input type="text" required className="form-input" value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: slugify(e.target.value) }))} placeholder="article-slug" />
              </div>
              <MediaImageUploader
                label="Article Featured / Cover Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                module="news"
                helpText="Drag & drop or choose article featured image from Media Library."
              />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Excerpt</label>
                <textarea className="form-textarea" rows={2} value={formData.excerpt}
                  onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short summary shown in listings..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Content</label>
                <textarea className="form-textarea" rows={8} value={formData.content}
                  onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                  placeholder="Write the full article content here..." style={{ fontSize: '0.9rem', lineHeight: 1.7 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Author</label>
                  <input type="text" className="form-input" value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} placeholder="Author name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Announcement" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tags (comma-separated)</label>
                <input type="text" className="form-input" value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. education, scholarship, 2024" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Published At</label>
                  <input type="datetime-local" className="form-input" value={formData.publishedAt} onChange={e => setFormData(p => ({ ...p, publishedAt: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Article' : 'Publish Article')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManager;
