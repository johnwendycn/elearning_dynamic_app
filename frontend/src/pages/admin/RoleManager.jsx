import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  ShieldCheck, Plus, Edit2, Trash2, Home, ChevronRight, 
  RefreshCw, Info, Search, ChevronLeft, ChevronRight as ChevronRightIcon,
  Check, X, Layers, Eye, Lock, Filter, CheckCircle2, Shield,
  BookOpen, Calendar, Newspaper, Mail, MessageSquare, Building2,
  Folder, Award, FileText, Film, Layout, Image, Users,
  ClipboardList, Settings, CheckSquare
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'academic', label: 'Academic & LMS' },
  { id: 'content', label: 'Content & Communication' },
  { id: 'layout', label: 'Layout & Media' },
  { id: 'system', label: 'System & Security' }
];

const RoleManager = () => {
  const { hasPermission } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk select states
  const [selectedIds, setSelectedIds] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    modulePermissions: {} // { [moduleId]: ['create', 'read', 'update', 'delete'] }
  });

  const canCreate = hasPermission('roles', 'create');
  const canUpdate = hasPermission('roles', 'update');
  const canDelete = hasPermission('roles', 'delete');

  const fetchRoles = () => {
    setLoading(true);
    api.get(`/roles?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (res.data.success) {
          setRoles(res.data.roles || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  const [modalSearch, setModalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchModules = () => {
    api.get('/modules?limit=100')
      .then((res) => {
        if (res.data.success) {
          setModules(res.data.modules || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load modules:', err);
      });
  };

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, [page, search]);

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      const modPerms = {};
      if (role.modules) {
        role.modules.forEach((m) => {
          modPerms[m.id] = m.RoleModule?.permissions || m.permissions || ['read'];
        });
      }
      setFormData({
        name: role.name || '',
        description: role.description || '',
        isActive: role.isActive !== false,
        modulePermissions: modPerms
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        isActive: true,
        modulePermissions: {}
      });
    }
    setModalSearch('');
    setCategoryFilter('all');
    setModalOpen(true);
  };

  const getModuleCategory = (code) => {
    if (['departments', 'courses', 'course_modules', 'units', 'certificates'].includes(code)) return 'academic';
    if (['events', 'news', 'pages', 'carousels', 'subscribers', 'contacts'].includes(code)) return 'content';
    if (['headers', 'footers', 'menus', 'media'].includes(code)) return 'layout';
    return 'system';
  };

  const getModuleIcon = (code) => {
    switch (code) {
      case 'departments': return <Building2 size={16} />;
      case 'courses': return <BookOpen size={16} />;
      case 'course_modules': return <Folder size={16} />;
      case 'units': return <BookOpen size={16} />;
      case 'certificates': return <Award size={16} />;
      case 'pages': return <FileText size={16} />;
      case 'carousels': return <Film size={16} />;
      case 'news': return <Newspaper size={16} />;
      case 'events': return <Calendar size={16} />;
      case 'subscribers': return <Mail size={16} />;
      case 'contacts': return <MessageSquare size={16} />;
      case 'headers':
      case 'footers': return <Layout size={16} />;
      case 'menus': return <Layers size={16} />;
      case 'media': return <Image size={16} />;
      case 'organization_settings': return <Settings size={16} />;
      case 'users': return <Users size={16} />;
      case 'roles': return <ShieldCheck size={16} />;
      case 'user_privileges': return <Shield size={16} />;
      case 'assign_roles': return <Users size={16} />;
      case 'audit_trails': return <ClipboardList size={16} />;
      default: return <Layers size={16} />;
    }
  };

  // Toggle whole module visibility (defaults to ['read'] if turned on, or deletes if turned off)
  const toggleModuleVisibility = (moduleId) => {
    setFormData((prev) => {
      const current = prev.modulePermissions[moduleId] || [];
      if (current.length > 0) {
        const nextPerms = { ...prev.modulePermissions };
        delete nextPerms[moduleId];
        return { ...prev, modulePermissions: nextPerms };
      }
      return {
        ...prev,
        modulePermissions: {
          ...prev.modulePermissions,
          [moduleId]: ['read']
        }
      };
    });
  };

  // Toggle all actions for a specific module
  const toggleModuleAllActions = (mod) => {
    const moduleId = mod.id;
    const allowedForMod = mod.permissions && mod.permissions.length > 0
      ? mod.permissions
      : ['create', 'read', 'update', 'delete'];

    setFormData((prev) => {
      const current = prev.modulePermissions[moduleId] || [];
      const hasAll = allowedForMod.every((act) => current.includes(act));

      const nextPerms = { ...prev.modulePermissions };
      if (hasAll) {
        delete nextPerms[moduleId];
      } else {
        nextPerms[moduleId] = allowedForMod;
      }
      return { ...prev, modulePermissions: nextPerms };
    });
  };

  // Set specific preset for a single module
  const setModulePreset = (mod, preset) => {
    const moduleId = mod.id;
    setFormData((prev) => {
      const nextPerms = { ...prev.modulePermissions };
      if (preset === 'none') {
        delete nextPerms[moduleId];
      } else if (preset === 'read') {
        nextPerms[moduleId] = ['read'];
      } else if (preset === 'full') {
        nextPerms[moduleId] = mod.permissions && mod.permissions.length > 0
          ? mod.permissions
          : ['create', 'read', 'update', 'delete'];
      }
      return { ...prev, modulePermissions: nextPerms };
    });
  };

  // Bulk select all modules (either full CRUD, read-only, or none)
  const handleSelectAllModules = (mode = 'full') => {
    const nextPerms = {};
    modules.forEach((m) => {
      const allowed = m.permissions && m.permissions.length > 0
        ? m.permissions
        : ['create', 'read', 'update', 'delete'];

      if (mode === 'full') {
        nextPerms[m.id] = allowed;
      } else if (mode === 'read') {
        nextPerms[m.id] = ['read'];
      }
    });
    setFormData((prev) => ({ ...prev, modulePermissions: nextPerms }));
  };

  const handleDeselectAllModules = () => {
    setFormData((prev) => ({ ...prev, modulePermissions: {} }));
  };

  const togglePermission = (moduleId, action) => {
    setFormData((prev) => {
      const current = prev.modulePermissions[moduleId] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      const nextPerms = { ...prev.modulePermissions };
      if (updated.length === 0) {
        delete nextPerms[moduleId];
      } else {
        nextPerms[moduleId] = updated;
      }

      return {
        ...prev,
        modulePermissions: nextPerms
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const modulesPayload = Object.entries(formData.modulePermissions)
        .filter(([_, actions]) => Array.isArray(actions) && actions.length > 0)
        .map(([modId, actions]) => ({
          moduleId: parseInt(modId, 10),
          permissions: actions
        }));

      let roleId;
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          modules: modulesPayload
        });
        roleId = editingRole.id;
      } else {
        const res = await api.post('/roles', {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          modules: modulesPayload
        });
        roleId = res.data.data?.id || res.data?.id;
      }

      // Sync via dedicated role modules endpoint to ensure complete database persistence
      if (roleId) {
        try {
          await api.post(`/roles/${roleId}/modules`, {
            modules: modulesPayload
          });
        } catch (syncErr) {
          console.warn('Direct role-modules sync notice:', syncErr);
        }
      }

      setModalOpen(false);
      fetchRoles();
      showSuccess(editingRole ? `Role "${formData.name}" updated successfully!` : `Role "${formData.name}" created successfully!`);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this role? Users assigned to this role will lose its permissions.')) {
      try {
        await api.delete(`/roles/${id}`);
        fetchRoles();
        showSuccess('Role deleted successfully');
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete role');
      }
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === roles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(roles.map((r) => r.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected role(s)?`)) {
      try {
        await api.post('/roles/bulk-delete', { ids: selectedIds });
        setSelectedIds([]);
        fetchRoles();
        showSuccess(`${selectedIds.length} roles deleted successfully`);
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to execute bulk delete');
      }
    }
  };

  const selectedModulesCount = useMemo(() => {
    return Object.values(formData.modulePermissions).filter(
      (acts) => Array.isArray(acts) && acts.length > 0
    ).length;
  }, [formData.modulePermissions]);

  const totalActionsCount = useMemo(() => {
    return Object.values(formData.modulePermissions).reduce(
      (acc, acts) => acc + (Array.isArray(acts) ? acts.length : 0), 0
    );
  }, [formData.modulePermissions]);

  return (
    <div>
      {/* Content Header */}
      <div className="content-header">
        <h1>
          Roles &amp; Privileges{' '}
          <small style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            Role-Based Access Control &amp; Application Functions
          </small>
        </h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Roles</span>
        </div>
      </div>

      <div className="main-content">
        {/* RBAC Guide Alert */}
        <div className="card card-outline card-info" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>Role Permissions &amp; Explicit Function Selection</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0 }}>
              Roles define access matrices across all application areas. You can explicitly select modules and individual functions (<strong>Create, Read / View, Update, Delete</strong>) per role. Enabling <code>Read</code> makes the module visible in the navigation sidebar, while disabling it hides the feature entirely.
            </p>
          </div>
        </div>

        {/* Roles Table Card */}
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              <span>Configured System Roles</span>
            </h3>

            {/* Responsive Actions Toolbar */}
            <div className="card-tools">
              {/* Search Control */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '160px', flex: '1 1 auto' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="form-input"
                  style={{ paddingLeft: '32px', minHeight: '34px', width: '100%' }}
                />
              </div>

              {/* Bulk Delete Button */}
              {selectedIds.length > 0 && canDelete && (
                <button onClick={handleBulkDelete} className="btn btn-danger btn-sm" style={{ minHeight: '34px' }}>
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}

              <button onClick={fetchRoles} className="btn btn-secondary btn-sm" style={{ minHeight: '34px' }} title="Refresh list">
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
              
              {canCreate && (
                <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm" style={{ minHeight: '34px' }}>
                  <Plus size={14} />
                  <span>Create Role</span>
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
                        checked={roles.length > 0 && selectedIds.length === roles.length} 
                        onChange={handleSelectAll} 
                        style={{ cursor: 'pointer' }}
                        aria-label="Select all roles"
                      />
                    </th>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Attached Modules</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', width: '110px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading system roles...' : 'No system roles found.'}
                      </td>
                    </tr>
                  ) : (
                    roles.map((r) => (
                      <tr key={r.id}>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(r.id)} 
                            onChange={() => handleSelectRow(r.id)} 
                            style={{ cursor: 'pointer' }}
                            aria-label={`Select role ${r.name}`}
                          />
                        </td>
                        <td>#{r.id}</td>
                        <td style={{ fontWeight: 700 }}>{r.name}</td>
                        <td style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
                          {r.description || 'No description provided.'}
                        </td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
                            {r.modules?.length || 0} of {modules.length} modules
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${r.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                            {r.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1">
                            {canUpdate && (
                              <button 
                                onClick={() => handleOpenModal(r)} 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '0.3rem 0.5rem' }}
                                title="Edit Role & Permissions"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => handleDelete(r.id)} 
                                className="btn btn-danger btn-sm" 
                                style={{ padding: '0.3rem 0.5rem' }}
                                title="Delete Role"
                              >
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
              <div className="card-footer">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} roles total)
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

      {/* Role Creation / Editing Modal */}
      {modalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.65)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1060, 
            padding: '1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div 
            className="card animate-fade-in" 
            style={{ 
              width: '100%', 
              maxWidth: '840px', 
              maxHeight: '92vh', 
              display: 'flex', 
              flexDirection: 'column',
              padding: 0,
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                padding: '1.1rem 1.5rem', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'var(--bg-surface)'
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                  <span>{editingRole ? `Edit Role: ${editingRole.name}` : 'Create New System Role'}</span>
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Configure role details and explicitly assign module functions and privileges.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem', borderRadius: '50%', minHeight: 'auto' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              <form id="roleForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Role Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Content Editor, Academic Registrar"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>Role Status</label>
                    <select
                      className="form-select"
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">Active (Permitted to sign in &amp; use)</option>
                      <option value="inactive">Inactive (Disabled / Suspended)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Role Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Briefly state the responsibilities and scope of this role..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Permissions Section Header & Summary */}
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="form-label" style={{ marginBottom: 0, fontWeight: 800, fontSize: '1rem' }}>
                          Application Modules &amp; Functions Matrix
                        </label>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {selectedModulesCount} / {modules.length} modules visible
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          {totalActionsCount} permissions granted
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        Explicitly check which modules and functional capabilities (CRUD) are granted for this role.
                      </p>
                    </div>

                    {/* Global Bulk Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSelectAllModules('full')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', fontWeight: 600 }}
                        title="Grant full CRUD on all modules"
                      >
                        <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} />
                        <span>All (Full CRUD)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAllModules('read')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', fontWeight: 600 }}
                        title="Make all modules visible (read-only)"
                      >
                        <Eye size={13} style={{ color: '#10b981' }} />
                        <span>All Visible (Read Only)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllModules}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', fontWeight: 600 }}
                        title="Clear all permissions"
                      >
                        <X size={13} style={{ color: '#ef4444' }} />
                        <span>Clear All</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.5rem', 
                      marginBottom: '0.75rem', 
                      background: 'var(--bg-app)', 
                      padding: '0.65rem', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border)' 
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Filter modules by name, keyword, or function (e.g. course, event, user)..."
                          value={modalSearch}
                          onChange={(e) => setModalSearch(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '0.4rem 0.65rem 0.4rem 2rem', minHeight: '34px' }}
                        />
                      </div>
                      {modalSearch && (
                        <button
                          type="button"
                          onClick={() => setModalSearch('')}
                          className="btn btn-secondary btn-sm"
                          style={{ minHeight: '34px', padding: '0 0.65rem', fontSize: '0.75rem' }}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
                      {CATEGORIES.map((cat) => {
                        const count = cat.id === 'all' 
                          ? modules.length 
                          : modules.filter((m) => getModuleCategory(m.code) === cat.id).length;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`btn btn-sm ${categoryFilter === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '0.25rem 0.65rem', 
                              borderRadius: '999px', 
                              whiteSpace: 'nowrap',
                              fontWeight: categoryFilter === cat.id ? 700 : 500
                            }}
                          >
                            {cat.label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modules List Container */}
                  <div 
                    style={{ 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px', 
                      padding: '0.5rem', 
                      maxHeight: '400px', 
                      overflowY: 'auto', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.65rem' 
                    }}
                  >
                    {modules
                      .filter((m) => {
                        const matchesSearch = !modalSearch || 
                          m.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
                          m.code.toLowerCase().includes(modalSearch.toLowerCase()) ||
                          (m.description && m.description.toLowerCase().includes(modalSearch.toLowerCase()));
                        if (!matchesSearch) return false;
                        if (categoryFilter === 'all') return true;
                        return getModuleCategory(m.code) === categoryFilter;
                      })
                      .map((m) => {
                        const currentActions = formData.modulePermissions[m.id] || [];
                        const isVisible = currentActions.length > 0;
                        const allowedActions = m.permissions && m.permissions.length > 0
                          ? m.permissions
                          : ['create', 'read', 'update', 'delete'];
                        const hasAll = allowedActions.every((act) => currentActions.includes(act));
                        const isReadOnly = currentActions.length === 1 && currentActions[0] === 'read';

                        return (
                          <div
                            key={m.id}
                            style={{
                              border: isVisible ? '1px solid var(--primary)' : '1px solid var(--border)',
                              background: isVisible ? 'rgba(0, 123, 255, 0.04)' : 'var(--bg-app)',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Module Header & Master Toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.55rem',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  margin: 0,
                                  minWidth: 0,
                                  flex: 1
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isVisible}
                                  onChange={() => toggleModuleVisibility(m.id)}
                                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }}
                                />
                                <div style={{ minWidth: 0 }}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span style={{ color: isVisible ? 'var(--primary)' : 'var(--text-muted)' }}>
                                      {getModuleIcon(m.code)}
                                    </span>
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isVisible ? 'var(--primary)' : 'var(--text-main)' }}>
                                      {m.name}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                      ({m.code})
                                    </span>
                                    {isVisible ? (
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          padding: '0.1rem 0.45rem',
                                          borderRadius: '4px',
                                          background: 'rgba(16, 185, 129, 0.15)',
                                          color: '#10b981',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}
                                      >
                                        <Eye size={10} /> Active ({currentActions.length} actions)
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          padding: '0.1rem 0.45rem',
                                          borderRadius: '4px',
                                          background: 'rgba(148, 163, 184, 0.12)',
                                          color: 'var(--text-muted)',
                                          fontWeight: 600,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}
                                      >
                                        <Lock size={10} /> Hidden
                                      </span>
                                    )}
                                  </div>
                                  {m.description && (
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                      {m.description}
                                    </p>
                                  )}
                                </div>
                              </label>

                              {/* Quick Module-Level Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0" style={{ paddingLeft: '1.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setModulePreset(m, hasAll ? 'none' : 'full')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ 
                                    fontSize: '0.7rem', 
                                    padding: '0.18rem 0.45rem', 
                                    borderRadius: '4px',
                                    background: hasAll ? 'rgba(0, 123, 255, 0.15)' : undefined,
                                    borderColor: hasAll ? 'var(--primary)' : undefined
                                  }}
                                  title="Toggle all CRUD functions"
                                >
                                  <span>{hasAll ? 'Clear' : 'All CRUD'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setModulePreset(m, isReadOnly ? 'none' : 'read')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ 
                                    fontSize: '0.7rem', 
                                    padding: '0.18rem 0.45rem', 
                                    borderRadius: '4px',
                                    background: isReadOnly ? 'rgba(16, 185, 129, 0.15)' : undefined,
                                    borderColor: isReadOnly ? '#10b981' : undefined
                                  }}
                                  title="Set Read-Only access"
                                >
                                  <span>View Only</span>
                                </button>
                              </div>
                            </div>

                            {/* Explicit Functional Actions Checkboxes */}
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem 1.25rem',
                                paddingLeft: '1.65rem',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                paddingTop: '0.45rem'
                              }}
                            >
                              {allowedActions.map((act) => {
                                const isChecked = currentActions.includes(act);
                                let actLabel = act;
                                let actDesc = '';
                                if (act === 'read') {
                                  actLabel = 'Read / View';
                                  actDesc = '(Browse & view records)';
                                } else if (act === 'create') {
                                  actLabel = 'Create';
                                  actDesc = '(Add new items)';
                                } else if (act === 'update') {
                                  actLabel = 'Update / Edit';
                                  actDesc = '(Modify data & settings)';
                                } else if (act === 'delete') {
                                  actLabel = 'Delete';
                                  actDesc = '(Remove records)';
                                }

                                return (
                                  <label
                                    key={act}
                                    style={{
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      userSelect: 'none',
                                      color: isChecked ? 'var(--text-main)' : 'var(--text-muted)'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermission(m.id, act)}
                                      style={{
                                        width: '15px',
                                        height: '15px',
                                        cursor: 'pointer',
                                        accentColor: act === 'read' ? '#10b981' : (act === 'delete' ? '#ef4444' : 'var(--primary)')
                                      }}
                                    />
                                    <span style={{ fontWeight: isChecked ? 700 : 500 }}>
                                      {actLabel}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                      {actDesc}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div 
              style={{ 
                padding: '0.85rem 1.5rem', 
                borderTop: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end', 
                gap: '0.75rem',
                background: 'var(--bg-surface)'
              }}
            >
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                className="btn btn-secondary btn-sm" 
                style={{ minWidth: '90px', minHeight: '36px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="roleForm" 
                className="btn btn-primary btn-sm" 
                style={{ minWidth: '120px', minHeight: '36px', fontWeight: 700 }}
              >
                <Check size={15} />
                <span>{editingRole ? 'Save Changes' : 'Create Role'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
