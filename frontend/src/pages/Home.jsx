import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Eye, Target, Compass, Lightbulb, Award,
  Wrench, ShieldCheck, BookOpen, Rocket, Code2, Cpu,
  BarChart3, Building2, Sparkles, ChevronRight, Users,
  Star, Globe, TrendingUp, Zap, Heart, Calendar, Clock,
  MapPin, Newspaper, CalendarDays, ExternalLink, Handshake
} from 'lucide-react';

const VMG_ICON_MAP = { eye: Eye, target: Target, compass: Compass, lightbulb: Lightbulb, rocket: Rocket, star: Star };
const SVC_ICON_MAP = { code: Code2, cpu: Cpu, sparkles: Sparkles, chart: BarChart3, building: Building2, lightbulb: Lightbulb, rocket: Rocket, zap: Zap, globe: Globe, trending: TrendingUp, users: Users };
import Carousel from '../components/common/Carousel';
import api from '../services/api';
import { getFullMediaUrl } from '../utils/mediaUrl';

/* ─────────────────────────────────────────────────────────────────────────────
   Shared reusable renderers
───────────────────────────────────────────────────────────────────────────── */

const VALUE_ICONS = {
  lightbulb: Lightbulb, award: Award, wrench: Wrench,
  shield: ShieldCheck, book: BookOpen, rocket: Rocket,
  star: Star, zap: Zap, globe: Globe, trending: TrendingUp,
  heart: Heart, users: Users, code: Code2, cpu: Cpu,
  chart: BarChart3, sparkles: Sparkles
};

const VALUE_COLORS = [
  { bg: 'rgba(0,123,255,0.12)', color: '#007bff', grad: 'linear-gradient(135deg,#007bff,#00c6ff)' },
  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
  { bg: 'rgba(16,185,129,0.12)', color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#34d399)' },
  { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', grad: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { bg: 'rgba(236,72,153,0.12)', color: '#ec4899', grad: 'linear-gradient(135deg,#ec4899,#f472b6)' },
  { bg: 'rgba(111,66,193,0.12)', color: '#7c3aed', grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
];

const SERVICE_COLORS = [
  { bg: 'rgba(0,123,255,0.10)', color: '#007bff', borderHover: '#007bff' },
  { bg: 'rgba(16,185,129,0.10)', color: '#10b981', borderHover: '#10b981' },
  { bg: 'rgba(111,66,193,0.10)', color: '#7c3aed', borderHover: '#7c3aed' },
  { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', borderHover: '#f59e0b' },
  { bg: 'rgba(6,182,212,0.10)', color: '#06b6d4', borderHover: '#06b6d4' },
  { bg: 'rgba(236,72,153,0.10)', color: '#ec4899', borderHover: '#ec4899' },
];

/* ── 1. About Us Intro Block ─────────────────────────────────────────────────── */
export const AboutIntroBlock = ({ sec = {} }) => {
  const features = sec.features || [
    { title: 'Hands-On Practical Training', desc: 'Real-world, project-driven curriculum for kids, students and professionals.', icon: 'code', color: 0 },
    { title: 'Cutting-Edge AI & Software', desc: 'Custom software and AI solutions tailored to business needs.', icon: 'cpu', color: 1 },
    { title: 'Digital Transformation', desc: 'Empowering learners and organizations to thrive in the digital economy.', icon: 'rocket', color: 2 },
  ];

  return (
    <section className="container">
      <div style={{
        borderRadius: '28px',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
        padding: 'clamp(2rem, 5vw, 4.5rem)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,123,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          {/* Left: Text content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.1)', border: '1px solid rgba(0,123,255,0.2)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
              <Users size={14} color="#007bff" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>About JONIKWIRIA</span>
            </div>

            <h2 style={{ fontSize: 'clamp(2rem,3.5vw,2.9rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-main)', margin: '0 0 0.6rem 0', lineHeight: 1.15 }}>
              {sec.headline || 'Building People. Building Technology.'}
            </h2>

            <p style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', fontWeight: 800, margin: '0 0 1.75rem 0' }}>
              {sec.tagline || 'Leading Technology Training, Software Development & Innovation'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.25rem' }}>
              <p style={{ margin: 0, fontSize: '1.025rem', lineHeight: 1.8, color: 'var(--text-main)', fontWeight: 600 }}>
                {sec.para1 || 'JONIKWIRIA is a premier technology education and software development firm equipping learners with practical digital skills while engineering robust enterprise software solutions.'}
              </p>
              <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: 1.75, color: 'var(--text-muted)' }}>
                {sec.para2 || 'From youth robotics to full-stack engineering and artificial intelligence, our industry-led curriculum bridges the skills gap for learners and empowers organizations.'}
              </p>
            </div>

            <Link to={sec.btnUrl || '/p/about-us'} className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <span>{sec.btnText || 'Learn More About Us'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Right: Features Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            {features.map((f, fi) => {
              const IconComp = SVC_ICON_MAP[f.icon] || Sparkles;
              const col = VALUE_COLORS[fi % VALUE_COLORS.length];
              return (
                <div key={fi} className="hover-scale" style={{ padding: '1.5rem 1.75rem', borderRadius: '18px', border: '1px solid var(--border)', background: 'var(--bg-surface)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: col.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${col.bg}` }}>
                    <IconComp size={22} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{f.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── 2. Vision, Mission & Goal Section (Following About Us) ─────────────────── */
export const VMGBlock = ({ sec = {} }) => {
  const items = sec.items || [
    {
      icon: 'eye',
      label: 'Our Vision',
      tagline: 'Empowering Digital Futures',
      text: 'To become a leading technology education and innovation company, empowering people and organizations to create solutions for a digital future.',
      grad: 'linear-gradient(135deg, #007bff 0%, #00c6ff 100%)',
      topBar: 'linear-gradient(90deg, #007bff, #00c6ff)',
      glow: 'rgba(0,123,255,0.25)',
      accentColor: '#007bff',
      badgeBg: 'rgba(0,123,255,0.1)'
    },
    {
      icon: 'target',
      label: 'Our Mission',
      tagline: 'Practical & Industry-Relevant',
      text: 'To provide accessible, practical and industry-relevant technology education while developing innovative software, AI and data solutions that create meaningful impact.',
      grad: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      topBar: 'linear-gradient(90deg, #10b981, #34d399)',
      glow: 'rgba(16,185,129,0.25)',
      accentColor: '#10b981',
      badgeBg: 'rgba(16,185,129,0.1)'
    },
    {
      icon: 'compass',
      label: 'Our Goal',
      tagline: 'Transforming Creators',
      text: 'To bridge the technology skills gap by transforming learners into confident technology creators and helping organizations build the capabilities they need to thrive in the digital economy.',
      grad: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      topBar: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
      glow: 'rgba(124,58,237,0.25)',
      accentColor: '#7c3aed',
      badgeBg: 'rgba(124,58,237,0.1)'
    },
  ];

  return (
    <section className="container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .vmg-responsive-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        @media (max-width: 1024px) {
          .vmg-responsive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        @media (max-width: 768px) {
          .vmg-responsive-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .vmg-card-box {
            padding: 2rem 1.5rem !important;
          }
        }
      `}} />

      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
          <Globe size={14} color="#007bff" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Strategic Direction</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {sec.title || 'Our Vision, Mission & Goal'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, lineHeight: 1.65 }}>
          {sec.subtitle || 'Guided by a dedicated commitment to human empowerment, digital excellence, and transformative technological impact.'}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="vmg-responsive-grid">
        {items.map((item, i) => {
          const IconComp = VMG_ICON_MAP[item.icon] || Star;
          return (
            <div
              key={i}
              className="vmg-card-box hover-scale"
              style={{
                padding: '2.5rem 2rem',
                borderRadius: '22px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
              }}
            >
              {/* Colored top indicator line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: item.topBar }} />

              {/* Icon Container with glowing shadow */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: item.grad,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: `0 8px 24px ${item.glow}`
              }}>
                <IconComp size={30} color="#fff" />
              </div>

              {/* Title & Tagline */}
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: item.accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {item.tagline}
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
                {item.label}
              </h3>

              {/* Description Body */}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.75, margin: 0, flex: 1 }}>
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ── Values Grid Block ───────────────────────────────────────────────────────── */
export const ValuesGridBlock = ({ sec = {} }) => {
  const values = sec.values || [
    { icon: 'lightbulb', title: 'Innovation', desc: 'We encourage creativity, experimentation and new ways of solving problems.' },
    { icon: 'award', title: 'Excellence', desc: 'We strive for high standards in everything we teach and build.' },
    { icon: 'wrench', title: 'Practicality', desc: 'We focus on skills and solutions that can be applied to real-world problems.' },
    { icon: 'shield', title: 'Integrity', desc: 'We operate with honesty, transparency and professionalism.' },
    { icon: 'book', title: 'Continuous Learning', desc: 'We believe technology is constantly evolving, and learning must evolve with it.' },
    { icon: 'rocket', title: 'Impact', desc: 'We measure our success by the value we create for learners, clients and society.' },
  ];

  return (
    <section className="container">
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
          <ShieldCheck size={14} color="#007bff" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Core Principles</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.85rem,3vw,2.6rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
          {sec.title || 'Our Core Values'}
        </h2>
        {sec.subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, lineHeight: 1.65 }}>{sec.subtitle}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.75rem' }}>
        {values.map((v, vi) => {
          const c = VALUE_COLORS[vi % VALUE_COLORS.length];
          const IconComp = VALUE_ICONS[v.icon] || Award;
          return (
            <div
              key={vi}
              className="hover-scale"
              style={{
                padding: '2rem 1.75rem', borderRadius: '18px',
                border: '1px solid var(--border)', background: 'var(--bg-surface)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c.grad }} />
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', boxShadow: `0 4px 14px ${c.bg}` }}>
                <IconComp size={24} color="#fff" />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.6rem 0', color: 'var(--text-main)' }}>{v.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>{v.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ── 3. Featured Courses Section ────────────────────────────────────────────── */
export const CoursesSection = ({ courses = [], departments = [] }) => {
  const [selectedDept, setSelectedDept] = useState('all');

  const filteredCourses = selectedDept === 'all'
    ? courses
    : courses.filter(c => c.departmentId === selectedDept || c.department?.id === selectedDept);

  return (
    <section className="container">
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
          <BookOpen size={14} color="#007bff" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academic Programmes</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.65rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>
          Featured Courses &amp; Learning Tracks
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, lineHeight: 1.65 }}>
          Master in-demand technology disciplines through hands-on project building, expert faculty mentoring, and verified certifications.
        </p>
      </div>

      {/* Department Filter Pills */}
      {departments.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <button
            onClick={() => setSelectedDept('all')}
            style={{
              padding: '0.5rem 1.15rem', borderRadius: '9999px',
              background: selectedDept === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedDept === 'all' ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)'
            }}
          >
            All Tracks ({courses.length})
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              style={{
                padding: '0.5rem 1.15rem', borderRadius: '9999px',
                background: selectedDept === d.id ? 'var(--primary)' : 'var(--bg-surface)',
                color: selectedDept === d.id ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {filteredCourses.slice(0, 6).map(course => (
          <div
            key={course.id}
            className="card hover-scale"
            style={{
              padding: 0, overflow: 'hidden', borderRadius: '20px',
              border: '1px solid var(--border)', background: 'var(--bg-surface)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            {/* Image */}
            <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: '#0b132b' }}>
              <img
                src={getFullMediaUrl(course.imageUrl) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{ position: 'absolute', top: 12, left: 12, padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(0,123,255,0.9)', color: '#fff', backdropFilter: 'blur(8px)', textTransform: 'capitalize' }}>
                {course.level} Level
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {course.department && (
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {course.department.name}
                </span>
              )}

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.65rem 0', lineHeight: 1.35 }}>
                <Link to={`/courses/${course.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {course.title}
                </Link>
              </h3>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.25rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                {course.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="var(--primary)" />
                  <span>{course.duration || 'Flexible Pace'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={13} fill="#fbbf24" color="#fbbf24" />
                  <span>4.9 (1.2k)</span>
                </div>
              </div>

              <Link
                to={`/courses/${course.slug}`}
                className="btn btn-primary"
                style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}
              >
                <span>View Full Curriculum</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* View All CTA */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/courses" className="btn btn-outline" style={{ padding: '0.85rem 2.25rem', borderRadius: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span>Browse All Academic Courses</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

/* ── 4. News & Events Dual Showcase Section ─────────────────────────────────── */
export const NewsAndEventsSection = ({ news = [], events = [] }) => {
  const featuredArticle = news[0];
  const otherNews = news.slice(1, 4);

  return (
    <section className="container">
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto clamp(2rem, 4vw, 3rem) auto', padding: '0 0.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '0.75rem' }}>
          <Newspaper size={14} color="#007bff" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>News &amp; Events</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em', lineHeight: 1.2, wordBreak: 'break-word' }}>
          Latest News &amp; Upcoming Events
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', margin: 0, lineHeight: 1.65, wordBreak: 'break-word' }}>
          Stay informed with our latest technology research, institutional milestones, hackathons, and global summit schedules.
        </p>
      </div>

      <div className="news-events-grid">

        {/* Left Column: Latest News & Insights */}
        <div style={{ minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,123,255,0.12)', color: '#007bff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Newspaper size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-word' }}>Featured &amp; Latest News</h3>
            </div>
            <Link to="/news" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <span>View All News</span> <ChevronRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
            {/* Featured Hero Article */}
            {featuredArticle && (
              <div
                className="card hover-scale"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: '18px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  minWidth: 0
                }}
              >
                {featuredArticle.imageUrl && (
                  <div style={{ height: 'clamp(160px, 25vw, 200px)', overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
                    <img
                      src={getFullMediaUrl(featuredArticle.imageUrl)}
                      alt={featuredArticle.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {featuredArticle.category && (
                      <span style={{ position: 'absolute', top: 12, left: 12, padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, background: 'var(--primary)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                        {featuredArticle.category}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, flexWrap: 'wrap' }}>
                    <Calendar size={12} color="var(--primary)" />
                    <span>{new Date(featuredArticle.publishedAt || featuredArticle.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(1.05rem, 2.5vw, 1.2rem)', fontWeight: 800, lineHeight: 1.35 }}>
                    <Link to={`/news/${featuredArticle.slug}`} className="line-clamp-2" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {featuredArticle.title}
                    </Link>
                  </h4>
                  <p className="line-clamp-3" style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {featuredArticle.excerpt || (featuredArticle.content ? featuredArticle.content.substring(0, 140) + '...' : '')}
                  </p>
                  <Link to={`/news/${featuredArticle.slug}`} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>Read Full Story</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Other Compact News List */}
            {otherNews.map(n => (
              <div
                key={n.id}
                className="card hover-scale"
                style={{
                  padding: 'clamp(0.85rem, 2vw, 1.15rem)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  gap: 'clamp(0.75rem, 2vw, 1rem)',
                  alignItems: 'center',
                  minWidth: 0
                }}
              >
                {n.imageUrl && (
                  <img
                    src={getFullMediaUrl(n.imageUrl)}
                    alt=""
                    style={{ width: 72, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    loading="lazy"
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3, flexWrap: 'wrap' }}>
                    <Calendar size={10} />
                    <span>{new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    {n.category && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>• {n.category}</span>}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.4 }}>
                    <Link to={`/news/${n.slug}`} className="line-clamp-2" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {n.title}
                    </Link>
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Events */}
        <div style={{ minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarDays size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-word' }}>Upcoming Events</h3>
            </div>
            <Link to="/events" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <span>View All Events</span> <ChevronRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
            {events.slice(0, 4).map(ev => {
              const dateObj = new Date(ev.startDate);
              const monthStr = dateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
              const dayStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit' });

              return (
                <div key={ev.id} className="home-event-card hover-scale">
                  {/* Calendar Date Badge */}
                  <div className="home-event-date-badge">
                    <span className="badge-month" style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em' }}>{monthStr}</span>
                    <span className="badge-day" style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1 }}>{dayStr}</span>
                  </div>

                  {/* Event Info */}
                  <div className="home-event-card-content" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                      <MapPin size={11} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span className="line-clamp-1">{ev.location || 'Online Stream'}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 800, lineHeight: 1.35 }}>
                      <Link to={`/events/${ev.slug}`} className="line-clamp-2" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {ev.title}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', fontWeight: 700, textTransform: 'capitalize', display: 'inline-block' }}>
                      {ev.category || 'Workshop'}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="home-event-card-action">
                    <Link
                      to={`/events/${ev.slug}`}
                      className="btn btn-sm btn-primary"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', whiteSpace: 'nowrap', textDecoration: 'none', fontWeight: 700, borderRadius: '8px' }}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

/* ── 5. Strategic Sponsors & Partners Section ────────────────────────────────── */
export const SponsorsSection = () => {
  const sponsors = [
    { name: 'Google Cloud for Education', tier: 'Cloud & AI Partner', logo: '🌐', bg: '#4285F4' },
    { name: 'Microsoft Learn Academy', tier: 'Curriculum & Certifications', logo: '💻', bg: '#00A4EF' },
    { name: 'AWS Academy', tier: 'Cloud Infrastructure Partner', logo: '☁️', bg: '#FF9900' },
    { name: 'Python Software Foundation', tier: 'Ecosystem Partner', logo: '🐍', bg: '#3776AB' },
    { name: 'Techstars Community', tier: 'Incubation & Startup Accelerator', logo: '🚀', bg: '#00BFA5' },
    { name: 'Oracle Academy', tier: 'Enterprise Database Partner', logo: '🏛️', bg: '#F80000' }
  ];

  return (
    <section className="container">
      <div style={{
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
          <Handshake size={14} color="#10b981" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Global Tech Ecosystem</span>
        </div>

        <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.6rem 0' }}>
          Strategic Sponsors &amp; Industry Affiliates
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 650, margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
          We collaborate with premier technology giants, academic foundations, and venture accelerators to provide sponsored training, cloud credits, and global certifications.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {sponsors.map((sp, sIdx) => (
            <div
              key={sIdx}
              className="hover-scale"
              style={{
                padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)',
                background: 'var(--bg-app)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '2.25rem', marginBottom: 4 }}>{sp.logo}</span>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{sp.name}</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sp.tier}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/p/about-us" className="btn btn-outline btn-sm" style={{ fontWeight: 700, padding: '0.65rem 1.5rem', borderRadius: '10px' }}>
            <span>Partner With JONIKWIRIA</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ── 6. Services Grid Block ("What We Do") ─────────────────────────────────── */
export const ServicesGridBlock = ({ sec = {} }) => {
  const items = sec.items || [
    { icon: 'code', label: 'Technology Training', text: 'Practical, industry-led curriculum for kids, students, professionals and organizations.', link: '/courses', linkText: 'Explore Courses', colorIndex: 0 },
    { icon: 'cpu', label: 'Software Development', text: 'Design, development and deployment of customized digital solutions and web systems.', link: '/p/about-us', linkText: 'Custom Engineering', colorIndex: 1 },
    { icon: 'sparkles', label: 'Artificial Intelligence', text: 'Cutting-edge AI, machine-learning models and intelligent automated workflows.', link: '/courses', linkText: 'AI Solutions', colorIndex: 2 },
    { icon: 'chart', label: 'Data Science & Analytics', text: 'Data engineering, interactive visualizations, and predictive analytics for growth.', link: '/courses', linkText: 'Data Analytics', colorIndex: 3 },
    { icon: 'building', label: 'IT Capacity Building', text: 'Customized corporate technology bootcamps and executive upskilling programs.', link: '/p/about-us', linkText: 'Corporate Upskilling', colorIndex: 4 },
    { icon: 'lightbulb', label: 'Digital Innovation', text: 'Helping individuals and organizations turn ambitious ideas into scalable products.', link: '/p/about-us', linkText: 'Innovate With Us', colorIndex: 5 },
  ];

  return (
    <section className="container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .services-responsive-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }
        @media (max-width: 1024px) {
          .services-responsive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        @media (max-width: 640px) {
          .services-responsive-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .services-card-box {
            padding: 1.75rem 1.25rem !important;
          }
        }
      `}} />

      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,123,255,0.08)', border: '1px solid rgba(0,123,255,0.18)', borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1rem' }}>
          <Sparkles size={14} color="#007bff" />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#007bff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Services &amp; Solutions</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {sec.title || 'What We Do'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, lineHeight: 1.65 }}>
          {sec.subtitle || 'Practical digital skills training, custom software engineering, and AI solutions built for real-world impact.'}
        </p>
      </div>

      {/* Grid */}
      <div className="services-responsive-grid">
        {items.map((svc, si) => {
          const c = SERVICE_COLORS[svc.colorIndex ?? si % SERVICE_COLORS.length];
          const SvcIcon = SVC_ICON_MAP[svc.icon] || Code2;
          return (
            <div
              key={si}
              className="services-card-box hover-scale"
              style={{
                padding: '2.25rem 1.75rem',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: c.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  border: `1px solid ${c.color}33`,
                  boxShadow: `0 6px 18px ${c.bg}`
                }}>
                  <SvcIcon size={26} color={c.color} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.65rem 0' }}>
                  {svc.label}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.65, margin: 0 }}>
                  {svc.text}
                </p>
              </div>

              <div style={{ marginTop: '1.75rem', paddingTop: '1.15rem', borderTop: '1px solid var(--border)' }}>
                <Link
                  to={svc.link || '/courses'}
                  style={{ color: c.color, fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>{svc.linkText || 'Learn More'}</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ── 7. Promise Banner Block ─────────────────────────────────────────────────── */
export const PromiseBannerBlock = () => {
  return (
    <section className="container">
      <div style={{
        background: 'linear-gradient(-45deg, #0b132b, #0037b3, #0052cc, #1e1b4b)',
        padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1.5rem, 4vw, 4rem)',
        borderRadius: '28px', color: '#fff', textAlign: 'center',
        position: 'relative', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,82,204,0.35)'
      }}>
        <div style={{ position: 'absolute', top: -50, left: -50, width: 180, height: 180, borderRadius: '50%', background: '#fff', opacity: 0.1 }} />
        <div style={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: '#fff', opacity: 0.1 }} />

        <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '9999px', padding: '0.4rem 1.25rem', marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
            <Heart size={14} color="#fff" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>Our Core Promise</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.85rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 2rem 0', color: '#fff', lineHeight: 1.15 }}>
            Learn. Build. Innovate.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.75rem' }}>
            <p style={{ margin: 0, fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', opacity: 0.92, fontWeight: 500 }}>
              At <strong>JONIKWIRIA</strong>, we don't just teach people how technology works.
            </p>
            <p style={{ margin: 0, color: '#ffdd57', fontWeight: 800, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)' }}>
              We teach them how to use technology to create.
            </p>
            <p style={{ margin: 0, fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', opacity: 0.92, fontWeight: 500 }}>
              And we don't just build software.
            </p>
            <p style={{ margin: 0, color: '#ffdd57', fontWeight: 800, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)' }}>
              We build solutions that solve real problems.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-lg" style={{ background: '#fff', color: '#0037b3', fontWeight: 800, padding: '0.95rem 2.25rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <span>Start Learning Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/p/about-us" className="btn btn-lg" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.6)', fontWeight: 700, padding: '0.95rem 2rem', borderRadius: '12px', textDecoration: 'none' }}>
              <span>About Academy</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Home Component
───────────────────────────────────────────────────────────────────────────── */
const Home = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/courses/active?limit=6').catch(() => ({ data: { data: [] } })),
      api.get('/departments/active').catch(() => ({ data: { data: [] } })),
      api.get('/news/published?limit=3').catch(() => ({ data: { news: [] } })),
      api.get('/events/upcoming?limit=3').catch(() => ({ data: { data: [] } }))
    ])
      .then(([coursesRes, deptsRes, newsRes, eventsRes]) => {
        if (coursesRes.data?.data) setCourses(coursesRes.data.data);
        if (deptsRes.data?.data) setDepartments(deptsRes.data.data);
        if (newsRes.data?.news) setNews(newsRes.data.news);
        if (eventsRes.data?.data) setEvents(eventsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* 1. Hero Carousel */}
      <Carousel />

      {/* Structured Sections Sequence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5.5rem', marginTop: '2.5rem' }}>

        {/* 2. About Us Section */}
        <AboutIntroBlock />

        {/* 3. Our Vision, Mission & Goal Section (Following About Us) */}
        <VMGBlock />

        {/* 4. What We Do Section (POSITIONED IMMEDIATELY AFTER VISION, MISSION & GOAL) */}
        <ServicesGridBlock />

        {/* 5. Featured Courses Section */}
        <CoursesSection courses={courses} departments={departments} />

        {/* 6. News & Events Dual Section */}
        <NewsAndEventsSection news={news} events={events} />

        {/* 7. Strategic Sponsors & Industry Partners */}
        <SponsorsSection />

        {/* 8. Our Core Promise Banner */}
        <PromiseBannerBlock />

      </div>
    </div>
  );
};

export default Home;
