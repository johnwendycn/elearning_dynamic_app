import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Save, X
} from 'lucide-react';
import api from '../../services/api';
import MediaImageUploader, { getFullMediaUrl } from '../../components/admin/MediaImageUploader';

const DepartmentManager = () => {
  const { hasPermission } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', imageUrl: '', status: 'active' });

  const canCreate = hasPermission('departments', 'create');
  const canUpdate = hasPermission('departments', 'update');
  const canDelete = hasPermission('departments', 'delete');

  const slugify = (v) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const fetchDepartments = () => {
    setLoading(true);
    api.get(`/departments?page=${page}&limit=10&search=${encodeURIComponent(search)}`)
      .then(res => {
        if (res.data.success) {
          setDepartments(res.data.departments || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', slug: '', description: '', imageUrl: '', status: 'active' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setFormData({ name: dept.name, slug: dept.slug, description: dept.description || '', imageUrl: dept.imageUrl || '', status: dept.status });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setFormError('Name is required.');
    if (!formData.slug.trim()) return setFormError('Slug is required.');
    setSaving(true); setFormError('');
    try {
      if (editing) {
        await api.put(`/departments/${editing.id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? All its courses will also be removed.')) return;
    try { await api.delete(`/departments/${id}`); fetchDepartments(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} department(s)? This cannot be undone.`)) return;
    try { await api.post('/departments/bulk-delete', { ids: selectedIds }); setSelectedIds([]); fetchDepartments(); }
    catch (err) { alert(err.response?.data?.error || 'Bulk delete failed'); }
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === departments.length ? [] : departments.map(d => d.id));

  return (
    <div>
      {/* Content Header */}
      <div className="content-header">
        <h1>Departments <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Academic Faculties & Schools</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Departments</span>
        </div>
      </div>

      <div className="main-content">
        {/* Info Panel */}
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>Department Management Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>Departments represent academic faculties or schools. Each department can contain multiple courses.</p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Slug:</strong> Auto-generated from the name. Used in URLs — must be unique.</li>
              <li><strong>Image URL:</strong> A banner image displayed on the department listing page.</li>
              <li><strong>Bulk Actions:</strong> Select multiple departments using checkboxes to delete them at once.</li>
            </ul>
          </div>
        </div>

        {/* Main Card */}
        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}>All Departments</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search departments..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }} />
              </div>
              {/* Bulk Delete */}
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
              <button onClick={fetchDepartments} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Department</span>
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
                      <input type="checkbox" checked={departments.length > 0 && selectedIds.length === departments.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Image</th>
                    <th>Name / Slug</th>
                    <th>Description</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading departments...' : 'No departments found. Click "Add Department" to create one.'}
                      </td>
                    </tr>
                  ) : departments.map(dept => (
                    <tr key={dept.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(dept.id)} onChange={() => handleSelectRow(dept.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{dept.id}</td>
                      <td>
                        {dept.imageUrl ? (
                          <img src={getFullMediaUrl(dept.imageUrl)} alt={dept.name} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: 48, height: 36, background: 'var(--border)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dept.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{dept.slug}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 260 }}>
                        {dept.description ? dept.description.substring(0, 80) + (dept.description.length > 80 ? '…' : '') : '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${dept.status === 'active' ? 'success' : 'secondary'}`}>{dept.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(dept.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <button onClick={() => openEdit(dept)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(dept.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
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
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> departments)
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
          <div className="card w-full animate-fade-in" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editing ? `Edit: ${editing.name}` : 'Add New Department'}
            </h2>
            {formError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name *</label>
                <input type="text" required className="form-input" value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))}
                  placeholder="e.g. Faculty of Science" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Slug *</label>
                <input type="text" required className="form-input" value={formData.slug}
                  onChange={e => setFormData(p => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="e.g. faculty-of-science" />
              </div>
              <MediaImageUploader
                label="Department Banner / Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData(p => ({ ...p, imageUrl: url }))}
                module="departments"
                helpText="Drag & drop or select an image for this faculty/department."
              />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={3} value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this department..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editing ? 'Update Department' : 'Create Department')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
