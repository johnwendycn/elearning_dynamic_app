import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { useOrgSettings } from '../../context/OrgSettingsContext';
import { 
  Layout, Save, Home, ChevronRight, Image, File, Plus, Edit2, Trash2,
  Phone, Mail, Search, Sun, Moon, LogOut, LayoutDashboard, User,
  Eye, Facebook, Twitter, Instagram, Linkedin, AlignCenter, AlignLeft, AlignRight,
  Menu as MenuIcon, Check, Settings, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import MediaSelectorModal from './MediaSelectorModal';
import { getFullMediaUrl } from '../../utils/mediaUrl';

const HeaderManager = () => {
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useAlert();
  const { orgSettings, refreshSettings } = useOrgSettings();
  
  // Dashboard states
  const [headers, setHeaders] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form / Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [editingHeaderId, setEditingHeaderId] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewMenu, setPreviewMenu] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    showLogo: true,
    showSiteName: true,
    showSearch: true,
    status: 'inactive',
    logoMediaId: null,
    menuId: '',
    extraSettings: {
      layout: 'edulearn',
      topStripEnabled: true,
      topStripText: 'Admissions Open 2026: Apply now for professional certification courses!',
      phone: '+1 (555) 019-2834',
      email: 'info@edulearn-academy.edu',
      menuAlign: 'center',
      socialLinksEnabled: true,
      stickyEnabled: true
    }
  });

  const canCreate = hasPermission('headers', 'create');
  const canUpdate = hasPermission('headers', 'update');
  const canDelete = hasPermission('headers', 'delete');

  const fetchHeaders = () => {
    setLoading(true);
    api.get(`/headers?page=${page}&limit=5&search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (res.data.success) {
          setHeaders(res.data.headers || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchMenus = () => {
    api.get('/menus')
      .then((res) => {
        if (res.data.success) setMenus(res.data.menus || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchHeaders();
  }, [page, search]);

  useEffect(() => {
    fetchMenus();
  }, []);

  // Update preview menu object reactively when menuId changes
  useEffect(() => {
    if (formData.menuId) {
      const activeM = menus.find(m => m.id === parseInt(formData.menuId));
      setPreviewMenu(activeM || null);
    } else {
      setPreviewMenu(null);
    }
  }, [formData.menuId, menus]);

  const handleOpenForm = (header = null) => {
    if (header) {
      setEditingHeaderId(header.id);
      setSelectedLogo(header.logoMedia || null);
      setFormData({
        name: header.name || '',
        showLogo: header.showLogo !== undefined ? header.showLogo : true,
        showSiteName: header.showSiteName !== undefined ? header.showSiteName : true,
        showSearch: header.showSearch !== undefined ? header.showSearch : true,
        status: header.status || 'inactive',
        logoMediaId: header.logoMediaId || null,
        menuId: header.menuId || '',
        extraSettings: header.extraSettings || {
          layout: 'edulearn',
          topStripEnabled: true,
          topStripText: 'Admissions Open 2026: Apply now for professional certification courses!',
          phone: '+1 (555) 019-2834',
          email: 'info@edulearn-academy.edu',
          menuAlign: 'center',
          socialLinksEnabled: true,
          stickyEnabled: true
        }
      });
    } else {
      setEditingHeaderId(null);
      setSelectedLogo(null);
      setFormData({
        name: '',
        showLogo: true,
        showSiteName: true,
        showSearch: true,
        status: 'inactive',
        logoMediaId: null,
        menuId: '',
        extraSettings: {
          layout: 'edulearn',
          topStripEnabled: true,
          topStripText: 'Admissions Open 2026: Apply now for professional certification courses!',
          phone: '+1 (555) 019-2834',
          email: 'info@edulearn-academy.edu',
          menuAlign: 'center',
          socialLinksEnabled: true,
          stickyEnabled: true
        }
      });
    }
    setFormOpen(true);
  };

  const handleMediaSelect = (media) => {
    setSelectedLogo(media);
    setFormData(prev => ({ ...prev, logoMediaId: media.id }));
  };

  const updateExtraSettings = (key, value) => {
    setFormData(prev => ({
      ...prev,
      extraSettings: {
        ...prev.extraSettings,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHeaderId) {
        await api.put(`/headers/${editingHeaderId}`, formData);
        showSuccess('Header configuration updated successfully!');
      } else {
        await api.post('/headers', formData);
        showSuccess('Header configuration created successfully!');
      }
      setFormOpen(false);
      fetchHeaders();
      refreshSettings(); // Propagate live updates in context instantly
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save header settings');
    }
  };

  const handleDeleteHeader = async (id) => {
    if (window.confirm('Are you sure you want to delete this header layout design?')) {
      try {
        await api.delete(`/headers/${id}`);
        showSuccess('Header design deleted successfully.');
        fetchHeaders();
        refreshSettings();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete header design');
      }
    }
  };

  const handleToggleStatus = async (header) => {
    try {
      await api.put(`/headers/${header.id}`, {
        ...header,
        status: header.status === 'active' ? 'inactive' : 'active'
      });
      showSuccess(`Header status set to ${header.status === 'active' ? 'inactive' : 'active'}.`);
      fetchHeaders();
      refreshSettings();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update header status');
    }
  };

  const resolvedLogoUrl = selectedLogo?.url || orgSettings?.logoMedia?.url;
  const siteTitle = orgSettings?.siteName || 'EduLearn CMS';

  return (
    <div>
      <div className="content-header">
        <h1>Header Settings & Layouts <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Multiple Layout Designs</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Headers</span>
        </div>
      </div>

      <div className="main-content">
        {!formOpen ? (
          /* Grid list view of headers */
          <div className="card card-primary card-outline">
            <div className="card-header admin-card-header-responsive">
              <h3 className="card-title">Configured Header Designs</h3>
              <div className="card-tools admin-card-header-tools">
                <input
                  type="text"
                  placeholder="Search layouts..."
                  className="form-input"
                  style={{ flex: '1 1 140px', minWidth: '120px', maxWidth: '240px', height: '32px', fontSize: '0.8rem' }}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                {canCreate && (
                  <button onClick={() => handleOpenForm()} className="btn btn-primary btn-sm">
                    <Plus size={14} />
                    <span>Create Header Design</span>
                  </button>
                )}
              </div>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#ID</th>
                      <th>Design Layout Name</th>
                      <th>Template Style</th>
                      <th>Attached Menu</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right', width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading designs...</td></tr>
                    ) : headers.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No header layouts configured. Click "Create Header Design" to start.</td></tr>
                    ) : (
                      headers.map((h) => (
                        <tr key={h.id}>
                          <td>#{h.id}</td>
                          <td style={{ fontWeight: 700 }}>{h.name}</td>
                          <td>
                            <span className="badge badge-info">{h.extraSettings?.layout || 'standard'}</span>
                          </td>
                          <td>
                            {h.menu ? (
                              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{h.menu.name}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None (Inherited standard nav)</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(h)}
                              className={`badge ${h.status === 'active' ? 'badge-success' : 'badge-secondary'}`}
                              style={{ border: 'none', cursor: 'pointer' }}
                            >
                              {h.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleOpenForm(h)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                                <Edit2 size={13} />
                              </button>
                              {canDelete && (
                                <button onClick={() => handleDeleteHeader(h.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="card-footer flex justify-between items-center">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-secondary btn-sm">Previous</button>
                <span style={{ fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
              </div>
            )}
          </div>
        ) : (
          /* Create / Edit View with Live preview side-by-side */
          <div className="admin-split-grid">
            
            {/* Left Column: Form Fields */}
            <div className="card card-primary card-outline" style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="card-header admin-card-header-responsive">
                <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: 800 }}>
                  {editingHeaderId ? 'Edit Layout Parameters' : 'Create Layout Parameters'}
                </h3>
                <button onClick={() => setFormOpen(false)} className="btn btn-secondary btn-sm" style={{ minHeight: 'auto', padding: '0.2rem 0.6rem' }}>
                  Back to List
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card-body flex flex-col gap-4">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Layout Design Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Template Layout Style</label>
                      <select
                        className="form-select"
                        value={formData.extraSettings.layout}
                        onChange={(e) => updateExtraSettings('layout', e.target.value)}
                      >
                        <option value="edulearn">EduLearn Top Strip + Nav</option>
                        <option value="standard">Standard Minimalist</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Associate Navigation Menu</label>
                      <select
                        className="form-select"
                        value={formData.menuId}
                        onChange={(e) => setFormData({ ...formData, menuId: e.target.value })}
                        style={{ border: '2px solid var(--primary)', borderRadius: '6px' }}
                      >
                        <option value="">-- Inherit Standard Pages List --</option>
                        {menus.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.location})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Header Logo */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Header Logo (Overrides default organization logo)</label>
                    <div className="flex items-center gap-3" style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ width: '60px', height: '60px', background: '#ffffff', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        {selectedLogo ? (
                          <img src={getFullMediaUrl(selectedLogo.url)} alt="Selected logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <Image size={24} color="var(--text-muted)" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                          {selectedLogo ? selectedLogo.filename : 'Inheriting default organization logo'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setMediaModalOpen(true)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', minHeight: 'auto' }}
                          >
                            Choose Custom Logo
                          </button>
                          {formData.logoMediaId && (
                            <button
                              type="button"
                              onClick={() => { setSelectedLogo(null); setFormData(prev => ({ ...prev, logoMediaId: null })); }}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', minHeight: 'auto' }}
                            >
                              Clear Custom Logo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alignment & Visibility */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Menu Items Alignment</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`btn ${formData.extraSettings.menuAlign === 'flex-start' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => updateExtraSettings('menuAlign', 'flex-start')}
                          style={{ flex: 1 }}
                        >
                          <AlignLeft size={14} />
                          <span>Left</span>
                        </button>
                        <button
                          type="button"
                          className={`btn ${formData.extraSettings.menuAlign === 'center' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => updateExtraSettings('menuAlign', 'center')}
                          style={{ flex: 1 }}
                        >
                          <AlignCenter size={14} />
                          <span>Center</span>
                        </button>
                        <button
                          type="button"
                          className={`btn ${formData.extraSettings.menuAlign === 'flex-end' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => updateExtraSettings('menuAlign', 'flex-end')}
                          style={{ flex: 1 }}
                        >
                          <AlignRight size={14} />
                          <span>Right</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.showLogo}
                          onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                        />
                        <span style={{ fontWeight: 600 }}>Show Logo</span>
                      </label>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.showSiteName}
                          onChange={(e) => setFormData({ ...formData, showSiteName: e.target.checked })}
                        />
                        <span style={{ fontWeight: 600 }}>Show Site Title</span>
                      </label>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.showSearch}
                          onChange={(e) => setFormData({ ...formData, showSearch: e.target.checked })}
                        />
                        <span style={{ fontWeight: 600 }}>Show Search</span>
                      </label>
                    </div>
                  </div>

                  {/* EduLearn Settings */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex items-center justify-between">
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>EduLearn Top Bar Strip</h4>
                      <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.extraSettings.topStripEnabled}
                          onChange={(e) => updateExtraSettings('topStripEnabled', e.target.checked)}
                        />
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Enable Top strip bar</span>
                      </label>
                    </div>

                    {formData.extraSettings.topStripEnabled && (
                      <div className="flex flex-col gap-3 animate-fade-in">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Top Strip Banner Notice Text</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.extraSettings.topStripText}
                            onChange={(e) => updateExtraSettings('topStripText', e.target.value)}
                          />
                        </div>

                        <div className="admin-form-grid-2">
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Contact Telephone</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="+1 (555) 019-2834"
                              value={formData.extraSettings.phone || ''}
                              onChange={(e) => updateExtraSettings('phone', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Contact Email Address</label>
                            <input
                              type="email"
                              className="form-input"
                              placeholder="info@college.edu"
                              value={formData.extraSettings.email || ''}
                              onChange={(e) => updateExtraSettings('email', e.target.value)}
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={formData.extraSettings.socialLinksEnabled}
                            onChange={(e) => updateExtraSettings('socialLinksEnabled', e.target.checked)}
                          />
                          <span style={{ fontWeight: 600 }}>Show Social links (Facebook, Twitter, Instagram, Linkedin)</span>
                        </label>
                      </div>
                    )}
                  </div>

                </div>

                <div className="card-footer flex justify-between">
                  <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={15} />
                    <span>Save Layout Configuration</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Visual Simulator Live Preview */}
            <div style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="card card-outline card-info" style={{ borderTopWidth: '3px' }}>
                <div className="card-header admin-card-header-responsive" style={{ padding: '0.75rem 1.25rem' }}>
                  <div className="flex items-center gap-2" style={{ fontWeight: 700, color: 'var(--info)' }}>
                    <Eye size={18} />
                    <span>Real-time Interactive Header Preview (EduLearn Canvas Sim)</span>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>Active Style: {formData.extraSettings.layout.toUpperCase()}</span>
                </div>
                
                <div className="card-body" style={{ background: '#f1f5f9', border: '1px dashed var(--border)', borderRadius: '4px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  
                  {/* Header Rendering Container */}
                  <div style={{ width: '100%', minWidth: '460px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', borderRadius: '8px 8px 0 0', overflow: 'hidden', background: '#ffffff', border: '1px solid var(--border)', borderBottom: 'none' }}>
                    
                    {/* 1. EduLearn Top Info Strip */}
                    {formData.extraSettings.topStripEnabled && (
                      <div style={{
                        background: 'var(--secondary)', 
                        color: '#ffffff', 
                        fontSize: '0.75rem', 
                        padding: '0.5rem 1rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <div className="flex items-center gap-3">
                          {formData.extraSettings.phone && (
                            <span className="flex items-center gap-1"><Phone size={10} /> {formData.extraSettings.phone}</span>
                          )}
                          {formData.extraSettings.email && (
                            <span className="flex items-center gap-1"><Mail size={10} /> {formData.extraSettings.email}</span>
                          )}
                        </div>
                        <span style={{ fontWeight: 500, opacity: 0.9 }}>{formData.extraSettings.topStripText}</span>
                        {formData.extraSettings.socialLinksEnabled && (
                          <div className="flex items-center gap-2" style={{ opacity: 0.8 }}>
                            <Facebook size={10} />
                            <Twitter size={10} />
                            <Instagram size={10} />
                            <Linkedin size={10} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Main Navigation Bar */}
                    <div style={{
                      padding: '0.75rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.98)',
                      position: 'relative'
                    }}>
                      <div className="flex items-center gap-2">
                        {formData.showLogo && resolvedLogoUrl && (
                          <img
                            src={getFullMediaUrl(resolvedLogoUrl)}
                            alt={siteTitle}
                            style={{
                              height: '40px',
                              width: 'auto',
                              borderRadius: '6px',
                              objectFit: 'contain',
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              transform: 'perspective(500px) translateZ(0)'
                            }}
                          />
                        )}
                        {formData.showSiteName && (
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                            {siteTitle}
                          </span>
                        )}
                      </div>

                      {/* Navigation Items */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1.25rem', 
                        flex: 1, 
                        justifyContent: formData.extraSettings.menuAlign,
                        padding: '0 1.5rem'
                      }}>
                        {previewMenu && previewMenu.items?.length > 0 ? (
                          previewMenu.items.map(item => (
                            <div key={item.id} className="menu-preview-item" style={{ position: 'relative', cursor: 'pointer', padding: '0.75rem 0' }}>
                              <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {item.title}
                                {((item.children?.length > 0) || item.isMegaMenu) && <ChevronDown size={10} />}
                              </span>
                              
                              {/* Submenu Dropdown */}
                              {!item.isMegaMenu && item.children?.length > 0 && (
                                <div className="menu-preview-dropdown" style={{
                                  position: 'absolute', top: '100%', left: 0, background: '#ffffff',
                                  boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', borderRadius: '6px',
                                  minWidth: '160px', zIndex: 100, padding: '0.4rem 0', display: 'none'
                                }}>
                                  {item.children.map(child => (
                                    <span key={child.id} style={{ display: 'block', padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--text-main)' }} className="hover-bg-app">
                                      {child.title}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Mega Menu Dropdown */}
                              {item.isMegaMenu && item.megaColumns?.length > 0 && (
                                <div className="menu-preview-megamenu" style={{
                                  position: 'absolute', top: '100%', left: '-50px', background: '#ffffff',
                                  boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', borderRadius: '8px',
                                  width: '380px', zIndex: 100, padding: '1rem', display: 'none'
                                }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.megaColumns.length}, 1fr)`, gap: '0.75rem' }}>
                                    {item.megaColumns.map(col => (
                                      <div key={col.id}>
                                        <h5 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.2rem', marginBottom: '0.4rem' }}>
                                          {col.title}
                                        </h5>
                                        <div className="flex flex-col gap-1">
                                          {col.links?.map(lnk => (
                                            <span key={lnk.id} style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block' }}>
                                              {lnk.title}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            (No menu selected or selected menu is empty)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {formData.showSearch && (
                          <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%', minHeight: 'auto', background: '#e2e8f0', color: '#475569', border: 'none' }}>
                            <Search size={12} />
                          </button>
                        )}
                        <button type="button" className="btn btn-primary btn-sm" style={{ minHeight: '30px', fontSize: '0.75rem', borderRadius: '4px', padding: '0 0.75rem', background: 'var(--primary)' }}>
                          <span>Enroll Now</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* High fidelity hero overlay simulation under header */}
                  <div style={{
                    height: '140px',
                    borderRadius: '0 0 8px 8px',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#ffffff',
                    padding: '1rem',
                    textAlign: 'center',
                    boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.1)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Astonishing EduLearn CMS Portal</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: '0.25rem 0 0 0' }}>Build interactive menus, custom layouts, and 3D floating header elements dynamically.</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  💡 Tip: Hover over the navigation links in the simulation to test dropdown menus and mega menu column layouts instantly!
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Header Logo Image"
      />
    </div>
  );
};

export default HeaderManager;
