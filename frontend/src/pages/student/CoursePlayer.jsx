import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle2, Lock, Play, ChevronDown, ChevronUp,
  FileText, Download, Award, ArrowLeft, ArrowRight, Sparkles,
  HelpCircle, AlertCircle, Clock, Menu, X, PenLine, Target,
  Zap, Flame, Star, Trophy, Save, Trash2, MessageSquare, Search,
  SkipForward, Volume2, Settings, BarChart3, Circle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import VideoPlayer from '../../components/common/VideoPlayer';
import UnitQuiz from '../../components/common/UnitQuiz';
import { getFullMediaUrl } from '../../utils/mediaUrl';

// ─── XP / Level system ───────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Learner', min: 0, color: '#64748b', icon: '📚' },
  { label: 'Scholar', min: 200, color: '#3b82f6', icon: '🎓' },
  { label: 'Expert', min: 600, color: '#8b5cf6', icon: '⚡' },
  { label: 'Master', min: 1200, color: '#f59e0b', icon: '🏆' },
];
const getLevel = (xp) => [...LEVELS].reverse().find(l => xp >= l.min) || LEVELS[0];

// ─── Confetti mini component ─────────────────────────────────────────────────
const Confetti = () => {
  const colors = ['#38bdf8', '#818cf8', '#f59e0b', '#10b981', '#f472b6', '#fb923c'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i, color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.6}s`,
    duration: `${0.8 + Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: '-10px', left: p.left,
          width: p.size, height: p.size, background: p.color, borderRadius: '2px',
          animation: `confetti-fall ${p.duration} ${p.delay} ease-out forwards`,
          transform: `rotate(${p.rotate})`,
        }} />
      ))}
    </div>
  );
};

// ─── Module progress ring ────────────────────────────────────────────────────
const ProgressRing = ({ pct = 0, size = 36, stroke = 3, color = '#38bdf8' }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease', strokeLinecap: 'round' }}
      />
    </svg>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CoursePlayer = () => {
  const { courseIdOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUnit, setActiveUnit] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [expandedModules, setExpandedModules] = useState({});
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // XP / gamification
  const [xp, setXp] = useState(() => parseInt(sessionStorage.getItem('lms_xp') || '0', 10));
  const [streak, setStreak] = useState(() => parseInt(sessionStorage.getItem('lms_streak') || '1', 10));
  const [unitCompletions, setUnitCompletions] = useState({});

  // Notes
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lms_notes') || '{}'); } catch { return {}; }
  });
  const [noteInput, setNoteInput] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Sidebar search
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Video completion tracker
  const [videoCompleted, setVideoCompleted] = useState(false);

  // Animation on unit change
  const [contentKey, setContentKey] = useState(0);

  const mainRef = useRef(null);

  // ─── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => { fetchCoursePlayer(); }, [courseIdOrSlug]);

  const fetchCoursePlayer = (autoSelectNext = false, justCompletedId = null) => {
    setLoading(true);
    api.get(`/student/courses/${courseIdOrSlug}/learn`)
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;
          setPlayerData(data);

          const exp = {};
          (data.modules || []).forEach(m => { exp[m.id] = true; });
          setExpandedModules(exp);

          const allUnits = [];
          (data.modules || []).forEach(m => (m.units || []).forEach(u => allUnits.push(u)));

          if (autoSelectNext && justCompletedId) {
            const idx = allUnits.findIndex(u => u.id === justCompletedId);
            const next = allUnits[idx + 1] || allUnits[idx];
            setActiveUnit(next || null);
          } else if (!activeUnit) {
            const firstUnlocked = allUnits.find(u => !u.isCompleted && !u.isLocked)
              || allUnits.find(u => !u.isLocked) || allUnits[0];
            setActiveUnit(firstUnlocked || null);
          } else {
            const current = allUnits.find(u => u.id === activeUnit.id);
            if (current) setActiveUnit(current);
          }
        }
      })
      .catch(() => setError('Unable to load course curriculum. Please try again.'))
      .finally(() => setLoading(false));
  };

  // ─── Notes persistence ─────────────────────────────────────────────────────
  useEffect(() => {
    if (activeUnit) {
      setNoteInput(notes[activeUnit.id] || '');
      setNoteSaved(false);
    }
  }, [activeUnit?.id]);

  const saveNote = () => {
    if (!activeUnit) return;
    const next = { ...notes, [activeUnit.id]: noteInput };
    setNotes(next);
    localStorage.setItem('lms_notes', JSON.stringify(next));
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const deleteNote = () => {
    if (!activeUnit) return;
    const next = { ...notes };
    delete next[activeUnit.id];
    setNotes(next);
    localStorage.setItem('lms_notes', JSON.stringify(next));
    setNoteInput('');
  };

  // ─── Unit selection ────────────────────────────────────────────────────────
  const handleSelectUnit = useCallback((unit) => {
    if (unit.isLocked) return;
    setActiveUnit(unit);
    setVideoCompleted(false);
    setContentKey(k => k + 1);
    setActiveTab(unit.videoUrl ? 'video' : 'notes');
    setMobileDrawerOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Module toggle ─────────────────────────────────────────────────────────
  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // ─── XP helper ────────────────────────────────────────────────────────────
  const awardXP = (amount) => {
    setXp(prev => {
      const next = prev + amount;
      sessionStorage.setItem('lms_xp', String(next));
      return next;
    });
  };

  // ─── Complete unit ─────────────────────────────────────────────────────────
  const handleCompleteUnit = async (exercisePayload = {}) => {
    if (!activeUnit || completing) return;
    setCompleting(true);
    try {
      const payload = {
        watched: videoCompleted || true,
        ...(typeof exercisePayload === 'object' ? exercisePayload : {})
      };
      const res = await api.post(`/student/units/${activeUnit.id}/complete`, payload);
      if (res.data.success) {
        const result = res.data.data;
        setUnitCompletions(prev => ({ ...prev, [activeUnit.id]: true }));
        awardXP(50);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        if (result.isCourseCompleted) {
          awardXP(500);
          setTimeout(() => setShowCelebration(true), 600);
        }
        fetchCoursePlayer(true, activeUnit.id);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to complete unit.');
    } finally {
      setCompleting(false);
    }
  };

  // ─── Video completion callback ─────────────────────────────────────────────
  const handleVideoComplete = useCallback(() => {
    setVideoCompleted(true);
    awardXP(10);
  }, []);

  // ─── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!playerData) return;
      const allUnits = [];
      playerData.modules.forEach(m => (m.units || []).forEach(u => allUnits.push(u)));
      const idx = allUnits.findIndex(u => u.id === activeUnit?.id);
      if (e.code === 'ArrowRight' && idx < allUnits.length - 1) {
        const next = allUnits[idx + 1];
        if (!next.isLocked) handleSelectUnit(next);
      }
      if (e.code === 'ArrowLeft' && idx > 0) {
        handleSelectUnit(allUnits[idx - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeUnit, playerData, handleSelectUnit]);

  // ─── Loading / Error ───────────────────────────────────────────────────────
  if (loading && !playerData) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ position: 'relative', width: 56, height: 56 }}>
          <div style={{ width: 56, height: 56, border: '3px solid var(--border)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'lms-spin 0.9s linear infinite' }} />
          <BookOpen size={20} color="#38bdf8" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>Loading your learning experience...</p>
        <style>{`@keyframes lms-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Curriculum Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/student/my-learning" className="btn btn-primary">Return to Student Portal</Link>
      </div>
    );
  }

  const { course, modules, progressPercentage, totalUnits, completedUnits } = playerData;
  const level = getLevel(xp);

  const allSequentialUnits = [];
  modules.forEach(m => (m.units || []).forEach(u => allSequentialUnits.push(u)));

  const currentIdx = allSequentialUnits.findIndex(u => u.id === activeUnit?.id);
  const prevUnit = currentIdx > 0 ? allSequentialUnits[currentIdx - 1] : null;
  const nextUnit = currentIdx < allSequentialUnits.length - 1 ? allSequentialUnits[currentIdx + 1] : null;

  // Motivational messages based on progress
  const motivational = (() => {
    if (progressPercentage === 100) return '🎓 You completed the course!';
    if (progressPercentage >= 75) return '🔥 Almost there — final stretch!';
    if (progressPercentage >= 50) return '⚡ Great progress — halfway done!';
    if (progressPercentage >= 25) return '📈 Building momentum!';
    return '🚀 Just getting started!';
  })();

  // Filter sidebar units
  const filteredModules = sidebarSearch
    ? modules.map(m => ({
        ...m,
        units: (m.units || []).filter(u => u.title?.toLowerCase().includes(sidebarSearch.toLowerCase()))
      })).filter(m => m.units.length > 0)
    : modules;

  // Unit content tabs definition
  const tabs = [
    { id: 'video', label: '🎬 Video', show: true },
    { id: 'notes', label: '📖 Notes', show: true },
    { id: 'myNotes', label: '✏️ My Notes', show: true },
    { id: 'files', label: `📎 Files (${activeUnit?.files?.length || 0})`, show: true },
    { id: 'quiz', label: '❓ Quiz', show: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-app)' }}>
      {showConfetti && <Confetti />}

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(90deg, #0b132b 0%, #0f1f3d 100%)',
        color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 56, gap: '1rem',
        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 8, padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'none' }}
            id="lms-mobile-toggle"
          >
            <Menu size={18} />
          </button>

          <Link to="/student/my-learning" style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: '0.82rem', flexShrink: 0 }}>
            <ArrowLeft size={14} />
            <span className="hide-xs">Portal</span>
          </Link>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '0.85rem', minWidth: 0 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'clamp(140px, 30vw, 420px)' }}>
              {course.title}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {activeUnit?.title || 'Select a unit'}
            </div>
          </div>
        </div>

        {/* Center: Progress + Score + Motivation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'center' }}>
          <div className="hide-sm" style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{motivational}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #10b981)', borderRadius: 9999, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', whiteSpace: 'nowrap' }}>{progressPercentage}%</span>
          </div>

          {playerData?.currentAverageScore > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: 8, padding: '0.2rem 0.55rem',
              fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8'
            }}>
              <Star size={12} fill="#38bdf8" color="#38bdf8" />
              <span>Score: {playerData.currentAverageScore}%</span>
            </div>
          )}
        </div>

        {/* Right: XP + Streak + Certificate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
          {/* XP Badge */}
          <div className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.07)', padding: '0.25rem 0.65rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem' }}>{level.icon}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: level.color }}>{level.label}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{xp} XP</span>
          </div>

          {/* Streak */}
          <div className="hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(251,146,60,0.12)', padding: '0.25rem 0.6rem', borderRadius: 8, border: '1px solid rgba(251,146,60,0.25)' }}>
            <Flame size={13} color="#fb923c" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fb923c' }}>{streak}d streak</span>
          </div>

          {/* Certificate CTA */}
          {progressPercentage === 100 && (
            <Link
              to={`/certificates/view/${course.id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#080c14', fontWeight: 900,
                padding: '0.35rem 0.85rem', borderRadius: 8,
                textDecoration: 'none', fontSize: '0.78rem',
                boxShadow: '0 2px 10px rgba(251,191,36,0.35)'
              }}
            >
              <Award size={14} />
              <span className="hide-xs">Certificate of Participation</span>
            </Link>
          )}
        </div>
      </header>

      {/* ── MAIN TWO-COLUMN BODY ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT: LESSON AREA ──────────────────────────────────────────────── */}
        <main
          ref={mainRef}
          style={{ flex: 1, padding: 'clamp(1.25rem, 3vw, 2rem)', overflowY: 'auto', minWidth: 0, boxSizing: 'border-box' }}
        >
          {activeUnit ? (
            <div key={contentKey} style={{ animation: 'lms-fadeSlide 0.3s ease', maxWidth: 900, margin: '0 auto' }}>

              {/* Unit Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: activeUnit.isCompleted ? 'rgba(16,185,129,0.12)' : 'rgba(56,189,248,0.1)', color: activeUnit.isCompleted ? '#10b981' : '#38bdf8', padding: '0.2rem 0.65rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.5rem', border: `1px solid ${activeUnit.isCompleted ? 'rgba(16,185,129,0.25)' : 'rgba(56,189,248,0.2)'}` }}>
                    {activeUnit.isCompleted ? <CheckCircle2 size={11} /> : <Sparkles size={11} />}
                    <span>{activeUnit.isCompleted ? 'Completed' : `Unit ${currentIdx + 1} of ${totalUnits}`}</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', fontWeight: 900, color: 'var(--text-main)', margin: 0, lineHeight: 1.25 }}>
                    {activeUnit.title}
                  </h2>
                  {activeUnit.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                      {activeUnit.description}
                    </p>
                  )}
                </div>

                {/* Tab switcher */}
                <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, gap: 2, flexWrap: 'wrap' }}>
                  {tabs.filter(t => t.show).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      style={{
                        padding: '0.38rem 0.85rem', borderRadius: 8, border: 'none',
                        background: activeTab === t.id ? 'var(--primary)' : 'transparent',
                        color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                        transition: 'all 0.18s ease', whiteSpace: 'nowrap'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── TAB: VIDEO ───────────────────────────────────────────────── */}
              {activeTab === 'video' && (
                <div style={{ animation: 'lms-fadeSlide 0.25s ease' }}>
                  <VideoPlayer
                    url={activeUnit.videoUrl}
                    title={activeUnit.title}
                    onComplete={handleVideoComplete}
                  />
                  {videoCompleted && !activeUnit.isCompleted && (
                    <div style={{ marginTop: '0.85rem', padding: '0.75rem 1.25rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <CheckCircle2 size={16} color="#10b981" />
                      <span style={{ fontSize: '0.88rem', color: '#10b981', fontWeight: 700 }}>Video watched! Mark unit complete below to earn 50 XP and unlock the next unit.</span>
                    </div>
                  )}
                  {activeUnit.description && (
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1.25rem' }}>
                      {activeUnit.description}
                    </p>
                  )}
                </div>
              )}

              {/* ── TAB: LECTURE NOTES ──────────────────────────────────────── */}
              {activeTab === 'notes' && (
                <div className="card lms-notes-card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-surface)', minHeight: 320, animation: 'lms-fadeSlide 0.25s ease' }}>
                  {activeUnit.content ? (
                    <div
                      className="lms-content-body"
                      dangerouslySetInnerHTML={{ __html: activeUnit.content }}
                      style={{ lineHeight: 1.9, fontSize: '1rem', color: 'var(--text-main)', wordBreak: 'break-word' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      <BookOpen size={44} style={{ margin: '0 auto 1rem auto', opacity: 0.35 }} />
                      <h3 style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Reading Notes</h3>
                      <p style={{ maxWidth: 400, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Rich lecture notes and code examples for this unit will appear here. Watch the video lesson and complete the quiz to progress.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: MY NOTES ───────────────────────────────────────────── */}
              {activeTab === 'myNotes' && (
                <div style={{ animation: 'lms-fadeSlide 0.25s ease' }}>
                  <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                      <PenLine size={18} color="var(--primary)" />
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>My Notes — {activeUnit.title}</h3>
                      {notes[activeUnit.id] && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: 6, fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                          Saved
                        </span>
                      )}
                    </div>
                    <textarea
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Write your notes, key takeaways, or questions about this unit here..."
                      rows={10}
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: '0.9rem 1rem',
                        borderRadius: 10, border: '1px solid var(--border)',
                        background: 'var(--bg-app)', color: 'var(--text-main)',
                        fontSize: '0.95rem', lineHeight: 1.7, resize: 'vertical',
                        fontFamily: 'inherit', outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.75rem' }}>
                      <button
                        onClick={saveNote}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', borderRadius: 8, border: 'none', background: noteSaved ? '#10b981' : 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'background 0.2s ease' }}
                      >
                        <Save size={14} />
                        <span>{noteSaved ? 'Saved!' : 'Save Notes'}</span>
                      </button>
                      {notes[activeUnit.id] && (
                        <button
                          onClick={deleteNote}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* All saved notes count */}
                  {Object.keys(notes).length > 0 && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem 1.25rem', background: 'rgba(0,123,255,0.06)', borderRadius: 10, border: '1px solid rgba(0,123,255,0.12)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      💾 You have notes saved for <strong style={{ color: 'var(--primary)' }}>{Object.keys(notes).length}</strong> unit{Object.keys(notes).length !== 1 ? 's' : ''} in this course.
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: FILES ──────────────────────────────────────────────── */}
              {activeTab === 'files' && (
                <div style={{ animation: 'lms-fadeSlide 0.25s ease' }}>
                  {activeUnit.files && activeUnit.files.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
                        📎 Downloadable practice resources, code starters, and lecture slides for this unit:
                      </p>
                      {activeUnit.files.map(file => (
                        <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)', gap: '1rem', flexWrap: 'wrap', transition: 'box-shadow 0.2s ease' }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,123,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FileText size={18} color="var(--primary)" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{file.fileName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {file.fileType} {file.fileSize ? `• ${(file.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                              </div>
                            </div>
                          </div>
                          <a
                            href={getFullMediaUrl(file.fileUrl)}
                            target="_blank" rel="noopener noreferrer" download
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', flexShrink: 0 }}
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                      <FileText size={40} color="var(--text-muted)" style={{ opacity: 0.4, margin: '0 auto 1rem auto' }} />
                      <p style={{ color: 'var(--text-muted)', margin: 0 }}>No downloadable files attached to this unit.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: QUIZ ───────────────────────────────────────────────── */}
              {activeTab === 'quiz' && (
                <div style={{ animation: 'lms-fadeSlide 0.25s ease' }}>
                  <UnitQuiz
                    unitTitle={activeUnit.title}
                    questions={activeUnit.exerciseData || activeUnit.quiz || []}
                    passingScore={activeUnit.passingScore || 70}
                    userScore={activeUnit.userScore}
                    isCompleted={activeUnit.isCompleted}
                    onPass={(payload) => {
                      awardXP(30);
                      setShowConfetti(true);
                      setTimeout(() => setShowConfetti(false), 2000);
                      handleCompleteUnit(payload);
                    }}
                  />
                </div>
              )}

              {/* ── NAVIGATION FOOTER ────────────────────────────────────────── */}
              <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '2px solid var(--border)', paddingTop: '1.75rem' }}>
                <button
                  disabled={!prevUnit}
                  onClick={() => prevUnit && handleSelectUnit(prevUnit)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: 700, cursor: prevUnit ? 'pointer' : 'not-allowed', opacity: prevUnit ? 1 : 0.4, fontSize: '0.9rem', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => prevUnit && (e.currentTarget.style.background = 'var(--bg-app)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                {/* Center: Complete button */}
                <button
                  onClick={handleCompleteUnit}
                  disabled={completing}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '0.8rem 2rem', fontWeight: 800, borderRadius: 12, border: 'none', cursor: completing ? 'not-allowed' : 'pointer',
                    background: activeUnit.isCompleted ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, var(--primary), #0052cc)',
                    color: '#fff', fontSize: '0.95rem',
                    boxShadow: activeUnit.isCompleted ? '0 4px 16px rgba(16,185,129,0.35)' : '0 4px 16px rgba(0,123,255,0.35)',
                    animation: !activeUnit.isCompleted && (videoCompleted || activeTab !== 'video') ? 'lms-glow 2s ease-in-out infinite' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{completing ? 'Completing...' : activeUnit.isCompleted ? '✓ Completed — Go Next' : 'Mark Complete & Unlock Next'}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  disabled={!nextUnit || nextUnit.isLocked}
                  onClick={() => nextUnit && !nextUnit.isLocked && handleSelectUnit(nextUnit)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontWeight: 700, cursor: (nextUnit && !nextUnit.isLocked) ? 'pointer' : 'not-allowed', opacity: (nextUnit && !nextUnit.isLocked) ? 1 : 0.4, fontSize: '0.9rem', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => nextUnit && !nextUnit.isLocked && (e.currentTarget.style.background = 'var(--bg-app)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Keyboard shortcuts hint */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { key: '← →', label: 'Navigate units' },
                  { key: 'Space', label: 'Play/Pause video' },
                  { key: 'F', label: 'Fullscreen' },
                  { key: 'M', label: 'Mute' },
                ].map(s => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <kbd style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-main)' }}>{s.key}</kbd>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
              <BookOpen size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Select a unit from the curriculum to start learning.</p>
            </div>
          )}
        </main>

        {/* ── RIGHT: CURRICULUM SIDEBAR ─────────────────────────────────────── */}
        <aside
          className={`lms-sidebar ${mobileDrawerOpen ? 'open' : ''}`}
          style={{
            width: 340, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto', flexShrink: 0
          }}
        >
          {/* Sidebar Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.92rem', color: 'var(--text-main)' }}>Course Curriculum</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {completedUnits} / {totalUnits} completed • {progressPercentage}%
                </div>
              </div>
              <button onClick={() => setMobileDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }} id="lms-close-drawer">
                <X size={18} color="var(--text-muted)" />
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search units..."
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.45rem 0.75rem 0.45rem 2rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Modules List */}
          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredModules.map((mod, modIdx) => {
              const modUnits = mod.units || [];
              const modCompleted = modUnits.filter(u => u.isCompleted).length;
              const modPct = modUnits.length > 0 ? Math.round((modCompleted / modUnits.length) * 100) : 0;
              const isExpanded = expandedModules[mod.id] ?? true;

              return (
                <div key={mod.id} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-app)' }}>
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', background: 'var(--bg-surface)', border: 'none', borderBottom: isExpanded ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', gap: '0.65rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <ProgressRing pct={modPct} size={32} stroke={3} color={modPct === 100 ? '#10b981' : '#38bdf8'} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {mod.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{modCompleted}/{modUnits.length} • {modPct}%</div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                  </button>

                  {/* Units */}
                  {isExpanded && modUnits.map((unit, uIdx) => {
                    const isCurrent = activeUnit?.id === unit.id;
                    const isLocked = unit.isLocked;
                    const isCompleted = unit.isCompleted;

                    return (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectUnit(unit)}
                        style={{
                          padding: '0.65rem 0.9rem',
                          borderBottom: uIdx < modUnits.length - 1 ? '1px solid var(--border)' : 'none',
                          background: isCurrent ? 'rgba(0,123,255,0.07)' : 'transparent',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          opacity: isLocked ? 0.45 : 1,
                          borderLeft: `3px solid ${isCurrent ? 'var(--primary)' : 'transparent'}`,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => !isCurrent && !isLocked && (e.currentTarget.style.background = 'rgba(0,123,255,0.04)')}
                        onMouseLeave={e => !isCurrent && (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Status icon */}
                        <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: isCompleted ? 'rgba(16,185,129,0.15)' : isCurrent ? 'rgba(0,123,255,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${isCompleted ? '#10b981' : isCurrent ? 'var(--primary)' : 'var(--border)'}` }}>
                          {isCompleted ? <CheckCircle2 size={12} color="#10b981" /> : isLocked ? <Lock size={11} color="var(--text-muted)" /> : <Play size={10} color={isCurrent ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginLeft: 1 }} />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                            {unit.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 2, flexWrap: 'wrap' }}>
                            {unit.userScore !== null && (
                              <span style={{
                                fontSize: '0.66rem', fontWeight: 800,
                                background: unit.userScore >= (unit.passingScore || 70) ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
                                color: unit.userScore >= (unit.passingScore || 70) ? '#10b981' : '#ef4444',
                                padding: '1px 5px', borderRadius: 4,
                                border: `1px solid ${unit.userScore >= (unit.passingScore || 70) ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`
                              }}>
                                {unit.userScore}%
                              </span>
                            )}
                            {unit.videoUrl && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>🎬</span>}
                            {unit.content && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>📖</span>}
                            {unit.files?.length > 0 && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>📎{unit.files.length}</span>}
                            {notes[unit.id] && <span style={{ fontSize: '0.62rem', color: '#10b981' }}>✏️</span>}
                            {unit.duration && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{unit.duration}</span>}
                          </div>
                        </div>

                        {isLocked && <Lock size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ── COURSE COMPLETION CELEBRATION ────────────────────────────────────── */}
      {showCelebration && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem', backdropFilter: 'blur(8px)' }}>
          <div style={{ maxWidth: 540, width: '100%', textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, #090e1a 0%, #0f182c 100%)', color: '#fff', border: '2px solid #fbbf24', borderRadius: 24, position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', animation: 'lms-fadeSlide 0.4s ease' }}>
            <div style={{ width: 88, height: 88, background: 'rgba(251,191,36,0.12)', border: '2px solid #fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Trophy size={44} color="#fbbf24" />
            </div>
            <div style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Official Course Completion & Verification
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.1rem)', fontWeight: 900, margin: '0 0 0.75rem 0', lineHeight: 1.2, color: '#fff' }}>
              Congratulations, {user?.firstName || 'Scholar'}! 🎓
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
              You have completed all modules and unit exercises of <strong style={{ color: '#f1f5f9' }}>{course.title}</strong>!
            </p>

            {playerData?.currentAverageScore > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 10, padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                <Star size={14} fill="#38bdf8" color="#38bdf8" />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
                  Final Academic Score: {playerData.currentAverageScore}%
                </span>
              </div>
            )}

            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Your official <strong>Certificate of Participation</strong> has been authenticated and awarded with a unique cryptographic verification hash.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to={`/certificates/view/${course.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '0.95rem 1.75rem', borderRadius: 12,
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#080c14', fontWeight: 900,
                  textDecoration: 'none', fontSize: '0.95rem',
                  boxShadow: '0 4px 20px rgba(251,191,36,0.35)'
                }}
              >
                <Award size={20} />
                <span>View & Print Certificate of Participation</span>
              </Link>
              <button
                onClick={() => setShowCelebration(false)}
                style={{ padding: '0.65rem', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.07)', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Close & Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL STYLES ──────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes lms-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes lms-fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lms-glow {
          0%, 100% { box-shadow: 0 4px 16px rgba(0,123,255,0.35); }
          50%       { box-shadow: 0 4px 30px rgba(0,123,255,0.65), 0 0 0 6px rgba(0,123,255,0.15); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }

        /* Lecture note content styles */
        .lms-content-body h1, .lms-content-body h2, .lms-content-body h3 {
          color: var(--text-main); font-weight: 800; margin: 1.5rem 0 0.75rem 0;
        }
        .lms-content-body h2 { font-size: 1.35rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
        .lms-content-body h3 { font-size: 1.1rem; color: var(--primary); }
        .lms-content-body p { margin: 0 0 1rem 0; }
        .lms-content-body ul, .lms-content-body ol { padding-left: 1.5rem; margin: 0.5rem 0 1rem 0; }
        .lms-content-body li { margin-bottom: 0.4rem; }
        .lms-content-body pre {
          background: #0f172a; color: #e2e8f0; padding: 1.25rem 1.5rem;
          border-radius: 10px; overflow-x: auto; font-size: 0.88rem;
          border: 1px solid rgba(255,255,255,0.08); margin: 1rem 0;
        }
        .lms-content-body code {
          background: rgba(0,123,255,0.1); color: var(--primary);
          padding: 1px 6px; border-radius: 4px; font-size: 0.88em;
        }
        .lms-content-body blockquote {
          border-left: 4px solid var(--primary); padding: 0.75rem 1.25rem;
          background: rgba(0,123,255,0.06); border-radius: 0 8px 8px 0; margin: 1rem 0;
          color: var(--text-muted); font-style: italic;
        }
        .lms-content-body table {
          width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem;
        }
        .lms-content-body th {
          background: var(--primary); color: #fff; padding: 0.6rem 1rem;
          text-align: left; font-weight: 700;
        }
        .lms-content-body td {
          padding: 0.6rem 1rem; border-bottom: 1px solid var(--border);
        }
        .lms-content-body tr:nth-child(even) td { background: rgba(0,0,0,0.02); }

        /* Responsive */
        @media (max-width: 900px) {
          #lms-mobile-toggle { display: flex !important; }
          #lms-close-drawer { display: flex !important; }
          .lms-sidebar {
            position: fixed !important;
            top: 0 !important; right: 0 !important; bottom: 0 !important;
            height: 100vh !important; z-index: 1001 !important;
            transform: translateX(100%);
            transition: transform 0.28s ease;
          }
          .lms-sidebar.open { transform: translateX(0); }
          .hide-sm { display: none !important; }
        }
        @media (max-width: 480px) {
          .hide-xs { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;
