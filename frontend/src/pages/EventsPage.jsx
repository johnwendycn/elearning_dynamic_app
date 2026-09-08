import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, ArrowRight, Search, Filter, Ticket } from 'lucide-react';
import api from '../services/api';
import PageBanner from '../components/common/PageBanner';
import { getFullMediaUrl } from '../utils/mediaUrl';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEvents = () => {
    setLoading(true);
    let url = `/events/public?page=${page}&limit=6&search=${encodeURIComponent(search)}`;
    if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

    api.get(url)
      .then(res => {
        if (res.data.success) {
          setEvents(res.data.events || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, statusFilter]);

  const statusBadges = {
    upcoming: { bg: 'rgba(0,123,255,0.12)', color: '#007bff', label: 'Upcoming' },
    ongoing: { bg: 'rgba(40,167,69,0.12)', color: '#28a745', label: 'Happening Now' },
    completed: { bg: 'rgba(108,117,125,0.12)', color: '#6c757d', label: 'Concluded' },
    cancelled: { bg: 'rgba(220,53,69,0.12)', color: '#dc3545', label: 'Cancelled' }
  };

  return (
    <div className="events-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Hero Header */}
      <PageBanner
        badge="Programmes & Summits"
        badgeIcon={CalendarDays}
        title="Workshops, Seminars & Hackathons"
        subtitle="Join live industry workshops, coding hackathons, technical conferences, and student project showcases organized by JONIKWIRIA."
        breadcrumbs={[{ label: 'Summits & Events', path: '/events' }]}
      >
        <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search events by title, venue, or keyword..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '0.9rem 1rem 0.9rem 2.85rem', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)', color: '#fff', fontSize: '0.95rem', outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </PageBanner>

      {/* Main Grid */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Status Filters */}
        <div className="filter-pills-bar">
          {[
            { id: '', label: 'All Events' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Happening Now' },
            { id: 'completed', label: 'Past Events' }
          ].map(st => (
            <button
              key={st.id}
              onClick={() => { setStatusFilter(st.id); setPage(1); }}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: '9999px',
                background: statusFilter === st.id ? 'var(--primary)' : 'var(--bg-surface)',
                color: statusFilter === st.id ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '18px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <CalendarDays size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>No Events Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Check back later or adjust your search filter.</p>
          </div>
        ) : (
          <div className="events-cards-grid">
            {events.map(ev => {
              const badge = statusBadges[ev.status] || statusBadges.upcoming;
              return (
                <div
                  key={ev.id}
                  className="card hover-scale"
                  style={{
                    padding: 0, overflow: 'hidden', borderRadius: '18px',
                    border: '1px solid var(--border)', background: 'var(--bg-surface)',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    minWidth: 0, width: '100%'
                  }}
                >
                  <div style={{ height: 190, overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
                    <img
                      src={getFullMediaUrl(ev.imageUrl) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <span style={{ position: 'absolute', top: 12, right: 12, padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, background: badge.bg, color: badge.color, backdropFilter: 'blur(8px)', border: `1px solid ${badge.color}44` }}>
                      {badge.label}
                    </span>
                    {ev.category && (
                      <span style={{ position: 'absolute', bottom: 12, left: 12, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                        {ev.category}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: 'clamp(1.2rem, 3vw, 1.75rem)', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <Clock size={14} style={{ flexShrink: 0 }} />
                      <span style={{ wordBreak: 'break-word' }}>
                        {new Date(ev.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {ev.endDate && ev.endDate !== ev.startDate ? ` – ${new Date(ev.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.2rem)', fontWeight: 800, margin: '0 0 0.65rem 0', lineHeight: 1.35 }}>
                      <Link to={`/events/${ev.slug}`} className="line-clamp-2" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {ev.title}
                      </Link>
                    </h3>

                    {ev.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <MapPin size={13} style={{ flexShrink: 0 }} />
                        <span className="line-clamp-1">{ev.location}</span>
                      </div>
                    )}

                    <p className="line-clamp-3" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.25rem 0', flex: 1 }}>
                      {ev.description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      <Link
                        to={`/events/${ev.slug}`}
                        className="btn btn-sm btn-outline"
                        style={{ flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '8px' }}
                      >
                        <span>Details</span>
                        <ArrowRight size={13} />
                      </Link>
                      {ev.status !== 'completed' && ev.status !== 'cancelled' ? (
                        <Link
                          to={`/events/${ev.slug}/register`}
                          className="btn btn-sm btn-primary"
                          style={{ flex: '1 1 110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}
                        >
                          <Ticket size={13} /> <span>Register</span>
                        </Link>
                      ) : (
                        <span
                          className="btn btn-sm btn-secondary"
                          style={{ flex: '1 1 110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '8px', opacity: 0.65, cursor: 'default' }}
                        >
                          <span>{ev.status === 'cancelled' ? 'Cancelled' : 'Concluded'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
