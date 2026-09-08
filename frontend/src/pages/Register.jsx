import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrgSettings } from '../context/OrgSettingsContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { getFullMediaUrl } from '../utils/mediaUrl';

const Register = () => {
  const { register } = useAuth();
  const { orgSettings, headerConfig } = useOrgSettings();
  const navigate = useNavigate();

  const siteTitle = orgSettings?.siteName || 'Core CMS';
  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const regUser = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        const isStaff = regUser?.roles?.some(r => ['Super Admin', 'Admin', 'Curator', 'admin', 'superadmin'].includes(r.name));
        if (isStaff) {
          navigate('/admin');
        } else {
          navigate('/student/my-learning');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Ambient glow backdrop */}
      <div className="auth-ambient-glow" />

      <div className="auth-card-wrapper animate-fade-in" style={{ maxWidth: '1080px' }}>
        {/* Left Side: Visual Branding (Desktop & Tablets) */}
        <div className="auth-sidebar">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                {logoUrl ? (
                  <img src={getFullMediaUrl(logoUrl)} alt={siteTitle} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Sparkles size={20} />
                )}
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{siteTitle}</span>
            </div>

            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
              Start Building Today
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Create an account to manage pages, customize sliders, and control dynamic content with ease.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--success)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Instant Account Activation</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--success)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Automated Role Assignment</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--success)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Multi-Device Seamless Access</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Built with modern architecture & security best practices.
          </div>
        </div>

        {/* Right Side: Responsive Sign-up Form */}
        <div className="auth-form-container">
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Fill in your details to set up your profile
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* First & Last Name Grid (Responsive) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
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
                  name="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
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
                    name="password"
                    required
                    minLength={6}
                    className="form-input"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
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
                    name="confirmPassword"
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.5rem' }}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {loading ? 'Creating Account...' : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
