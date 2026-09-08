import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  Home,
  ChevronRight,
  UserCheck,
  Info
} from 'lucide-react';
import api from '../../services/api';

const UserManager = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: ''
  });

  const canCreate = hasPermission('users', 'create');
  const canUpdate = hasPermission('users', 'update');
  const canDelete = hasPermission('users', 'delete');

  const fetchUsers = () => {
    setLoading(true);
    api.get(`/users?search=${encodeURIComponent(search)}&page=${page}&limit=10`)
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.users || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  };

  const fetchRoles = () => {
    api.get('/roles')
      .then((res) => {
        if (res.data.success) setRoles(res.data.roles || []);
      })
      .catch((err) => console.error('Failed to load roles:', err));
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search, page]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        roleId: user.roles?.[0]?.id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: roles?.[0]?.id || ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        });

        // Assign role if selected
        if (formData.roleId) {
          await api.post('/user-roles', {
            userId: editingUser.id,
            roleId: formData.roleId
          });
        }
      } else {
        const res = await api.post('/auth/register', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password || 'Password@123'
        });

        if (res.data?.data?.user?.id && formData.roleId) {
          await api.post('/user-roles', {
            userId: res.data.data.user.id,
            roleId: formData.roleId
          });
        }
      }

      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  return (
    <div>
      {/* AdminLTE Content Header */}
      <div className="content-header">
        <h1>Users Management <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Accounts & Roles</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Users</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* User Management Instructions Panel */}
        <div className="card card-outline card-info" style={{ borderTopWidth: '3px', marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ padding: '0.65rem 1.25rem' }}>
            <div className="flex items-center gap-2" style={{ fontWeight: 600, color: 'var(--info)' }}>
              <Info size={18} />
              <span>User Accounts Directory Instructions</span>
            </div>
          </div>
          <div className="card-body" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              Welcome to the User Directory. Here you can add and manage administrative credentials for team members:
            </p>
            <ul style={{ paddingLeft: '1.25rem', listStyleType: 'disc' }}>
              <li><strong>Add Users:</strong> Click <em>"Add New User"</em> to register new accounts. Provide their name, email, and choose their default security group.</li>
              <li><strong>Assign Roles:</strong> Role definitions determine default system permissions. Assign a role (like <em>Super Admin</em>, <em>Editor</em>, etc.) to set default rules.</li>
              <li><strong>Custom Exceptions:</strong> To grant or deny specific privileges to one user without changing their role, navigate to the <strong>Individual Overrides</strong> screen in the sidebar.</li>
            </ul>
          </div>
        </div>

        <div className="card card-primary card-outline">
          {/* Card Header */}
          <div className="card-header">
            <h3 className="card-title">Registered User Accounts</h3>
            <div className="card-tools">
              <button onClick={fetchUsers} className="btn btn-secondary btn-sm" title="Refresh List">
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
              {canCreate && (
                <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
                  <Plus size={14} />
                  <span>Add New User</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Filter Bar */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.015)' }}>
            <div className="flex items-center gap-2" style={{ maxWidth: '380px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                className="form-input"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#ID</th>
                    <th>User / Name</th>
                    <th>Email Address</th>
                    <th>Assigned Roles</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>
                          <div className="flex items-center gap-2">
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: '#e0e7ff',
                                color: '#4338ca',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <span>{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td><code>{u.email}</code></td>
                        <td>
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span key={r.id} className="badge badge-primary" style={{ marginRight: '4px' }}>
                                {r.name}
                              </span>
                            ))
                          ) : (
                            <span className="badge badge-secondary">Standard User</span>
                          )}
                        </td>
                        <td>
                          {u.isActive !== false ? (
                            <span className="badge badge-success flex items-center gap-1" style={{ width: 'fit-content' }}>
                              <CheckCircle size={10} />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="badge badge-danger flex items-center gap-1" style={{ width: 'fit-content' }}>
                              <XCircle size={10} />
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1">
                            {canUpdate && (
                              <button
                                onClick={() => handleOpenModal(u)}
                                className="btn btn-secondary btn-sm"
                                title="Edit User & Roles"
                                style={{ padding: '0.2rem 0.45rem' }}
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="btn btn-danger btn-sm"
                                title="Delete User"
                                style={{ padding: '0.2rem 0.45rem' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading users...' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Footer with Total & Pagination */}
          <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {users.length} user record(s)
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '540px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {editingUser ? `Edit User: ${editingUser.firstName}` : 'Add New User'}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {!editingUser && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="Password@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Assign Role</label>
                <select
                  className="form-select"
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                >
                  <option value="">No Role (Standard User)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
