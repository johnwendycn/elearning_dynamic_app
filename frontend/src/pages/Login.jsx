import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrgSettings } from '../context/OrgSettingsContext';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  LayoutDashboard,
  Shield,
  KeyRound,
  Info
} from 'lucide-react';
import { getFullMediaUrl } from '../utils/mediaUrl';

const Login = () => {
  const { login } = useAuth();
  const { orgSettings, headerConfig } = useOrgSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const siteTitle = orgSettings?.siteName || 'JONIKWIRIA Limited';
  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');
  const portalParam = searchParams.get('portal');

  // Determine active portal mode (admin or student)
  const isDirectAdminUrl = location.pathname.includes('/admin') || portalParam === 'admin' || redirectUrl?.includes('/admin');
  const [portalTab, setPortalTab] = useState(isDirectAdminUrl ? 'admin' : 'student');

  useEffect(() => {
    if (isDirectAdminUrl) {
      setPortalTab('admin');
    }
  }, [location.pathname, location.search]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminHelp, setShowAdminHelp] = useState(false);

  const fillAdminCredentials = () => {
    setEmail('johnwendynwaukwa@gmail.com');
    setPassword('111111');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      const isStaff = loggedUser?.roles?.some(r =>
        ['Super Admin', 'Admin', 'Curator', 'admin', 'superadmin'].includes(r.name)
      );

      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (portalTab === 'admin') {
        if (isStaff) {
          navigate('/admin');
        } else {
          // Logged in as student but on admin portal tab
          navigate('/student/my-learning');
        }
      } else {
        if (isStaff) {
          navigate('/admin');
        } else {
          navigate('/student/my-learning');
        }
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. Please ensure the backend server and MySQL database are running.');
      } else {
        setError(err.response?.data?.error || 'Invalid email or password. Please verify and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Ambient background glow */}
      <div className="auth-ambient-glow" />

      <div className="auth-card-wrapper animate-fade-in">
        {/* Left Side: Visual Branding (Desktop & Tablets) */}
        <div className={`auth-sidebar ${portalTab === 'admin' ? 'auth-sidebar-admin' : ''}`}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: portalTab === 'admin'
                    ? 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)'
                    : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {logoUrl ? (
                  <img src={getFullMediaUrl(logoUrl)} alt={siteTitle} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  portalTab === 'admin' ? <ShieldCheck size={22} /> : <Sparkles size={20} />
                )}
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{siteTitle}</span>
            </div>

            {portalTab === 'admin' ? (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  <Shield size={13} />
                  <span>Secure Admin Portal</span>
                </div>
                <h2 style={{ fontSize: '2.05rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
                  System Control &amp; CMS Center
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                  Sign in to manage curriculum departments, online courses, real-time carousels, role permissions, and immutable audit logs.
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div style={{ color: '#34d399' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Dual-Tier RBAC &amp; Permission Overrides</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ color: '#34d399' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Curriculum &amp; Department Manager</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ color: '#34d399' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Real-time Audit Trail &amp; Activity Log</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                  <GraduationCap size={14} />
                  <span>Student Learning Hub</span>
                </div>
                <h2 style={{ fontSize: '2.05rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
                  Elevate Your Career &amp; Skills
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                  Access your enrolled courses, video lectures, coding challenges, and internationally verifiable certificates.
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'var(--success)' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Interactive High-Definition Lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'var(--success)' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Verifiable Digital Certificates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'var(--success)' }}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Self-Paced Learning Progress</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={13} color="#94a3b8" />
            <span>Protected by enterprise 256-bit TLS encryption.</span>
          </div>
        </div>

        {/* Right Side: Responsive Sign-in Form */}
        <div className="auth-form-container">
          
          {/* Responsive Segmented Tab Switcher */}
          <div className="auth-portal-selector" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={portalTab === 'student'}
              className={`auth-portal-btn ${portalTab === 'student' ? 'active' : ''}`}
              onClick={() => {
                setPortalTab('student');
                setError('');
              }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={portalTab === 'admin'}
              className={`auth-portal-btn ${portalTab === 'admin' ? 'active active-admin' : ''}`}
              onClick={() => {
                setPortalTab('admin');
                setError('');
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin / Staff</span>
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                {portalTab === 'admin' ? 'Admin Dashboard Sign In' : 'Welcome Back'}
              </h1>
              {portalTab === 'admin' && (
                <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Restricted
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              {portalTab === 'admin'
                ? 'Authorized staff login for JONIKWIRIA administrative control center.'
                : 'Enter your student credentials to continue your learning journey.'}
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 animate-fade-in"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.875rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                {portalTab === 'admin' ? 'Staff Email Address' : 'Student Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder={portalTab === 'admin' ? 'admin@jonikwiria.com' : 'student@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: 600, fontSize: '0.85rem' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn ${portalTab === 'admin' ? 'btn-primary' : 'btn-primary'} w-full`}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: portalTab === 'admin'
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : undefined,
                fontWeight: 700
              }}
            >
              {loading ? (
                <span>Authenticating session...</span>
              ) : (
                <>
                  {portalTab === 'admin' ? <LayoutDashboard size={18} /> : <ArrowRight size={18} />}
                  <span>{portalTab === 'admin' ? 'Sign In to Admin Dashboard' : 'Sign In to Learning Portal'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper for Admin Demo */}
          {portalTab === 'admin' && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(2, 132, 199, 0.08)', borderRadius: '10px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <KeyRound size={13} color="#0284c7" />
                  <span>Admin Demo Credentials Available</span>
                </span>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Auto Fill
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {portalTab === 'admin' ? (
              <div>
                Need a student account?{' '}
                <button
                  type="button"
                  onClick={() => { setPortalTab('student'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Switch to Student Login
                </button>
              </div>
            ) : (
              <div>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Register Free
                </Link>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Are you an administrator?{' '}
                  <button
                    type="button"
                    onClick={() => { setPortalTab('admin'); setError(''); }}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Go to Admin Login
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
