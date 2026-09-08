import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getFullMediaUrl } from '../../utils/mediaUrl';
import {
  Menu as MenuIcon,
  Sun,
  Moon,
  LogOut,
  User,
  ExternalLink,
  Shield,
  Bell
} from 'lucide-react';

const AdminNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleName = user?.roles?.[0]?.name || 'Administrator';
  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'U'}`;

  const avatarUrl = user?.profilePicture?.url
    ? getFullMediaUrl(user.profilePicture.url)
    : null;

  return (
    <nav className="adminlte-navbar" style={{ position: 'relative' }}>
      {/* Left side: Hamburger & Quick Links */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            padding: '0.45rem',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            minHeight: '36px'
          }}
          title="Toggle Navigation"
          aria-label="Toggle Navigation"
        >
          <MenuIcon size={19} />
        </button>

        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-1.5"
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.35rem 0.6rem',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border)'
          }}
          title="View Live Website"
        >
          <span>View Site</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Right side: Tools & User Profile */}
      <div className="flex items-center gap-2">
        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2"
            style={{
              background: dropdownOpen ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              border: dropdownOpen ? '1px solid var(--primary)' : '1px solid transparent',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
            aria-label="User Account Menu"
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <span className="mobile-hide" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </span>
          </button>

          {/* Backdrop for mobile to close when tapping outside */}
          {dropdownOpen && (
            <div
              onClick={() => setDropdownOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1045,
                background: 'rgba(0, 0, 0, 0.2)'
              }}
            />
          )}

          {dropdownOpen && (
            <div
              className="card animate-fade-in"
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '260px',
                maxWidth: 'calc(100vw - 20px)',
                padding: '1rem',
                zIndex: 1050,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px'
              }}
            >
              {/* User Identity Header */}
              <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.15em 0.5em', marginTop: '2px' }}>
                      {roleName}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '0.25rem',
                    padding: '0.2rem 0.4rem',
                    background: 'var(--bg-app)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)'
                  }}
                  title={user?.email}
                >
                  {user?.email}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link
                  to="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="btn btn-secondary btn-sm w-full"
                  style={{
                    justifyContent: 'flex-start',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    padding: '0.55rem 0.75rem',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  <User size={15} />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="btn btn-danger btn-sm w-full"
                  style={{
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '0.55rem 0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px'
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
