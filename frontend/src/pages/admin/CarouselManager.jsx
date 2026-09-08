import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { 
  Plus, Edit2, Trash2, Sliders, Image, Layers, Search, 
  ChevronLeft, ChevronRight, Eye, Save, Film, Play, Pause, RefreshCw 
} from 'lucide-react';
import api from '../../services/api';
import MediaSelectorModal from './MediaSelectorModal';

const CarouselManager = () => {
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useAlert();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('playlists'); // 'playlists' or 'slides'
  
  // Carousel Playlists States
  const [carousels, setCarousels] = useState([]);
  const [carouselTotal, setCarouselTotal] = useState(0);
  const [carouselPages, setCarouselPages] = useState(1);
  const [carouselPage, setCarouselPage] = useState(1);
  const [carouselSearch, setCarouselSearch] = useState('');
  
  // Slides States
  const [slides, setSlides] = useState([]);
  const [slideTotal, setSlideTotal] = useState(0);
  const [slidePages, setSlidePages] = useState(1);
  const [slidePage, setSlidePage] = useState(1);
  const [slideSearch, setSlideSearch] = useState('');
  const [slideCarouselFilter, setSlideCarouselFilter] = useState('');

  // Common Loading
  const [loading, setLoading] = useState(false);

  // Modals & Editing
  const [carouselModalOpen, setCarouselModalOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [carouselFormData, setCarouselFormData] = useState({
    name: '',
    autoplay: true,
    autoplaySpeed: 5000,
    showArrows: true,
    showIndicators: true,
    status: 'active'
  });

  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideFormData, setSlideFormData] = useState({
    carouselId: '',
    mediaId: null,
    title: '',
    subtitle: '',
    description: '',
    buttonText: 'Explore More',
    buttonUrl: '/',
    displayOrder: 1,
    status: 'active'
  });

  // Media Selector States
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Simulator Preview States
  const [previewCarouselId, setPreviewCarouselId] = useState(null);
  const [previewSlides, setPreviewSlides] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayTimer = useRef(null);

  const canCreate = hasPermission('carousels', 'create');
  const canUpdate = hasPermission('carousels', 'update');
  const canDelete = hasPermission('carousels', 'delete');

  // Load Carousels
  const fetchCarousels = () => {
    setLoading(true);
    api.get(`/carousels?page=${carouselPage}&limit=6&search=${carouselSearch}`)
      .then((res) => {
        if (res.data.success) {
          setCarousels(res.data.carousels || []);
          setCarouselTotal(res.data.totalItems || 0);
          setCarouselPages(res.data.totalPages || 1);
          
          // Set initial simulator preview if not selected
          if (res.data.carousels?.length > 0 && !previewCarouselId) {
            setPreviewCarouselId(res.data.carousels[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Load Slides
  const fetchSlides = () => {
    setLoading(true);
    let url = `/carousel-slides?page=${slidePage}&limit=6&search=${slideSearch}`;
    if (slideCarouselFilter) {
      url += `&carouselId=${slideCarouselFilter}`;
    }
    api.get(url)
      .then((res) => {
        if (res.data.success) {
          setSlides(res.data.slides || []);
          setSlideTotal(res.data.totalItems || 0);
          setSlidePages(res.data.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Load Simulator Slides when active preview carousel changes
  const fetchPreviewSlides = () => {
    if (!previewCarouselId) {
      setPreviewSlides([]);
      return;
    }
    api.get(`/carousel-slides/carousel/${previewCarouselId}`)
      .then((res) => {
        if (res.data.success) {
          setPreviewSlides(res.data.data || []);
          setPreviewIndex(0);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCarousels();
  }, [carouselPage, carouselSearch]);

  useEffect(() => {
    fetchSlides();
  }, [slidePage, slideSearch, slideCarouselFilter]);

  useEffect(() => {
    fetchPreviewSlides();
  }, [previewCarouselId]);

  // Simulator Autoplay
  useEffect(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    
    if (!isPlaying || previewSlides.length <= 1) return;
    
    const activeCarousel = carousels.find(c => c.id === previewCarouselId);
    const speed = activeCarousel?.autoplaySpeed || 5000;

    autoplayTimer.current = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % previewSlides.length);
    }, speed);

    return () => clearInterval(autoplayTimer.current);
  }, [isPlaying, previewSlides, previewCarouselId, carousels]);

  // Handle Carousel Playlist Form Open
  const handleOpenCarouselModal = (item = null) => {
    if (item) {
      setEditingCarousel(item);
      setCarouselFormData({
        name: item.name || '',
        autoplay: item.autoplay !== undefined ? item.autoplay : true,
        autoplaySpeed: item.autoplaySpeed || 5000,
        showArrows: item.showArrows !== undefined ? item.showArrows : true,
        showIndicators: item.showIndicators !== undefined ? item.showIndicators : true,
        status: item.status || 'active'
      });
    } else {
      setEditingCarousel(null);
      setCarouselFormData({
        name: '',
        autoplay: true,
        autoplaySpeed: 5000,
        showArrows: true,
        showIndicators: true,
        status: 'active'
      });
    }
    setCarouselModalOpen(true);
  };

  const handleCarouselSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCarousel) {
        await api.put(`/carousels/${editingCarousel.id}`, carouselFormData);
        showSuccess('Playlist updated successfully!');
      } else {
        await api.post('/carousels', carouselFormData);
        showSuccess('Playlist created successfully!');
      }
      setCarouselModalOpen(false);
      fetchCarousels();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save carousel');
    }
  };

  const handleCarouselDelete = async (id) => {
    if (window.confirm('Delete this carousel and all its slide images?')) {
      try {
        await api.delete(`/carousels/${id}`);
        showSuccess('Playlist deleted successfully.');
        if (previewCarouselId === id) setPreviewCarouselId(null);
        fetchCarousels();
        fetchSlides();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete carousel');
      }
    }
  };

  // Handle Slide Form Open
  const handleOpenSlideModal = (slide = null, defaultCarouselId = null) => {
    if (slide) {
      setEditingSlide(slide);
      setSelectedMedia(slide.media);
      setSlideFormData({
        carouselId: slide.carouselId || '',
        mediaId: slide.mediaId || null,
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        description: slide.description || '',
        buttonText: slide.buttonText || 'Explore More',
        buttonUrl: slide.buttonUrl || '/',
        displayOrder: slide.displayOrder || 1,
        status: slide.status || 'active'
      });
    } else {
      setEditingSlide(null);
      setSelectedMedia(null);
      setSlideFormData({
        carouselId: defaultCarouselId || (carousels[0]?.id || ''),
        mediaId: null,
        title: '',
        subtitle: '',
        description: '',
        buttonText: 'Explore More',
        buttonUrl: '/',
        displayOrder: slides.length + 1,
        status: 'active'
      });
    }
    setSlideModalOpen(true);
  };

  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    if (!slideFormData.carouselId) {
      showError('Please choose a target carousel playlist first');
      return;
    }
    try {
      const payload = {
        ...slideFormData,
        mediaId: selectedMedia?.id || null
      };

      if (editingSlide) {
        await api.put(`/carousel-slides/${editingSlide.id}`, payload);
        showSuccess('Slide updated successfully!');
      } else {
        await api.post('/carousel-slides', payload);
        showSuccess('Slide created successfully!');
      }
      setSlideModalOpen(false);
      fetchSlides();
      fetchCarousels();
      fetchPreviewSlides();
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to save slide');
    }
  };

  const handleSlideDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this slide?')) {
      try {
        await api.delete(`/carousel-slides/${id}`);
        showSuccess('Slide deleted successfully.');
        fetchSlides();
        fetchCarousels();
        fetchPreviewSlides();
      } catch (err) {
        showError(err.response?.data?.error || 'Failed to delete slide');
      }
    }
  };

  const handleMediaSelect = (media) => {
    setSelectedMedia(media);
    setMediaModalOpen(false);
  };

  const activeCarousel = carousels.find(c => c.id === previewCarouselId);

  return (
    <div className="admin-page-container">
      
      {/* Title Header */}
      <div className="content-header" style={{ padding: 0, marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Film size={26} color="var(--primary)" />
            <span>Interactive Media Carousels & Hero Sliders</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Design high-fidelity homepage sliders with custom titles, description, action buttons, and backdrops.
          </p>
        </div>
      </div>

      {/* Tabs selectors */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: '0.5rem', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'playlists' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'playlists' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          Carousel Playlists
        </button>
        <button
          onClick={() => setActiveTab('slides')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderBottom: activeTab === 'slides' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'slides' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          Slide Library
        </button>
      </div>

      {/* Two-Column split manager */}
      <div className="admin-split-grid">
        
        {/* Left Side: Playlists or Slide List CRUD panel */}
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          
          {activeTab === 'playlists' ? (
            /* Playlist tab content */
            <div className="card card-outline card-primary">
              <div className="card-header admin-card-header-responsive">
                <h3 className="card-title flex items-center gap-2">
                  <Sliders size={18} color="var(--primary)" />
                  <span>Configured Playlists</span>
                </h3>
                <div className="admin-card-header-tools">
                  <input
                    type="text"
                    placeholder="Search playlists..."
                    className="form-input"
                    value={carouselSearch}
                    onChange={(e) => { setCarouselSearch(e.target.value); setCarouselPage(1); }}
                    style={{ flex: '1 1 120px', minWidth: '100px', maxWidth: '200px', height: '32px', fontSize: '0.8rem' }}
                  />
                  {canCreate && (
                    <button onClick={() => handleOpenCarouselModal()} className="btn btn-primary btn-sm">
                      <Plus size={14} />
                      <span>Create Playlist</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Playlist Name</th>
                        <th>Parameters</th>
                        <th>Slides count</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && carousels.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading playlists...</td></tr>
                      ) : carousels.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No playlists configured.</td></tr>
                      ) : (
                        carousels.map((c) => (
                          <tr 
                            key={c.id} 
                            style={{ 
                              cursor: 'pointer',
                              background: previewCarouselId === c.id ? 'var(--bg-app)' : 'transparent',
                              borderLeft: previewCarouselId === c.id ? '4px solid var(--primary)' : '4px solid transparent'
                            }}
                            onClick={() => setPreviewCarouselId(c.id)}
                          >
                            <td>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {c.autoplaySpeed}ms {c.autoplay ? '(Auto)' : '(Manual)'}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-info">{c.slides?.length || 0} slides</span>
                            </td>
                            <td>
                              <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => handleOpenSlideModal(null, c.id)} 
                                  className="btn btn-secondary btn-sm" 
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                                  title="Add slide to playlist"
                                >
                                  <Plus size={12} />
                                </button>
                                <button 
                                  onClick={() => handleOpenCarouselModal(c)} 
                                  className="btn btn-secondary btn-sm" 
                                  style={{ padding: '0.2rem 0.45rem' }}
                                >
                                  <Edit2 size={13} />
                                </button>
                                {canDelete && (
                                  <button 
                                    onClick={() => handleCarouselDelete(c.id)} 
                                    className="btn btn-danger btn-sm" 
                                    style={{ padding: '0.2rem 0.45rem' }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {carouselPages > 1 && (
                <div className="card-footer flex justify-between items-center">
                  <button disabled={carouselPage === 1} onClick={() => setCarouselPage(p => p - 1)} className="btn btn-secondary btn-sm">Prev</button>
                  <span style={{ fontSize: '0.8rem' }}>Page {carouselPage} of {carouselPages}</span>
                  <button disabled={carouselPage === carouselPages} onClick={() => setCarouselPage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
                </div>
              )}
            </div>
          ) : (
            /* Slide manager tab content */
            <div className="card card-outline card-primary">
              <div className="card-header admin-card-header-responsive">
                <h3 className="card-title flex items-center gap-2">
                  <Image size={18} color="var(--primary)" />
                  <span>Slides Library</span>
                </h3>
                <div className="admin-card-header-tools">
                  <select
                    className="form-select"
                    value={slideCarouselFilter}
                    onChange={(e) => { setSlideCarouselFilter(e.target.value); setSlidePage(1); }}
                    style={{ height: '32px', padding: '0 0.5rem', fontSize: '0.8rem', flex: '1 1 120px', minWidth: '110px', maxWidth: '160px' }}
                  >
                    <option value="">All Playlists</option>
                    {carousels.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Search slides..."
                    className="form-input"
                    value={slideSearch}
                    onChange={(e) => { setSlideSearch(e.target.value); setSlidePage(1); }}
                    style={{ flex: '1 1 120px', minWidth: '100px', maxWidth: '160px', height: '32px', fontSize: '0.8rem' }}
                  />
                  {canCreate && (
                    <button onClick={() => handleOpenSlideModal()} className="btn btn-primary btn-sm">
                      <Plus size={14} />
                      <span>Add Slide</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Backdrop</th>
                        <th>Slide Info</th>
                        <th>Playlist</th>
                        <th>Order</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && slides.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading slides...</td></tr>
                      ) : slides.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No slides found.</td></tr>
                      ) : (
                        slides.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <div style={{ width: '60px', height: '40px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                {s.media?.url ? (
                                  <img src={`http://localhost:5000${s.media.url}`} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <Image size={16} color="var(--text-muted)" />
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="flex flex-col">
                                <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{s.title || 'Untitled Slide'}</span>
                                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{s.subtitle}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.carousel?.name}</span>
                            </td>
                            <td>
                              <span className="badge badge-secondary">Order {s.displayOrder}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleOpenSlideModal(s)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                                  <Edit2 size={13} />
                                </button>
                                {canDelete && (
                                  <button onClick={() => handleSlideDelete(s.id)} className="btn btn-danger btn-sm" style={{ padding: '0.2rem 0.45rem' }}>
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {slidePages > 1 && (
                <div className="card-footer flex justify-between items-center">
                  <button disabled={slidePage === 1} onClick={() => setSlidePage(p => p - 1)} className="btn btn-secondary btn-sm">Prev</button>
                  <span style={{ fontSize: '0.8rem' }}>Page {slidePage} of {slidePages}</span>
                  <button disabled={slidePage === slidePages} onClick={() => setSlidePage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: High Fidelity Carousel Live Preview Simulator */}
        <div style={{ minWidth: 0, maxWidth: '100%' }}>
          <div className="card card-outline card-info" style={{ borderTopWidth: '3px' }}>
            <div className="card-header admin-card-header-responsive" style={{ padding: '0.75rem 1.25rem' }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 700, color: 'var(--info)' }}>
                <Eye size={18} />
                <span>Live Carousel Website Preview</span>
              </div>
              {activeCarousel && (
                <div className="admin-card-header-tools">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn btn-secondary btn-sm"
                    style={{ minHeight: 'auto', padding: '0.2rem 0.5rem', background: '#f1f5f9', border: 'none' }}
                  >
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>{isPlaying ? 'Pause' : 'Autoplay'}</span>
                  </button>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Playlist: {activeCarousel.name}</span>
                </div>
              )}
            </div>

            <div className="card-body" style={{ background: '#f1f5f9', border: '1px dashed var(--border)', borderRadius: '4px', padding: '1rem' }}>
              
              {/* Slider Rendering Box */}
              {previewSlides.length > 0 ? (
                <div 
                  className="hero-carousel" 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '240px', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    background: '#0f172a'
                  }}
                >
                  
                  {/* Backdrop Slide Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: previewSlides[previewIndex]?.media?.url 
                        ? `url(http://localhost:5000${previewSlides[previewIndex].media.url})` 
                        : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'background-image 0.5s ease-in-out'
                    }}
                  >
                    {/* Shadow overlay layer */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 100%)',
                      zIndex: 1
                    }} />

                    {/* Text Slide content */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '1.25rem',
                      color: '#ffffff',
                      maxWidth: '100%'
                    }} className="animate-fade-in">
                      {previewSlides[previewIndex]?.subtitle && (
                        <span 
                          className="badge badge-primary" 
                          style={{ 
                            alignSelf: 'flex-start', 
                            fontSize: '0.65rem', 
                            fontWeight: 800, 
                            marginBottom: '0.4rem',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {previewSlides[previewIndex].subtitle}
                        </span>
                      )}
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
                        {previewSlides[previewIndex]?.title || 'Untitled Slide'}
                      </h2>
                      <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                        {previewSlides[previewIndex]?.description}
                      </p>
                      {previewSlides[previewIndex]?.buttonText && (
                        <a 
                          href={previewSlides[previewIndex].buttonUrl} 
                          onClick={(e) => e.preventDefault()}
                          className="btn btn-primary btn-sm" 
                          style={{ alignSelf: 'flex-start', minHeight: '30px', fontSize: '0.725rem', padding: '0 1rem' }}
                        >
                          {previewSlides[previewIndex].buttonText}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Left / Right Arrow Indicators */}
                  {(activeCarousel?.showArrows ?? true) && (
                    <>
                      <button
                        onClick={() => setPreviewIndex(prev => (prev === 0 ? previewSlides.length - 1 : prev - 1))}
                        style={{
                          position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                          background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%',
                          width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setPreviewIndex(prev => (prev + 1) % previewSlides.length)}
                        style={{
                          position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
                          background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%',
                          width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}

                  {/* Dot Indicators */}
                  {(activeCarousel?.showIndicators ?? true) && (
                    <div style={{
                      position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
                      display: 'flex', gap: '0.3rem'
                    }}>
                      {previewSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewIndex(idx)}
                          style={{
                            width: previewIndex === idx ? '16px' : '6px',
                            height: '6px',
                            borderRadius: '3px',
                            border: 'none',
                            background: previewIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                            transition: 'var(--transition)',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ 
                  height: '240px', background: '#0f172a', borderRadius: '8px', border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                }}>
                  <Image size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <span style={{ fontSize: '0.8rem' }}>No active slides in this carousel playlist.</span>
                </div>
              )}

              {/* Tips panel */}
              <div style={{ marginTop: '1rem', background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  💡 <b>Pro Tip:</b> Create a high-resolution landscape slide picture in the Media Manager, select it as backdrop inside your slides, and watch it render reactively on the landing page carousel!
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 1. Carousel playlist Settings Modal */}
      {carouselModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '520px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {editingCarousel ? 'Edit Carousel Playlist' : 'Create Carousel Playlist'}
            </h2>

            <form onSubmit={handleCarouselSubmit}>
              <div className="form-group">
                <label className="form-label">Playlist Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={carouselFormData.name}
                  onChange={(e) => setCarouselFormData({ ...carouselFormData, name: e.target.value })}
                />
              </div>

              <div className="admin-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Autoplay Transition Speed (ms)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={carouselFormData.autoplaySpeed}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, autoplaySpeed: parseInt(e.target.value, 10) || 5000 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={carouselFormData.status}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2" style={{ margin: '1rem 0', background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={carouselFormData.autoplay}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, autoplay: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Enable Autoplay looping</span>
                </label>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={carouselFormData.showArrows}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, showArrows: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Show Left / Right arrows</span>
                </label>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={carouselFormData.showIndicators}
                    onChange={(e) => setCarouselFormData({ ...carouselFormData, showIndicators: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Show Bottom Dot indicators</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setCarouselModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} />
                  <span>Save Playlist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Slide Create / Edit modal */}
      {slideModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card w-full animate-fade-in" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {editingSlide ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
            </h2>

            <form onSubmit={handleSlideSubmit}>
              
              <div className="admin-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Target Playlist</label>
                  <select
                    className="form-select"
                    required
                    value={slideFormData.carouselId}
                    onChange={(e) => setSlideFormData({ ...slideFormData, carouselId: e.target.value })}
                  >
                    <option value="">-- Choose Playlist --</option>
                    {carousels.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={slideFormData.status}
                    onChange={(e) => setSlideFormData({ ...slideFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Background Media Image selector */}
              <div className="form-group">
                <label className="form-label">Background Slide Backdrop</label>
                <div className="flex items-center gap-3" style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '80px', height: '50px', background: '#ffffff', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    {selectedMedia ? (
                      <img src={`http://localhost:5000${selectedMedia.url}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Image size={22} color="var(--text-muted)" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>
                      {selectedMedia ? selectedMedia.filename : 'No background image selected'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaModalOpen(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', minHeight: 'auto' }}
                      >
                        Choose Backdrop Image
                      </button>
                      {selectedMedia && (
                        <button
                          type="button"
                          onClick={() => setSelectedMedia(null)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.725rem', minHeight: 'auto' }}
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Headline / Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="E.g., Virtual Open House"
                    value={slideFormData.title}
                    onChange={(e) => setSlideFormData({ ...slideFormData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle / Badge notice</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E.g., Admissions Open"
                    value={slideFormData.subtitle}
                    onChange={(e) => setSlideFormData({ ...slideFormData, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Brief Description Text</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={slideFormData.description}
                  onChange={(e) => setSlideFormData({ ...slideFormData, description: e.target.value })}
                />
              </div>

              <div className="admin-form-grid-3">
                <div className="form-group">
                  <label className="form-label">Button label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={slideFormData.buttonText}
                    onChange={(e) => setSlideFormData({ ...slideFormData, buttonText: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Button redirection URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={slideFormData.buttonUrl}
                    onChange={(e) => setSlideFormData({ ...slideFormData, buttonUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order Index</label>
                  <input
                    type="number"
                    className="form-input"
                    value={slideFormData.displayOrder}
                    onChange={(e) => setSlideFormData({ ...slideFormData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setSlideModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={14} />
                  <span>Save Slide</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Media Selector Modal */}
      <MediaSelectorModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        title="Choose Backdrop Image from Library"
      />
    </div>
  );
};

export default CarouselManager;
