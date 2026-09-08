import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Filter
} from 'lucide-react';
import api from '../../services/api';
import MediaImageUploader, { getFullMediaUrl } from '../../components/admin/MediaImageUploader';

const CourseModuleManager = () => {
  const { hasPermission } = useAuth();

  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ courseId: '', title: '', description: '', imageUrl: '', order: 0, status: 'active' });

  const canCreate = hasPermission('course_modules', 'create');
  const canUpdate = hasPermission('course_modules', 'update');
  const canDelete = hasPermission('course_modules', 'delete');

  const fetchCourses = () => {
    api.get('/courses?limit=200').then(res => { if (res.data.success) setCourses(res.data.courses || []); }).catch(() => {});
  };

  const fetchModules = () => {
    setLoading(true);
    let url = `/course-modules?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
    if (courseFilter) url += `&courseId=${courseFilter}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setModules(res.data.modules || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { fetchModules(); }, [page, search, courseFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ courseId: courseFilter || courses[0]?.id || '', title: '', description: '', imageUrl: '', order: 0, status: 'active' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setFormData({ courseId: m.courseId, title: m.title, description: m.description || '', imageUrl: m.imageUrl || '', order: m.order, status: m.status });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setFormError('Title is required.');
    if (!formData.courseId) return setFormError('Course is required.');
    setSaving(true); setFormError('');
    try {
      if (editing) { await api.put(`/course-modules/${editing.id}`, formData); }
      else { await api.post('/course-modules', formData); }
      setModalOpen(false); fetchModules();
    } catch (err) { setFormError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module? All units inside it will also be removed.')) return;
    try { await api.delete(`/course-modules/${id}`); fetchModules(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} module(s)?`)) return;
    try { await api.post('/course-modules/bulk-delete', { ids: selectedIds }); setSelectedIds([]); fetchModules(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === modules.length ? [] : modules.map(m => m.id));

  return (
    <div>
      <div className="content-header">
        <h1>Course Modules <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Sections within a Course</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Course Modules</span>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} /><span>Course Module Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>Modules organize a course into logical chapters or sections. Each module contains one or more units.</p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Order:</strong> Controls the sequence in which modules are presented to learners (lower = first).</li>
              <li><strong>Units:</strong> After creating a module, add learning units to it from the Units section.</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}>All Course Modules</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ minHeight: '34px', width: 200 }} value={courseFilter}
                  onChange={e => { setCourseFilter(e.target.value); setPage(1); }}>
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search modules..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }} />
              </div>
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete ({selectedIds.length})</span>
                </button>
              )}
              <button onClick={fetchModules} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Module</span>
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
                      <input type="checkbox" checked={modules.length > 0 && selectedIds.length === modules.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Module Title</th>
                    <th>Course</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Order</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading modules...' : 'No modules found. Click "Add Module" to create one.'}
                      </td>
                    </tr>
                  ) : modules.map(m => (
                    <tr key={m.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => handleSelectRow(m.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{m.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.title}</div>
                        {m.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.description.substring(0, 60)}…</div>}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{m.course?.title || '—'}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{m.order}</td>
                      <td><span className={`badge badge-${m.status === 'active' ? 'success' : 'secondary'}`}>{m.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && <button onClick={() => openEdit(m)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Edit2 size={13} /></button>}
                          {canDelete && <button onClick={() => handleDelete(m.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Trash2 size={13} /></button>}
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
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> modules)
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
          <div className="card w-full animate-fade-in" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editing ? `Edit: ${editing.title}` : 'Add New Module'}
            </h2>
            {formError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Course *</label>
                <select className="form-select" value={formData.courseId} onChange={e => setFormData(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Module Title *</label>
                <input type="text" required className="form-input" value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction & Overview" />
              </div>
              <MediaImageUploader
                label="Module Thumbnail / Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                module="course_modules"
                helpText="Drag & drop or select an image for this curricular module."
              />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="What this module covers..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Order</label>
                  <input type="number" min={0} className="form-input" value={formData.order}
                    onChange={e => setFormData(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Module' : 'Create Module')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseModuleManager;
