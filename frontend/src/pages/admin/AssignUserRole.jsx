import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Shield, Save, ChevronRight, Home, Info, 
  Search, RefreshCw, CheckCircle, UserCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AssignUserRole = () => {
  const { hasPermission } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Track multiple selected role IDs
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  
  const [searching, setSearching] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const canUpdate = hasPermission('users', 'update');

  // Load roles list for assignment selection
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await api.get('/roles');
      if (res.data.success) {
        setRoles(res.data.roles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Perform search (debounced or manual trigger) for massive user directories
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(searchQuery)}&limit=10`);
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Trigger search on typing input changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const selectUser = (user) => {
    setSelectedUser(user);
    if (user.roles && user.roles.length > 0) {
      setSelectedRoleIds(user.roles.map(r => r.id));
    } else {
      setSelectedRoleIds([]);
    }
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoleIds((prev) => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Please search and select a user account');
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      // Set roles using backend updateUser route which natively takes roleIds array
      await api.put(`/users/${selectedUser.id}`, {
        roleIds: selectedRoleIds
      });
      
      setMsg({ type: 'success', text: 'User role mappings updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
      
      // Update selectedUser object locally to reflect new roles
      const matchedRoles = roles.filter(r => selectedRoleIds.includes(r.id));
      setSelectedUser({
        ...selectedUser,
        roles: matchedRoles
      });
    } catch (err) {
      console.error(err);
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to update role assignment' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <h1>Assign User Roles <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>High-Scale Security Group Mapping</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Assign Roles</span>
        </div>
      </div>

      <div className="main-content">
        {/* Floating Notification */}
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
          }}>
            <CheckCircle size={16} />
            <span>{msg.text}</span>
          </div>
        )}

        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>Multi-Role Assignment Instructions</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p>To support users with multi-functional tasks, you can select and assign <strong>multiple roles</strong> simultaneously to a single user account. Check or uncheck roles from the assignment list to customize their default privileges.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="user-privileges-grid">
          {/* Left Panel: Search Autocomplete */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Search User Accounts</h3>
            </div>
            <div className="card-body flex flex-col gap-3">
              <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Type name or email to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </form>

              <div style={{ minHeight: '280px', maxHeight: '420px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '4px', marginTop: '0.5rem' }}>
                {searching ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <RefreshCw className="animate-spin" size={20} style={{ margin: '0 auto 0.5rem auto' }} />
                    <span>Searching database...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {searchQuery.trim() ? 'No matching user accounts found.' : 'Enter a search term to find users.'}
                  </div>
                ) : (
                  users.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const roleNames = u.roles && u.roles.length > 0 ? u.roles.map(r => r.name).join(', ') : 'Standard User';
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => selectUser(u)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--primary)' : 'var(--border)',
                          color: isSelected ? '#fff' : 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>{u.firstName} {u.lastName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                        </div>
                        <span className="badge badge-secondary" style={{ marginLeft: 'auto', fontSize: '0.7rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={roleNames}>
                          {roleNames}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Role Assignment Actions */}
          <div className="card card-primary card-outline">
            <div className="card-header">
              <h3 className="card-title">Assign Security Settings</h3>
            </div>
            <div className="card-body flex flex-col justify-between" style={{ minHeight: '340px' }}>
              {!selectedUser ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', padding: '2rem' }}>
                  <UserCheck size={48} style={{ opacity: 0.25, margin: '0 auto 1rem auto' }} />
                  <p style={{ fontWeight: 600 }}>No User Selected</p>
                  <p style={{ fontSize: '0.85rem' }}>Find and select a user account from the search box to set their system roles.</p>
                </div>
              ) : (
                <form onSubmit={handleAssign} className="flex flex-col gap-4 h-full justify-between" style={{ flex: 1 }}>
                  <div className="flex flex-col gap-4">
                    <div style={{ 
                      padding: '1rem', 
                      background: 'rgba(0,0,0,0.02)', 
                      borderRadius: '4px', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{selectedUser.firstName} {selectedUser.lastName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedUser.email}</span>
                        <span style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                          Current Roles: <strong style={{ color: 'var(--primary)' }}>{selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles.map(r => r.name).join(', ') : 'Standard User'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ marginBottom: '0.5rem' }}>Select Target Role Assignments</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                        {roles.length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No roles configured.</span>
                        ) : (
                          roles.map(r => (
                            <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                              <input 
                                type="checkbox" 
                                checked={selectedRoleIds.includes(r.id)} 
                                onChange={() => handleRoleToggle(r.id)} 
                                style={{ width: '16px', height: '16px' }}
                              />
                              <span>{r.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {canUpdate && (
                    <div style={{ marginTop: '2rem' }}>
                      <button type="submit" className="btn btn-primary w-full" style={{ minHeight: '42px', justifyContent: 'center' }} disabled={saving}>
                        <Save size={16} />
                        <span>{saving ? 'Updating Assignments...' : 'Save Role Assignments'}</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignUserRole;
