import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award, ShieldCheck, Download, Printer, Share2, ArrowLeft,
  CheckCircle2, Copy, ExternalLink, Sparkles, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOrgSettings } from '../context/OrgSettingsContext';

const CertificateViewer = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { orgSettings } = useOrgSettings();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const siteName = orgSettings?.siteName || 'JONIKWIRIA Academy of Technology';

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = () => {
    setLoading(true);
    api.get('/student/certificates/my-certificates')
      .then((res) => {
        if (res.data.success) {
          const list = res.data.data || [];
          const cert = list.find(c => String(c.courseId) === String(courseId) || String(c.id) === String(courseId));
          if (cert) {
            setCertificate(cert);
          } else if (list.length > 0) {
            setCertificate(list[0]);
          } else {
            setError('No issued certificate found for this course. Please ensure you have completed 100% of all phases.');
          }
        }
      })
      .catch((err) => {
        console.error('Error loading certificate:', err);
        setError('Unable to retrieve certificate details.');
      })
      .finally(() => setLoading(false));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (!certificate) return;
    const verifyUrl = `${window.location.origin}/verify/${certificate.credentialId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid var(--border)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Rendering high-resolution verifiable digital certificate...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Certificate Not Available</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>{error}</p>
        <Link to="/student/my-learning" className="btn btn-primary">Back to Student Portal</Link>
      </div>
    );
  }

  const issueDateFormatted = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const verifyUrl = `${window.location.origin}/verify/${certificate.credentialId}`;

  return (
    <div className="certificate-page animate-fade-in" style={{ padding: '2.5rem 1rem 6rem 1rem', background: 'var(--bg-app)' }}>
      {/* ── Top Action Header (Hidden during Print) ───────────────────────── */}
      <div className="container no-print" style={{ maxWidth: '1000px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-surface)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <Link to="/student/my-learning" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={15} />
            <span>My Learning Portal</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={handleCopyLink} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {copied ? <CheckCircle2 size={15} color="var(--success)" /> : <Copy size={15} />}
              <span>{copied ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Official JONIKWIRIA Certificate of Participation ───────────── */}
      <div className="container certificate-print-container" style={{ maxWidth: '960px' }}>
        <div
          ref={printRef}
          className="certificate-card"
          style={{
            background: 'linear-gradient(145deg, #090e1a 0%, #0f172a 100%)',
            color: '#f8fafc',
            padding: 'clamp(2rem, 5vw, 4rem)',
            borderRadius: '24px',
            border: '12px solid #060a12',
            boxShadow: '0 25px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.3)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'serif'
          }}
        >
          {/* Ornate Gold Border Inset */}
          <div style={{ position: 'absolute', inset: '12px', border: '2px solid #fbbf24', pointerEvents: 'none', borderRadius: '14px', boxShadow: 'inset 0 0 20px rgba(251,191,36,0.1)' }} />
          <div style={{ position: 'absolute', inset: '16px', border: '1px solid rgba(251,191,36,0.35)', pointerEvents: 'none', borderRadius: '10px' }} />

          {/* Background Watermark Crest */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '420px', height: '420px', opacity: 0.05, pointerEvents: 'none', background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />

          {/* Header & Crest */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fbbf24', border: '3px solid #fbbf24', marginBottom: '1rem', boxShadow: '0 4px 20px rgba(251,191,36,0.35)' }}>
              <Award size={38} />
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#94a3b8', marginBottom: '0.35rem', fontFamily: 'sans-serif' }}>
              {siteName}
            </div>

            <h1 style={{ fontSize: 'clamp(1.85rem, 4.2vw, 2.9rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#fbbf24', margin: '0 0 0.5rem 0', lineHeight: 1.15, textShadow: '0 2px 10px rgba(251,191,36,0.2)' }}>
              Certificate of Participation
            </h1>

            <div style={{ width: '140px', height: '3px', background: 'linear-gradient(90deg, transparent 0%, #fbbf24 50%, transparent 100%)', margin: '0.85rem auto' }} />
          </div>

          {/* Recipient Details */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, margin: '2rem 0' }}>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', fontStyle: 'italic', margin: '0 0 0.85rem 0' }}>
              This official certificate is proudly conferred upon
            </p>

            <h2 style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.2rem)', fontWeight: 900, color: '#38bdf8', margin: '0 0 1rem 0', borderBottom: '2px solid rgba(56,189,248,0.3)', display: 'inline-block', paddingBottom: '0.5rem', letterSpacing: '0.02em', textShadow: '0 2px 12px rgba(56,189,248,0.25)' }}>
              {certificate.recipientName}
            </h2>

            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.65, maxWidth: '700px', margin: '1rem auto 0 auto' }}>
              for successful participation, completion of curriculum units and modules, and demonstrated practical excellence in
            </p>

            <h3 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 1.95rem)', fontWeight: 800, color: '#fff', margin: '1.1rem 0 0.75rem 0' }}>
              {certificate.courseTitle}
            </h3>

            {certificate.metadata?.department && (
              <div style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: 600, fontFamily: 'sans-serif' }}>
                {certificate.metadata.department}
              </div>
            )}

            {/* Academic Score & Distinction Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginTop: '1.5rem', flexWrap: 'wrap', fontFamily: 'sans-serif' }}>
              {certificate.metadata?.finalScore && (
                <div style={{ padding: '0.45rem 1.1rem', borderRadius: '9999px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  <span>Academic Evaluation: {certificate.metadata.finalScore}%</span>
                </div>
              )}
              {certificate.metadata?.distinction && (
                <div style={{ padding: '0.45rem 1.1rem', borderRadius: '9999px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} />
                  <span>Grade: {certificate.metadata.distinction}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Metadata & Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'end', marginTop: '3.5rem', position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '2rem', fontFamily: 'sans-serif' }}>
            {/* Date & Issue */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em' }}>Date Awarded</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9', marginTop: 4 }}>{issueDateFormatted}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Credential ID: <code style={{ color: '#fbbf24' }}>{certificate.credentialId}</code></div>
            </div>

            {/* Official Gold Seal */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: 'radial-gradient(circle, #fbbf24 0%, #b45309 100%)', border: '3px dashed #090e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#090e1a', boxShadow: '0 4px 20px rgba(251,191,36,0.4)' }}>
                <ShieldCheck size={38} />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fbbf24', marginTop: 6 }}>
                Official Verified Seal
              </span>
            </div>

            {/* Signature */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: '1.3rem', color: '#38bdf8', fontWeight: 700, borderBottom: '1px solid rgba(56,189,248,0.4)', display: 'inline-block', paddingBottom: 3, marginBottom: 4 }}>
                Dr. Jonathan Kwiria
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9' }}>Director of Academics &amp; Technology</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>JONIKWIRIA Global Faculty Board</div>
            </div>
          </div>

          {/* Online Verification Notice */}
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.74rem', color: '#64748b', fontFamily: 'sans-serif', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            Verify authenticity at: <a href={verifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontWeight: 700 }}>{verifyUrl}</a>
          </div>
        </div>
      </div>

      {/* Print Friendly Styles */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000 !important; margin: 0 !important; padding: 0 !important; }
          .no-print, header, footer { display: none !important; }
          .certificate-print-container { max-width: 100% !important; margin: 0 !important; }
          .certificate-card {
            background: #ffffff !important;
            color: #0b132b !important;
            border: 8px solid #0b132b !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .certificate-card h1 { color: #0b132b !important; text-shadow: none !important; }
          .certificate-card h2 { color: #0052cc !important; text-shadow: none !important; border-bottom: 2px solid #0052cc !important; }
          .certificate-card h3 { color: #0b132b !important; }
          .certificate-card p { color: #334155 !important; }
          .certificate-card * { text-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CertificateViewer;
