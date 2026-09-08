import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, Plus, Edit2, Trash2, Search, RefreshCw,
  Home, ChevronRight, ChevronLeft, Info, Filter, Paperclip, Video, Eye,
  HelpCircle, CheckCircle2, Award, Sparkles, BookOpen
} from 'lucide-react';
import api from '../../services/api';
import MediaImageUploader, { getFullMediaUrl } from '../../components/admin/MediaImageUploader';

const FILE_TYPES = ['pdf', 'slide', 'excel', 'doc', 'video', 'image', 'other'];
const FILE_ICONS = { pdf: '📄', slide: '📊', excel: '📑', doc: '📝', video: '🎬', image: '🖼️', other: '📎' };

const UnitManager = () => {
  const { hasPermission } = useAuth();

  const [units, setUnits] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  // Unit modal
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('details'); // 'details' | 'exercises'
  const [editingUnit, setEditingUnit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [unitForm, setUnitForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    imageUrl: '',
    tutorialText: '',
    videoUrl: '',
    order: 0,
    status: 'active',
    passingScore: 70,
    exerciseData: []
  });

  // File manager modal
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [fileUnit, setFileUnit] = useState(null);
  const [unitFiles, setUnitFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileForm, setFileForm] = useState({ fileName: '', fileUrl: '', fileType: 'pdf', fileSize: '' });
  const [fileError, setFileError] = useState('');
  const [savingFile, setSavingFile] = useState(false);

  const canCreate = hasPermission('units', 'create');
  const canUpdate = hasPermission('units', 'update');
  const canDelete = hasPermission('units', 'delete');

  const fetchModules = () => {
    api.get('/course-modules?limit=200').then(res => { if (res.data.success) setModules(res.data.modules || []); }).catch(() => {});
  };

  const fetchUnits = () => {
    setLoading(true);
    let url = `/units?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
    if (moduleFilter) url += `&moduleId=${moduleFilter}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setUnits(res.data.units || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchModules(); }, []);
  useEffect(() => { fetchUnits(); }, [page, search, moduleFilter]);

  const openCreate = () => {
    setEditingUnit(null);
    setModalTab('details');
    setUnitForm({
      moduleId: moduleFilter || modules[0]?.id || '',
      title: '',
      description: '',
      imageUrl: '',
      tutorialText: '',
      videoUrl: '',
      order: 0,
      status: 'active',
      passingScore: 70,
      exerciseData: []
    });
    setFormError('');
    setUnitModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUnit(u);
    setModalTab('details');
    setUnitForm({
      moduleId: u.moduleId,
      title: u.title,
      description: u.description || '',
      imageUrl: u.imageUrl || '',
      tutorialText: u.tutorialText || '',
      videoUrl: u.videoUrl || '',
      order: u.order,
      status: u.status,
      passingScore: u.passingScore || 70,
      exerciseData: Array.isArray(u.exerciseData) ? u.exerciseData : []
    });
    setFormError('');
    setUnitModalOpen(true);
  };

  const handleAddQuestion = () => {
    setUnitForm(p => ({
      ...p,
      exerciseData: [
        ...p.exerciseData,
        {
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
        }
      ]
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setUnitForm(p => ({
      ...p,
      exerciseData: p.exerciseData.filter((_, i) => i !== idx)
    }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setUnitForm(p => {
      const copy = [...p.exerciseData];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...p, exerciseData: copy };
    });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setUnitForm(p => {
      const copy = [...p.exerciseData];
      const q = { ...copy[qIdx] };
      const opts = [...q.options];
      opts[optIdx] = value;
      q.options = opts;
      copy[qIdx] = q;
      return { ...p, exerciseData: copy };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unitForm.title.trim()) return setFormError('Title is required.');
    if (!unitForm.moduleId) return setFormError('Module is required.');
    setSaving(true); setFormError('');
    try {
      if (editingUnit) { await api.put(`/units/${editingUnit.id}`, unitForm); }
      else { await api.post('/units', unitForm); }
      setUnitModalOpen(false); fetchUnits();
    } catch (err) { setFormError(err.response?.data?.error || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unit? All attached files will also be removed.')) return;
    try { await api.delete(`/units/${id}`); fetchUnits(); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} unit(s)?`)) return;
    try { await api.post('/units/bulk-delete', { ids: selectedIds }); setSelectedIds([]); fetchUnits(); }
    catch (err) { alert('Failed'); }
  };

  const openFileManager = async (unit) => {
    setFileUnit(unit);
    setFileForm({ fileName: '', fileUrl: '', fileType: 'pdf', fileSize: '' });
    setFileError('');
    setLoadingFiles(true);
    setFileModalOpen(true);
    try {
      const res = await api.get(`/unit-files?unitId=${unit.id}&limit=50`);
      if (res.data.success) setUnitFiles(res.data.files || []);
    } catch { setUnitFiles([]); }
    finally { setLoadingFiles(false); }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!fileForm.fileName.trim() || !fileForm.fileUrl.trim()) return setFileError('File name and URL are required.');
    setSavingFile(true); setFileError('');
    try {
      await api.post('/unit-files', { ...fileForm, unitId: fileUnit.id });
      setFileForm({ fileName: '', fileUrl: '', fileType: 'pdf', fileSize: '' });
      const res = await api.get(`/unit-files?unitId=${fileUnit.id}&limit=50`);
      if (res.data.success) setUnitFiles(res.data.files || []);
      fetchUnits();
    } catch (err) { setFileError(err.response?.data?.error || 'Add file failed.'); }
    finally { setSavingFile(false); }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Remove this file?')) return;
    try { await api.delete(`/unit-files/${fileId}`); setUnitFiles(p => p.filter(f => f.id !== fileId)); fetchUnits(); }
    catch { alert('Delete failed'); }
  };

  const handleSelectRow = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedIds(p => p.length === units.length ? [] : units.map(u => u.id));

  return (
    <div>
      <div className="content-header">
        <h1>Units <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Learning Units with Files & Tutorials</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Units</span>
        </div>
      </div>

      <div className="main-content">
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} /><span>Unit Management Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>Units are individual lessons within a module. Each unit can have tutorial text, a video link, and downloadable files (PDF, slides, Excel, etc.).</p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Files:</strong> Click the <strong>📎 Files</strong> button on any unit row to manage its attachments.</li>
              <li><strong>Tutorial Text:</strong> Supports long-form content. You can use Markdown formatting.</li>
              <li><strong>Video URL:</strong> Link to YouTube, Vimeo, or any direct video URL.</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center' }}>All Units</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="form-select" style={{ minHeight: '34px', width: 200 }} value={moduleFilter}
                  onChange={e => { setModuleFilter(e.target.value); setPage(1); }}>
                  <option value="">All Modules</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search units..." value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="form-input" style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }} />
              </div>
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /><span>Delete ({selectedIds.length})</span>
                </button>
              )}
              <button onClick={fetchUnits} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} /><span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={openCreate} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} /><span>Add Unit</span>
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
                      <input type="checkbox" checked={units.length > 0 && selectedIds.length === units.length} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Unit Title</th>
                    <th>Module</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Files</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Video</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Order</th>
                    <th style={{ width: '90px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {units.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading units...' : 'No units found. Click "Add Unit" to create one.'}
                      </td>
                    </tr>
                  ) : units.map(u => (
                    <tr key={u.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => handleSelectRow(u.id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td>#{u.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.title}</div>
                        {u.tutorialText && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.tutorialText.substring(0, 55)}…</div>}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{u.module?.title || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${u.files?.length > 0 ? 'badge-info' : 'badge-secondary'}`}>{u.files?.length || 0}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {u.videoUrl ? <Video size={14} style={{ color: '#6f42c1' }} /> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.order}</td>
                      <td><span className={`badge badge-${u.status === 'active' ? 'success' : 'secondary'}`}>{u.status}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openFileManager(u)} className="btn btn-secondary btn-sm" title="Manage Files" style={{ padding: '0.2rem 0.45rem' }}>
                            <Paperclip size={13} />
                          </button>
                          {canUpdate && <button onClick={() => openEdit(u)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Edit2 size={13} /></button>}
                          {canDelete && <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}><Trash2 size={13} /></button>}
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
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> units)
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

      {/* Unit Create/Edit Modal */}
      {unitModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingUnit ? `Edit Unit: ${editingUnit.title}` : 'Add New Curriculum Unit'}
              </h2>
              <span className="badge badge-info" style={{ fontSize: '0.78rem' }}>
                {unitForm.exerciseData.length} Exercise Question{unitForm.exerciseData.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setModalTab('details')}
                className={`btn btn-sm ${modalTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <BookOpen size={14} />
                <span>Unit Content & Details</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('exercises')}
                className={`btn btn-sm ${modalTab === 'exercises' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <HelpCircle size={14} />
                <span>Dynamic Exercises & Quiz ({unitForm.exerciseData.length})</span>
              </button>
            </div>

            {formError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {modalTab === 'details' ? (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Module *</label>
                    <select className="form-select" value={unitForm.moduleId} onChange={e => setUnitForm(p => ({ ...p, moduleId: e.target.value }))}>
                      <option value="">-- Select Module --</option>
                      {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit Title *</label>
                    <input type="text" required className="form-input" value={unitForm.title}
                      onChange={e => setUnitForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Variables and Data Types" />
                  </div>
                  <MediaImageUploader
                    label="Unit / Lesson Image"
                    value={unitForm.imageUrl}
                    onChange={(url) => setUnitForm(p => ({ ...p, imageUrl: url }))}
                    module="units"
                    helpText="Drag & drop or select lesson cover image from Media Library."
                  />
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={2} value={unitForm.description}
                      onChange={e => setUnitForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief overview..." />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tutorial Text (Markdown Supported)</label>
                    <textarea className="form-textarea" rows={5} value={unitForm.tutorialText}
                      onChange={e => setUnitForm(p => ({ ...p, tutorialText: e.target.value }))}
                      placeholder="Enter the full tutorial content here. Markdown is supported..." style={{ fontFamily: 'monospace', fontSize: '0.875rem' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Video Tutorial URL</label>
                    <input type="text" className="form-input" value={unitForm.videoUrl}
                      onChange={e => setUnitForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://youtube.com/... or direct video URL" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Order</label>
                      <input type="number" min={0} className="form-input" value={unitForm.order}
                        onChange={e => setUnitForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Status</label>
                      <select className="form-select" value={unitForm.status} onChange={e => setUnitForm(p => ({ ...p, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Dynamic Exercises & Quiz Tab */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(56,189,248,0.08)', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                          Automated Exercise & Scoring Engine
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Add questions for this unit. The LMS will automatically grade responses and score students.
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Passing Score (%):</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          style={{ width: '75px', textAlign: 'center' }}
                          className="form-input"
                          value={unitForm.passingScore}
                          onChange={e => setUnitForm(p => ({ ...p, passingScore: parseInt(e.target.value) || 70 }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Questions List ({unitForm.exerciseData.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Plus size={14} />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {unitForm.exerciseData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                      <HelpCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>No exercise questions added yet</div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Click below to create interactive multiple-choice questions for automated evaluation.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Plus size={14} /> Add First Question
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {unitForm.exerciseData.map((q, qIdx) => (
                        <div key={qIdx} style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-app)', border: '1px solid var(--border)', position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                              Question {qIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              title="Delete this question"
                            >
                              <Trash2 size={12} style={{ marginRight: 4 }} /> Delete
                            </button>
                          </div>

                          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Question Statement *</label>
                            <input
                              type="text"
                              required
                              className="form-input"
                              placeholder="e.g. Which keyword is used to declare a constant in JavaScript?"
                              value={q.question}
                              onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                            />
                          </div>

                          <div style={{ marginBottom: '0.75rem' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                              Answer Options (Select the radio button next to the correct answer):
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                                <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <input
                                    type="radio"
                                    name={`correct_${qIdx}`}
                                    checked={Number(q.correctIndex) === optIdx}
                                    onChange={() => handleQuestionChange(qIdx, 'correctIndex', optIdx)}
                                    title={`Mark Option ${letter} as correct`}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                  />
                                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: Number(q.correctIndex) === optIdx ? 'var(--success)' : 'var(--text-muted)', width: '20px' }}>
                                    {letter}.
                                  </span>
                                  <input
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder={`Option ${letter} text`}
                                    value={q.options?.[optIdx] || ''}
                                    onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                                    style={{
                                      borderColor: Number(q.correctIndex) === optIdx ? 'var(--success)' : 'var(--border)',
                                      background: Number(q.correctIndex) === optIdx ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Explanation / Feedback (Optional)</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. const prevents reassignment of variable identifiers in modern ES6."
                              value={q.explanation || ''}
                              onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setUnitModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (editingUnit ? 'Update Unit' : 'Create Unit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Manager Modal */}
      {fileModalOpen && fileUnit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              <Paperclip size={16} style={{ marginRight: 6 }} />Files — {fileUnit.title}
            </h2>

            {/* Existing files */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Attached Files ({unitFiles.length})
              </h3>
              {loadingFiles ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading files...</p>
              ) : unitFiles.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No files attached to this unit yet.</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th style={{ width: 80 }}>Type</th>
                        <th style={{ width: 90 }}>Size</th>
                        <th style={{ width: 90, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitFiles.map(f => (
                        <tr key={f.id}>
                          <td style={{ fontWeight: 500 }}>{FILE_ICONS[f.fileType] || '📎'} {f.fileName}</td>
                          <td><span className="badge badge-secondary">{f.fileType}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.fileSize ? `${Math.round(f.fileSize / 1024)} KB` : '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="flex items-center justify-end gap-1">
                              <a href={f.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                                <Eye size={12} />
                              </a>
                              {canDelete && (
                                <button onClick={() => handleDeleteFile(f.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add file form */}
            {canCreate && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Add New File</h3>
                {fileError && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{fileError}</div>}
                <form onSubmit={handleAddFile} className="flex flex-col gap-3">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">File Name *</label>
                    <input type="text" className="form-input" value={fileForm.fileName} onChange={e => setFileForm(p => ({ ...p, fileName: e.target.value }))} placeholder="e.g. Chapter 1 Notes.pdf" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">File URL *</label>
                    <input type="text" className="form-input" value={fileForm.fileUrl} onChange={e => setFileForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">File Type</label>
                      <select className="form-select" value={fileForm.fileType} onChange={e => setFileForm(p => ({ ...p, fileType: e.target.value }))}>
                        {FILE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">File Size (bytes)</label>
                      <input type="number" className="form-input" value={fileForm.fileSize} onChange={e => setFileForm(p => ({ ...p, fileSize: e.target.value }))} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2" style={{ marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setFileModalOpen(false)} className="btn btn-secondary btn-sm">Close</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={savingFile}>
                      {savingFile ? 'Adding...' : <><Plus size={14} /> Add File</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {!canCreate && (
              <div className="flex items-center justify-end" style={{ marginTop: '1rem' }}>
                <button type="button" onClick={() => setFileModalOpen(false)} className="btn btn-secondary btn-sm">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitManager;
