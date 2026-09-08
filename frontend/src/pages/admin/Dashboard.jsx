import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Sliders,
  Users,
  ClipboardList,
  ArrowRight,
  RefreshCw,
  Eye,
  ShieldAlert,
  ChevronRight,
  Home
} from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pages: 0,
    carousels: 0,
    users: 0,
    audits: 0,
    recentAudits: []
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.allSettled([
      api.get('/pages?limit=1'),
      api.get('/carousels?limit=1'),
      api.get('/users?limit=1'),
      api.get('/audit-trails?limit=6')
    ])
      .then(([pagesRes, carouselsRes, usersRes, auditsRes]) => {
        setStats({
          pages: pagesRes.value?.data?.totalItems || 0,
          carousels: carouselsRes.value?.data?.totalItems || 0,
          users: usersRes.value?.data?.totalItems || 0,
          audits: auditsRes.value?.data?.totalItems || 0,
          recentAudits: auditsRes.value?.data?.data || []
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div>
      {/* AdminLTE Content Header */}
      <div className="content-header">
        <h1>Dashboard <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Control Panel</small></h1>
        <div className="breadcrumb">
          <Home size={14} />
          <Link to="/admin">Home</Link>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Dashboard</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* AdminLTE Small Boxes Grid - Clickable whole-card links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Info Box: Pages */}
          <Link to="/admin/pages" className="small-box bg-info" title="Manage Dynamic Pages">
            <div className="inner">
              <h3>{stats.pages}</h3>
              <p>Dynamic CMS Pages</p>
            </div>
            <div className="icon">
              <FileText size={70} />
            </div>
            <div className="small-box-footer">
              <span>More info</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Success Box: Carousels */}
          <Link to="/admin/carousels" className="small-box bg-success" title="Manage Sliders & Carousels">
            <div className="inner">
              <h3>{stats.carousels}</h3>
              <p>Active Sliders & Carousels</p>
            </div>
            <div className="icon">
              <Sliders size={70} />
            </div>
            <div className="small-box-footer">
              <span>More info</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Warning Box: Users */}
          <Link to="/admin/users" className="small-box bg-warning" title="Manage User Accounts">
            <div className="inner">
              <h3>{stats.users}</h3>
              <p>User Registrations</p>
            </div>
            <div className="icon">
              <Users size={70} />
            </div>
            <div className="small-box-footer">
              <span>More info</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Danger Box: Audit Logs */}
          <Link to="/admin/audit-trails" className="small-box bg-danger" title="Inspect Immutable Audit Logs">
            <div className="inner">
              <h3>{stats.audits || stats.recentAudits.length}</h3>
              <p>Immutable Audit Logs</p>
            </div>
            <div className="icon">
              <ClipboardList size={70} />
            </div>
            <div className="small-box-footer">
              <span>More info</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        {/* Card Outline: Recent Activity Audit Table */}
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Recent System Activities & Audit Trail</h3>
            <div className="card-tools">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="btn btn-secondary btn-sm"
                title="Refresh Logs"
                style={{ padding: '0.35rem 0.75rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {stats.recentAudits.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Action</th>
                      <th>Module</th>
                      <th>Performed By</th>
                      <th>IP Address</th>
                      <th>Date & Time</th>
                      <th style={{ textAlign: 'center', width: '90px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAudits.map((log) => {
                      const badgeClass =
                        log.action === 'DELETE'
                          ? 'badge-danger'
                          : log.action === 'CREATE'
                          ? 'badge-success'
                          : log.action === 'UPDATE'
                          ? 'badge-warning'
                          : 'badge-info';

                      return (
                        <tr key={log.id}>
                          <td>
                            <span className={`badge ${badgeClass}`}>{log.action}</span>
                          </td>
                          <td>
                            <span className="badge badge-secondary" style={{ fontFamily: 'monospace' }}>
                              {log.moduleCode}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : 'System / Guest'}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{log.ipAddress || '127.0.0.1'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-success">Recorded</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recent activity records found.
              </div>
            )}
          </div>

          <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              🔒 Protected by Immutable Audit Ledger
            </span>
            <Link to="/admin/audit-trails" className="btn btn-primary btn-sm">
              <span>View All Logs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
