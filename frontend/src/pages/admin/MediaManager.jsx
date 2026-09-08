import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Image, Upload, Trash2, Home, ChevronRight, RefreshCw, 
  File, Search, Grid, List, Info, ExternalLink, Copy, Check,
  ChevronLeftIcon, ChevronRightIcon, Edit2, Plus, Save
} from 'lucide-react';
import api from '../../services/api';

const MediaManager = () => {
  const { hasPermission } = useAuth();
  
  // Media records and pagination states
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8); // Page limit suitable for card view grids
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Layout views and dialog triggers
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form submission state
  const [formData, setFormData] = useState({
    filename: '',
    url: '',
    mimeType: '',
    size: ''
  });

  const canCreate = hasPermission('media', 'create');
  const canUpdate = hasPermission('media', 'update');
  const canDelete = hasPermission('media', 'delete');

  const fetchMedia = () => {
    setLoading(true);
    api.get(`/media?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (res.data.success) {
          setMediaList(res.data.media || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Reload media list whenever search or pagination page modifies
  useEffect(() => {
    fetchMedia();
  }, [currentPage, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset page selection on searching
  };

  const uploadFileInstance = async (file) => {
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('module', 'general');

    setUploading(true);
    try {
      await api.post('/media/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    uploadFileInstance(file);
  };

  const handleOpenModal = (media = null) => {
    if (media) {
      setEditingMedia(media);
      setFormData({
        filename: media.filename,
        url: media.url,
        mimeType: media.mimeType || 'image/jpeg',
        size: media.size || 0
      });
    } else {
      setEditingMedia(null);
      setFormData({
        filename: '',
        url: 'http://',
        mimeType: 'image/jpeg',
        size: 0
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMedia) {
        await api.put(`/media/${editingMedia.id}`, formData);
      } else {
        await api.post('/media', formData);
      }
      setModalOpen(false);
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save media entry');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media asset?')) {
      try {
        await api.delete(`/media/${id}`);
        setSelectedIds(prev => prev.filter(x => x !== id));
        if (selectedMedia?.id === id) setSelectedMedia(null);
        fetchMedia();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete media');
      }
    }
  };

  // Bulk Delete implementation
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected assets permanently?`)) {
      try {
        await api.post('/media/bulk-delete', { ids: selectedIds });
        setSelectedIds([]);
        setSelectedMedia(null);
        fetchMedia();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to perform bulk delete');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(mediaList.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopyLink = (url, id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="content-header">
        <h1>Media Library <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Uploads & Image Assets</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Media</span>
        </div>
      </div>

      <div className="main-content">
        {/* Instructions panel */}
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>Media Management Directory Instructions</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p>To upload files, click the <strong>Add New Media</strong> button. In the popup form, you can drag and drop your files or enter external link references directly.</p>
          </div>
        </div>

        {/* Toolbar panel */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center" style={{ padding: '1rem' }}>
            <div className="flex items-center gap-3" style={{ flex: 1 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search file name..."
                  value={search}
                  onChange={handleSearchChange}
                  className="form-input"
                  style={{ paddingLeft: '32px', minHeight: '35px', width: '240px' }}
                />
              </div>

              {canDelete && selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm" style={{ minHeight: '35px' }}>
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center" style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? 'var(--primary-light)' : 'transparent',
                    border: 'none',
                    padding: '0.45rem',
                    cursor: 'pointer',
                    color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                  title="Grid Layout"
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? 'var(--primary-light)' : 'transparent',
                    border: 'none',
                    padding: '0.45rem',
                    cursor: 'pointer',
                    color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                  title="List Layout"
                >
                  <List size={16} />
                </button>
              </div>

              <button onClick={fetchMedia} className="btn btn-secondary btn-sm" style={{ minHeight: '35px' }} title="Refresh List">
                <RefreshCw size={14} />
              </button>

              {canCreate && (
                <>
                  <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm" style={{ minHeight: '35px' }}>
                    <Plus size={14} />
                    <span>Add New Media</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content panel layouts */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedMedia ? '1fr 320px' : '1fr', gap: '1.5rem', alignItems: 'start' }} className="user-privileges-grid">
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">Stored Media Library</h3>
            </div>
            
            <div className="card-body" style={{ padding: viewMode === 'list' ? 0 : '1.25rem' }}>
              {mediaList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Reading media files...' : 'No media assets found in library.'}
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid view cards */
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    {mediaList.map((m) => {
                      const isImg = m.mimeType?.startsWith('image/') || m.url?.match(/\.(jpeg|jpg|gif|png|webp)/i);
                      const isSelected = selectedMedia?.id === m.id;
                      const isChecked = selectedIds.includes(m.id);

                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMedia(m)}
                          className="card animate-fade-in"
                          style={{
                            padding: '0.65rem',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            position: 'relative'
                          }}
                        >
                          {/* Card select Checkbox */}
                          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => handleSelectRow(m.id, e)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          </div>

                          <div
                            style={{
                              height: '110px',
                              background: 'var(--bg-app)',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              marginTop: '1.5rem'
                            }}
                          >
                            {isImg ? (
                              <img
                                src={m.url.startsWith('http') ? m.url : `http://localhost:5000${m.url}`}
                                alt={m.filename}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <File size={36} color="var(--text-muted)" />
                            )}
                          </div>

                          <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.filename}>
                            {m.filename}
                          </div>

                          <div className="flex items-center justify-between" style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            <span>{m.size ? `${(m.size / 1024).toFixed(1)} KB` : 'External'}</span>
                            <div className="flex items-center gap-1">
                              {canUpdate && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenModal(m); }}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                  title="Edit Title"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={(e) => handleDelete(m.id, e)}
                                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                  title="Delete File"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                          <ChevronLeftIcon size={14} />
                          <span>Prev</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                          <span>Next</span>
                          <ChevronRightIcon size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* List view */
                <div className="table-container">
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll} 
                            checked={mediaList.length > 0 && selectedIds.length === mediaList.length}
                          />
                        </th>
                        <th>Thumbnail</th>
                        <th>File Name</th>
                        <th>Mime Type</th>
                        <th>File Size</th>
                        <th>Created Date</th>
                        <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mediaList.map((m) => {
                        const isImg = m.mimeType?.startsWith('image/') || m.url?.match(/\.(jpeg|jpg|gif|png|webp)/i);
                        const isSelected = selectedMedia?.id === m.id;

                        return (
                          <tr
                            key={m.id}
                            onClick={() => setSelectedMedia(m)}
                            style={{
                              cursor: 'pointer',
                              background: isSelected ? 'var(--primary-light)' : 'transparent'
                            }}
                          >
                            <td onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                checked={selectedIds.includes(m.id)}
                                onChange={(e) => handleSelectRow(m.id, e)}
                              />
                            </td>
                            <td style={{ width: '60px' }}>
                              <div style={{ width: '40px', height: '40px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isImg ? (
                                  <img src={m.url.startsWith('http') ? m.url : `http://localhost:5000${m.url}`} alt={m.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <File size={18} color="var(--text-muted)" />
                                )}
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{m.filename}</td>
                            <td><code>{m.mimeType || 'unknown'}</code></td>
                            <td>{m.size ? `${(m.size / 1024).toFixed(1)} KB` : 'External'}</td>
                            <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyLink(m.url, m.id, e)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.2rem 0.4rem', minHeight: '26px' }}
                                  title="Copy URL Link"
                                >
                                  {copiedId === m.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                                </button>
                                {canUpdate && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenModal(m)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '0.2rem 0.4rem', minHeight: '26px' }}
                                    title="Edit Link"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDelete(m.id, e)}
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '0.2rem 0.4rem', minHeight: '26px' }}
                                    title="Delete File"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Details Sidebar inspector panel */}
          {selectedMedia && (
            <div className="card animate-fade-in" style={{ borderTop: '3px solid var(--primary)', position: 'sticky', top: '75px' }}>
              <div className="card-header" style={{ padding: '0.75rem 1rem' }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>Asset Inspector</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginLeft: 'auto'
                  }}
                >
                  Close
                </button>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div style={{
                  height: '160px',
                  background: 'var(--bg-app)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--border)'
                }}>
                  {selectedMedia.mimeType?.startsWith('image/') || selectedMedia.url?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                    <img src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`} alt={selectedMedia.filename} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <File size={48} color="var(--text-muted)" />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>File Name:</span>
                    <div style={{ wordBreak: 'break-all', fontWeight: 700, marginTop: '2px' }}>{selectedMedia.filename}</div>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Mime Type:</span>
                    <div style={{ marginTop: '2px' }}><code>{selectedMedia.mimeType || 'unknown'}</code></div>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>File Size:</span>
                    <div style={{ marginTop: '2px' }}>{selectedMedia.size ? `${(selectedMedia.size / 1024).toFixed(1)} KB` : 'External Link'}</div>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Created Date:</span>
                    <div style={{ marginTop: '2px' }}>{new Date(selectedMedia.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedMedia.url, selectedMedia.id)}
                    className="btn btn-secondary w-full btn-sm"
                    style={{ justifyContent: 'center' }}
                  >
                    {copiedId === selectedMedia.id ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    <span>{copiedId === selectedMedia.id ? 'Copied URL!' : 'Copy Direct URL'}</span>
                  </button>

                  <a
                    href={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-info w-full btn-sm"
                    style={{ justifyContent: 'center', color: '#fff' }}
                  >
                    <ExternalLink size={14} />
                    <span>Open in Tab</span>
                  </a>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMedia.id)}
                      className="btn btn-danger w-full btn-sm"
                      style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Asset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Link Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '620px', maxHeight: '95vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>
              {editingMedia ? 'Edit Media Reference' : 'Upload or Register Media Asset'}
            </h2>

            {/* Modal Instructions */}
            <div style={{ background: 'rgba(23, 162, 184, 0.08)', padding: '0.85rem', borderRadius: '4px', borderLeft: '3px solid var(--info)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--info)' }}>Permitted Upload Formats:</strong>
              <ul style={{ margin: '0.25rem 0 0 1rem', paddingLeft: 0, listStyleType: 'disc' }}>
                <li><strong>Images:</strong> Standard PNG, JPG, JPEG, SVG, WebP, and small picture sizes.</li>
                <li><strong>Videos:</strong> Light/Small MP4 or WebM video loops.</li>
                <li><strong>Documents:</strong> Portable PDF formats and standard logs.</li>
              </ul>
            </div>

            {/* Modal Drag and Drop Area */}
            {!editingMedia && canCreate && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    await uploadFileInstance(file);
                    setModalOpen(false);
                  }
                }}
                style={{
                  border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                  background: isDragging ? 'var(--primary-light)' : 'rgba(0,0,0,0.015)',
                  borderRadius: '6px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onClick={() => document.getElementById('modal-drag-input').click()}
              >
                <Upload size={28} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Drag & Drop File Here
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  or click to select file from system directories
                </span>
                <input 
                  id="modal-drag-input"
                  type="file" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await uploadFileInstance(file);
                      setModalOpen(false);
                    }
                  }} 
                  style={{ display: 'none' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ padding: '0 0.75rem', fontWeight: 600 }}>OR REGISTER LINK DETAILS</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Asset Title / File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homepage Hero Video"
                  className="form-input"
                  value={formData.filename}
                  onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Direct URL Address</label>
                <input
                  type="text"
                  required
                  placeholder="http://example.com/assets/intro.mp4"
                  className="form-input"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mime Type</label>
                <input
                  type="text"
                  placeholder="video/mp4"
                  className="form-input"
                  value={formData.mimeType}
                  onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Estimated Size (Bytes)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="form-input"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm" style={{ minWidth: '80px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: '100px' }}>
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
