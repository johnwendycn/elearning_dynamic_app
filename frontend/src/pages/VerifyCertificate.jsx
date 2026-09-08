import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck, Award, Calendar, CheckCircle2, User, BookOpen,
  ArrowRight, Search, Sparkles, AlertCircle, ExternalLink
} from 'lucide-react';
import api from '../services/api';
import PageBanner from '../components/common/PageBanner';

const VerifyCertificate = () => {
  const { credentialId } = useParams();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(credentialId || '');

  const verifyId = credentialId || searchInput;

  useEffect(() => {
    if (credentialId) {
      handleVerify(credentialId);
    } else {
      setLoading(false);
    }
  }, [credentialId]);

  const handleVerify = (idToVerify) => {
    const id = (idToVerify || searchInput).trim();
    if (!id) return;

    setLoading(true);
    setError('');
    api.get(`/student/certificates/verify/${id}`)
      .then((res) => {
        if (res.data.success) {
          setCertData(res.data.data);
        }
      })
      .catch((err) => {
        setCertData(null);
        setError(err.response?.data?.error || 'Invalid or unrecognized certificate identifier.');
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(searchInput);
  };

  return (
    <div className="verify-certificate-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Banner */}
      <PageBanner
        badge="Official Verification Registry"
        badgeIcon={ShieldCheck}
        title="JONIKWIRIA Credential Verification"
        subtitle="Verify the validity, authenticity, and curriculum completion records for JONIKWIRIA certified graduates."
        breadcrumbs={[{ label: 'Certificate Verification', path: '/verify' }]}
      >
        <form onSubmit={handleSubmit} style={{ maxWidth: '580px', margin: '0 auto', width: '100%', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Enter Credential ID (e.g. JK-2026-A8F9B2)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 6.5rem 0.9rem 2.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.95rem',
              backdropFilter: 'blur(10px)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '9999px',
              padding: '0.55rem 1.25rem',
              fontWeight: 800
            }}
          >
            Verify
          </button>
        </form>
      </PageBanner>

      <div className="container" style={{ marginTop: '3rem', maxWidth: '780px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ display: 'inline-block', width: '44px', height: '44px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Querying credential verification registry...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', border: '1px solid rgba(239,68,68,0.3)', background: 'var(--bg-surface)' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Credential Verification Failed</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>{error}</p>
            <Link to="/courses" className="btn btn-secondary btn-sm">Explore Certified Tech Programs</Link>
          </div>
        ) : certData ? (
          <div className="card animate-fade-in" style={{ padding: 'clamp(2rem, 4vw, 3rem)', border: '2px solid var(--success)', background: 'var(--bg-surface)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            {/* Status Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.05em' }}>
                    Authentic Verified Record
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                    Valid JONIKWIRIA Credential
                  </h3>
                </div>
              </div>

              <span style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800 }}>
                Status: Verified Active
              </span>
            </div>

            {/* Credential Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Recipient Scholar</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.35rem 0 0 0' }}>
                  {certData.recipientName}
                </h4>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Award Granted</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', margin: '0.35rem 0 0 0' }}>
                  {certData.metadata?.certificateType || 'Certificate of Participation'}
                </h4>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Course Completed</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', margin: '0.35rem 0 0 0' }}>
                  {certData.courseTitle}
                </h4>
                {certData.metadata?.department && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    {certData.metadata.department}
                  </div>
                )}
              </div>

              {certData.metadata?.finalScore && (
                <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Academic Evaluation</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--success)', marginTop: '0.35rem' }}>
                    Score: {certData.metadata.finalScore}%
                    {certData.metadata.distinction && (
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', marginLeft: '0.5rem', fontWeight: 700 }}>
                        • {certData.metadata.distinction}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Date Awarded</span>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  {new Date(certData.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Credential ID</span>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  <code style={{ color: 'var(--primary)' }}>{certData.credentialId}</code>
                </div>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div style={{ background: 'var(--bg-app)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
              <strong>Cryptographic Verification Hash:</strong> <code>{certData.verificationHash}</code>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'var(--bg-surface)', border: '1px dashed var(--border)' }}>
            <Award size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Enter a Credential ID</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
              Enter the unique Credential ID located on any JONIKWIRIA certificate to verify recipient identity and completion records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
