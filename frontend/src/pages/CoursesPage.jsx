import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Filter, Clock, Star, Users, Building2,
  ArrowRight, Play, Zap, TrendingUp, Award, ChevronRight, X
} from 'lucide-react';
import api from '../services/api';
import PageBanner from '../components/common/PageBanner';
import { getFullMediaUrl } from '../utils/mediaUrl';

// ─── Shimmer skeleton card ──────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 185, background: 'var(--bg-app)', position: 'relative', overflow: 'hidden' }}>
      <div className="shimmer-bar" style={{ position: 'absolute', inset: 0 }} />
    </div>
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="shimmer-bar" style={{ height: 12, borderRadius: 6, width: '40%' }} />
      <div className="shimmer-bar" style={{ height: 18, borderRadius: 6, width: '85%' }} />
      <div className="shimmer-bar" style={{ height: 14, borderRadius: 6, width: '70%' }} />
      <div className="shimmer-bar" style={{ height: 14, borderRadius: 6, width: '55%' }} />
      <div style={{ height: 1, background: 'var(--border)', marginTop: '0.25rem' }} />
      <div className="shimmer-bar" style={{ height: 40, borderRadius: 10 }} />
    </div>
  </div>
);

// ─── Level badge colours ────────────────────────────────────────────────────
const levelBadge = {
  beginner:     { bg: 'rgba(16,185,129,0.14)', color: '#10b981', border: 'rgba(16,185,129,0.3)', label: '🌱 Beginner' },
  intermediate: { bg: 'rgba(245,158,11,0.14)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', label: '⚡ Intermediate' },
  advanced:     { bg: 'rgba(239,68,68,0.14)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)',  label: '🔥 Advanced' }
};

// ─── Course card ─────────────────────────────────────────────────────────────
const CourseCard = ({ course: c }) => {
  const [hovered, setHovered] = useState(false);
  const lvl = levelBadge[c.level] || levelBadge.beginner;
  const unitCount = (c.modules || []).reduce((acc, m) => acc + (m.units?.length || 0), 0);

  return (
    <Link
      to={`/courses/${c.slug}`}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          borderRadius: 18, border: `1px solid ${hovered ? 'var(--primary)' : 'var(--border)'}`,
          background: 'var(--bg-surface)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', height: '100%',
          boxShadow: hovered ? '0 12px 40px rgba(0,123,255,0.14)' : '0 2px 12px rgba(0,0,0,0.05)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Thumbnail */}
        <div style={{ height: 185, position: 'relative', overflow: 'hidden', background: '#0f172a', flexShrink: 0 }}>
          <img
            src={getFullMediaUrl(c.imageUrl) || `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80`}
            alt={c.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          />

          {/* Dark overlay + play button on hover */}
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.28s ease' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.35)', transform: hovered ? 'scale(1)' : 'scale(0)', transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <Play size={22} fill="var(--primary)" color="var(--primary)" style={{ marginLeft: 3 }} />
            </div>
          </div>

          {/* Badges top */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 800, background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}`, backdropFilter: 'blur(8px)' }}>
              {lvl.label}
            </span>
            {c.badge && (
              <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 800, background: 'rgba(251,191,36,0.9)', color: '#0b132b', backdropFilter: 'blur(8px)' }}>
                ⭐ {c.badge}
              </span>
            )}
          </div>

          {/* Price badge top-right */}
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 800, background: 'rgba(16,185,129,0.9)', color: '#fff' }}>
              {parseFloat(c.price) > 0 ? `$${parseFloat(c.price).toFixed(2)}` : 'FREE'}
            </span>
          </div>

          {/* Bottom: unit/module count */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 8 }}>
            {(c.modules?.length > 0 || c.modulesCount > 0) && (
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(6px)' }}>
                📚 {c.modulesCount ?? c.modules.length} modules
              </span>
            )}
            {(unitCount > 0 || c.unitsCount > 0) && (
              <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(6px)' }}>
                🎬 {c.unitsCount ?? unitCount} lessons
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {c.department && (
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {c.department.name}
            </span>
          )}

          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.55rem 0', color: 'var(--text-main)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.title}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1rem 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.description}
          </p>

          {/* Stats row from database */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color="var(--primary)" />
              <span>{c.duration || 'Self-Paced'}</span>
            </div>
            {c.ratingsCount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontWeight: 700 }}>
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span>{c.averageRating} ({c.ratingsCount})</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)' }}>
                <span>🌱 New</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Users size={12} color="var(--primary)" />
              <span>{c.enrollmentCount || 0} enrolled</span>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              padding: '0.65rem 1rem', borderRadius: 10,
              background: hovered ? 'linear-gradient(135deg, var(--primary), #0052cc)' : 'rgba(0,123,255,0.08)',
              color: hovered ? '#fff' : 'var(--primary)',
              fontWeight: 800, fontSize: '0.88rem',
              border: `1px solid ${hovered ? 'transparent' : 'rgba(0,123,255,0.25)'}`,
              transition: 'all 0.25s ease'
            }}
          >
            <span>Explore Course</span>
            <ArrowRight size={15} />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const debounceTimer = useRef(null);

  useEffect(() => {
    api.get('/departments/active')
      .then(res => { if (res.data.success) setDepartments(res.data.data || []); })
      .catch(() => {});
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    let url = `/courses/public?page=${page}&limit=9&search=${encodeURIComponent(search)}`;
    if (selectedDept)  url += `&departmentId=${selectedDept}`;
    if (selectedLevel) url += `&level=${selectedLevel}`;
    api.get(url)
      .then(res => {
        if (res.data.success) {
          setCourses(res.data.courses || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, [page, search, selectedDept, selectedLevel]);

  // Debounce search input
  const handleSearchChange = (val) => {
    setDraftSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 380);
  };

  const clearFilters = () => {
    setDraftSearch(''); setSearch('');
    setSelectedDept(''); setSelectedLevel('');
    setPage(1);
  };

  const hasFilters = draftSearch || selectedDept || selectedLevel;

  // Stats strip data
  const stats = [
    { icon: BookOpen, value: `${totalItems}+`, label: 'Courses' },
    { icon: Users, value: '50k+', label: 'Students' },
    { icon: Award, value: '100%', label: 'Free Access' },
    { icon: TrendingUp, value: '4.9★', label: 'Avg Rating' },
  ];

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Banner */}
      <PageBanner
        badge="Academic Curriculum"
        badgeIcon={BookOpen}
        title="Explore All Courses & Programmes"
        subtitle="Practical, project-driven technology courses designed by industry engineers — from foundational basics to advanced mastery."
        breadcrumbs={[{ label: 'Academic Courses', path: '/courses' }]}
      >
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 580, width: '100%', margin: '0 auto' }}>
          <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by course title, skill, or keyword..."
            value={draftSearch}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: '100%', padding: '0.9rem 3rem 0.9rem 2.85rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
          />
          {draftSearch && (
            <button onClick={() => handleSearchChange('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              <X size={15} />
            </button>
          )}
        </div>
      </PageBanner>

      {/* Stats strip */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', padding: '1rem' }}>
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon size={16} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{value}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Filter toolbar */}
        <div style={{ padding: 'clamp(0.9rem, 2vw, 1.25rem)', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-surface)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
              <Filter size={14} />
              <span>Filter:</span>
            </div>

            {/* Department */}
            <select
              value={selectedDept}
              onChange={e => { setSelectedDept(e.target.value); setPage(1); }}
              style={{ padding: '0.42rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">All Faculties</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            {/* Level pills */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { id: '', label: 'All Levels' },
                { id: 'beginner', label: '🌱 Beginner' },
                { id: 'intermediate', label: '⚡ Intermediate' },
                { id: 'advanced', label: '🔥 Advanced' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => { setSelectedLevel(lvl.id); setPage(1); }}
                  style={{ padding: '0.38rem 0.85rem', borderRadius: 8, border: 'none', background: selectedLevel === lvl.id ? 'var(--primary)' : 'var(--bg-app)', color: selectedLevel === lvl.id ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap' }}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Clear button */}
            {hasFilters && (
              <button onClick={clearFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.38rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)', color: '#ef4444', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                <X size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {loading ? 'Searching...' : <><strong style={{ color: 'var(--text-main)' }}>{courses.length}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalItems}</strong> programmes</>}
          </span>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <BookOpen size={52} style={{ color: 'var(--text-muted)', opacity: 0.35, margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No Courses Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
              Try clearing your search query or selecting a different department or level filter.
            </p>
            <button onClick={clearFilters} className="btn btn-primary">Reset All Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: '0.55rem 1.1rem', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: 700, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.45 : 1 }}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  style={{ width: 38, height: 38, borderRadius: 9, border: 'none', background: page === pg ? 'var(--primary)' : 'var(--bg-surface)', color: page === pg ? '#fff' : 'var(--text-main)', fontWeight: 800, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.18s ease' }}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: '0.55rem 1.1rem', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: 700, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.45 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Shimmer style */}
      <style>{`
        .shimmer-bar {
          background: linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-app) 50%, var(--bg-surface) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default CoursesPage;
