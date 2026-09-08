import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Award, CheckCircle2, Clock, Play, ArrowRight,
  TrendingUp, Compass, Search, ShieldCheck, Sparkles, ExternalLink,
  Flame, Calendar, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageBanner from '../../components/common/PageBanner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learningData, setLearningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in_progress'); // 'in_progress', 'completed', 'certificates'
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchMyLearning();
  }, []);

  const fetchMyLearning = () => {
    setLoading(true);
    api.get('/student/my-learning')
      .then((res) => {
        if (res.data.success) {
          setLearningData(res.data.data);
        }
      })
      .catch((err) => console.error('Error loading student dashboard:', err))
      .finally(() => setLoading(false));
  };

  const studentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || 'Scholar';

  const enrollments = learningData?.enrollments || [];
  const certificates = learningData?.certificates || [];
  const summary = learningData?.summary || {
    totalEnrolled: 0,
    completedCount: 0,
    inProgressCount: 0,
    certificatesEarned: 0
  };

  const inProgressCourses = enrollments.filter(e => e.progressPercentage < 100);
  const completedCourses = enrollments.filter(e => e.progressPercentage >= 100);

  const filteredInProgress = inProgressCourses.filter(e =>
    e.course?.title?.toLowerCase().includes(searchFilter.toLowerCase())
  );
  const filteredCompleted = completedCourses.filter(e =>
    e.course?.title?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="student-dashboard-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Dynamic Student Hero Banner */}
      <PageBanner
        badge="Great Learning Student Portal"
        badgeIcon={Sparkles}
        title={`Welcome back, ${studentName}!`}
        subtitle="Track your phased curriculum, continue where you left off, and claim your verifiable JONIKWIRIA digital certificates."
        breadcrumbs={[{ label: 'Student Portal', path: '/student/my-learning' }]}
        align="left"
      >
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{summary.totalEnrolled} Courses Enrolled</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>{summary.certificatesEarned} Certificates Earned</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Flame size={16} color="#ef4444" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>100% Free Lifetime Access</span>
          </div>
        </div>
      </PageBanner>

      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Navigation & Search Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('in_progress')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'in_progress' ? 'var(--primary)' : 'var(--bg-surface)',
                color: activeTab === 'in_progress' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              <BookOpen size={16} />
              <span>In Progress ({inProgressCourses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'completed' ? 'var(--primary)' : 'var(--bg-surface)',
                color: activeTab === 'completed' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Completed ({completedCourses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'certificates' ? 'var(--primary)' : 'var(--bg-surface)',
                color: activeTab === 'certificates' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition)'
              }}
            >
              <Award size={16} />
              <span>My Certificates ({certificates.length})</span>
            </button>
          </div>

          {/* Quick Filter Search & Explore Courses CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter your courses..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <Link to="/courses" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              <Compass size={14} />
              <span>Browse All Free Courses</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading your curriculum and progress records...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div>
            {/* 1. IN PROGRESS TAB */}
            {activeTab === 'in_progress' && (
              <div>
                {filteredInProgress.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', border: '1px dashed var(--border)' }}>
                    <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No Active Courses In Progress</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                      You don’t have any active courses right now. All courses are 100% free with step-by-step phased progression and digital credentials.
                    </p>
                    <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Explore Free Course Catalog</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                    {filteredInProgress.map((enrollment) => {
                      const course = enrollment.course;
                      if (!course) return null;
                      const progress = enrollment.progressPercentage || 0;

                      return (
                        <div key={enrollment.id} className="card hover-scale" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 0 }}>
                          <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <span style={{ background: 'rgba(0,123,255,0.12)', color: 'var(--primary)', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                                {course.department?.name || 'Technology'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {course.duration || 'Flexible'}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.75rem 0', lineHeight: 1.35 }} className="line-clamp-2">
                              {course.title}
                            </h3>

                            {/* Score & Progress */}
                            <div style={{ margin: '1.25rem 0 0.5rem 0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Curriculum Progress</span>
                                <span style={{ color: 'var(--primary)' }}>{progress}%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #38bdf8 100%)', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                              </div>
                            </div>

                            {enrollment.finalScore > 0 && (
                              <div style={{ marginTop: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
                                <span>Current Evaluation Score: {enrollment.finalScore}%</span>
                              </div>
                            )}
                          </div>

                          <div style={{ background: 'var(--bg-app)', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={13} />
                              {progress === 0 ? 'Not started' : 'Phase in progress'}
                            </span>
                            <Link to={`/student/courses/${course.slug || course.id}/learn`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                              <Play size={13} />
                              <span>{progress === 0 ? 'Start Course' : 'Resume Lesson'}</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. COMPLETED TAB */}
            {activeTab === 'completed' && (
              <div>
                {filteredCompleted.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', border: '1px dashed var(--border)' }}>
                    <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No Completed Courses Yet</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                      Complete all sequential phases in a course to 100% to earn your verified JONIKWIRIA certificate.
                    </p>
                    <button onClick={() => setActiveTab('in_progress')} className="btn btn-primary">Continue In-Progress Courses</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
                    {filteredCompleted.map((enrollment) => {
                      const course = enrollment.course;
                      if (!course) return null;

                      return (
                        <div key={enrollment.id} className="card hover-scale" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                              <CheckCircle2 size={16} />
                              <span>100% Completed</span>
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>{course.title}</h3>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }} className="line-clamp-2">{course.description}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link to={`/student/courses/${course.slug || course.id}/learn`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                              Review Course
                            </Link>
                            <Link to={`/certificates/view/${course.id}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Award size={14} />
                              <span>View Certificate</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. MY CERTIFICATES TAB */}
            {activeTab === 'certificates' && (
              <div>
                {certificates.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-surface)', border: '1px dashed var(--border)' }}>
                    <Award size={48} color="#fbbf24" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>No Certificates Earned Yet</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                      Once you finish all course lessons and units, your verified credential with unique QR code will appear here.
                    </p>
                    <button onClick={() => setActiveTab('in_progress')} className="btn btn-primary">Go to Active Courses</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
                    {certificates.map((cert) => (
                      <div key={cert.id} className="card hover-scale" style={{ background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)', color: '#fff', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '16px', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <ShieldCheck size={16} />
                            <span>Certificate of Participation</span>
                          </div>
                          {cert.metadata?.finalScore && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(56,189,248,0.3)' }}>
                              Score: {cert.metadata.finalScore}%
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                          {cert.courseTitle}
                        </h3>

                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
                          <div>Conferred to: <strong style={{ color: '#fff' }}>{cert.recipientName}</strong></div>
                          {cert.metadata?.distinction && (
                            <div style={{ color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
                              Honors: {cert.metadata.distinction}
                            </div>
                          )}
                          <div style={{ marginTop: 2 }}>Credential ID: <code style={{ color: '#fbbf24', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>{cert.credentialId}</code></div>
                          <div style={{ marginTop: 2 }}>Date: {new Date(cert.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <Link to={`/certificates/view/${cert.courseId || cert.id}`} className="btn btn-sm" style={{ background: '#fbbf24', color: '#0b132b', fontWeight: 800, flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', borderRadius: 8 }}>
                            <Award size={14} />
                            <span>View / Download</span>
                          </Link>
                          <Link to={`/verify/${cert.credentialId}`} target="_blank" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none', borderRadius: 8 }}>
                            <ExternalLink size={13} />
                            <span>Verify</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
