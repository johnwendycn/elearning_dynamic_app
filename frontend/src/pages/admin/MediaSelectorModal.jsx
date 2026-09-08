import React, { useState, useEffect, useRef } from 'react';
import { File, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const MediaSelectorModal = ({ isOpen, onClose, onSelect, title = "Select Media Asset" }) => {
  const [mediaList, setMediaList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
  const fileInputRef = useRef(null);

  const fetchMedia = () => {
    setLoading(true);
    api.get(`/media?page=${page}&limit=9&search=${encodeURIComponent(search)}`)
      .then((res) => {
        if (res.data.success) {
          setMediaList(res.data.media || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, page, search]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', 'general');

    setUploading(true);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success && res.data.data) {
        onSelect(res.data.data);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const backendHost = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : 'http://localhost:5000';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100050, padding: '1rem' }}>
      <div className="card w-full animate-fade-in" style={{ maxWidth: '680px', padding: '1.75rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-surface)' }}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{title}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Choose an existing asset or upload a new one directly</span>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>Close</button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`btn btn-sm ${activeTab === 'library' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 700 }}
          >
            Media Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`btn btn-sm ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <UploadCloud size={15} />
            <span>Upload New File</span>
          </button>
        </div>

        {/* TAB 1: LIBRARY */}
        {activeTab === 'library' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search images and media assets..."
                className="form-input"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: 'var(--primary)' }} />
                  <p>Loading media assets...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '12px' }}>
                  <ImageIcon size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>No matching media assets found.</p>
                  <button type="button" onClick={() => setActiveTab('upload')} className="btn btn-primary btn-sm">
                    Upload An Image
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1rem' }}>
                  {mediaList.map((m) => {
                    const isImg = m.mimeType?.startsWith('image/') || m.url?.match(/\.(jpeg|jpg|gif|png|webp|svg)/i);
                    const fullUrl = m.url.startsWith('http') ? m.url : `${backendHost}${m.url}`;
                    return (
                      <div
                        key={m.id}
                        onClick={() => { onSelect(m); onClose(); }}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'var(--bg-app)',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        className="media-select-card hover-scale"
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <div style={{ width: '100%', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0b132b', borderRadius: '6px' }}>
                          {isImg ? (
                            <img src={fullUrl} alt={m.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <File size={32} color="var(--text-muted)" />
                          )}
                        </div>
                        <span style={{ fontSize: '0.725rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', color: 'var(--text-main)', display: 'block' }}>
                          {m.filename}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                <button type="button" disabled={page === 1} className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(p - 1, 1))}>Prev</button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <button type="button" disabled={page === totalPages} className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD NEW FILE */}
        {activeTab === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', border: '2px dashed var(--border)', borderRadius: '16px', background: 'var(--bg-app)', textAlign: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,123,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <UploadCloud size={32} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
              Upload Image from Your Device
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 0 1.5rem 0' }}>
              Select any PNG, JPG, JPEG, WEBP or SVG file. It will be uploaded and immediately selected for this section.
            </p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Select Image File</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MediaSelectorModal;
