import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play, PlayCircle, BookOpen, Clock, ChevronDown, ChevronUp, ChevronRight,
  FileText, Paperclip, CheckCircle2, Share2, Bookmark, Award, Users, Star,
  ArrowLeft, Download, Sparkles, AlertCircle, ShieldCheck, Globe, Check,
  Copy, X, Video, Smartphone, Info, BarChart3, Zap, Lock, ExternalLink,
  MessageSquare, TrendingUp, Trophy, Target, Send
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/common/VideoPlayer';
import { getFullMediaUrl } from '../utils/mediaUrl';

const FILE_ICONS = { pdf: '📄', slide: '📊', excel: '📑', doc: '📝', video: '🎬', image: '🖼️', other: '📎' };

// ─── Animated counter hook ───────────────────────────────────────────────────
const useCounter = (target, duration = 1200) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.floor(start));
      if (start >= target) clearInterval(ref.current);
    }, 16);
    return () => clearInterval(ref.current);
  }, [target]);
  return val;
};

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatBubble = ({ icon: Icon, value, label, color = 'var(--primary)' }) => {
  const n = useCounter(parseInt(value) || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff', lineHeight: 1 }}>
          {isNaN(parseInt(value)) ? value : `${n}${value.toString().replace(/[0-9]/g, '')}`}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activeUnitTab, setActiveUnitTab] = useState('video');
  const [bookmarked, setBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('curriculum');
  const [enrolling, setEnrolling] = useState(false);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', reviewerName: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const curriculumRef = useRef(null);
  const unitPlayerRef = useRef(null);
  const heroRef = useRef(null);

  const fetchCourseData = useCallback(() => {
    return api.get(`/courses/slug/${slug}`)
      .then(res => {
        if (res.data.success && res.data.data) {
          const cData = res.data.data;
          setCourse(cData);
          const exp = {};
          (cData.modules || []).forEach(m => { exp[m.id] = true; });
          setExpandedModules(exp);
          if (cData.modules?.[0]?.units?.[0]) setSelectedUnit(cData.modules[0].units[0]);
        } else setError('Course details could not be loaded.');
      })
      .catch(() => {
        return api.get(`/courses/public/${slug}`)
          .then(res => {
            if (res.data.success && res.data.data) {
              const cData = res.data.data;
              setCourse(cData);
              const exp = {};
              (cData.modules || []).forEach(m => { exp[m.id] = true; });
              setExpandedModules(exp);
              if (cData.modules?.[0]?.units?.[0]) setSelectedUnit(cData.modules[0].units[0]);
            } else setError('Course not found or currently unavailable.');
          })
          .catch(() => setError('Course not found or currently unavailable.'));
      });
  }, [slug]);

  useEffect(() => {
    setLoading(true); setError('');
    fetchCourseData().finally(() => setLoading(false));
  }, [fetchCourseData]);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 420);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close intro modal on Escape
  useEffect(() => {
    const handler = (e) => { if (e.code === 'Escape') setShowIntroModal(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleAllModules = () => {
    if (!course?.modules) return;
    const allExpanded = course.modules.every(m => expandedModules[m.id]);
    const next = {};
    course.modules.forEach(m => { next[m.id] = !allExpanded; });
    setExpandedModules(next);
  };

  const handleSelectUnit = useCallback((unit, tab = 'video') => {
    setSelectedUnit(unit);
    setActiveUnitTab(tab);
    setTimeout(() => {
      unitPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const handleEnrollClick = async () => {
    const targetUrl = `/student/courses/${course.slug || course.id}/learn`;
    if (!user) { navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`); return; }
    setEnrolling(true);
    try { await api.post(`/student/enroll/${course.id}`); } catch { /* already enrolled */ }
    setEnrolling(false);
    navigate(targetUrl);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setSubmittingReview(true);
    try {
      const payload = {
        rating: newReview.rating,
        comment: newReview.comment,
        reviewerName: newReview.reviewerName.trim() || (user ? `${user.firstName} ${user.lastName}` : 'Student')
      };
      const res = await api.post(`/courses/${course.id}/reviews`, payload);
      if (res.data.success) {
        setReviewSuccess('Thank you! Your review has been recorded.');
        setNewReview({ rating: 5, comment: '', reviewerName: '' });
        setShowReviewForm(false);
        fetchCourseData();
        setTimeout(() => setReviewSuccess(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalUnits = (course?.modules || []).reduce((acc, m) => acc + (m.units?.length || 0), 0);
  const totalFiles = (course?.modules || []).reduce((acc, m) => acc + (m.units?.reduce((u, un) => u + (un.files?.length || 0), 0) || 0), 0);

  const getIntroVideo = () => {
    if (course?.videoUrl) return course.videoUrl;
    for (const m of (course?.modules || [])) {
      for (const u of (m.units || [])) {
        if (u.videoUrl) return u.videoUrl;
      }
    }
    return null;
  };

  const getEmbedUrl = (url, autoplay = false) => {
    if (!url) return null;
    const ap = autoplay ? 1 : 0;
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=${ap}&rel=0&modestbranding=1&enablejsapi=1`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}?autoplay=${ap}&rel=0&modestbranding=1&enablejsapi=1`;
    }
    if (url.includes('youtube.com/embed/')) return `${url}${url.includes('?') ? '&' : '?'}autoplay=${ap}&rel=0`;
    if (url.includes('vimeo.com/')) {
      const vid = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${vid}?autoplay=${ap}&title=0&byline=0&portrait=0`;
    }
    return null;
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
      <div style={{ width: 52, height: 52, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'cd-spin 0.9s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>Loading course details...</p>
      <style>{`@keyframes cd-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !course) return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(220,53,69,0.1)', color: '#dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
        <AlertCircle size={40} />
      </div>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Course Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 2rem auto', lineHeight: 1.6 }}>{error || "The course you're looking for doesn't exist."}</p>
      <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} /><span>Browse All Courses</span>
      </Link>
    </div>
  );

  const lvlColors = {
    beginner:     { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
    intermediate: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    advanced:     { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  };
  const lvlStyle = lvlColors[course.level] || lvlColors.beginner;
  const introVideoUrl = getIntroVideo();

  // Pure database-driven arrays
  const learningOutcomes = Array.isArray(course.learningOutcomes) && course.learningOutcomes.length > 0
    ? course.learningOutcomes
    : null;

  const requirements = Array.isArray(course.requirements) && course.requirements.length > 0
    ? course.requirements
    : null;

  const targetAudience = Array.isArray(course.targetAudience) && course.targetAudience.length > 0
    ? course.targetAudience
    : null;

  const reviewsList = Array.isArray(course.reviews) ? course.reviews : [];

  const mainTabs = [
    { id: 'curriculum', label: `📚 Course Content (${course.modulesCount ?? (course.modules?.length || 0)})` },
    { id: 'overview',   label: '📋 Description & Requirements' },
    { id: 'instructor', label: '👤 Instructor & Faculty' },
    { id: 'reviews',    label: `⭐ Reviews (${course.ratingsCount || 0})` },
  ];

  const unitTabs = [
    { id: 'video',    label: '🎬 Video Lesson', always: true },
    { id: 'tutorial', label: '📖 Notes & Guide', always: true },
    { id: 'files',    label: `📎 Files (${selectedUnit?.files?.length || 0})`, always: true },
  ];

  // Price calculations
  const numPrice = parseFloat(course.price) || 0;
  const numDiscountPrice = parseFloat(course.discountPrice) || 0;

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', paddingBottom: '5rem' }}>

      {/* ── 1. DARK HERO BANNER ──────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #0f1c35 60%, #0b132b 100%)', color: '#fff', padding: 'clamp(2.5rem, 5vw, 4rem) 0 clamp(2rem, 4vw, 3.5rem) 0', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ maxWidth: 820 }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem', fontWeight: 600 }}>
              <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} style={{ opacity: 0.6 }} />
              <Link to="/courses" style={{ color: '#94a3b8', textDecoration: 'none' }}>Courses</Link>
              {course.department && (
                <>
                  <ChevronRight size={12} style={{ opacity: 0.6 }} />
                  <span style={{ color: '#c0c4fc' }}>{course.department.name}</span>
                </>
              )}
              <ChevronRight size={12} style={{ opacity: 0.6 }} />
              <span style={{ color: '#fff', fontWeight: 700 }}>{course.title}</span>
            </nav>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              {course.badge && (
                <span style={{ background: '#eceb98', color: '#3d3c0a', padding: '3px 10px', borderRadius: 4, fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {course.badge}
                </span>
              )}
              {course.level && (
                <span style={{ background: lvlStyle.bg, color: lvlStyle.color, border: `1px solid ${lvlStyle.border}`, padding: '3px 10px', borderRadius: 4, fontWeight: 700, fontSize: '0.72rem', textTransform: 'capitalize' }}>
                  {course.level} Level
                </span>
              )}
              {course.department && (
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, alignSelf: 'center' }}>
                  {course.department.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.18, margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>
              {course.title}
            </h1>

            {/* Description */}
            {course.description && (
              <p style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 1.5rem 0', maxWidth: 680 }}>
                {course.description}
              </p>
            )}

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.88rem', marginBottom: '1rem' }}>
              {course.ratingsCount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem' }}>{course.averageRating}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.round(course.averageRating) ? "#f59e0b" : "transparent"} color="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ color: '#94a3b8', textDecoration: 'underline', fontSize: '0.8rem' }}>
                    ({course.ratingsCount} {course.ratingsCount === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <Star size={14} color="#f59e0b" />
                  <span>No reviews yet</span>
                </div>
              )}
              <span style={{ color: '#e2e8f0' }}>
                <strong>{course.enrollmentCount || 0}</strong> {course.enrollmentCount === 1 ? 'student' : 'students'} enrolled
              </span>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Created by</span>
                <span style={{ color: '#c0c4fc', fontWeight: 700 }}>
                  {course.instructorName || course.department?.name || 'Department Faculty'}
                </span>
              </div>
              {course.updatedAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="#64748b" />
                  <span>Last updated {new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
              {course.language && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={13} color="#64748b" />
                  <span>{course.language}</span>
                </div>
              )}
            </div>

            {/* Stats bubbles from database */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <StatBubble icon={Video} value={`${course.videoLessonsCount ?? 0}`} label="Video Lessons" color="#38bdf8" />
              <StatBubble icon={Paperclip} value={`${course.filesCount ?? totalFiles}`} label="Downloadable Files" color="#10b981" />
              <StatBubble icon={BookOpen} value={`${course.modulesCount ?? (course.modules?.length || 0)}`} label="Modules" color="#818cf8" />
              <StatBubble icon={Award} value={course.certificateAvailable !== false ? "1" : "0"} label="Certificate" color="#f59e0b" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TWO-COLUMN BODY ──────────────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 1rem' }}>
        <div className="cd-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2.5rem', position: 'relative' }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div style={{ paddingTop: '2.5rem', minWidth: 0 }}>

            {/* What you'll learn (From Database) */}
            {learningOutcomes && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '1.75rem 2rem', background: 'var(--bg-surface)', marginBottom: '2.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 1.25rem 0' }}>What you'll learn</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem 2rem' }}>
                  {learningOutcomes.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', animation: `cd-fadeIn 0.4s ease ${idx * 0.07}s both` }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check size={12} color="#10b981" />
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main tab nav */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', gap: '0.25rem', marginBottom: '2rem', overflowX: 'auto' }}>
              {mainTabs.map(tab => {
                const active = activeMainTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMainTab(tab.id)}
                    style={{ padding: '0.85rem 1.1rem', border: 'none', background: 'transparent', color: active ? 'var(--primary)' : 'var(--text-muted)', fontWeight: active ? 800 : 600, fontSize: '0.9rem', cursor: 'pointer', borderBottom: `3px solid ${active ? 'var(--primary)' : 'transparent'}`, marginBottom: '-2px', whiteSpace: 'nowrap', transition: 'all 0.18s ease' }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── TAB: CURRICULUM ──────────────────────────────────────────── */}
            {activeMainTab === 'curriculum' && (
              <div ref={curriculumRef}>

                {/* Active Unit Player */}
                {selectedUnit && (
                  <div ref={unitPlayerRef} style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '1.5rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', animation: 'cd-fadeIn 0.3s ease' }}>
                    {/* Player header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(0,123,255,0.08)', padding: '2px 8px', borderRadius: 4 }}>Interactive Lesson Viewer</span>
                          {selectedUnit.files?.length > 0 && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 4 }}>📎 {selectedUnit.files.length} File(s)</span>}
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{selectedUnit.title}</h3>
                      </div>

                      {/* Sub-tabs */}
                      <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--bg-app)', padding: 3, borderRadius: 10, border: '1px solid var(--border)' }}>
                        {unitTabs.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setActiveUnitTab(t.id)}
                            style={{ padding: '0.4rem 0.85rem', borderRadius: 7, border: 'none', background: activeUnitTab === t.id ? 'var(--primary)' : 'transparent', color: activeUnitTab === t.id ? '#fff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap' }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Video tab */}
                    {activeUnitTab === 'video' && (
                      <div style={{ animation: 'cd-fadeIn 0.25s ease' }}>
                        {selectedUnit.videoUrl ? (
                          <VideoPlayer url={selectedUnit.videoUrl} title={selectedUnit.title} />
                        ) : (
                          <div style={{ padding: '3rem 1rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 12, color: 'var(--text-muted)' }}>
                            <Video size={40} style={{ opacity: 0.4, margin: '0 auto 0.75rem auto' }} />
                            <p style={{ margin: 0, fontWeight: 600 }}>No video recording attached to this unit yet.</p>
                          </div>
                        )}
                        {selectedUnit.description && (
                          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, marginTop: '1rem', marginBottom: 0 }}>
                            {selectedUnit.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes tab */}
                    {activeUnitTab === 'tutorial' && (
                      <div style={{ background: 'var(--bg-app)', borderRadius: 12, padding: '1.5rem', border: '1px solid var(--border)', animation: 'cd-fadeIn 0.25s ease' }}>
                        {selectedUnit.description && (
                          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.65, borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                            {selectedUnit.description}
                          </p>
                        )}
                        {selectedUnit.tutorialText ? (
                          <div style={{ fontSize: '0.95rem', lineHeight: 1.85, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                            {selectedUnit.tutorialText}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                            <BookOpen size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.35 }} />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Reading notes will be accessible in your enrolled student workspace.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Files tab */}
                    {activeUnitTab === 'files' && (
                      <div style={{ animation: 'cd-fadeIn 0.25s ease' }}>
                        {selectedUnit.files?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>Downloadable resources, code starters, and datasets for this unit:</p>
                            {selectedUnit.files.map(file => (
                              <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.1rem', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border)', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <span style={{ fontSize: '1.5rem' }}>{FILE_ICONS[file.fileType] || '📎'}</span>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{file.fileName}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{file.fileType} {file.fileSize ? `• ${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}</div>
                                  </div>
                                </div>
                                <a href={file.fileUrl} target="_blank" rel="noreferrer" download={file.fileName} className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', padding: '0.42rem 0.9rem', fontSize: '0.8rem' }}>
                                  <Download size={13} /><span>Download</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 12 }}>
                            <Paperclip size={32} color="var(--text-muted)" style={{ opacity: 0.4, margin: '0 auto 0.75rem auto' }} />
                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>No downloadable files for this unit.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Curriculum accordion */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Course content</h2>
                    <button onClick={toggleAllModules} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}>
                      {course.modules?.every(m => expandedModules[m.id]) ? 'Collapse all' : 'Expand all'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    {course.modules?.length || 0} sections • {course.unitsCount ?? totalUnits} lectures • {course.filesCount ?? totalFiles} downloadable resources • {course.duration || 'Flexible pace'}
                  </p>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-surface)' }}>
                  {(course.modules || []).length > 0 ? course.modules.map((mod, mIdx) => {
                    const isExpanded = !!expandedModules[mod.id];
                    const modCompleted = (mod.units || []).filter(u => u.isCompleted).length;
                    return (
                      <div key={mod.id} style={{ borderBottom: mIdx === course.modules.length - 1 ? 'none' : '1px solid var(--border)' }}>
                        {/* Module header */}
                        <div onClick={() => toggleModule(mod.id)} style={{ padding: '1rem 1.4rem', background: isExpanded ? 'rgba(0,123,255,0.03)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', transition: 'background 0.18s ease' }}
                          onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'var(--bg-app)')}
                          onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'var(--bg-surface)')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {isExpanded ? <ChevronUp size={17} color="var(--text-main)" /> : <ChevronDown size={17} color="var(--text-main)" />}
                            <div>
                              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                Section {mIdx + 1}: {mod.title}
                              </h3>
                              {mod.description && <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{mod.description}</p>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {(mod.units?.length > 0) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <div style={{ width: 50, height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                                  <div style={{ width: `${modCompleted > 0 ? (modCompleted / mod.units.length) * 100 : 0}%`, height: '100%', background: '#10b981', borderRadius: 9999, transition: 'width 0.4s ease' }} />
                                </div>
                                <span>{mod.units?.length || 0} lectures</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Units */}
                        {isExpanded && (
                          <div style={{ background: 'var(--bg-app)' }}>
                            {(mod.units || []).length > 0 ? mod.units.map((unit, uIdx) => {
                              const isSelected = selectedUnit?.id === unit.id;
                              return (
                                <div
                                  key={unit.id}
                                  onClick={() => handleSelectUnit(unit, 'video')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.82rem 1.4rem', cursor: 'pointer', background: isSelected ? 'rgba(0,123,255,0.08)' : 'transparent', borderLeft: `3px solid ${isSelected ? 'var(--primary)' : 'transparent'}`, borderBottom: uIdx === mod.units.length - 1 ? 'none' : '1px solid var(--border)', transition: 'all 0.15s ease' }}
                                  onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(0,123,255,0.03)')}
                                  onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                                    {unit.videoUrl ? (
                                      <PlayCircle size={15} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                                    ) : (
                                      <FileText size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                    )}
                                    <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 800 : 500, color: isSelected ? 'var(--primary)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {unit.title}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                                    {unit.files?.length > 0 && (
                                      <span onClick={e => { e.stopPropagation(); handleSelectUnit(unit, 'files'); }} style={{ fontSize: '0.72rem', padding: '1px 7px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }} title="View files">
                                        <Paperclip size={10} />{unit.files.length}
                                      </span>
                                    )}
                                    {unit.videoUrl && (
                                      <button onClick={e => { e.stopPropagation(); handleSelectUnit(unit, 'video'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', padding: '1px 4px' }}>
                                        Preview
                                      </button>
                                    )}
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{unit.duration || '—'}</span>
                                  </div>
                                </div>
                              );
                            }) : (
                              <div style={{ padding: '1rem 1.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No lessons uploaded yet.</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <BookOpen size={40} style={{ opacity: 0.35, margin: '0 auto 1rem auto' }} />
                      <p style={{ margin: 0 }}>Curriculum sections are being prepared.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: OVERVIEW ────────────────────────────────────────────── */}
            {activeMainTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'cd-fadeIn 0.25s ease' }}>
                {requirements && (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1.75rem', background: 'var(--bg-surface)' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Requirements</h2>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      {requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1.75rem', background: 'var(--bg-surface)' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Course Description</h2>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <p style={{ margin: 0 }}>{course.description}</p>
                    
                    {targetAudience && (
                      <>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0', color: 'var(--text-main)' }}>Who this course is for:</h3>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {targetAudience.map((aud, i) => (
                            <li key={i}>{aud}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: INSTRUCTOR ──────────────────────────────────────────── */}
            {activeMainTab === 'instructor' && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '2rem', background: 'var(--bg-surface)', animation: 'cd-fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>
                  {course.instructorName ? 'Instructor' : 'Academic Faculty'}
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {course.instructorAvatar ? (
                    <img src={getFullMediaUrl(course.instructorAvatar)} alt={course.instructorName || 'Instructor'} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', flexShrink: 0 }} />
                  ) : course.department?.imageUrl ? (
                    <img src={getFullMediaUrl(course.department.imageUrl)} alt={course.department?.name} style={{ width: 100, height: 100, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, flexShrink: 0 }}>
                      {(course.instructorName || course.department?.name || 'F')[0]}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {course.instructorName || course.department?.name || 'Department Faculty'}
                    </h3>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem', margin: '0 0 0.85rem 0' }}>
                      {course.instructorTitle || (course.department ? `${course.department.name} Curriculum Mentors` : 'Academic Faculty')}
                    </p>
                    {course.instructorBio ? (
                      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                        {course.instructorBio}
                      </p>
                    ) : course.department?.description ? (
                      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                        {course.department.description}
                      </p>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                        Curriculum curated by department educators and subject matter experts.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: REVIEWS (Fully Database-Driven) ─────────────────────── */}
            {activeMainTab === 'reviews' && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '2rem', background: 'var(--bg-surface)', animation: 'cd-fadeIn 0.25s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Student feedback</h2>
                  <button
                    onClick={() => setShowReviewForm(f => !f)}
                    className="btn btn-sm btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <MessageSquare size={14} />
                    <span>{showReviewForm ? 'Cancel Review' : 'Write a Review'}</span>
                  </button>
                </div>

                {reviewSuccess && (
                  <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    {reviewSuccess}
                  </div>
                )}

                {/* Review submission form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} style={{ background: 'var(--bg-app)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Share your feedback</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Your Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={user ? `${user.firstName} ${user.lastName}` : "Your Name"}
                          value={newReview.reviewerName}
                          onChange={e => setNewReview({ ...newReview, reviewerName: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Rating (1 - 5 Stars)</label>
                        <select
                          value={newReview.rating}
                          onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })}
                          style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                          <option value={3}>⭐⭐⭐ (3 - Good)</option>
                          <option value={2}>⭐⭐ (2 - Fair)</option>
                          <option value={1}>⭐ (1 - Needs Improvement)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>Review Comment</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="What did you think of the curriculum, lessons, and exercises?"
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', resize: 'vertical' }}
                      />
                    </div>
                    <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                      <Send size={14} />
                      <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </form>
                )}

                {/* Rating breakdown */}
                {course.ratingsCount > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{course.averageRating}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '0.4rem 0' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < Math.round(course.averageRating) ? "#f59e0b" : "transparent"} color="#f59e0b" />
                        ))}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Course Rating ({course.ratingsCount} {course.ratingsCount === 1 ? 'review' : 'reviews'})
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {(course.ratingBreakdown || []).map(row => (
                        <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem' }}>
                          <span style={{ width: 42, color: 'var(--text-muted)', flexShrink: 0 }}>{row.stars} ★</span>
                          <div style={{ flex: 1, height: 7, background: 'var(--bg-app)', borderRadius: 9999, overflow: 'hidden' }}>
                            <div style={{ width: `${row.pct}%`, height: '100%', background: '#f59e0b', borderRadius: 9999 }} />
                          </div>
                          <span style={{ width: 32, textAlign: 'right', color: 'var(--text-muted)', flexShrink: 0 }}>{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 12, marginBottom: '2rem' }}>
                    <Star size={36} color="#f59e0b" style={{ opacity: 0.5, margin: '0 auto 0.75rem auto' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>No reviews yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>Be the first student to review this course after starting your learning journey!</p>
                  </div>
                )}

                {/* Real Reviews from DB */}
                {reviewsList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {reviewsList.map(rev => (
                      <div key={rev.id} style={{ padding: '1.25rem', background: 'var(--bg-app)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                          {rev.reviewerAvatar ? (
                            <img src={rev.reviewerAvatar} alt={rev.reviewerName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                              {(rev.reviewerName || 'S')[0]}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{rev.reviewerName}</div>
                            <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} size={12} fill={j < rev.rating ? "#f59e0b" : "transparent"} color="#f59e0b" />
                              ))}
                            </div>
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.65 }}>{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: STICKY ENROLL CARD ────────────────────────────────────── */}
          <div className="cd-sticky-col" style={{ position: 'relative' }}>
            <div style={{ position: 'sticky', top: 90, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-surface)', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', overflow: 'hidden', marginTop: -160, zIndex: 20 }}>

              {/* Video preview thumbnail */}
              <div
                onClick={() => introVideoUrl && setShowIntroModal(true)}
                style={{ height: 210, position: 'relative', overflow: 'hidden', background: '#000', cursor: introVideoUrl ? 'pointer' : 'default' }}
              >
                <img
                  src={getFullMediaUrl(course.imageUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: introVideoUrl ? 0.85 : 1, transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => introVideoUrl && (e.target.style.transform = 'scale(1.04)')}
                  onMouseLeave={e => introVideoUrl && (e.target.style.transform = 'scale(1)')}
                />
                {introVideoUrl && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', transition: 'transform 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Play size={28} fill="var(--primary)" color="var(--primary)" style={{ marginLeft: 3 }} />
                    </div>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', marginTop: 10, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Preview this course</span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: '1.5rem' }}>
                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1.1rem' }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    {numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Free'}
                  </span>
                  {numDiscountPrice > 0 && (
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ${numDiscountPrice.toFixed(2)}
                    </span>
                  )}
                  {numPrice === 0 && numDiscountPrice > 0 && (
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                      100% OFF
                    </span>
                  )}
                </div>

                {/* Enroll CTA */}
                <button
                  onClick={handleEnrollClick}
                  disabled={enrolling}
                  style={{ width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none', background: enrolling ? 'var(--border)' : 'linear-gradient(135deg, var(--primary) 0%, #0052cc 100%)', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: enrolling ? 'not-allowed' : 'pointer', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(0,123,255,0.3)', transition: 'all 0.2s ease' }}
                >
                  <Play size={17} fill="#fff" />
                  <span>{enrolling ? 'Enrolling...' : (numPrice > 0 ? 'Enroll Now' : 'Start Learning — Free')}</span>
                </button>

                {/* Wishlist + Share */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[
                    { icon: Bookmark, label: bookmarked ? 'Saved' : 'Wishlist', action: () => setBookmarked(b => !b), active: bookmarked },
                    { icon: copiedLink ? Check : Share2, label: copiedLink ? 'Copied!' : 'Share', action: handleShare, active: copiedLink }
                  ].map((btn, i) => {
                    const Icon = btn.icon;
                    return (
                      <button key={i} onClick={btn.action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: btn.active ? 'rgba(0,123,255,0.07)' : 'var(--bg-app)', color: btn.active ? 'var(--primary)' : 'var(--text-main)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s ease' }}>
                        <Icon size={14} color={btn.active ? 'var(--primary)' : 'currentColor'} fill={btn.active && btn.icon === Bookmark ? 'var(--primary)' : 'none'} />
                        <span>{btn.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Includes list */}
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>This course includes:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Video size={15} color="var(--primary)" />
                    <span>{course.videoLessonsCount ?? totalUnits} on-demand video lesson{(course.videoLessonsCount ?? totalUnits) === 1 ? '' : 's'}</span>
                  </li>
                  {(course.filesCount ?? totalFiles) > 0 && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Paperclip size={15} color="var(--primary)" />
                      <span>{course.filesCount ?? totalFiles} downloadable learning file{(course.filesCount ?? totalFiles) === 1 ? '' : 's'}</span>
                    </li>
                  )}
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <BookOpen size={15} color="var(--primary)" />
                    <span>Comprehensive reading guides & notes</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Smartphone size={15} color="var(--primary)" />
                    <span>Access on mobile, tablet & desktop</span>
                  </li>
                  {course.certificateAvailable !== false && (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Award size={15} color="var(--primary)" />
                      <span>Certificate of completion upon passing</span>
                    </li>
                  )}
                </ul>

                {/* Team access */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Training your team?</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.65rem 0', lineHeight: 1.4 }}>Get organizational access to certified technical courses.</p>
                  <Link to="/contact" style={{ display: 'block', textAlign: 'center', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', transition: 'all 0.18s ease' }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg-app)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    Contact Academic Admissions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIDEO INTRO MODAL ────────────────────────────────────────────────── */}
      {showIntroModal && introVideoUrl && (
        <div onClick={() => setShowIntroModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1c1d1f', borderRadius: 16, maxWidth: 860, width: '100%', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', border: '1px solid #3e4143', animation: 'cd-fadeIn 0.25s ease' }}>
            <div style={{ padding: '0.9rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2d2f31' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Course Preview</span>
                <h4 style={{ margin: '2px 0 0 0', color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>{course.title}</h4>
              </div>
              <button onClick={() => setShowIntroModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.35rem', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
              <iframe
                src={`${getEmbedUrl(introVideoUrl, true)}`}
                title="Course Introduction"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div style={{ padding: '1rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: '#1c1d1f' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                {course.certificateAvailable !== false ? 'Includes certificate upon course completion.' : 'Full curriculum access.'}
              </span>
              <button onClick={() => { setShowIntroModal(false); handleEnrollClick(); }} style={{ padding: '0.6rem 1.4rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--primary), #0052cc)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
                {numPrice > 0 ? 'Enroll Now' : 'Enroll Free'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE STICKY ENROLL BAR ─────────────────────────────────────────── */}
      {showStickyBar && (
        <div className="cd-mobile-sticky" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '0.75rem 1rem', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', display: 'none', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{course.title}</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
              {numPrice > 0 ? `$${numPrice.toFixed(2)}` : '100% Free'} • {course.certificateAvailable !== false ? 'Certificate Included' : 'Full Access'}
            </div>
          </div>
          <button onClick={handleEnrollClick} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', borderRadius: 8, flexShrink: 0 }}>
            Start Learning
          </button>
        </div>
      )}

      <style>{`
        @keyframes cd-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 991px) {
          .cd-layout-grid { grid-template-columns: 1fr !important; }
          .cd-sticky-col { display: none !important; }
          .cd-mobile-sticky { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
