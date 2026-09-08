import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, ChevronRight, MessageSquare, Play, Send, 
  CornerDownRight, CheckCircle2, ArrowRight, ExternalLink 
} from 'lucide-react';
import api from '../services/api';
import Carousel from '../components/common/Carousel';
import { AboutIntroBlock, ValuesGridBlock } from './Home';

const formatVideoEmbedUrl = (url) => {
  if (!url) return null;
  const str = url.trim();
  // YouTube
  if (str.includes('youtube.com/watch?v=')) {
    const videoId = str.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (str.includes('youtu.be/')) {
    const videoId = str.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (str.includes('youtube.com/embed/')) {
    return str;
  }
  // Vimeo
  if (str.includes('vimeo.com/')) {
    const vimeoId = str.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${vimeoId}`;
  }
  return null;
};

import PageBanner from '../components/common/PageBanner';
import { getFullMediaUrl } from '../utils/mediaUrl';
export { getFullMediaUrl };

const DynamicPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get('preview') === 'true';

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsFeedItems, setNewsFeedItems] = useState([]);

  // Comment system states
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);

    api.get(`/pages/slug/${slug}?preview=${preview}`)
      .then((res) => {
        if (res.data.success) {
          const pageData = res.data.data;
          setPage(pageData);
          setComments(pageData.comments || []);
          document.title = pageData.metaTitle || pageData.title;

          if (pageData.sections && pageData.sections.some(s => s.type === 'news_feed')) {
            api.get('/pages?pageType=news&status=published&limit=10')
              .then((newsRes) => {
                if (newsRes.data.success) {
                  setNewsFeedItems(newsRes.data.pages || []);
                }
              })
              .catch(err => console.error(err));
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching page:', err);
        setError('Page not found or is unpublished.');
      })
      .finally(() => setLoading(false));
  }, [slug, preview]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/pages/${page.id}/comments`, {
        user: commentName.trim() || 'Anonymous',
        text: commentText.trim()
      });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setCommentText('');
        setCommentName('');
      }
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handlePostReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/pages/${page.id}/comments/${commentId}/replies`, {
        user: replyName.trim() || 'Anonymous',
        text: replyText.trim()
      });
      if (res.data.success) {
        setComments(comments.map(c => c.id === commentId ? res.data.data : c));
        setReplyText('');
        setReplyName('');
        setReplyTarget(null);
      }
    } catch (err) {
      alert('Failed to post reply');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading page content...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>404 - Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  const breadcrumbs = [
    ...(page.parent ? [{ label: page.parent.title, path: `/p/${page.parent.slug}` }] : []),
    { label: page.title, path: null }
  ];

  const metaItems = page.publishedAt ? [
    {
      icon: Calendar,
      label: `Published on ${new Date(page.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`,
      iconColor: 'var(--primary)'
    }
  ] : [];

  return (
    <article className="dynamic-page-wrapper animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* ── Dynamic Page Banner ───────────────────────────────────── */}
      <PageBanner
        badge={preview ? 'PREVIEW MODE' : (page.pageType === 'standard' && page.slug === 'about-us' ? 'About JONIKWIRIA' : (page.pageType || 'Portal'))}
        title={page.bannerTitle || page.title}
        subtitle={page.bannerSubtitle || page.metaDescription}
        bgImage={getFullMediaUrl(page.bannerImageUrl)}
        breadcrumbs={breadcrumbs}
        metaItems={metaItems}
        align="left"
      />

      <div className="container" style={{ marginTop: '3rem', maxWidth: '1100px' }}>

      {/* Dynamic Sections Render */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Render standard body text as fallback */}
        {(!page.sections || page.sections.length === 0) && (
          <div className="page-body card" style={{ padding: '2.5rem', fontSize: '1.05rem', lineHeight: 1.8 }}>
            {page.metaDescription && (
              <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                {page.metaDescription}
              </p>
            )}
            {page.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <p>Welcome to <strong>{page.title}</strong>.</p>
            )}
          </div>
        )}

        {/* Dynamic Blocks Loop */}
        {page.sections && page.sections.map((sec, idx) => {
          
          // 0. About Us Intro Block
          if (sec.type === 'about_intro') {
            return <AboutIntroBlock key={sec.id || idx} sec={sec} />;
          }

          // 0b. Core Values Grid Block
          if (sec.type === 'values_grid') {
            return <ValuesGridBlock key={sec.id || idx} sec={sec} />;
          }

          // 1. Rich Text Block
          if (sec.type === 'text') {
            return (
              <div 
                key={sec.id || idx} 
                className="text-section" 
                dangerouslySetInnerHTML={{ __html: sec.content }} 
                style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-main)' }} 
              />
            );
          }

          // 2. Video Player Block
          if (sec.type === 'video') {
            const embedUrl = formatVideoEmbedUrl(sec.videoUrl);
            const isDirectFile = !embedUrl && sec.videoUrl;
            const fullDirectUrl = isDirectFile ? getFullMediaUrl(sec.videoUrl) : sec.videoUrl;

            return (
              <div key={sec.id || idx} className="video-section" style={{ margin: '1rem 0' }}>
                {sec.title && (
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', color: 'var(--text-main)' }}>
                    {sec.title}
                  </h3>
                )}
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', background: '#000' }}>
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={sec.title || 'Video Player'}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : isDirectFile ? (
                    <video
                      src={fullDirectUrl}
                      controls
                      autoPlay={sec.autoPlay}
                      muted={sec.autoPlay}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <p>Video URL not configured</p>
                    </div>
                  )}
                </div>
                {sec.caption && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
                    {sec.caption}
                  </p>
                )}
              </div>
            );
          }

          // 3. Hero Banner Block
          if (sec.type === 'hero') {
            const bgImg = getFullMediaUrl(sec.bgImage);
            return (
              <div 
                key={sec.id || idx} 
                className="hero-section" 
                style={{ 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  position: 'relative', 
                  padding: 'clamp(3rem, 6vw, 5rem) 2rem',
                  background: bgImg ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${bgImg}) center/cover` : 'linear-gradient(135deg, #0052cc 0%, #007bff 100%)',
                  color: '#ffffff',
                  textAlign: sec.align || 'center',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                {sec.badge && (
                  <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                    {sec.badge}
                  </span>
                )}
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '0 0 1rem 0', color: '#ffffff' }}>
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p style={{ fontSize: '1.2rem', maxWidth: '750px', margin: sec.align === 'left' ? '0 0 2rem 0' : '0 auto 2rem auto', opacity: 0.9, lineHeight: 1.6 }}>
                    {sec.subtitle}
                  </p>
                )}
                {sec.btnText && sec.btnUrl && (
                  <Link 
                    to={sec.btnUrl} 
                    className="btn btn-lg" 
                    style={{ background: '#ffffff', color: '#0052cc', fontWeight: 800, padding: '0.85rem 2.25rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>{sec.btnText}</span>
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            );
          }

          // 4. Split Two-Column Block
          if (sec.type === 'split') {
            const mediaRight = sec.layout === 'media-right';
            const mediaImg = getFullMediaUrl(sec.image);

            return (
              <div 
                key={sec.id || idx} 
                className="card" 
                style={{ 
                  padding: 'clamp(2rem, 4vw, 3.5rem)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
                  <div style={{ order: mediaRight ? 1 : 2 }}>
                    {sec.badge && <span className="badge badge-primary" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>{sec.badge}</span>}
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-main)', lineHeight: 1.25 }}>{sec.title}</h3>
                    <div 
                      dangerouslySetInnerHTML={{ __html: sec.content }} 
                      style={{ lineHeight: 1.8, fontSize: '1.025rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }} 
                    />
                    {sec.btnText && sec.btnUrl && (
                      <Link to={sec.btnUrl} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                        <span>{sec.btnText}</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>

                  <div style={{ order: mediaRight ? 2 : 1 }}>
                    {mediaImg ? (
                      <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid var(--border)', position: 'relative' }}>
                        <img 
                          src={mediaImg} 
                          alt={sec.title || 'Section visual'} 
                          style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} 
                        />
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '260px', background: 'var(--bg-app)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Media container
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // 5. Stats Metric Block
          if (sec.type === 'stats') {
            return (
              <div 
                key={sec.id || idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, 
                  gap: '1.5rem',
                  padding: '1rem 0'
                }}
              >
                {(sec.items || []).map((st, sIdx) => (
                  <div 
                    key={sIdx} 
                    className="card hover-scale" 
                    style={{ padding: '2rem 1.5rem', textAlign: 'center', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                  >
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.5rem' }}>
                      {st.number}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {st.label}
                    </div>
                    {st.subtext && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{st.subtext}</div>}
                  </div>
                ))}
              </div>
            );
          }

          // 6. Call To Action (CTA) Banner
          if (sec.type === 'cta') {
            return (
              <div 
                key={sec.id || idx} 
                className="card" 
                style={{ 
                  padding: 'clamp(2rem, 5vw, 3.5rem)', 
                  borderRadius: '18px', 
                  background: sec.gradient || 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  color: '#ffffff',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <h3 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, margin: '0 0 1rem 0', color: '#ffffff' }}>
                  {sec.title}
                </h3>
                {sec.subtitle && (
                  <p style={{ fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 2rem auto', opacity: 0.95, lineHeight: 1.6 }}>
                    {sec.subtitle}
                  </p>
                )}
                {sec.btnText && sec.btnUrl && (
                  <Link 
                    to={sec.btnUrl} 
                    className="btn btn-lg" 
                    style={{ background: '#ffffff', color: '#0056b3', fontWeight: 800, padding: '0.85rem 2.25rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span>{sec.btnText}</span>
                    <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            );
          }

          // 7. Carousel Block
          if (sec.type === 'carousel') {
            return (
              <div key={sec.id || idx} className="carousel-section" style={{ margin: '1rem 0' }}>
                <Carousel carouselId={sec.carouselId} />
              </div>
            );
          }

          // 8. Accordion / FAQ Block
          if (sec.type === 'accordion') {
            return (
              <div key={sec.id || idx} className="accordion-section animate-fade-in">
                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', color: 'var(--text-main)' }}>
                  {sec.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {(sec.items || []).map((item, itemIdx) => (
                    <details key={itemIdx} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {item.header}
                      </summary>
                      <p style={{ marginTop: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: '0.5rem', margin: 0, fontSize: '1rem' }}>
                        {item.content}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            );
          }

          // 9. Card Grid Block
          if (sec.type === 'cards') {
            return (
              <div key={sec.id || idx} className="cards-section">
                {sec.title && (
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', color: 'var(--text-main)' }}>
                    {sec.title}
                  </h3>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: '1.75rem' }}>
                  {(sec.items || []).map((card, cardIdx) => {
                    const cardImg = getFullMediaUrl(card.image);
                    return (
                      <div 
                        key={cardIdx} 
                        className="card flex flex-col hover-scale" 
                        style={{ 
                          padding: '0', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border)', 
                          borderRadius: '16px', 
                          transition: 'var(--transition)',
                          background: 'var(--bg-surface)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                      >
                        {cardImg && (
                          <div style={{ height: '200px', width: '100%', overflow: 'hidden', background: '#0b132b', position: 'relative' }}>
                            <img 
                              src={cardImg} 
                              alt={card.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                            />
                            {card.badge && (
                              <span style={{ 
                                position: 'absolute', 
                                top: 12, 
                                left: 12, 
                                padding: '3px 10px', 
                                borderRadius: '9999px', 
                                fontSize: '0.72rem', 
                                fontWeight: 800, 
                                background: 'rgba(0,123,255,0.92)', 
                                color: '#ffffff', 
                                backdropFilter: 'blur(8px)',
                                letterSpacing: '0.04em'
                              }}>
                                {card.badge}
                              </span>
                            )}
                          </div>
                        )}
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                          <div>
                            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{card.title}</h4>
                              {card.badge && <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 800 }}>{card.badge}</span>}
                            </div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{card.text}</p>
                          </div>
                          {card.link && (
                            <Link to={card.link} className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', marginTop: '1.25rem' }}>
                              <span>Learn More</span>
                              <ArrowRight size={16} />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // 10. List Block
          if (sec.type === 'list') {
            return (
              <div key={sec.id || idx} className="list-section">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', color: 'var(--text-main)' }}>
                  {sec.title}
                </h3>
                {sec.listType === 'ordered' ? (
                  <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-main)' }}>
                    {(sec.items || []).map((li, lIdx) => <li key={lIdx} style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{li}</li>)}
                  </ol>
                ) : (
                  <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', listStyleType: 'disc', color: 'var(--text-main)' }}>
                    {(sec.items || []).map((li, lIdx) => <li key={lIdx} style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{li}</li>)}
                  </ul>
                )}
              </div>
            );
          }

          // 11. News Feed Block
          if (sec.type === 'news_feed') {
            const feedLimit = sec.limit || 3;
            const displayNews = newsFeedItems.slice(0, feedLimit);
            return (
              <div key={sec.id || idx} className="news-feed-section">
                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', color: 'var(--text-main)' }}>
                  {sec.title}
                </h3>
                {displayNews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No news posts published yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                    {displayNews.map((post) => (
                      <Link 
                        key={post.id} 
                        to={`/p/${post.slug}`} 
                        className="card flex flex-col hover-scale" 
                        style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none' }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>News Feed Post</span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--text-main)' }}>{post.title}</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                          {post.metaDescription || 'Click to read full news coverage...'}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}

      </div>

      {/* Dynamic Comment / Reply Section */}
      {page.chatSettings?.enabled && (
        <section style={{ marginTop: '5rem', borderTop: '2px solid var(--border)', paddingTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <MessageSquare size={20} color="var(--primary)" />
            <span>Discussion & Comments ({comments.length})</span>
          </h3>

          {/* Comment Thread List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                No comments posted yet. Be the first to start the discussion!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{comment.user}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <p style={{ color: 'var(--text-main)', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>{comment.text}</p>

                  {page.chatSettings?.allowReplies && (
                    <button 
                      onClick={() => setReplyTarget(replyTarget === comment.id ? null : comment.id)} 
                      className="btn btn-secondary btn-xs"
                      style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <CornerDownRight size={12} />
                      <span>Reply</span>
                    </button>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginTop: '1rem', borderLeft: '2px solid var(--border)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{reply.user}</strong>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(reply.createdAt).toLocaleString()}</span>
                          </div>
                          <p style={{ color: 'var(--text-main)', margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }}>{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {replyTarget === comment.id && (
                    <div className="animate-fade-in" style={{ marginTop: '1rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 800 }}>Reply to {comment.user}</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Your name"
                          style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Write reply text..."
                          style={{ fontSize: '0.8rem', padding: '0.3rem' }}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setReplyTarget(null)} className="btn btn-secondary btn-xs">Cancel</button>
                        <button type="button" onClick={() => handlePostReply(comment.id)} className="btn btn-primary btn-xs">Reply</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* New Comment Submission Box */}
          <form onSubmit={handlePostComment} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Add a Comment</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Anonymous"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                />
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Comment Description</label>
                <textarea
                  required
                  className="form-textarea"
                  rows={2}
                  placeholder="Share your thoughts about this page..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={14} />
                <span>Submit Comment</span>
              </button>
            </div>
          </form>
        </section>
      )}
      </div>
    </article>
  );
};

export default DynamicPage;
