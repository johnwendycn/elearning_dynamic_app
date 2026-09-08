import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Filter
} from 'lucide-react';
import api from '../../services/api';
import MediaImageUploader, { getFullMediaUrl } from '../../components/admin/MediaImageUploader';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEVEL_BADGE = { beginner: 'badge-success', intermediate: 'badge-warning', advanced: 'badge-danger' };

const CourseManager = () => {
  const { hasPermission } = useAuth();

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ departmentId: '', title: '', slug: '', description: '', imageUrl: '', duration: '', level: 'beginner', status: 'active' });

  const canCreate = hasPermission('courses', 'create');
  const canUpdate = hasPermission('courses', 'update');
  const canDelete = hasPermission('courses', 'delete');

  const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const fetchDepartments = () => {
    api.get('/departments/active').then(res => { if (res.data.success) setDepartments(res.data.data || []); }).catch(() => {});
  };

  const fetchCourses = () => {
    setLoading(true);
    let url = `/courses?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
    if (deptFilter) url += `&departmentId=${deptFilter}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setCourses(res.data.courses || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, []);
  useEffect(() => { fetchCourses(); }, [page, search, deptFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormData({
      departmentId: departments[0]?.id || '',
      title: '',
      slug: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      badge: '',
      language: 'English',
      price: 0,
      discountPrice: '',
      certificateAvailable: true,
      duration: '',
      level: 'beginner',
      status: 'active',
      instructorName: '',
      instructorTitle: '',
      instructorBio: '',
      instructorAvatar: '',
      learningOutcomes: '',
      requirements: '',
      targetAudience: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setFormData({
      departmentId: c.departmentId,
      title: c.title,
      slug: c.slug,
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      videoUrl: c.videoUrl || '',
      badge: c.badge || '',
      language: c.language || 'English',
      price: c.price || 0,
      discountPrice: c.discountPrice || '',
      certificateAvailable: c.certificateAvailable !== false,
      duration: c.duration || '',
      level: c.level,
      status: c.status,
      instructorName: c.instructorName || '',
      instructorTitle: c.instructorTitle || '',
      instructorBio: c.instructorBio || '',
      instructorAvatar: c.instructorAvatar || '',
      learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes.join('\n') : (c.learningOutcomes || ''),
      requirements: Array.isArray(c.requirements) ? c.requirements.join('\n') : (c.requirements || ''),
      targetAudience: Array.isArray(c.targetAudience) ? c.targetAudience.join('\n') : (c.targetAudience || '')
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setFormError('Title is required.');
    if (!formData.departmentId) return setFormError('Department is required.');
    if (!formData.slug.trim()) return setFormError('Slug is required.');
    setSaving(true); setFormError('');
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        learningOutcomes: formData.learningOutcomes ? formData.learningOutcomes.split('\n').map(s => s.trim()).filter(Boolean) : null,
        requirements: formData.requirements ? formData.requirements.split('\n').map(s => s.trim()).filter(Boolean) : null,
        targetAudience: formData.targetAudience ? formData.targetAudience.split('\n').map(s => s.trim()).filter(Boolean) : null,
      };
      if (editing) { await api.put(`/courses/${editing.id}`, payload); }
      else { await api.post('/courses', payload); }
      setModalOpen(false); fetchCourses();
    } catch (err) { setFormError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? All modules and units will also be removed.')) return;
    try { await api.delete(`/courses/${id}`); fetchCourses(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} course(s)?`)) return;
    try { await api.post('/courses/bulk-delete', { ids: selectedIds }); setSelectedIds([]); fetchCourses(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === courses.length ? [] : courses.map(c => c.id));

  return (
    <div>
      <div className="content-header">
        <h1>Courses <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Department Learning Programmes</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Courses</span>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} /><span>Course Management Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>Courses belong to departments and represent full learning programmes offered to students.</p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Department:</strong> Every course must be assigned to a department. Create departments first.</li>
              <li><strong>Level:</strong> Beginner, Intermediate, or Advanced — shown to learners as a difficulty indicator.</li>
              <li><strong>Duration:</strong> Optional free-text field, e.g. "8 weeks" or "3 months".</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}>All Courses</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              {/* Dept Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ minHeight: '34px', width: 180 }} value={deptFilter}
                  onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search courses..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }} />
              </div>
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete ({selectedIds.length})</span>
                </button>
              )}
              <button onClick={fetchCourses} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Course</span>
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
                      <input type="checkbox" checked={courses.length > 0 && selectedIds.length === courses.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Image</th>
                    <th>Title / Slug</th>
                    <th>Department</th>
                    <th style={{ width: '110px' }}>Level</th>
                    <th style={{ width: '90px' }}>Duration</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading courses...' : 'No courses found. Click "Add Course" to create one.'}
                      </td>
                    </tr>
                  ) : courses.map(c => (
                    <tr key={c.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleSelectRow(c.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{c.id}</td>
                      <td>
                        {c.imageUrl ? (
                          <img src={getFullMediaUrl(c.imageUrl)} alt={c.title} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: 48, height: 36, background: 'var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{c.slug}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{c.department?.name || '—'}</td>
                      <td><span className={`badge ${LEVEL_BADGE[c.level] || 'badge-secondary'}`}>{c.level}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.duration || '—'}</td>
                      <td><span className={`badge badge-${c.status === 'active' ? 'success' : 'secondary'}`}>{c.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && <button onClick={() => openEdit(c)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Edit2 size={13} /></button>}
                          {canDelete && <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Trash2 size={13} /></button>}
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
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> courses)
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
          <div className="card w-full animate-fade-in" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editing ? `Edit: ${editing.title}` : 'Add New Course'}
            </h2>
            {formError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department *</label>
                <select className="form-select" value={formData.departmentId} onChange={e => setFormData(p => ({ ...p, departmentId: e.target.value }))}>
                  <option value="">-- Select Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Title *</label>
                <input type="text" required className="form-input" value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value, slug: p.slug || slugify(e.target.value) }))}
                  placeholder="e.g. Introduction to Programming" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slug *</label>
                <input type="text" required className="form-input" value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="e.g. intro-to-programming" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Level</label>
                  <select className="form-select" value={formData.level} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))}>
                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duration</label>
                  <input type="text" className="form-input" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 8 weeks" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Badge</label>
                  <input type="text" className="form-input" value={formData.badge} onChange={e => setFormData(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Bestseller, Featured" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Language</label>
                  <input type="text" className="form-input" value={formData.language} onChange={e => setFormData(p => ({ ...p, language: e.target.value }))} placeholder="e.g. English" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price ($) (0 = Free)</label>
                  <input type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Original / Discount Price ($)</label>
                  <input type="number" step="0.01" className="form-input" value={formData.discountPrice} onChange={e => setFormData(p => ({ ...p, discountPrice: e.target.value }))} placeholder="e.g. 94.99" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Intro / Preview Video URL (YouTube, Vimeo, MP4)</label>
                <input type="text" className="form-input" value={formData.videoUrl} onChange={e => setFormData(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              <MediaImageUploader
                label="Course Thumbnail / Banner"
                value={formData.imageUrl}
                onChange={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                module="courses"
                helpText="Drag & drop or choose course cover image from Media Library."
              />

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Course overview..." />
              </div>

              {/* Instructor Information */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Instructor Details (Optional)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Instructor Name</label>
                    <input type="text" className="form-input" value={formData.instructorName} onChange={e => setFormData(p => ({ ...p, instructorName: e.target.value }))} placeholder="e.g. Dr. Michelle Okonjo" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Instructor Title / Role</label>
                    <input type="text" className="form-input" value={formData.instructorTitle} onChange={e => setFormData(p => ({ ...p, instructorTitle: e.target.value }))} placeholder="e.g. Head of AI Faculty" />
                  </div>
                </div>
                <MediaImageUploader
                  label="Instructor Avatar Picture"
                  value={formData.instructorAvatar}
                  onChange={(url) => setFormData(p => ({ ...p, instructorAvatar: url }))}
                  module="courses"
                  height={100}
                  helpText="Optional profile photo for the instructor."
                />
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Instructor Bio</label>
                  <textarea className="form-textarea" rows={2} value={formData.instructorBio} onChange={e => setFormData(p => ({ ...p, instructorBio: e.target.value }))} placeholder="Instructor background and achievements..." />
                </div>
              </div>

              {/* Learning Outcomes, Requirements, Audience */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Curriculum Details (One item per line)</h4>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">What You'll Learn (1 per line)</label>
                  <textarea className="form-textarea" rows={3} value={formData.learningOutcomes} onChange={e => setFormData(p => ({ ...p, learningOutcomes: e.target.value }))} placeholder="Master core principles...&#10;Build end-to-end projects..." />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label">Requirements (1 per line)</label>
                  <textarea className="form-textarea" rows={2} value={formData.requirements} onChange={e => setFormData(p => ({ ...p, requirements: e.target.value }))} placeholder="Basic computer literacy...&#10;Internet connection..." />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Audience / Who This Course Is For (1 per line)</label>
                  <textarea className="form-textarea" rows={2} value={formData.targetAudience} onChange={e => setFormData(p => ({ ...p, targetAudience: e.target.value }))} placeholder="Beginners and aspiring engineers...&#10;Software developers upgrading..." />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Certificate Available</label>
                  <select className="form-select" value={formData.certificateAvailable ? 'true' : 'false'} onChange={e => setFormData(p => ({ ...p, certificateAvailable: e.target.value === 'true' }))}>
                    <option value="true">Yes - Certificate Included</option>
                    <option value="false">No Certificate</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Course' : 'Create Course')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;
