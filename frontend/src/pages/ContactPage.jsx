import React, { useState } from 'react';
import { 
  MessageSquare, Phone, Mail, MapPin, Clock, Send, 
  CheckCircle2, Sparkles, Shield, HelpCircle, ChevronDown, 
  ChevronUp, ArrowRight, ExternalLink, Headphones, Users,
  Building2, BookOpen, AlertCircle, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrgSettings } from '../context/OrgSettingsContext';
import PageBanner from '../components/common/PageBanner';
import api from '../services/api';

const ContactPage = () => {
  const { orgSettings } = useOrgSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'admissions',
    studentId: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const phone = orgSettings?.contactPhone || '+234 800 566 4594';
  const email = orgSettings?.contactEmail || 'admissions@jonikwiria.com';
  const address = orgSettings?.address || '14 Technology Innovation Boulevard, Digital Hub, Lagos, Nigeria';

  const faqs = [
    {
      q: 'How do I apply and register for an academic tech track?',
      a: 'You can register online by clicking the "Register" button in the top navigation bar, selecting your desired course, and filling out the brief applicant profile. An admissions mentor will contact you within 24 hours.'
    },
    {
      q: 'Are the certificates verified and recognized in the industry?',
      a: 'Yes, every graduate receives a tamper-proof, globally verifiable digital certificate with a unique credential ID and QR code, recognized by our network of over 120+ hiring and enterprise partners.'
    },
    {
      q: 'Can I pay my tuition in installments or apply for sponsorship?',
      a: 'Yes, JONIKWIRIA provides flexible monthly installment plans as well as merit-based scholarships and corporate sponsored seats for qualified candidates.'
    },
    {
      q: 'Do you offer online classes as well as in-person physical classes?',
      a: 'We offer both options: 100% live interactive online classes with remote lab environments, and hybrid hands-on sessions at our campus innovation centers.'
    },
    {
      q: 'How do I request corporate training or custom software engineering?',
      a: 'Select "Corporate Training & Bootcamps" or "Custom Software Development" in the inquiry form below, and our enterprise solutions architect will schedule a discovery call with your executive team.'
    }
  ];

  const filteredFaqs = searchQuery.trim()
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || formData.inquiryType,
        message: formData.message
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .contact-channels-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: -3rem;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 1024px) {
          .contact-channels-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
            margin-top: -2.5rem;
          }
        }
        @media (max-width: 600px) {
          .contact-channels-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-top: -1.5rem;
          }
        }
        .contact-main-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 3rem;
          margin-top: 4rem;
          align-items: start;
        }
        @media (max-width: 960px) {
          .contact-main-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
        .channel-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.75rem 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }
        .channel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,123,255,0.12);
          border-color: var(--primary);
        }
        .faq-accordion-item {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          margin-bottom: 0.85rem;
          overflow: hidden;
          transition: var(--transition);
        }
        .faq-accordion-header {
          padding: 1.15rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-weight: 700;
          color: var(--text-main);
          font-size: 1rem;
        }
        .faq-accordion-body {
          padding: 0 1.5rem 1.25rem 1.5rem;
          color: var(--text-muted);
          line-height: 1.7;
          font-size: 0.94rem;
          word-break: break-word;
        }
      `}} />

      {/* 1. Header Hero Banner */}
      <PageBanner
        badge="24/7 Support & Help Desk"
        badgeIcon={Headphones}
        title="How Can We Assist You Today?"
        subtitle="Connect directly with our admissions counsellors, academic advisors, and technical support team for fast assistance."
        breadcrumbs={[{ label: 'Help & Contact Center', path: '/contact' }]}
      >
        <div style={{ maxWidth: 580, margin: '0 auto', width: '100%', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search help topics, FAQs, admissions, fees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem 0.9rem 2.85rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '0.95rem',
              backdropFilter: 'blur(12px)',
              outline: 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </PageBanner>

      <div className="container">
        {/* 2. Four Direct Contact Channels (Jumia Customer Service Cards) */}
        <div className="contact-channels-grid">
          
          {/* Card 1: WhatsApp / Live Chat */}
          <div className="channel-card">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <MessageSquare size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Fastest Channel</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Instant Live Chat</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Chat directly with our admissions desk on WhatsApp for instant replies.
            </p>
            <a 
              href="https://wa.me/2348005664594?text=Hello%20JONIKWIRIA%20Admissions%20Team" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-sm btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
            >
              <span>Start WhatsApp Chat</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Card 2: Phone Hotline */}
          <div className="channel-card">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(0,123,255,0.12)', color: '#007bff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Phone size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Toll-Free Phone</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Call Us Directly</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Mon – Sat from 8:00 AM – 7:00 PM for voice admissions mentoring.
            </p>
            <a 
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`} 
              className="btn btn-sm btn-outline"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
            >
              <span>{phone}</span>
            </a>
          </div>

          {/* Card 3: Email Support */}
          <div className="channel-card">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Mail size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Official Enquiries</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Email Admissions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Send formal proposals, transcripts, and partnership requests.
            </p>
            <a 
              href={`mailto:${email}`} 
              className="btn btn-sm btn-outline"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
            >
              <span>{email}</span>
            </a>
          </div>

          {/* Card 4: Innovation Campus Center */}
          <div className="channel-card">
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <MapPin size={24} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Main Campus</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Visit Our Hub</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              Experience our state-of-the-art computer labs and robotics arena in person.
            </p>
            <a 
              href="#campus-location" 
              className="btn btn-sm btn-outline"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', fontWeight: 700 }}
            >
              <span>View Hub Location</span>
            </a>
          </div>

        </div>

        {/* 3. Main Split: Inquiry Ticket Form (Left) & FAQs / Office Info (Right) */}
        <div className="contact-main-grid">
          
          {/* Left: Jumia-Style Customer Ticket & Inquiry Form */}
          <div 
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: 'clamp(1.75rem, 4vw, 3rem)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
              <Send size={14} color="#007bff" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Send Inquiry</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
              Submit a Support Request
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
              Fill out the form below and an assigned counselor will review your ticket and reach out promptly.
            </p>

            {submitted ? (
              <div style={{ padding: '2.5rem 2rem', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', margin: '0 0 0.5rem 0' }}>Request Submitted Successfully!</h3>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', maxWidth: 450, margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                  Thank you, <strong>{formData.name}</strong>. Your inquiry has been routed to our student relations desk. We have sent a confirmation copy to <strong>{formData.email}</strong>.
                </p>
                <button 
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', inquiryType: 'admissions', studentId: '', subject: '', message: '' }); }}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', borderRadius: '12px', fontWeight: 800 }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Chukwuemeka Adebayo"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Phone / WhatsApp Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      required
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      Inquiry Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formData.inquiryType}
                      onChange={e => setFormData({ ...formData, inquiryType: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
                    >
                      <option value="admissions">Course Admissions &amp; Enrollment</option>
                      <option value="fees">Tuition, Installments &amp; Scholarships</option>
                      <option value="corporate">Corporate Training &amp; Bootcamps</option>
                      <option value="software">Custom Software &amp; AI Engineering</option>
                      <option value="certificate">Certificate Verification</option>
                      <option value="general">General Support / Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Subject <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="Brief summary of your inquiry..."
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Detailed Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={5}
                    className="form-input"
                    required
                    placeholder="Explain your request, questions, or learning goals..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Shield size={14} color="#10b981" />
                    <span>Your personal data is encrypted &amp; private.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 2.25rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>{submitting ? 'Submitting Request...' : 'Send Message'}</span>
                    <Send size={16} />
                  </button>
                </div>
                {submitError && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.5rem' }}>
                    <AlertCircle size={16} />{submitError}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Right: FAQs & Headquarter Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* FAQ Accordion Block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <HelpCircle size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Frequently Asked Questions
                </h3>
              </div>

              <div>
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="faq-accordion-item">
                      <div 
                        className="faq-accordion-header"
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} />}
                      </div>
                      {isOpen && (
                        <div className="faq-accordion-body animate-fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hub Campus Box */}
            <div 
              id="campus-location"
              style={{
                padding: '2rem',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={18} color="var(--primary)" />
                <span>Headquarters &amp; Innovation Labs</span>
              </h4>

              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {address}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="var(--primary)" />
                  <span><strong>Operating Hours:</strong> Monday – Saturday: 8:00 AM – 7:00 PM (WAT)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} color="var(--primary)" />
                  <span><strong>Campus Walk-Ins:</strong> Visitors &amp; students welcome without prior appointment.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
