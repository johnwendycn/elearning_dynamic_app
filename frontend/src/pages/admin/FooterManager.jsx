import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  Plus, Edit2, Trash2, Eye, Search, AlertCircle, Save, 
  Settings, Layout, Facebook, Twitter, Instagram, Linkedin, Globe, Check, RefreshCw
} from 'lucide-react';
import api from '../../services/api';

const FooterManager = () => {
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [footers, setFooters] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [editingFooterId, setEditingFooterId] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    copyrightText: '',
    status: 'inactive',
    columns: [
      { header: 'About Us', type: 'html', content: '<p>Core CMS is a modern content management framework built with high Separations of Concerns.</p>' },
      { header: 'Quick Links', type: 'menu', menuId: '' },
      { header: 'Contact details', type: 'contact' }
    ],
    extraSettings: {
      bgStyle: 'light', // light vs dark
      phone: '',
      email: '',
      address: '',
      socials: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      }
    }
  });

  const canCreate = hasPermission('organization', 'create');
  const canUpdate = hasPermission('organization', 'update');
  const canDelete = hasPermission('organization', 'delete');

  const fetchFooters = () => {
    setLoading(true);
    api.get(`/footers?page=${page}&limit=5&search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (res.data.success) {
          setFooters(res.data.footers || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchMenus = () => {
    api.get('/menus?limit=100')
      .then((res) => {
        if (res.data.success) {
          setMenus(res.data.menus || []);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchFooters();
  }, [page, search]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenForm = (footer = null) => {
    if (footer) {
      setEditingFooterId(footer.id);
      setFormData({
        name: footer.name || '',
        copyrightText: footer.copyrightText || '',
        status: footer.status || 'inactive',
        columns: footer.columns || [],
        extraSettings: footer.extraSettings || {
          bgStyle: 'light',
          phone: '',
          email: '',
          address: '',
          socials: { facebook: '', twitter: '', instagram: '', linkedin: '' }
        }
      });
    } else {
      setEditingFooterId(null);
      setFormData({
        name: '',
        copyrightText: '',
        status: 'inactive',
        columns: [
          { header: 'About Us', type: 'html', content: '<p>Core CMS is a modern content management framework built with high Separations of Concerns.</p>' },
          { header: 'Quick Links', type: 'menu', menuId: '' },
          { header: 'Contact details', type: 'contact' }
        ],
        extraSettings: {
          bgStyle: 'light',
          phone: '',
          email: '',
          address: '',
          socials: { facebook: '', twitter: '', instagram: '', linkedin: '' }
        }
      });
    }
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map column menu IDs to foreign keys for relationship resolution on save
      const payload = {
        ...formData,
        column1_menu_id: formData.columns[0]?.type === 'menu' ? formData.columns[0].menuId || null : null,
        column2_menu_id: formData.columns[1]?.type === 'menu' ? formData.columns[1].menuId || null : null,
        column3_menu_id: formData.columns[2]?.type === 'menu' ? formData.columns[2].menuId || null : null,
        column4_menu_id: formData.columns[3]?.type === 'menu' ? formData.columns[3].menuId || null : null
      };

      if (editingFooterId) {
        await api.put(`/footers/${editingFooterId}`, payload);
        showSuccess('Footer configuration updated successfully!');
      } else {
        await api.post('/footers', payload);
        showSuccess('Footer configuration created successfully!');
      }
      setFormOpen(false);
      fetchFooters();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save footer layout');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/footers/${id}`, { status: nextStatus });
      showSuccess(`Footer status set to ${nextStatus}.`);
      fetchFooters();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this footer configuration?')) {
      try {
        await api.delete(`/footers/${id}`);
        showSuccess('Footer configuration deleted successfully.');
        fetchFooters();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete footer');
      }
    }
  };

  // Helper functions for column editor
  const addColumn = () => {
    if (formData.columns.length >= 4) return;
    setFormData(prev => ({
      ...prev,
      columns: [...prev.columns, { header: 'New Column', type: 'html', content: 'HTML content' }]
    }));
  };

  const removeColumn = (index) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };

  const updateColumn = (index, fields) => {
    setFormData(prev => {
      const cols = [...prev.columns];
      cols[index] = { ...cols[index], ...fields };
      return { ...prev, columns: cols };
    });
  };

  const updateSocial = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      extraSettings: {
        ...prev.extraSettings,
        socials: {
          ...prev.extraSettings.socials,
          [platform]: value
        }
      }
    }));
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-bar">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Footers Layouts Designer</h1>
          <p style={{ color: 'var(--text-muted)' }}>Dynamically build multi-column website footers, map menus, insert widgets, and write custom copyright statements</p>
        </div>

        {canCreate && (
          <div className="admin-header-actions">
            <button onClick={() => handleOpenForm()} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Create Footer Configuration</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid Dashboard view */}
      <div className="admin-split-grid">
        
        {/* Left Side: Layout Configurations List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, maxWidth: '100%' }}>
          
          {/* Search Filter */}
          <div className="card" style={{ padding: '0.75rem 1rem' }}>
            <div className="flex items-center gap-2">
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                className="form-input"
                style={{ border: 'none', background: 'transparent', padding: 0 }}
                placeholder="Search footers by name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Theme Style</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Loading footers...</td>
                  </tr>
                ) : footers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No footer configurations available.</td>
                  </tr>
                ) : (
                  footers.map((foot) => (
                    <tr key={foot.id}>
                      <td style={{ fontWeight: 600 }}>{foot.name}</td>
                      <td>
                        <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                          {foot.extraSettings?.bgStyle || 'Light'} theme
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(foot.id, foot.status)}
                          className={`badge ${foot.status === 'active' ? 'badge-success' : 'badge-neutral'}`}
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          {foot.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-action-btn-group">
                          {canUpdate && (
                            <button onClick={() => handleOpenForm(foot)} className="btn btn-secondary btn-sm" title="Edit" style={{ padding: '0.2rem 0.45rem' }}>
                              <Edit2 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(foot.id)} className="btn btn-danger btn-sm" title="Delete" style={{ padding: '0.2rem 0.45rem' }}>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center card" style={{ padding: '0.75rem 1rem' }}>
              <button disabled={page === 1} className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(p - 1, 1))}>Prev</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))}>Next</button>
            </div>
          )}
        </div>

        {/* Right Side: Setup Editor Modal / Visual Workspace Form */}
        {formOpen ? (
          <div className="card animate-fade-in" style={{ padding: '1.5rem', maxWidth: '100%', minWidth: 0 }}>
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }} className="flex items-center gap-2">
                <Settings size={18} color="var(--primary)" />
                <span>{editingFooterId ? 'Edit Footer Config' : 'Design Dynamic Footer'}</span>
              </h2>
              <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary btn-xs">Cancel</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Layout Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Default EduLearn Footer"
                />
              </div>

              <div className="admin-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Active Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active (Set as main footer)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Theme Background Style</label>
                  <select
                    className="form-select"
                    value={formData.extraSettings.bgStyle}
                    onChange={(e) => setFormData({
                      ...formData,
                      extraSettings: { ...formData.extraSettings, bgStyle: e.target.value }
                    })}
                  >
                    <option value="light">Light Theme Mode</option>
                    <option value="dark">Sleek Dark Mode (#0F172A)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Copyright text label</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.copyrightText}
                  onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                  placeholder="e.g. © 2026 EduLearn Hub. All rights reserved."
                />
              </div>

              {/* Contact Information widgets */}
              <div className="card" style={{ padding: '1rem', background: 'var(--bg-app)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>Footer Contact Block details</h4>
                <div className="admin-form-grid-2">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contact Email"
                    value={formData.extraSettings.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      extraSettings: { ...formData.extraSettings, email: e.target.value }
                    })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contact Phone"
                    value={formData.extraSettings.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      extraSettings: { ...formData.extraSettings, phone: e.target.value }
                    })}
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Physical Address"
                  style={{ marginTop: '0.5rem' }}
                  value={formData.extraSettings.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    extraSettings: { ...formData.extraSettings, address: e.target.value }
                  })}
                />
                
                {/* Social media inputs */}
                <div className="admin-form-grid-2" style={{ marginTop: '0.75rem' }}>
                  <input type="text" className="form-input" placeholder="Facebook Link URL" value={formData.extraSettings.socials.facebook} onChange={(e) => updateSocial('facebook', e.target.value)} style={{ fontSize: '0.75rem' }} />
                  <input type="text" className="form-input" placeholder="Twitter Link URL" value={formData.extraSettings.socials.twitter} onChange={(e) => updateSocial('twitter', e.target.value)} style={{ fontSize: '0.75rem' }} />
                  <input type="text" className="form-input" placeholder="Instagram Link URL" value={formData.extraSettings.socials.instagram} onChange={(e) => updateSocial('instagram', e.target.value)} style={{ fontSize: '0.75rem' }} />
                  <input type="text" className="form-input" placeholder="LinkedIn Link URL" value={formData.extraSettings.socials.linkedin} onChange={(e) => updateSocial('linkedin', e.target.value)} style={{ fontSize: '0.75rem' }} />
                </div>
              </div>

              {/* Dynamic Column Builder */}
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>Column widgets list ({formData.columns.length}/4)</h4>
                  {formData.columns.length < 4 && (
                    <button type="button" onClick={addColumn} className="btn btn-secondary btn-xs">+ Add Col</button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {formData.columns.map((col, cIdx) => (
                    <div key={cIdx} style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', position: 'relative' }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Column #{cIdx + 1}</span>
                        <button type="button" onClick={() => removeColumn(cIdx)} className="btn btn-danger btn-xs" style={{ padding: '1px 3px' }}>Remove</button>
                      </div>
                      <div className="admin-form-grid-2" style={{ marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Header Title"
                          value={col.header}
                          onChange={(e) => updateColumn(cIdx, { header: e.target.value })}
                          style={{ fontSize: '0.8rem' }}
                        />
                        <select
                          className="form-select"
                          value={col.type}
                          onChange={(e) => updateColumn(cIdx, { type: e.target.value })}
                          style={{ fontSize: '0.8rem' }}
                        >
                          <option value="html">HTML content</option>
                          <option value="menu">Linked Menu Links</option>
                          <option value="contact">Contact & Social block</option>
                        </select>
                      </div>

                      {col.type === 'html' && (
                        <textarea
                          className="form-textarea"
                          rows={2}
                          value={col.content || ''}
                          onChange={(e) => updateColumn(cIdx, { content: e.target.value })}
                          placeholder="HTML or paragraph text content..."
                          style={{ fontSize: '0.75rem' }}
                        />
                      )}

                      {col.type === 'menu' && (
                        <select
                          className="form-select"
                          value={col.menuId || ''}
                          onChange={(e) => updateColumn(cIdx, { menuId: e.target.value })}
                          style={{ fontSize: '0.75rem', padding: '0.2rem' }}
                        >
                          <option value="">Select Created Menu...</option>
                          {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} />
                <span>Save Footer Layout</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="card flex flex-col justify-center items-center text-center animate-fade-in" style={{ padding: '4rem 2rem', minHeight: '400px' }}>
            <Layout size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Visual footer workspace is idle</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '320px', fontSize: '0.9rem', margin: 0 }}>Select a layout profile to edit or click the top-right button to design a new footer config.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default FooterManager;
