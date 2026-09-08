import React, { useState, useEffect } from 'react';
import { 
  Building2, BookOpen, Newspaper, CalendarDays, Award, 
  ShieldCheck, Sparkles, Clock, Facebook, Twitter, 
  Instagram, Linkedin, ArrowRight, CheckCircle2, UserCheck,
  FileText, Shield, Mail, Send, Phone, MapPin, ChevronDown, 
  ChevronUp, ExternalLink, Cookie, Lock, CreditCard, Headphones, Loader2
} from 'lucide-react';
import { useOrgSettings } from '../../context/OrgSettingsContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullMediaUrl } from '../../utils/mediaUrl';

const Footer = () => {
  const { orgSettings, headerConfig } = useOrgSettings();
  const [footerConfig, setFooterConfig] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [openAccordions, setOpenAccordions] = useState({});

  useEffect(() => {
    // 1. Fetch active footer layout configuration from Admin Dashboard
    api.get('/footers/active')
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setFooterConfig(res.data.data);
        }
      })
      .catch(() => {});

    // 2. Fetch live departments and courses for dynamic link fallback
    api.get('/departments/active')
      .then(res => { if (res.data?.success) setDepartments(res.data.data?.slice(0, 5) || []); })
      .catch(() => {});

    api.get('/courses/active?limit=5')
      .then(res => { if (res.data?.success) setCourses(res.data.data || []); })
      .catch(() => {});
  }, []);

  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;
  const fullLogoUrl = logoUrl ? getFullMediaUrl(logoUrl) : null;
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || newsletterLoading) return;
    setNewsletterLoading(true);
    setNewsletterError('');
    try {
      const res = await api.post('/subscribers/subscribe', {
        email: newsletterEmail.trim(),
        source: 'footer_digest'
      });
      if (res.data?.success) {
        setNewsletterSubscribed(true);
        setNewsletterFeedback(res.data.message || 'Thank you for subscribing! Check your email for our welcome kit.');
      } else {
        setNewsletterError(res.data?.error || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setNewsletterError(err.response?.data?.error || 'Unable to subscribe right now. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const toggleAccordion = (idx) => {
    setOpenAccordions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Fallback defaults if no custom admin columns configured
  const defaultColumns = [
    {
      header: 'Academic Faculties',
      type: 'links',
      links: departments.length > 0
        ? departments.map(d => ({ label: d.name, url: '/courses' }))
        : [
            { label: 'Software Engineering', url: '/courses' },
            { label: 'Artificial Intelligence & Data', url: '/courses' },
            { label: 'Cybersecurity & Cloud Defense', url: '/courses' },
            { label: 'Youth Robotics & Gaming', url: '/courses' },
            { label: 'Corporate IT Upskilling', url: '/p/about-us' }
          ]
    },
    {
      header: 'Featured Courses',
      type: 'links',
      links: courses.length > 0
        ? courses.map(c => ({ label: c.title, url: `/courses/${c.slug}` }))
        : [
            { label: 'Full-Stack Web Bootcamp', url: '/courses' },
            { label: 'Generative AI & PyTorch', url: '/courses' },
            { label: 'Cloud Architecture & DevOps', url: '/courses' },
            { label: 'Python Robotics for Kids', url: '/courses' },
            { label: 'Data Analytics & PowerBI', url: '/courses' }
          ]
    },
    {
      header: 'Customer Care & Portals',
      type: 'links',
      links: [
        { label: 'Help & Contact Center', url: '/contact' },
        { label: 'Latest News & Media', url: '/news' },
        { label: 'Summits & Workshops', url: '/events' },
        { label: 'Student Learning Portal', url: '/login?portal=student' },
        { label: 'Admin Dashboard Login', url: '/login?portal=admin' },
        { label: 'Apply for Admission', url: '/register' }
      ]
    }
  ];

  const columnsToRender = footerConfig?.columns && footerConfig.columns.length > 0
    ? footerConfig.columns
    : defaultColumns;

  const extra = footerConfig?.extraSettings || {};
  const phone = extra.phone || orgSettings?.contactPhone || '+234 800 566 4594';
  const email = extra.email || orgSettings?.contactEmail || 'admissions@jonikwiria.com';
  const address = extra.address || orgSettings?.address || '14 Technology Innovation Boulevard, Digital Hub, Lagos, Nigeria';
  const copyrightText = footerConfig?.copyrightText || 'JONIKWIRIA Technology Limited. All rights reserved.';

  const socials = extra.socials || {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  };

  const dynamicPolicies = extra.policies || [
    { label: 'Privacy Policy', url: '/p/privacy-policy' },
    { label: 'Terms of Service', url: '/p/terms-of-service' },
    { label: 'Cookie Policy', url: '/p/cookie-policy' },
    { label: 'Refund Policy', url: '/p/refund-policy' }
  ];

  return (
    <footer style={{ background: '#070d1d', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .footer-newsletter-wrap {
          background: linear-gradient(135deg, #0b132b 0%, #16203d 100%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.12);
          padding: clamp(2rem, 4vw, 3rem);
          margin-bottom: 3.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(0,0,0,0.25);
        }
        .footer-newsletter-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 960px) {
          .footer-newsletter-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        .footer-highlights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
        }
        @media (max-width: 1024px) {
          .footer-highlights-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        @media (max-width: 580px) {
          .footer-highlights-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
        .footer-main-columns {
          display: grid;
          grid-template-columns: 1.35fr repeat(${Math.max(1, columnsToRender.length)}, 1fr);
          gap: 2.5rem;
          margin-bottom: 3.5rem;
        }
        @media (max-width: 1024px) {
          .footer-main-columns {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 768px) {
          .footer-main-columns {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .footer-brand-column {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .jumia-footer-accordion {
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .jumia-footer-accordion-header {
            padding: 1.15rem 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            cursor: pointer !important;
            font-weight: 800 !important;
            font-size: 1.05rem !important;
            color: #ffffff !important;
            margin: 0 !important;
          }
          .jumia-footer-accordion-content {
            padding: 0 0 1.25rem 0 !important;
          }
        }
        @media (min-width: 769px) {
          .jumia-footer-accordion-header {
            color: #ffffff;
            font-size: 1.05rem;
            font-weight: 800;
            margin-bottom: 1.25rem;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 0.4rem;
            display: inline-block;
          }
          .jumia-footer-accordion-icon {
            display: none !important;
          }
          .jumia-footer-accordion-content {
            display: block !important;
          }
        }
        .footer-link-item {
          color: #94a3b8;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease, transform 0.2s ease;
          font-size: 0.92rem;
        }
        .footer-link-item:hover {
          color: #ffffff !important;
          transform: translateX(3px);
        }
        .social-btn-footer {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: var(--transition);
        }
        .social-btn-footer:hover {
          background: var(--primary);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }
      `}} />

      {/* Ambient background glow */}
      <div style={{ position: 'absolute', top: 0, left: '20%', width: 500, height: 250, background: 'radial-gradient(circle, rgba(0,123,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '10%', width: 400, height: 250, background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '3rem' }}>
        
        {/* 1. TOP NEWSLETTER SUBSCRIPTION STRIP (Inside the Footer) */}
        <div className="footer-newsletter-wrap">
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,123,255,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          <div className="footer-newsletter-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.2)', border: '1px solid rgba(0,123,255,0.4)', borderRadius: '9999px', padding: '0.3rem 0.9rem', marginBottom: '0.85rem' }}>
                <Sparkles size={13} color="#60a5fa" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>JONIKWIRIA Technology Digest</span>
              </div>
              <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {extra.newsletterTitle || 'Subscribe to Tech Insights & Cohort Schedules'}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: 0, lineHeight: 1.6 }}>
                {extra.newsletterDesc || 'Get weekly technology research, guest speaker invitations, scholarship notices, and career bootcamps directly in your inbox.'}
              </p>
            </div>

            <div>
              {newsletterSubscribed ? (
                <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(16,185,129,0.18)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontWeight: 700 }}>{newsletterFeedback || 'Thank you for subscribing! Check your email for our welcome kit.'}</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      required
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      disabled={newsletterLoading}
                      style={{
                        flex: '1 1 220px',
                        padding: '0.85rem 1.15rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading}
                      className="btn btn-primary"
                      style={{
                        padding: '0.85rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        whiteSpace: 'nowrap',
                        opacity: newsletterLoading ? 0.7 : 1,
                        cursor: newsletterLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {newsletterLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe</span>
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  </div>
                  {newsletterError && (
                    <div style={{ color: '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
                      {newsletterError}
                    </div>
                  )}
                </form>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Shield size={12} color="#10b981" />
                <span>Zero spam guarantee. You can unsubscribe at any time.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. VALUE PILLARS / TRUST HIGHLIGHTS */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2.5rem', marginBottom: '3.5rem' }}>
          <div className="footer-highlights-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,123,255,0.12)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={22} />
              </div>
              <div>
                <h5 style={{ color: '#fff', fontSize: '0.94rem', fontWeight: 800, margin: '0 0 2px 0' }}>Verified Certification</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Globally recognized digital badges</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h5 style={{ color: '#fff', fontSize: '0.94rem', fontWeight: 800, margin: '0 0 2px 0' }}>Industry-Led Curriculum</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Engineered by senior tech architects</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={22} />
              </div>
              <div>
                <h5 style={{ color: '#fff', fontSize: '0.94rem', fontWeight: 800, margin: '0 0 2px 0' }}>100% Practical Labs</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Real-world code &amp; capstone projects</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={22} />
              </div>
              <div>
                <h5 style={{ color: '#fff', fontSize: '0.94rem', fontWeight: 800, margin: '0 0 2px 0' }}>Lifetime Portal Access</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Learn at your pace with full archives</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN FOOTER MULTI-COLUMN GRID (Jumia-style Mobile Accordion) */}
        <div className="footer-main-columns">
          
          {/* Brand & Direct Contact Column */}
          <div className="footer-brand-column">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
              {fullLogoUrl ? (
                <img
                  src={fullLogoUrl}
                  alt="JONIKWIRIA Limited"
                  style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(0,123,255,0.3)' }}>
                  JK
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>JONIKWIRIA</span>
                <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Technology Limited</span>
              </div>
            </Link>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1.25rem 0' }}>
              Pioneering technology education, artificial intelligence research, and custom enterprise software development.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} color="var(--primary)" />
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{phone}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} color="var(--primary)" />
                <a href={`mailto:${email}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{email}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{address}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noreferrer" className="social-btn-footer" title="Facebook">
                  <Facebook size={16} />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="social-btn-footer" title="Twitter / X">
                  <Twitter size={16} />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="social-btn-footer" title="Instagram">
                  <Instagram size={16} />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="social-btn-footer" title="LinkedIn">
                  <Linkedin size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Admin-Configured Columns (with Jumia Mobile Collapsible Behavior) */}
          {columnsToRender.map((col, cIdx) => {
            const isAccordionOpen = !!openAccordions[cIdx];
            return (
              <div key={cIdx} className="jumia-footer-accordion">
                <div 
                  className="jumia-footer-accordion-header"
                  onClick={() => toggleAccordion(cIdx)}
                >
                  <span>{col.header || `Section ${cIdx + 1}`}</span>
                  <span className="jumia-footer-accordion-icon">
                    {isAccordionOpen ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} />}
                  </span>
                </div>

                <div 
                  className="jumia-footer-accordion-content"
                  style={{ display: isAccordionOpen ? 'block' : 'none' }}
                >
                  {col.type === 'html' && (
                    <div 
                      dangerouslySetInnerHTML={{ __html: col.content || '' }} 
                      style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.65 }}
                    />
                  )}

                  {(col.type === 'links' || !col.type) && col.links && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {col.links.map((lnk, lIdx) => (
                        <li key={lIdx}>
                          <Link to={lnk.url || '#'} className="footer-link-item">
                            <span>{lnk.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {col.type === 'contact' && (
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ margin: 0 }}><strong>Phone:</strong> {phone}</p>
                      <p style={{ margin: 0 }}><strong>Email:</strong> {email}</p>
                      <p style={{ margin: 0 }}><strong>Campus:</strong> {address}</p>
                      <Link to="/contact" className="btn btn-sm btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                        Visit Help Center
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        {/* 4. BOTTOM BAR: Policies, Cookies, Payment Badges & Copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Security & Payment Badges Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                All Systems Operational
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} color="#60a5fa" />
                256-Bit SSL Encrypted
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Shield size={13} color="#a78bfa" />
                ISO 9001:2015 &amp; NDPR Compliant
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.78rem' }}>
              <CreditCard size={15} />
              <span>Secure Payments: Visa • Mastercard • Verve • Bank Transfer</span>
            </div>
          </div>

          {/* Policy Links & Copyright */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.84rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            <div>
              &copy; {currentYear} <strong>{copyrightText}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {dynamicPolicies.map((p, pIdx) => (
                <Link key={pIdx} to={p.url} style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-white">
                  {p.label}
                </Link>
              ))}
              
              {/* Admin Dashboard Quick Gateway */}
              <Link
                to="/login?portal=admin"
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color 0.2s'
                }}
                className="hover:text-white"
                title="Management & Administrative Dashboard Portal"
              >
                <Shield size={13} color="#38bdf8" />
                <span>Admin Portal</span>
              </Link>

              {/* Discrete Cookie Settings Trigger */}
              <button
                type="button"
                onClick={() => window.openCookiePreferences && window.openCookiePreferences()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  padding: 0,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Cookie size={13} />
                <span>Cookie Settings</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
