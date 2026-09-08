import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useOrgSettings } from '../context/OrgSettingsContext';
import { getFullMediaUrl } from '../utils/mediaUrl';

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={{ marginTop: '0.4rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '3px',
              flex: 1,
              borderRadius: '2px',
              background: i < score ? colors[score - 1] : 'var(--border)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: '0.72rem', color: score > 0 ? colors[score - 1] : 'var(--text-muted)', fontWeight: 600 }}>
        {score > 0 ? labels[score - 1] : ''} (min. 6 characters, uppercase, number, symbol recommended)
      </div>
    </div>
  );
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { orgSettings, headerConfig } = useOrgSettings();

  const siteTitle = orgSettings?.siteName || 'JONIKWIRIA Limited';
  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;
  const fullLogoUrl = logoUrl ? getFullMediaUrl(logoUrl) : null;

  const [verifyingToken, setVerifyingToken] = useState(!!token);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyingToken(false);
      setTokenValid(false);
      setError('No password reset token provided. Please use the link provided in your email.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await api.get(`/auth/verify-reset-token/${token}`);
        if (res.data.success) {
          setTokenValid(true);
          setTargetEmail(res.data.data?.email || '');
        }
      } catch (err) {
        setTokenValid(false);
        setError(err.response?.data?.error || 'This password reset link is invalid or has expired. Please request a new one.');
      } finally {
        setVerifyingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: password
      });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-ambient-glow" />

      <div className="auth-card-wrapper animate-fade-in" style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          
          {/* Logo Header */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
              {fullLogoUrl ? (
                <img src={fullLogoUrl} alt={siteTitle} style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                  JK
                </div>
              )}
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>JONIKWIRIA</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Technology Limited</div>
              </div>
            </Link>
          </div>

          {/* 1. LOADING TOKEN CHECK */}
          {verifyingToken && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <Loader2 size={44} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>
                Validating Security Token...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Please wait a moment while we verify your password reset link.
              </p>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {!verifyingToken && success && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.6rem 0' }}>
                Password Reset Complete!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                Your password has been updated successfully. You can now log into your account using your new credentials.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <span>Proceed to Login</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* 3. INVALID / EXPIRED TOKEN STATE */}
          {!verifyingToken && !success && !tokenValid && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle size={32} />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                Invalid or Expired Link
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.75rem 0' }}>
                {error || 'This password reset link is invalid or has expired for security reasons. Please request a fresh reset link.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/forgot-password" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 800, textDecoration: 'none' }}>
                  Request New Reset Link
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                  Return to Login
                </Link>
              </div>
            </div>
          )}

          {/* 4. RESET PASSWORD FORM */}
          {!verifyingToken && !success && tokenValid && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                  Create New Password
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Enter a new password for <span style={{ color: '#60a5fa', fontWeight: 700 }}>{targetEmail}</span>
                </p>
              </div>

              {error && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm Password */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
