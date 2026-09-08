import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useOrgSettings } from '../context/OrgSettingsContext';
import { getFullMediaUrl } from '../utils/mediaUrl';

const ForgotPassword = () => {
  const { orgSettings, headerConfig } = useOrgSettings();
  const siteTitle = orgSettings?.siteName || 'JONIKWIRIA Limited';
  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;
  const fullLogoUrl = logoUrl ? getFullMediaUrl(logoUrl) : null;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
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
      setError(err.response?.data?.error || 'Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-ambient-glow" />

      <div className="auth-card-wrapper animate-fade-in" style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          
          {/* Brand Logo Header */}
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

          {!submitted ? (
            <div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,123,255,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid rgba(0,123,255,0.25)' }}>
                <KeyRound size={28} />
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                  Forgot Password?
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                  Enter the email address associated with your account and we will send you instructions to reset your password.
                </p>
              </div>

              {error && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.5rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeft size={15} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.6rem 0' }}>
                Check Your Inbox
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                If an account exists for <strong style={{ color: '#60a5fa' }}>{email}</strong>, we have sent a password reset link. The link is active for <strong>1 hour</strong>.
              </p>

              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>Didn't receive an email?</div>
                <div>• Check your spam or junk folder.</div>
                <div>• Ensure the email entered matches your registered account.</div>
                <div>• Wait a moment or try resending below.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={resendCooldown > 0 || loading}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.88rem' }}
                >
                  {resendCooldown > 0 ? `Resend Link (${resendCooldown}s)` : 'Resend Reset Email'}
                </button>

                <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                  Return to Login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
