import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOrgSettings } from '../context/OrgSettingsContext';
import { getFullMediaUrl } from '../utils/mediaUrl';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { orgSettings, headerConfig } = useOrgSettings();

  const siteTitle = orgSettings?.siteName || 'JONIKWIRIA Limited';
  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;
  const fullLogoUrl = logoUrl ? getFullMediaUrl(logoUrl) : null;

  const [loading, setLoading] = useState(!!token);
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState({ type: '', text: '' });
  const [manualToken, setManualToken] = useState('');

  const verifyToken = async (tok) => {
    if (!tok) return;
    setLoading(true);
    setStatus('verifying');
    setMessage('');
    try {
      const res = await api.post('/auth/verify-email', { token: tok });
      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message || 'Your email address has been verified successfully!');
        if (res.data.data?.token) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification link is invalid or has expired. Please request a new verification link.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendMsg({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }
    setResending(true);
    setResendMsg({ type: '', text: '' });
    try {
      const res = await api.post('/auth/resend-verification', { email: resendEmail });
      setResendMsg({ type: 'success', text: res.data.message || 'Verification email sent! Please check your inbox.' });
    } catch (err) {
      setResendMsg({ type: 'error', text: err.response?.data?.error || 'Failed to send verification email. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="auth-ambient-glow" />

      <div className="auth-card-wrapper animate-fade-in" style={{ maxWidth: '580px', width: '100%', margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem 2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}>
          
          {/* Logo / Header Branding */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
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

          {/* 1. LOADING / VERIFYING STATE */}
          {loading && (
            <div style={{ padding: '2rem 0' }}>
              <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1.25rem auto' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                Verifying Your Email...
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Please wait while we validate your activation token.
              </p>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {!loading && status === 'success' && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.6rem 0' }}>
                Email Verified Successfully!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
                {message || 'Your account is now fully active. You can now access your student portal, courses, quizzes, and digital certificates.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => navigate('/student/my-learning')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <span>Go to Student Portal</span>
                  <ArrowRight size={18} />
                </button>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* 3. ERROR OR NO TOKEN STATE */}
          {!loading && status !== 'success' && (
            <div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: status === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,123,255,0.15)', color: status === 'error' ? '#ef4444' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: status === 'error' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,123,255,0.3)' }}>
                {status === 'error' ? <AlertCircle size={36} /> : <Mail size={36} />}
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                {status === 'error' ? 'Verification Link Expired or Invalid' : 'Verify Your Email Address'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                {status === 'error' 
                  ? message 
                  : 'Please check your email inbox for the activation link. If your link has expired or you did not receive it, request a new one below:'}
              </p>

              {/* Resend Verification Form */}
              <form onSubmit={handleResend} style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={15} color="var(--primary)" />
                  <span>Resend Verification Link</span>
                </h4>

                {resendMsg.text && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', background: resendMsg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: resendMsg.type === 'success' ? '#34d399' : '#f87171', border: resendMsg.type === 'success' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {resendMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{resendMsg.text}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.4rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {resending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      <span>Send New Verification Link</span>
                    </>
                  )}
                </button>
              </form>

              {/* Enter Token Manually Accordion/Fallback */}
              {!token && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <details style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                    <summary style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer' }}>
                      Have a verification token or code? Paste it here
                    </summary>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Paste verification token..."
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.82rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => verifyToken(manualToken.trim())}
                        disabled={!manualToken.trim()}
                        className="btn btn-primary btn-sm"
                        style={{ fontWeight: 700 }}
                      >
                        Verify
                      </button>
                    </div>
                  </details>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Already verified? Log in to your account</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
