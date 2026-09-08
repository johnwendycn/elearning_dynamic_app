import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Newspaper, Calendar, User, Share2, ThumbsUp, MessageCircle,
  CornerDownRight, ChevronDown, ChevronUp, Send, X, Tag, Clock, ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { getFullMediaUrl } from '../utils/mediaUrl';
import PageBanner from '../components/common/PageBanner';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmtDate = (str, opts) => {
  try { return new Date(str).toLocaleDateString('en-GB', opts || { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return ''; }
};
const timeAgo = (str) => {
  const diff = Math.floor((Date.now() - new Date(str)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(str, { day: '2-digit', month: 'short', year: 'numeric' });
};
const getInitial = (name) => (name || 'A')[0].toUpperCase();
const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#3b82f6'];
const avatarColor = (name) => AVATAR_COLORS[(name || 'A').charCodeAt(0) % AVATAR_COLORS.length];

/* ─── CommentForm ──────────────────────────────────────────────────────────── */
const CommentForm = ({ newsId, parentId = null, replyTo = null, onSubmitted, onCancel }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const textRef = useRef(null);

  useEffect(() => { if (textRef.current) textRef.current.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return setError('Please write something first.');
    setSubmitting(true); setError('');
    try {
      const res = await api.post(`/news-comments/news/${newsId}/comments`, {
        authorName: name.trim() || 'Anonymous',
        authorEmail: email.trim() || null,
        content: content.trim(),
        parentId: parentId || null
      });
      if (res.data.success) {
        setContent(''); setName(''); setEmail('');
        onSubmitted(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post. Try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-app)', borderRadius: 12, padding: '1rem',
        border: '1px solid var(--border)', marginTop: '0.75rem'
      }}>
      {replyTo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.6rem', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
          <CornerDownRight size={14} /> Replying to <strong>{replyTo}</strong>
          {onCancel && <button type="button" onClick={onCancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>}
        </div>
      )}
      {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text" placeholder="Your name (optional)" value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
        <input
          type="email" placeholder="Email (optional, not shown)" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ padding: '0.55rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }} />
      </div>
      <textarea
        ref={textRef}
        placeholder={replyTo ? `Write a reply...` : 'Join the conversation — share your thoughts...'}
        value={content} onChange={e => setContent(e.target.value)} rows={3}
        style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: '0.6rem' }} />
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" onClick={onCancel}
            style={{ padding: '0.45rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting}
          style={{ padding: '0.45rem 1.1rem', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, opacity: submitting ? 0.7 : 1 }}>
          <Send size={14} /> {submitting ? 'Posting...' : (replyTo ? 'Post Reply' : 'Post Comment')}
        </button>
      </div>
    </form>
  );
};

/* ─── SingleComment ────────────────────────────────────────────────────────── */
const SingleComment = ({ comment, newsId, depth = 0, onReplyPosted, onLike }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 1);
  const [localLikes, setLocalLikes] = useState(comment.likes || 0);
  const [liked, setLiked] = useState(false);
  const replies = comment.replies || [];
  const isDeep = depth >= 2;

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await api.post(`/news-comments/comments/${comment.id}/like`);
      if (res.data.success) { setLocalLikes(res.data.data.likes); setLiked(true); }
    } catch { setLocalLikes(l => l + 1); setLiked(true); }
  };

  const handleReplyPosted = (newReply) => {
    setShowReplyForm(false);
    setShowReplies(true);
    onReplyPosted(comment.id, newReply);
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginLeft: depth > 0 ? (isDeep ? 0 : 24) : 0 }}>
      {/* Avatar */}
      <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: '50%', background: avatarColor(comment.authorName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
        {getInitial(comment.authorName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Bubble */}
        <div style={{ background: 'var(--bg-app)', borderRadius: '0 14px 14px 14px', padding: '0.7rem 1rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>{comment.authorName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-main)', wordBreak: 'break-word' }}>{comment.content}</p>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', paddingLeft: '0.25rem' }}>
          <button onClick={handleLike}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: liked ? 'default' : 'pointer', color: liked ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, padding: 0 }}>
            <ThumbsUp size={13} fill={liked ? 'currentColor' : 'none'} />
            {localLikes > 0 && <span>{localLikes}</span>}
            <span>Like</span>
          </button>
          {!isDeep && (
            <button onClick={() => setShowReplyForm(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: showReplyForm ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, padding: 0 }}>
              <CornerDownRight size={13} /> Reply
            </button>
          )}
          {replies.length > 0 && (
            <button onClick={() => setShowReplies(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}>
              {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showReplies ? 'Hide' : `${replies.length}`} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
        {/* Reply Form */}
        {showReplyForm && (
          <CommentForm newsId={newsId} parentId={comment.id} replyTo={comment.authorName}
            onSubmitted={handleReplyPosted} onCancel={() => setShowReplyForm(false)} />
        )}
        {/* Nested Replies */}
        {showReplies && replies.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' }}>
            {replies.map(reply => (
              <SingleComment key={reply.id} comment={reply} newsId={newsId} depth={depth + 1}
                onReplyPosted={onReplyPosted} onLike={onLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── CommentsSection ──────────────────────────────────────────────────────── */
const CommentsSection = ({ newsId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/news-comments/news/${newsId}/comments`)
      .then(res => { if (res.data.success) setComments(res.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [newsId]);

  const handleNewComment = (newComment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const handleReplyPosted = (parentId, newReply) => {
    setComments(prev => prev.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), newReply] };
      }
      // Also check one level deeper
      if (c.replies && c.replies.some(r => r.id === parentId)) {
        return {
          ...c, replies: c.replies.map(r =>
            r.id === parentId ? { ...r, replies: [...(r.replies || []), newReply] } : r
          )
        };
      }
      return c;
    }));
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0) + (c.replies?.reduce((a, r) => a + (r.replies?.length || 0), 0) || 0), 0);

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={18} color="#fff" />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Discussion
          {totalCount > 0 && <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 8 }}>({totalCount} {totalCount === 1 ? 'comment' : 'comments'})</span>}
        </h3>
      </div>

      {/* New comment form */}
      <div style={{ marginBottom: '2rem' }}>
        <CommentForm newsId={newsId} onSubmitted={handleNewComment} />
      </div>

      {/* Comment list */}
      {loading ? (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', borderRadius: 12, background: 'var(--bg-app)', border: '1px solid var(--border)' }}>
          <MessageCircle size={36} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: 10 }} />
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {comments.map(comment => (
            <SingleComment key={comment.id} comment={comment} newsId={newsId}
              depth={0} onReplyPosted={handleReplyPosted} onLike={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────────────────────────── */
const NewsDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true); setError(''); setArticle(null);
    api.get(`/news/slug/${slug}`)
      .then(res => { if (res.data.success && res.data.data) setArticle(res.data.data); })
      .catch(() => {
        api.get(`/news/public/${slug}`)
          .then(res => { if (res.data.success && res.data.data) setArticle(res.data.data); })
          .catch(() => setError('Article not found.'));
      })
      .finally(() => setLoading(false));

    api.get('/news/published?limit=5')
      .then(res => { if (res.data.success) setRecentNews(res.data.news || []); })
      .catch(() => {});
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '8rem 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading article…</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <Newspaper size={56} style={{ color: 'var(--text-muted)', opacity: 0.35, marginBottom: 20 }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Article Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || "The article you're looking for doesn't exist."}</p>
        <Link to="/news" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to All News
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'News & Media', path: '/news' },
    ...(article.category ? [{ label: article.category, path: '/news' }] : []),
    { label: article.title, path: null }
  ];
  const metaItems = [
    { icon: Calendar, label: fmtDate(article.publishedAt || article.createdAt, { day: '2-digit', month: 'long', year: 'numeric' }), iconColor: 'var(--primary)' },
    ...(article.author ? [{ icon: User, label: article.author, iconColor: '#a78bfa' }] : [])
  ];

  return (
    <div className="news-detail-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Banner */}
      <PageBanner badge={article.category || 'Press & Media'} badgeIcon={Newspaper}
        title={article.title} breadcrumbs={breadcrumbs} metaItems={metaItems} align="left" />

      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div className="article-detail-layout">

          {/* ── Main Article Body ───────────────────────────────────── */}
          <div style={{ minWidth: 0 }}>
            <article className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              {/* Hero Image */}
              {article.imageUrl && (
                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: '2rem', maxHeight: 440, background: '#0f172a', position: 'relative' }}>
                  <img src={getFullMediaUrl(article.imageUrl)} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                </div>
              )}

              {/* Excerpt / Pull Quote */}
              {article.excerpt && (
                <p style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.15rem)', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.7, marginBottom: '2rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1.25rem', fontStyle: 'italic', wordBreak: 'break-word' }}>
                  {article.excerpt}
                </p>
              )}

              {/* Body */}
              <div style={{ fontSize: 'clamp(0.95rem, 2vw, 1.025rem)', lineHeight: 1.9, color: 'var(--text-main)', whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {article.content}
              </div>

              {/* Footer: Tags + Share */}
              <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(Array.isArray(article.tags) ? article.tags : []).map((tag, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 6, background: 'var(--bg-app)', color: 'var(--text-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Tag size={11} /> {tag}
                    </span>
                  ))}
                </div>
                <button onClick={handleShare} className="btn btn-sm btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 130, justifyContent: 'center', position: 'relative' }}>
                  <Share2 size={14} />
                  <span>{copied ? '✓ Link Copied!' : 'Share Article'}</span>
                </button>
              </div>
            </article>

            {/* ── Comments Section ──────────────────────────────────── */}
            <div className="card" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-surface)', marginTop: '1.5rem' }}>
              <CommentsSection newsId={article.id} />
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside style={{ minWidth: 0, width: '100%' }}>
            {/* Article Meta */}
            <div className="card" style={{ padding: 'clamp(1.2rem, 3vw, 1.75rem)', borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-surface)', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>Article Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.87rem' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Calendar size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Published</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{fmtDate(article.publishedAt || article.createdAt)}</div>
                  </div>
                </div>
                {article.author && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <User size={14} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Author</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{article.author}</div>
                    </div>
                  </div>
                )}
                {article.category && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Tag size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Category</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{article.category}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Stories */}
            <div className="card" style={{ padding: 'clamp(1.2rem, 3vw, 1.75rem)', borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)' }}>Recent Stories</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {recentNews.filter(n => n.id !== article.id).slice(0, 5).map(r => (
                  <div key={r.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', minWidth: 0 }}>
                    <div style={{ width: 60, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#0f172a' }}>
                      <img src={getFullMediaUrl(r.imageUrl) || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&auto=format&fit=crop&q=60'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        <Link to={`/news/${r.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }} className="line-clamp-2">{r.title}</Link>
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {fmtDate(r.publishedAt || r.createdAt, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/news" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <ArrowLeft size={14} /> All News Articles
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
