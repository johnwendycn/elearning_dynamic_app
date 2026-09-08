import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Shield, Save, ChevronRight, Home, Info, 
  X, Check, Lock, CheckCircle, AlertTriangle, RefreshCw,
  Search, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const UserPrivilegeOverrides = () => {
  const { hasPermission } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modules, setModules] = useState([]);
  
  // Search & Pagination states for User selection sidebar
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Custom privileges configured for selected user
  // Format from DB: Array of { moduleId, isAllowed, allowedActions: [...], deniedActions: [...] }
  const [overrides, setOverrides] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const canUpdate = hasPermission('users', 'update');

  // Load active users list
  const fetchUsers = async () => {
    try {
      const res = await api.get(`/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load modules
  const fetchModules = async () => {
    try {
      const res = await api.get('/modules?limit=100');
      if (res.data.success) {
        setModules(res.data.modules || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // Fetch overrides when a user is selected
  const handleSelectUser = async (user) => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      // Fetch complete user object (with roles and role modules nested)
      const userRes = await api.get(`/users/${user.id}`);
      const fullUser = userRes.data.success ? userRes.data.data : user;
      setSelectedUser(fullUser);

      const res = await api.get(`/user-module-permissions/user/${user.id}`);
      if (res.data.success) {
        // Map overrides by moduleId for easy form updates
        const mapped = {};
        res.data.data.forEach((item) => {
          mapped[item.moduleId] = {
            isAllowed: item.isAllowed !== false,
            allowedActions: item.allowedActions || [],
            deniedActions: item.deniedActions || []
          };
        });
        setOverrides(mapped);
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'danger', text: 'Failed to load user privileges' });
    } finally {
      setLoading(false);
    }
  };

  // Handle privilege configurations
  const toggleModuleAccess = (moduleId, val) => {
    setOverrides((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || { allowedActions: [], deniedActions: [] }),
        isAllowed: val
      }
    }));
  };

  const handleActionToggle = (moduleId, action, isAllowedChecked) => {
    setOverrides((prev) => {
      const current = prev[moduleId] || { isAllowed: true, allowedActions: [], deniedActions: [] };
      let allowed = [...current.allowedActions];
      let denied = [...current.deniedActions];

      if (isAllowedChecked) {
        // Add to allowed, remove from denied
        allowed = allowed.includes(action) ? allowed : [...allowed, action];
        denied = denied.filter((a) => a !== action);
      } else {
        // Add to denied, remove from allowed
        denied = denied.includes(action) ? denied : [...denied, action];
        allowed = allowed.filter((a) => a !== action);
      }

      return {
        ...prev,
        [moduleId]: {
          ...current,
          allowedActions: allowed,
          deniedActions: denied
        }
      };
    });
  };

  const clearOverride = (moduleId) => {
    setOverrides((prev) => {
      const updated = { ...prev };
      delete updated[moduleId];
      return updated;
    });
  };

  const saveOverrides = async () => {
    if (!selectedUser || !canUpdate) return;
    setSaving(true);
    setMsg({ type: '', text: '' });
    
    try {
      // Format payload for bulk update
      const formattedPermissions = Object.entries(overrides).map(([modId, val]) => ({
        moduleId: parseInt(modId, 10),
        isAllowed: true,
        allowedActions: [],
        deniedActions: val.deniedActions || []
      }));

      // We will first wipe existing custom permissions for user if payload is empty,
      // or post the bulk array.
      await api.post('/user-module-permissions/bulk', {
        userId: selectedUser.id,
        permissions: formattedPermissions
      });

      // Clear overrides that are completely empty / matching default to clean up DB
      // Loop modules and delete database overrides that are not modified
      const currentKeys = Object.keys(overrides).map(Number);
      const modulesList = modules.map(m => m.id);
      
      const unassignedModules = modulesList.filter(id => !currentKeys.includes(id));
      for (const modId of unassignedModules) {
        try {
          await api.delete(`/user-module-permissions/user/${selectedUser.id}/module/${modId}`);
        } catch (e) {
          // Ignore if didn't exist in DB anyway
        }
      }

      setMsg({ type: 'success', text: 'Granular user privileges synced successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
      
      // Refresh overrides
      handleSelectUser(selectedUser);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to save privilege settings' });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <h1>User Privilege Overrides <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>User-Level Access Exclusions</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Privileges</span>
        </div>
      </div>

      <div className="main-content">
        {/* Instructions Guide */}
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>How User Privilege Overrides Work</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p>
              This screen allows you to assign specific <strong>allow/deny overrides</strong> directly to a user's account. Direct user overrides always take priority and <strong>override their default role settings</strong>:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', listStyleType: 'disc' }}>
              <li><strong>Force Deny Module:</strong> Set a module to <code>Forbidden</code> to completely block access, even if the user's role grants it.</li>
              <li><strong>Granular Control:</strong> Check/Uncheck specific actions. Checked actions are explicitly allowed; Unchecked actions are explicitly restricted/denied.</li>
              <li><strong>Inherit Settings:</strong> Click <em>"Reset / Inherit Role"</em> to remove direct user overrides and resume using their default role configurations.</li>
            </ul>
          </div>
        </div>

        <div className="user-privileges-grid">
          {/* Left panel: Users List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Select User Account</h3>
            </div>
            <div className="card-body" style={{ padding: '0.5rem 0', maxHeight: '650px', display: 'flex', flexDirection: 'column' }}>
              {/* Search input field */}
              <div style={{ padding: '0.5rem 1rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} style={{ position: 'absolute', left: '26px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="form-input"
                  style={{ paddingLeft: '32px', minHeight: '34px', width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Users list container */}
              <div style={{ overflowY: 'auto', flex: 1, maxHeight: '420px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                {users.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No users found matching query.
                  </p>
                ) : (
                  users.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const roleName = u.roles?.[0]?.name || 'Standard User';
                    
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'background 0.2s'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                          {u.firstName} {u.lastName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Role: {roleName}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Sidebar pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between" style={{ padding: '0.75rem 1rem', background: 'var(--bg-app)' }}>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', minHeight: 'auto', opacity: page === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', minHeight: 'auto', opacity: page === totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Overrides Table */}
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">
                {selectedUser ? `Configuring Direct Overrides for ${selectedUser.firstName} ${selectedUser.lastName}` : 'Direct Override Permissions Panel'}
              </h3>
              {selectedUser && canUpdate && (
                <div className="card-tools">
                  <button onClick={saveOverrides} disabled={saving} className="btn btn-primary btn-sm">
                    <Save size={14} />
                    <span>{saving ? 'Saving Changes...' : 'Save Overrides'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="card-body" style={{ padding: selectedUser ? 0 : '2rem' }}>
              {msg.text && (
                <div style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  zIndex: 2000,
                  minWidth: '300px',
                  padding: '1rem',
                  borderRadius: '6px',
                  background: msg.type === 'success' ? '#28a745' : '#dc3545',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }} className="animate-fade-in">
                  <CheckCircle size={16} />
                  <span>{msg.text}</span>
                  <button 
                    onClick={() => setMsg({ type: '', text: '' })} 
                    style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {!selectedUser ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600 }}>No user selected.</p>
                  <p style={{ fontSize: '0.85rem' }}>Select a user account from the left sidebar to override their access privileges.</p>
                </div>
              ) : loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
                  <p>Loading user custom privileges...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Module / Setting</th>
                        <th>Granular Action Overrides</th>
                        <th style={{ width: '150px', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((m) => {
                        const hasOverride = overrides[m.id] !== undefined;
                        const deniedActions = overrides[m.id]?.deniedActions || [];

                        // Default roles modules list
                        const userRoleModules = selectedUser.roles?.[0]?.modules || [];
                        const roleModLink = userRoleModules.find(rm => rm.id === m.id);
                        const rolePermissions = roleModLink?.RoleModule?.permissions || roleModLink?.permissions || [];

                        return (
                          <tr key={m.id} style={{ background: hasOverride ? 'rgba(23, 162, 184, 0.04)' : 'transparent' }}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 700 }}>{m.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Role Default: {rolePermissions.length > 0 ? rolePermissions.join(', ') : 'None'}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.75rem' }}>
                                {['create', 'read', 'update', 'delete'].map((action) => {
                                  // The action is active/checked if the role permits it AND the admin hasn't explicitly unchecked it for this user (i.e. added it to deniedActions).
                                  // Default Admin / Super Admin roles get all modules/actions by default
                                  const isUserAdmin = selectedUser.roles?.some(
                                    r => r.name === 'Super Admin' || r.name === 'Admin' || r.code === 'admin' || r.code === 'super_admin'
                                  );
                                  const allowedByDefault = isUserAdmin || rolePermissions.includes(action);
                                  const explicitlyDenied = deniedActions.includes(action);
                                  const isChecked = allowedByDefault && !explicitlyDenied;
                                  
                                  // Disable checkbox only if the user is NOT an admin AND the role doesn't grant the permission
                                  const isDisabled = !isUserAdmin && !rolePermissions.includes(action);

                                  return (
                                    <label key={action} style={{ 
                                      fontSize: '0.75rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '3px', 
                                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                                      opacity: isDisabled ? 0.4 : 1
                                    }}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setOverrides((prev) => {
                                            const current = prev[m.id] || { isAllowed: true, allowedActions: [], deniedActions: [] };
                                            let currentDenied = [...current.deniedActions];

                                            if (!checked) {
                                              // Explicitly unchecked: Add to deniedActions override
                                              if (!currentDenied.includes(action)) {
                                                currentDenied.push(action);
                                              }
                                            } else {
                                              // Re-checked: Remove from deniedActions override
                                              currentDenied = currentDenied.filter((a) => a !== action);
                                            }

                                            // If no denials are left, remove override key for this module entirely
                                            if (currentDenied.length === 0) {
                                              const updated = { ...prev };
                                              delete updated[m.id];
                                              return updated;
                                            }

                                            return {
                                              ...prev,
                                              [m.id]: {
                                                ...current,
                                                deniedActions: currentDenied
                                              }
                                            };
                                          });
                                        }}
                                      />
                                      <span style={{ 
                                        textTransform: 'capitalize', 
                                        fontWeight: explicitlyDenied ? '700' : '400',
                                        color: explicitlyDenied ? '#dc3545' : 'var(--text-main)' 
                                      }}>
                                        {action}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              {hasOverride ? (
                                <span className="badge badge-danger">Denied Override Active</span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Inherited from Role</span>
                              )}
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
        </div>
      </div>
    </div>
  );
};

export default UserPrivilegeOverrides;
