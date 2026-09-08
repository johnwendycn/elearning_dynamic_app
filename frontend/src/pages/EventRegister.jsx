import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, ArrowLeft, User, Mail, Phone,
  Building2, Ticket, FileText, CheckCircle2, AlertCircle, Send,
  ChevronRight, Tag
} from 'lucide-react';
import api from '../services/api';
import { getFullMediaUrl } from '../utils/mediaUrl';
import PageBanner from '../components/common/PageBanner';

const fmtDate = (str) => {
  try { return new Date(str).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return 'TBD'; }
};

/* ── Ticket Card ─────────────────────────────────────────────────── */
const TicketOption = ({ type, label, description, price, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(type)}
    style={{
      flex: 1, textAlign: 'left', padding: '1rem 1.25rem', borderRadius: 14,
      border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
      background: selected ? 'rgba(0,123,255,0.06)' : 'var(--bg-surface)',
      cursor: 'pointer', transition: 'all 0.15s'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
      </div>
      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: selected ? 'var(--primary)' : 'var(--text-main)' }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 700, color: selected ? 'var(--primary)' : 'var(--text-muted)' }}>{price}</span>
    </div>
    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: 26 }}>{description}</p>
  </button>
);

/* ═══════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════ */
const EventRegister = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState('');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    organization: '', ticketType: 'free', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(null); // { registration, event }

  useEffect(() => {
    setEventLoading(true);
    api.get(`/events/slug/${slug}`)
      .then(res => { if (res.data.success) setEvent(res.data.data); else setEventError('Event not found.'); })
      .catch(() => setEventError('Event not found.'))
      .finally(() => setEventLoading(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post('/event-registrations', { ...form, eventId: event.id });
      if (res.data.success) setSuccess(res.data.data);
    } catch (err) {
      setSubmitError(err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (eventLoading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading event details…</p>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <CalendarDays size={56} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 20 }} />
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{eventError}</p>
        <Link to="/events" className="btn btn-primary">← Back to Events</Link>
      </div>
    );
  }

  /* ── Success State ────────────────────────────────────────────────── */
  if (success) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={40} color="#10b981" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: 12 }}>Registration Confirmed!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
            You've successfully registered for <strong>{event.title}</strong>. A confirmation email has been sent to <strong>{form.email}</strong>.
          </p>

          {/* Confirmation details */}
          <div style={{ textAlign: 'left', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '1rem' }}>Your Booking Details</div>
            {[
              { label: 'Name', val: `${form.firstName} ${form.lastName}` },
              { label: 'Email', val: form.email },
              { label: 'Event', val: event.title },
              { label: 'Date', val: fmtDate(event.startDate) },
              { label: 'Venue', val: event.location || 'TBD' },
              { label: 'Ticket', val: form.ticketType.charAt(0).toUpperCase() + form.ticketType.slice(1) }
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={15} /> All Events
            </Link>
            <Link to={`/events/${slug}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              View Event <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration Form ────────────────────────────────────────────── */
  const fieldStyle = { width: '100%', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.92rem', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <PageBanner
        badge="Event Registration"
        badgeIcon={CalendarDays}
        title={`Register for: ${event.title}`}
        breadcrumbs={[
          { label: 'Events', path: '/events' },
          { label: event.title, path: `/events/${slug}` },
          { label: 'Register', path: null }
        ]}
        metaItems={[
          { icon: Clock, label: fmtDate(event.startDate), iconColor: '#60a5fa' },
          ...(event.location ? [{ icon: MapPin, label: event.location, iconColor: '#34d399' }] : [])
        ]}
        align="left"
      />

      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* ── Left: Registration Form ─────────────────────────────── */}
          <div>
            <div className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: 20, border: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Complete Your Registration</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Fill in your details to secure your spot at this event.</p>

              {submitError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.85rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} />{submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={labelStyle}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input style={{ ...fieldStyle, paddingLeft: 36 }} required placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input style={fieldStyle} required placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>

                {/* Email + Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={labelStyle}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input style={{ ...fieldStyle, paddingLeft: 36 }} type="email" required placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input style={{ ...fieldStyle, paddingLeft: 36 }} type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Organization / Company</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input style={{ ...fieldStyle, paddingLeft: 36 }} placeholder="Your organization (optional)" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
                  </div>
                </div>

                {/* Ticket Type */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Ticket Type <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <TicketOption type="free" label="Free" description="Standard access to all sessions" price="FREE" selected={form.ticketType === 'free'} onSelect={t => setForm({ ...form, ticketType: t })} />
                    <TicketOption type="standard" label="Standard" description="Priority seating + event materials" price="Paid" selected={form.ticketType === 'standard'} onSelect={t => setForm({ ...form, ticketType: t })} />
                    <TicketOption type="vip" label="VIP" description="Front-row + networking dinner access" price="VIP" selected={form.ticketType === 'vip'} onSelect={t => setForm({ ...form, ticketType: t })} />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={labelStyle}>Additional Notes</label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                    <textarea rows={3} style={{ ...fieldStyle, paddingLeft: 36, resize: 'vertical', fontFamily: 'inherit' }} placeholder="Special requirements, dietary needs, questions..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '0.95rem', borderRadius: 14, fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Ticket size={18} />
                  {submitting ? 'Submitting Registration...' : 'Confirm My Registration'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  A confirmation email will be sent to your inbox immediately.
                </p>
              </form>
            </div>
          </div>

          {/* ── Right: Event Summary ─────────────────────────────────── */}
          <aside>
            <div className="card" style={{ padding: '1.75rem', borderRadius: 20, border: '1px solid var(--border)', position: 'sticky', top: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarDays size={18} color="var(--primary)" />Event Summary
              </h3>

              {event.imageUrl && (
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: '1.25rem', height: 160 }}>
                  <img src={getFullMediaUrl(event.imageUrl)} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
              )}

              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '1rem', lineHeight: 1.4 }}>{event.title}</div>

              {event.category && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', marginBottom: '1rem' }}>
                  <Tag size={12} color="#6366f1" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>{event.category}</span>
                </div>
              )}

              {[
                { icon: Clock, label: 'Date', val: fmtDate(event.startDate), color: '#60a5fa' },
                ...(event.location ? [{ icon: MapPin, label: 'Venue', val: event.location, color: '#34d399' }] : [])
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} style={{ display: 'flex', gap: 10, marginBottom: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 2 }}>{val}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Link to={`/events/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> Back to Event
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventRegister;
