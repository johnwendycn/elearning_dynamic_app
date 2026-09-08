import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, User, ArrowRight, Search, Tag, Clock } from 'lucide-react';
import api from '../services/api';
import PageBanner from '../components/common/PageBanner';
import { getFullMediaUrl } from '../utils/mediaUrl';

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchNews = () => {
    setLoading(true);
    let url = `/news/published?page=${page}&limit=6&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    api.get(url)
      .then(res => {
        if (res.data.success) {
          setNewsList(res.data.news || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, [page, search, category]);

  const categories = ['Press Release', 'Industry Insights', 'Scholarships', 'Announcements', 'Tech Trends'];

  return (
    <div className="news-page animate-fade-in" style={{ paddingBottom: '6rem' }}>
      {/* Hero Header */}
      <PageBanner
        badge="Press & Publications"
        badgeIcon={Newspaper}
        title="News, Insights & Announcements"
        subtitle="Stay updated with the latest technological developments, academy breakthroughs, scholarship opportunities, and industry perspectives."
        breadcrumbs={[{ label: 'News & Media', path: '/news' }]}
      >
        <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search news, articles, tags..."
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

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        {/* Category Filter Pills */}
        <div className="filter-pills-bar">
          <button
            onClick={() => { setCategory(''); setPage(1); }}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: '9999px',
              background: category === '' ? 'var(--primary)' : 'var(--bg-surface)',
              color: category === '' ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            All Articles
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: '9999px',
                background: category === c ? 'var(--primary)' : 'var(--bg-surface)',
                color: category === c ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Loading news articles...</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '18px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <Newspaper size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>No News Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try resetting the search filters.</p>
          </div>
        ) : (
          <div className="news-cards-grid">
            {newsList.map(item => (
              <article
                key={item.id}
                className="card hover-scale"
                style={{
                  padding: 0, overflow: 'hidden', borderRadius: '18px',
                  border: '1px solid var(--border)', background: 'var(--bg-surface)',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  minWidth: 0, width: '100%'
                }}
              >
                <div style={{ height: 200, overflow: 'hidden', position: 'relative', background: '#0f172a' }}>
                  <img
                    src={getFullMediaUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  {item.category && (
                    <span style={{ position: 'absolute', top: 12, left: 12, padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(0,123,255,0.9)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                      {item.category}
                    </span>
                  )}
                </div>

                <div style={{ padding: 'clamp(1.2rem, 3vw, 1.75rem)', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <Calendar size={13} color="var(--primary)" />
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {item.author && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <User size={13} /> {item.author}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.2rem)', fontWeight: 800, margin: '0 0 0.75rem 0', lineHeight: 1.35 }}>
                    <Link to={`/news/${item.slug}`} className="line-clamp-2" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                      {item.title}
                    </Link>
                  </h3>

                  <p className="line-clamp-3" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.25rem 0', flex: 1 }}>
                    {item.excerpt || (item.content ? item.content.substring(0, 140) + '...' : '')}
                  </p>

                  {/* Tags */}
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      {item.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4, background: 'var(--bg-app)', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/news/${item.slug}`}
                    style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto' }}
                  >
                    <span>Read Full Story</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
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

export default NewsPage;
