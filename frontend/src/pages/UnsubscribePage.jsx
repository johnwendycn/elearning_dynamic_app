import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, HeartHandshake, Loader2 } from 'lucide-react';
import api from '../services/api';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleUnsubscribe = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/subscribers/unsubscribe', {
        email: email.trim()
      });

      if (res.data?.success) {
        setUnsubscribed(true);
        setMessage(res.data.message || 'You have been successfully unsubscribed from all JONIKWIRIA newsletters.');
      } else {
        setError(res.data?.error || 'Unable to complete unsubscribe request.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong while processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', background: 'var(--bg-app)' }}>
      <div 
        className="card animate-fade-in" 
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.08)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)'
        }}
      >
        {unsubscribed ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={34} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Unsubscribed Successfully
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {message || `You will no longer receive digest emails at ${email}.`}
            </p>

            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <HeartHandshake size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>We are sorry to see you go! You can subscribe back anytime directly from our homepage or footer.</span>
            </div>

            <div className="flex flex-col gap-2">
              <Link to="/" className="btn btn-primary w-full" style={{ padding: '0.85rem', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
                <ArrowLeft size={16} />
                <span>Return to JONIKWIRIA Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Manage Subscription
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Opt out of JONIKWIRIA email notifications</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Are you sure you want to unsubscribe from technology updates, cohort calendars, and webinar invitations?
            </p>

            {error && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUnsubscribe} className="flex flex-col gap-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Subscriber Email Address
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  style={{ minHeight: '44px', borderRadius: '10px' }}
                />
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn btn-danger w-full"
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Confirm Unsubscribe</span>
                  )}
                </button>

                <Link
                  to="/"
                  className="btn btn-secondary w-full"
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                >
                  Cancel &amp; Keep Subscription
                </Link>
              </div>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Instant 1-Click Unsubscribe Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
