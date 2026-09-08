import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, Share2,
  ArrowLeft, Tag, CheckCircle, AlertCircle, XCircle, Timer, Ticket
} from 'lucide-react';
import api from '../services/api';
import { getFullMediaUrl } from '../utils/mediaUrl';
import PageBanner from '../components/common/PageBanner';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmtDate = (str, opts) => {
  try {
    return new Date(str).toLocaleDateString('en-GB', opts || {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch { return ''; }
};

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Timer },
  ongoing: { label: 'Happening Now', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  completed: { label: 'Concluded', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle }
};

/* ─── Countdown Timer ──────────────────────────────────────────────────────── */
const Countdown = ({ targetDate }) => {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  };
  const [time, setTime] = useState(calc());

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (!time) return null;

  const box = (val, label) => (
    <div style={{ textAlign: 'center', minWidth: 54 }}>
      <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
        {String(val).padStart(2, '0')}
      </div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-app)', borderRadius: 14, padding: '1.25rem', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Timer size={14} color="var(--primary)" /> Event starts in
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        {box(time.d, 'Days')}
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 14 }}>:</span>
        {box(time.h, 'Hours')}
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 14 }}>:</span>
        {box(time.m, 'Mins')}
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: 14 }}>:</span>
        {box(time.s, 'Secs')}
      </div>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────────────────────────── */
const EventDetail = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserved, setReserved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true); setError(''); setEvent(null);
    api.get(`/events/slug/${slug}`)
      .then(res => { if (res.data.success && res.data.data) setEvent(res.data.data); })
      .catch(() => {
        api.get(`/events/public/${slug}`)
          .then(res => { if (res.data.success && res.data.data) setEvent(res.data.data); })
          .catch(() => setError('Event not found.'));
      })
      .finally(() => setLoading(false));

    // Load related/upcoming events for sidebar
    api.get('/events/upcoming?limit=4')
      .then(res => { if (res.data.success) setRelatedEvents(res.data.data || []); })
      .catch(() => {});
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  /* ── Loading State ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading event details…</p>
      </div>
    );
  }

  /* ── Error / Not Found ─────────────────────────────────────────── */
  if (error || !event) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <CalendarDays size={56} style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: 20 }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || "The event you're looking for doesn't exist or has been removed."}</p>
        <Link to="/events" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to All Events
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
  const StatusIcon = statusCfg.icon;
  const isUpcoming = event.status === 'upcoming' && event.startDate && new Date(event.startDate) > Date.now();

  const breadcrumbs = [
    { label: 'Events & Summits', path: '/events' },
    ...(event.category ? [{ label: event.category, path: '/events' }] : []),
    { label: event.title, path: null }
  ];
  const metaItems = [
    { icon: Clock, label: fmtDate(event.startDate), iconColor: '#60a5fa' },
    ...(event.location ? [{ icon: MapPin, label: event.location, iconColor: '#34d399' }] : [])
  ];

  return (
    <div className="event-detail-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Banner */}
      <PageBanner
        badge={statusCfg.label}
        badgeIcon={CalendarDays}
        title={event.title}
        breadcrumbs={breadcrumbs}
        metaItems={metaItems}
        align="left"
      />

      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div className="event-detail-layout">

          {/* ── Left Column: Event Body ─────────────────────────────── */}
          <div style={{ minWidth: 0 }}>
            <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              {/* Hero Image */}
              {event.imageUrl && (
                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: '2rem', maxHeight: 440, background: '#0f172a', position: 'relative' }}>
                  <img src={getFullMediaUrl(event.imageUrl)} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  {/* Status Badge overlay */}
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, background: statusCfg.bg, border: `1px solid ${statusCfg.color}44`, backdropFilter: 'blur(10px)' }}>
                    <StatusIcon size={13} color={statusCfg.color} />
                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: statusCfg.color }}>{statusCfg.label}</span>
                  </div>
                </div>
              )}

              {/* Category + Status badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {!event.imageUrl && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 50, background: statusCfg.bg, border: `1px solid ${statusCfg.color}44` }}>
                    <StatusIcon size={13} color={statusCfg.color} />
                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: statusCfg.color }}>{statusCfg.label}</span>
                  </span>
                )}
                {event.category && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 50, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <Tag size={12} color="#6366f1" />
                    <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#6366f1' }}>{event.category}</span>
                  </span>
                )}
              </div>

              {/* About Section */}
              <h3 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', wordBreak: 'break-word' }}>
                About This Event
              </h3>
              <div style={{ fontSize: 'clamp(0.95rem, 2vw, 1.025rem)', lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {event.description || 'No description provided for this event.'}
              </div>

              {/* Quick Date/Location info in body */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '2rem', padding: '1.25rem', borderRadius: 12, background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={17} color="#3b82f6" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Starts</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginTop: 2 }}>
                      {event.startDate ? fmtDate(event.startDate, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </div>
                  </div>
                </div>
                {event.endDate && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={17} color="#10b981" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ends</div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginTop: 2 }}>
                        {fmtDate(event.endDate, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={17} color="#34d399" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Venue</div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginTop: 2 }}>{event.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* In-content Registration Callout */}
              {event.status !== 'completed' && event.status !== 'cancelled' && (
                <div style={{ marginTop: '2.5rem', padding: '1.5rem 1.75rem', borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,123,255,0.08) 0%, rgba(124,58,237,0.08) 100%)', border: '1px solid rgba(0,123,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>Ready to Attend This Event?</h4>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>Secure your pass online in seconds. You will receive an instant confirmation email and ticket.</p>
                  </div>
                  <Link to={`/events/${event.slug}/register`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 800, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                    <Ticket size={16} /> <span>Register Now</span>
                  </Link>
                </div>
              )}

              {/* Share */}
              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleShare} className="btn btn-sm btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Share2 size={14} />
                  <span>{copied ? '✓ Link Copied!' : 'Share Event'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Column: Registration + Related ────────────────── */}
          <aside style={{ minWidth: 0, width: '100%' }}>

            {/* Countdown Timer */}
            {isUpcoming && <Countdown targetDate={event.startDate} />}

            {/* Registration / Action Card */}
            <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-surface)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarDays size={18} color="var(--primary)" /> Event Access
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starts:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {event.startDate ? fmtDate(event.startDate, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }) : 'TBD'}
                  </span>
                </div>
                {event.endDate && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Concludes:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {fmtDate(event.endDate, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {event.location && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Venue / Stream:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{event.location}</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, color: statusCfg.color }}>
                    <StatusIcon size={13} /> {statusCfg.label}
                  </span>
                </div>
              </div>

              {event.status === 'cancelled' ? (
                <div style={{ padding: '0.85rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 700, fontSize: '0.88rem' }}>
                  <XCircle size={16} /> This event has been cancelled.
                </div>
              ) : event.status === 'completed' ? (
                <div style={{ padding: '0.85rem', borderRadius: 10, background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.25)', display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontWeight: 700, fontSize: '0.88rem' }}>
                  <CheckCircle size={16} /> This event has concluded.
                </div>
              ) : (
                <Link
                  to={`/events/${event.slug}/register`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '0.9rem', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  Register Now →
                </Link>
              )}
            </div>

            {/* Related Upcoming Events */}
            {relatedEvents.filter(e => e.slug !== slug).length > 0 && (
              <div className="card" style={{ padding: 'clamp(1.2rem, 3vw, 1.75rem)', borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>
                  More Upcoming Events
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {relatedEvents.filter(e => e.slug !== slug).slice(0, 3).map(ev => (
                    <div key={ev.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 56, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#0f172a' }}>
                        <img
                          src={getFullMediaUrl(ev.imageUrl) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&auto=format&fit=crop&q=60'}
                          alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>
                          <Link to={`/events/${ev.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }} className="line-clamp-2">
                            {ev.title}
                          </Link>
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} />
                          {ev.startDate ? fmtDate(ev.startDate, { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginTop: '1.1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <ArrowLeft size={14} /> All Events
                </Link>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
