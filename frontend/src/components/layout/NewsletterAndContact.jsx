import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Phone, MapPin, Clock, MessageSquare, ArrowRight, Sparkles, Shield, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NewsletterAndContact = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/subscribers/subscribe', {
        email: email.trim(),
        source: 'homepage_digest'
      });
      if (res.data?.success) {
        setSubscribed(true);
        setFeedbackMessage(res.data.message || 'Thank you for subscribing! Check your email for our welcome kit.');
      } else {
        setErrorMessage(res.data?.error || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to subscribe right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-contact-section" style={{ background: 'var(--bg-app)', padding: '5rem 0 3.5rem 0', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .newsletter-contact-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 2.5rem;
          align-items: stretch;
        }
        @media (max-width: 1024px) {
          .newsletter-contact-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 640px) {
          .newsletter-contact-box {
            padding: 2rem 1.5rem !important;
          }
        }
      `}} />

      <div className="container">
        <div className="newsletter-contact-grid">
          
          {/* Left Card: Newsletter Subscription */}
          <div 
            className="newsletter-contact-box hover-scale"
            style={{
              background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)',
              color: '#ffffff',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Ambient lighting */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,123,255,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.2)', border: '1px solid rgba(0,123,255,0.4)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
                <Sparkles size={14} color="#60a5fa" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stay Ahead in Tech</span>
              </div>

              <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Subscribe to the JONIKWIRIA Digest
              </h3>

              <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: 1.65, margin: '0 0 2rem 0' }}>
                Receive weekly technology analyses, upcoming cohort schedules, guest lecture invitations, and scholarship alerts directly in your inbox.
              </p>
            </div>

            <div>
              {subscribed ? (
                <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(16,185,129,0.18)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={20} />
                  <span style={{ fontWeight: 700 }}>{feedbackMessage || 'Thank you for subscribing! Check your email for our welcome kit.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      style={{
                        flex: '1 1 240px',
                        padding: '0.95rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{
                        padding: '0.95rem 1.75rem',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe Now</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </div>
                  {errorMessage && (
                    <div style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
                      {errorMessage}
                    </div>
                  )}
                </form>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '1rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                <Shield size={12} color="#10b981" />
                <span>We respect your privacy. No spam. Unsubscribe at any time.</span>
              </div>
            </div>
          </div>

          {/* Right Card: Contact & Headquarters Details */}
          <div 
            className="newsletter-contact-box hover-scale"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.2)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
                <MessageSquare size={14} color="#007bff" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Get In Touch</span>
              </div>

              <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.75rem 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Connect With Our Team
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.65, margin: '0 0 2rem 0' }}>
                Have inquiries regarding admissions, corporate team upskilling, software engineering partnerships, or facility visits? We are here to help.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Headquarters Campus</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Innovation Hub, Victoria Island, Lagos, Nigeria</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Phone &amp; WhatsApp</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>+234 800 JONIKWIRIA (5664594)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Admissions &amp; Enterprise Desk</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>info@jonikwiria.com | admissions@jonikwiria.com</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Clock size={13} color="var(--primary)" />
                <span>Mon — Sat: 8:00 AM – 6:00 PM</span>
              </div>

              <Link to="/p/about-us" className="btn btn-sm btn-outline" style={{ fontWeight: 700, padding: '0.5rem 1.25rem', borderRadius: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span>Contact Admissions</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsletterAndContact;
