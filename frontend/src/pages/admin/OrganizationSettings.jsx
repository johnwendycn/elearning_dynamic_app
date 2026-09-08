



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrgSettings } from '../../context/OrgSettingsContext';
import { 
  Building, Save, Home, ChevronRight, Search, Plus, Edit2, 
  Trash2, Info, RefreshCw, ChevronLeft, ChevronRight as ChevronRightIcon,
  Check, Image, File, Palette
} from 'lucide-react';
import api from '../../services/api';
import MediaSelectorModal from './MediaSelectorModal';

const OrganizationSettings = () => {
  const { hasPermission } = useAuth();
  const { refreshSettings } = useOrgSettings();
  
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  
  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk select states
  const [selectedIds, setSelectedIds] = useState([]);

  // Media selector trigger state
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState(null); // 'logo' or 'favicon'

  // Selected media object previews
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedFavicon, setSelectedFavicon] = useState(null);

  const [formData, setFormData] = useState({
    siteName: '',
    siteTagline: '',
    phone: '',
    email: '',
    address: '',
    copyrightText: '',
    status: 'active',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e3a8a',
    theme: 'light',
    logoMediaId: null,
    faviconMediaId: null
  });

  const canCreate = hasPermission('organization_settings', 'create');
  const canUpdate = hasPermission('organization_settings', 'update');
  const canDelete = hasPermission('organization_settings', 'delete');

  const fetchSettings = () => {
    setLoading(true);
    api.get(`/organization-settings?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (res.data.success) {
          setSettings(res.data.settings || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, [page, search]);

  const handleOpenModal = (setting = null) => {
    if (setting) {
      setEditingSetting(setting);
      setSelectedLogo(setting.logoMedia || null);
      setSelectedFavicon(setting.faviconMedia || null);
      setFormData({
        siteName: setting.siteName || '',
        siteTagline: setting.siteTagline || '',
        phone: setting.phone || '',
        email: setting.email || '',
        address: setting.address || '',
        copyrightText: setting.copyrightText || '',
        status: setting.status || 'active',
        primaryColor: setting.primaryColor || '#3b82f6',
        secondaryColor: setting.secondaryColor || '#1e3a8a',
        theme: setting.theme || 'light',
        logoMediaId: setting.logoMediaId || null,
        faviconMediaId: setting.faviconMediaId || null
      });
    } else {
      setEditingSetting(null);
      setSelectedLogo(null);
      setSelectedFavicon(null);
      setFormData({
        siteName: '',
        siteTagline: '',
        phone: '',
        email: '',
        address: '',
        copyrightText: '',
        status: 'active',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e3a8a',
        theme: 'light',
        logoMediaId: null,
        faviconMediaId: null
      });
    }
    setModalOpen(true);
  };

  const handleMediaSelect = (media) => {
    if (selectingTarget === 'logo') {
      setSelectedLogo(media);
      setFormData(prev => ({ ...prev, logoMediaId: media.id }));
    } else if (selectingTarget === 'favicon') {
      setSelectedFavicon(media);
      setFormData(prev => ({ ...prev, faviconMediaId: media.id }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSetting) {
        await api.put(`/organization-settings/${editingSetting.id}`, formData);
      } else {
        await api.post('/organization-settings', formData);
      }
      setModalOpen(false);
      fetchSettings();
      // Notify the dynamic layout context to refresh and show updates instantly
      refreshSettings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save settings');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this setting profile?')) {
      try {
        await api.delete(`/organization-settings/${id}`);
        fetchSettings();
        refreshSettings();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete setting profile');
      }
    }
  };

  // Bulk selection handlers
  const handleSelectRow = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === settings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(settings.map((s) => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected setting profile(s)?`)) {
      try {
        await api.post('/organization-settings/bulk-delete', { ids: selectedIds });
        setSelectedIds([]);
        fetchSettings();
        refreshSettings();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to execute bulk delete');
      }
    }
  };

  return (
    <div>
      <div className="content-header">
        <h1>Organization Settings <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Dynamic Branding & Config Profile</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Organization Settings</span>
        </div>
      </div>

      <div className="main-content">
        {/* Instructions Panel */}
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>Multi-Profile Branding & Settings Guide</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              Create and manage different site settings profiles. You can change themes, colors, contact details, site titles, logos, and favicons.
            </p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Dynamic Propagation:</strong> Setting a profile status to <code>active</code> instantly pushes changes (logo, page title, favicon, color codes) in real-time across the client application.</li>
              <li><strong>Real-Time Color Themes:</strong> The primary and secondary colors set in the active profile dynamically change UI accents without any page reloads.</li>
              <li><strong>Logo & Favicon Selector:</strong> Choose images from your media library. They instantly update on the website header, footer, and browser tab.</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          <div className="card-header flex-col md:flex-row gap-3 items-stretch md:items-center">
            <h3 className="card-title">Configured Setting Profiles</h3>
            <div className="flex flex-wrap items-center gap-2" style={{ marginLeft: 'auto' }}>
              {/* Search Control */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="form-input"
                  style={{ paddingLeft: '32px', minHeight: '34px', width: '200px' }}
                />
              </div>

              {/* Bulk Delete Button */}
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}

              <button onClick={fetchSettings} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }}>
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
              
              {canCreate && (
                <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} />
                  <span>Create Settings Profile</span>
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
                      <input 
                        type="checkbox" 
                        checked={settings.length > 0 && selectedIds.length === settings.length} 
                        onChange={handleSelectAll} 
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Site Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Branding Colors</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Fetching settings data...' : 'No settings profiles found.'}
                      </td>
                    </tr>
                  ) : (
                    settings.map((s) => (
                      <tr key={s.id}>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(s.id)} 
                            onChange={() => handleSelectRow(s.id)} 
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td>#{s.id}</td>
                        <td style={{ fontWeight: 700 }}>{s.siteName}</td>
                        <td>{s.email || '-'}</td>
                        <td>{s.phone || '-'}</td>
                        <td>
                          <div className="flex gap-2">
                            <span className="badge" style={{ background: s.primaryColor || '#3b82f6', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              Primary: {s.primaryColor}
                            </span>
                            <span className="badge" style={{ background: s.secondaryColor || '#1e3a8a', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              Secondary: {s.secondaryColor}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {s.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1">
                            {canUpdate && (
                              <button onClick={() => handleOpenModal(s)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem', minHeight: 'auto' }} title="Edit profile">
                                <Edit2 size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem', minHeight: 'auto' }} title="Delete profile">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> profiles)
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setPage((p) => Math.max(p - 1, 1))} 
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>
                  <button 
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))} 
                    disabled={page === totalPages}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    <span>Next</span>
                    <ChevronRightIcon size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '750px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editingSetting ? `Edit Settings Profile: ${editingSetting.siteName}` : 'Create Settings Profile'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Site / Business Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Site Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.siteTagline}
                    onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Physical Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Copyright Notice Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.copyrightText}
                    onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                  />
                </div>
              </div>

              {/* Theme Settings and Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Theme Mode</label>
                  <select
                    className="form-select"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Profile Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active (Default Brand)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Real-Time Colors</label>
                  <div className="flex gap-2 align-center" style={{ height: '38px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', width: '28px', height: '28px' }}
                        title="Primary Color Theme"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', width: '28px', height: '28px' }}
                        title="Secondary Color Theme"
                      />
                    </div>
                    <Palette size={20} color="var(--text-muted)" style={{ alignSelf: 'center', marginLeft: '5px' }} />
                  </div>
                </div>
              </div>

              {/* Logo and Favicon Asset Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                {/* Logo Selector */}
                <div>
                  <label className="form-label">Organization Logo</label>
                  <div className="flex items-center gap-3" style={{ background: 'var(--bg-app)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '50px', height: '50px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedLogo ? (
                        <img src={selectedLogo.url.startsWith('http') ? selectedLogo.url : `http://localhost:5000${selectedLogo.url}`} alt="Selected logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Image size={20} color="var(--text-muted)" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                        {selectedLogo ? selectedLogo.filename : 'No logo selected'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSelectingTarget('logo'); setMediaModalOpen(true); }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', minHeight: 'auto' }}
                      >
                        Change Logo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Favicon Selector */}
                <div>
                  <label className="form-label">Tab Favicon</label>
                  <div className="flex items-center gap-3" style={{ background: 'var(--bg-app)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '50px', height: '50px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedFavicon ? (
                        <img src={selectedFavicon.url.startsWith('http') ? selectedFavicon.url : `http://localhost:5000${selectedFavicon.url}`} alt="Selected favicon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Image size={20} color="var(--text-muted)" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                        {selectedFavicon ? selectedFavicon.filename : 'No favicon selected'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setSelectingTarget('favicon'); setMediaModalOpen(true); }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', minHeight: 'auto' }}
                      >
                        Change Favicon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm" style={{ minWidth: '80px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: '120px' }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        title={selectingTarget === 'logo' ? "Select Corporate Logo Image" : "Select Browser Tab Favicon"}
      />
    </div>
  );
};

export default OrganizationSettings;
