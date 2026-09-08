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
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { getFullMediaUrl } from '../utils/mediaUrl';

const Register = () => {
  const { register } = useAuth();
  const { orgSettings, headerConfig } = useOrgSettings();
  const navigate = useNavigate();

  const siteTitle = orgSettings?.siteName || 'JONIKWIRIA Limited';
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

  // Email verification required state
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState({ type: '', text: '' });
  const [resendCooldown, setResendCooldown] = useState(0);

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

      if (regUser?.requireVerification) {
        setRegisteredEmail(formData.email);
        setVerificationPending(true);
      } else if (regUser?.token) {
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
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    setResendStatus({ type: '', text: '' });
    try {
      const res = await api.post('/auth/resend-verification', { email: registeredEmail });
      setResendStatus({ type: 'success', text: res.data.message || 'New verification email sent!' });
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setResendStatus({ type: 'error', text: err.response?.data?.error || 'Failed to resend verification email.' });
    } finally {
      setResending(false);
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
              Create an account to access our interactive e-learning platform, phased courses, and verified certificates.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--success)' }}>
                  <ShieldCheck size={18} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Secure Email Verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--success)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Automated Student Role Setup</span>
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

        {/* Right Side: Sign-up Form OR Verification Prompt */}
        <div className="auth-form-container">
          {verificationPending ? (
            <div className="animate-fade-in" style={{ padding: '1rem 0', textAlign: 'center' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(0,123,255,0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid rgba(0,123,255,0.3)' }}>
                <Mail size={36} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                Verify Your Email
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                We've sent an activation link to <strong style={{ color: '#60a5fa' }}>{registeredEmail}</strong>. Please check your inbox and click the verification link to activate your account.
              </p>

              {resendStatus.text && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', background: resendStatus.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: resendStatus.type === 'success' ? '#34d399' : '#f87171', border: resendStatus.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
                  {resendStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{resendStatus.text}</span>
                </div>
              )}

              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.75rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Tips if you can't find the email:</div>
                <div>1. Check your Spam or Junk folder.</div>
                <div>2. Allow 1-2 minutes for mail delivery.</div>
                <div>3. Click the button below to resend a fresh link if needed.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {resending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>{resendCooldown > 0 ? `Resend Email (${resendCooldown}s)` : 'Resend Verification Email'}</span>
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.8rem', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  Proceed to Login
                </Link>
              </div>
            </div>
          ) : (
            <div>
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
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="John"
                        style={{ paddingLeft: '2.5rem' }}
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
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Doe"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
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
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="name@company.com"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                {/* Phone Number */}
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
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+234..."
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
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
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="••••••••"
                        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
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
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="••••••••"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.85rem',
                    fontWeight: 700,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register &amp; Verify Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)'
                }}
              >
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                  Log in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
