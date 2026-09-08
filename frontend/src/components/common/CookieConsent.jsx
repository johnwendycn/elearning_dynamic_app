import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Settings, ExternalLink, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [settings, setSettings] = useState({
    essential: true, // Always true
    analytics: true,
    marketing: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('jonikwiria_cookie_consent');
    if (!saved) {
      // Delay display slightly for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // fallback
      }
    }

    // Allow global re-trigger from footer "Cookie Settings"
    window.openCookiePreferences = () => {
      setVisible(true);
      setPreferencesOpen(true);
    };

    return () => {
      delete window.openCookiePreferences;
    };
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { essential: true, analytics: true, marketing: true };
    localStorage.setItem('jonikwiria_cookie_consent', JSON.stringify(fullConsent));
    setSettings(fullConsent);
    setVisible(false);
    setPreferencesOpen(false);
  };

  const handleRejectNonEssential = () => {
    const minConsent = { essential: true, analytics: false, marketing: false };
    localStorage.setItem('jonikwiria_cookie_consent', JSON.stringify(minConsent));
    setSettings(minConsent);
    setVisible(false);
    setPreferencesOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('jonikwiria_cookie_consent', JSON.stringify(settings));
    setVisible(false);
    setPreferencesOpen(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="cookie-consent-container animate-fade-in"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        right: 24,
        maxWidth: 720,
        margin: '0 auto',
        zIndex: 99999,
        background: 'rgba(11, 19, 43, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        color: '#fff'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .cookie-btn-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        @media (max-width: 540px) {
          .cookie-btn-group {
            width: 100%;
          }
          .cookie-btn-group button {
            flex: 1 1 100%;
            justify-content: center;
          }
        }
        .cookie-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 0.6rem;
        }
      `}} />

      {!preferencesOpen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,123,255,0.35)' }}>
              <Cookie size={22} color="#fff" />
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                We Value Your Privacy
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                We use cookies and essential identifiers to personalize content, retain your portal session, and analyze platform performance in accordance with our{' '}
                <Link to="/p/cookie-policy" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}>
                  Cookie Policy
                </Link>
                {' '}and{' '}
                <Link to="/p/privacy-policy" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 600 }}>
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setPreferencesOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: 0 }}
            >
              <Settings size={14} />
              <span>Customize Preferences</span>
            </button>

            <div className="cookie-btn-group">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{ padding: '0.55rem 1.15rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.4rem', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Preferences Modal */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Settings size={18} color="#60a5fa" />
              <span>Cookie &amp; Tracking Preferences</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setPreferencesOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {/* 1. Essential */}
            <div className="cookie-toggle">
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#fff' }}>Strictly Necessary Cookies</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Required for authentication, security and navigation.</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                Always Active
              </span>
            </div>

            {/* 2. Analytics */}
            <div className="cookie-toggle">
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#fff' }}>Performance &amp; Analytics</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Help us measure and improve page load and learning engagement.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.analytics}
                onChange={e => setSettings({ ...settings, analytics: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* 3. Marketing */}
            <div className="cookie-toggle">
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#fff' }}>Marketing &amp; Announcements</strong>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Receive relevant workshop schedules and scholarship alerts.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.marketing}
                onChange={e => setSettings({ ...settings, marketing: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setPreferencesOpen(false)}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1', fontSize: '0.84rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePreferences}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Save My Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;
