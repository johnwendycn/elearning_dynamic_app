import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrgSettings } from '../../context/OrgSettingsContext';
import { 
  Search, User, LogOut, LayoutDashboard, Menu as MenuIcon, X,
  Phone, Mail, Facebook, Twitter, Instagram, Linkedin, ChevronDown, ChevronRight, Globe,
  BookOpen, Building2, Newspaper, CalendarDays, ArrowRight, Sparkles, Clock, Award,
  Home as HomeIcon, Info, PhoneCall, CheckCircle2, Shield, ShieldCheck
} from 'lucide-react';
import api from '../../services/api';
import { getFullMediaUrl } from '../../utils/mediaUrl';

const Header = () => {
  const { user, logout } = useAuth();
  const { orgSettings, headerConfig } = useOrgSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [publicMenuItems, setPublicMenuItems] = useState([]);
  const [departmentsWithCourses, setDepartmentsWithCourses] = useState([]);
  const [activeDeptHover, setActiveDeptHover] = useState(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDeptOpen, setMobileDeptOpen] = useState(false);
  const [mobileDeptExpanded, setMobileDeptExpanded] = useState({});
  const [mobileActiveDeptId, setMobileActiveDeptId] = useState(null);

  // Language States
  const [activeLang, setActiveLang] = useState('EN');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Draggable Language Button States
  const [dragPos, setDragPos] = useState({ x: window.innerWidth - 70, y: Math.floor(window.innerHeight / 2) - 28 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const megaMenuRef = useRef(null);

  // Draggable WhatsApp Button States
  const [waPos, setWaPos] = useState({ x: 16, y: Math.floor(window.innerHeight / 2) - 28 });
  const isWaDragging = useRef(false);
  const waDragStart = useRef({ x: 0, y: 0 });
  const waRef = useRef(null);

  // Close mobile drawer and mega menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open to prevent page background overflow/scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Handle outside click to close mega menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    // Fetch public navigation menu (filter out duplicate core items)
    api.get('/menus/public/location/main')
      .then((res) => {
        if (res.data.success && res.data.data?.items?.length > 0) {
          const coreTitles = ['home', 'about', 'about us', 'department', 'departments', 'course', 'courses', 'departments & courses', 'news', 'event', 'events', 'contact', 'contact us'];
          const customOnly = res.data.data.items.filter(item => !coreTitles.includes(item.title?.trim().toLowerCase()));
          setPublicMenuItems(customOnly);
        }
      })
      .catch(() => {});

    // Fetch active departments with courses for the Mega Menu
    api.get('/departments/active')
      .then((res) => {
        if (res.data.success && res.data.data?.length > 0) {
          setDepartmentsWithCourses(res.data.data);
          setActiveDeptHover(res.data.data[0]);
          setMobileActiveDeptId(res.data.data[0].id);
        }
      })
      .catch(() => {});

    // Google translate cookie init
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    const transCookie = getCookie('googtrans');
    if (transCookie) {
      const lang = transCookie.split('/').pop().toUpperCase();
      setActiveLang(lang);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,yo,ig,ha,fr,es,de,zh-CN,ar,pt,ru,sw,hi,it,ja,ko,tr,pl,nl,el',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDragPos(prev => ({
        x: Math.min(prev.x, window.innerWidth - 70),
        y: Math.min(prev.y, window.innerHeight - 70)
      }));
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleContactClick = (e) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    navigate('/contact');
  };

  const handleSelectLanguage = (langCode) => {
    const translateCode = langCode.toLowerCase();
    document.cookie = `googtrans=/en/${translateCode}; path=/;`;
    document.cookie = `googtrans=/en/${translateCode}; path=/; domain=${window.location.hostname};`;
    if (translateCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }
    setActiveLang(langCode);
    setLangMenuOpen(false);
    window.location.reload();
  };

  // --- Language Button Drag ---
  const startDrag = (clientX, clientY) => {
    isDragging.current = false;
    dragStart.current = { x: clientX - dragPos.x, y: clientY - dragPos.y };
    const onDrag = (e) => {
      isDragging.current = true;
      const x = Math.max(10, Math.min(e.clientX - dragStart.current.x, window.innerWidth - 70));
      const y = Math.max(10, Math.min(e.clientY - dragStart.current.y, window.innerHeight - 70));
      setDragPos({ x, y });
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startDragTouch = (e) => {
    isDragging.current = false;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - dragPos.x, y: touch.clientY - dragPos.y };
    const onDragTouch = (evt) => {
      isDragging.current = true;
      const t = evt.touches[0];
      const x = Math.max(10, Math.min(t.clientX - dragStart.current.x, window.innerWidth - 70));
      const y = Math.max(10, Math.min(t.clientY - dragStart.current.y, window.innerHeight - 70));
      setDragPos({ x, y });
    };
    const stopDragTouch = () => {
      document.removeEventListener('touchmove', onDragTouch);
      document.removeEventListener('touchend', stopDragTouch);
    };
    document.addEventListener('touchmove', onDragTouch);
    document.addEventListener('touchend', stopDragTouch);
  };

  const handleButtonClick = (e) => {
    if (isDragging.current) {
      e.preventDefault();
      return;
    }
    setLangMenuOpen(!langMenuOpen);
  };

  // --- WhatsApp Button Drag ---
  const startWaDrag = (clientX, clientY) => {
    isWaDragging.current = false;
    waDragStart.current = { x: clientX - waPos.x, y: clientY - waPos.y };
    const onDrag = (e) => {
      isWaDragging.current = true;
      const x = Math.max(8, Math.min(e.clientX - waDragStart.current.x, window.innerWidth - 70));
      const y = Math.max(8, Math.min(e.clientY - waDragStart.current.y, window.innerHeight - 70));
      setWaPos({ x, y });
    };
    const stopDrag = () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startWaDragTouch = (e) => {
    isWaDragging.current = false;
    const touch = e.touches[0];
    waDragStart.current = { x: touch.clientX - waPos.x, y: touch.clientY - waPos.y };
    const onDragTouch = (evt) => {
      isWaDragging.current = true;
      const t = evt.touches[0];
      const x = Math.max(8, Math.min(t.clientX - waDragStart.current.x, window.innerWidth - 70));
      const y = Math.max(8, Math.min(t.clientY - waDragStart.current.y, window.innerHeight - 70));
      setWaPos({ x, y });
    };
    const stopDragTouch = () => {
      document.removeEventListener('touchmove', onDragTouch);
      document.removeEventListener('touchend', stopDragTouch);
    };
    document.addEventListener('touchmove', onDragTouch);
    document.addEventListener('touchend', stopDragTouch);
  };

  const handleWaClick = (e) => {
    if (isWaDragging.current) { e.preventDefault(); return; }
    const phone = '2349137858366';
    window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
  };

  const showLogo = headerConfig ? headerConfig.showLogo : true;
  const showSiteName = headerConfig ? headerConfig.showSiteName : true;
  const showSearch = true;

  const siteTitle = orgSettings?.siteName || 'JONIKWIRIA Limited';
  const logoUrl = headerConfig?.logoMedia?.url || orgSettings?.logoMedia?.url;
  const fullLogoUrl = logoUrl ? getFullMediaUrl(logoUrl) : null;

  const extra = headerConfig?.extraSettings || {
    layout: 'standard',
    topStripEnabled: true,
    topStripText: 'Building People. Building Technology. | 2026 Admissions & Tech Bootcamps Open',
    phone: '+234 800 JONIKWIRIA',
    email: 'info@jonikwiria.com',
    menuAlign: 'flex-start',
    socialLinksEnabled: true,
    stickyEnabled: true
  };

  const isSticky = extra.stickyEnabled !== false;

  return (
    <header 
      className="header-glass animate-fade-in site-header-sticky" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 9999, 
        width: '100%',
        backgroundColor: 'var(--bg-glass)',
        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
        transition: 'var(--transition)'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        /* ===== SUPPRESS GOOGLE TRANSLATE BANNER ===== */
        .skiptranslate, #goog-gt-tt, .goog-te-banner-frame,
        .goog-te-ftab-float, body > .skiptranslate {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        body { top: 0 !important; }
        .goog-te-gadget { display: none !important; }
        iframe.goog-te-banner-frame { display: none !important; }
        /* ============================================= */

        header.site-header-sticky {
          position: -webkit-sticky !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 9999 !important;
          background: var(--bg-glass) !important;
        }
        .header-nav-link {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-main);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.42rem 0.65rem;
          border-radius: 8px;
          transition: var(--transition);
          white-space: nowrap;
          cursor: pointer;
        }
        .header-nav-link:hover, .header-nav-link.active {
          color: var(--primary) !important;
          background: rgba(0, 123, 255, 0.08);
        }
        .mega-menu-trigger {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .mega-menu-trigger:hover .mega-menu-panel,
        .mega-menu-panel.force-open {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateX(-50%) translateY(0) !important;
          pointer-events: auto !important;
        }
        .mega-menu-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          width: min(920px, 92vw);
          max-width: 92vw;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s ease;
          z-index: 1000;
          overflow: hidden;
        }
        .dept-item-hover {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dept-item-hover.active, .dept-item-hover:hover {
          background: rgba(0, 123, 255, 0.1);
          color: var(--primary);
          transform: translateX(4px);
        }
        .course-mini-card {
          padding: 0.9rem 1rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .course-mini-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary);
          box-shadow: 0 8px 24px rgba(0,123,255,0.14);
        }
        .mobile-nav-link {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          transition: var(--transition);
        }
        .mobile-nav-link:hover, .mobile-nav-link.active {
          background: rgba(0, 123, 255, 0.08);
          color: var(--primary);
        }
        /* Mobile & Desktop Media Queries */
        @media (max-width: 1024px) {
          .top-info-strip { display: none !important; }
          .desktop-nav-bar { display: none !important; }
          .header-actions-group { display: none !important; }
          .mobile-bottom-taskbar { display: flex !important; }
          .main-nav-container { 
            height: 64px !important; 
            justify-content: flex-start !important; 
            padding: 0 1rem !important; 
          }
        }
        @media (min-width: 1025px) {
          .mobile-bottom-taskbar { display: none !important; }
        }

        /* Jumia Style Mobile Bottom Taskbar */
        .mobile-bottom-taskbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
          z-index: 99990;
          display: none;
          align-items: center;
          justify-content: space-around;
          padding: 0 0.5rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .taskbar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          flex: 1;
          height: 100%;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.72rem;
          font-weight: 700;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          user-select: none;
        }
        .taskbar-item:active, .taskbar-item.active {
          color: var(--primary) !important;
        }
        .taskbar-item.active .taskbar-icon-wrap {
          transform: translateY(-2px);
          color: var(--primary);
        }
        .taskbar-badge {
          position: absolute;
          top: 6px;
          right: calc(50% - 18px);
          background: #ef4444;
          color: #fff;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 999px;
          line-height: 1;
          box-shadow: 0 2px 4px rgba(239,68,68,0.4);
        }

        /* Jumia-Style Slide-In Drawer */
        .jumia-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 999998;
          opacity: 1;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jumia-drawer-container {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 330px;
          max-width: 86vw;
          height: 100vh;
          background: var(--bg-surface);
          color: var(--text-main);
          z-index: 999999;
          display: flex;
          flex-direction: column;
          box-shadow: 8px 0 32px rgba(0, 0, 0, 0.25);
          transform: translateX(0);
          animation: jumiaSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        @keyframes jumiaSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .jumia-menu-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.82rem 1rem;
          color: var(--text-main);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .jumia-menu-row:hover, .jumia-menu-row:active, .jumia-menu-row.active {
          background: rgba(0, 123, 255, 0.08);
          color: var(--primary);
        }
        .jumia-dept-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 0.5rem;
          overflow: hidden;
          background: var(--bg-app);
          transition: border-color 0.2s ease;
        }
        .jumia-dept-card:hover {
          border-color: var(--primary);
        }
      `}} />

      {/* 1. Top Info Strip */}
      {extra.topStripEnabled && (
        <div className="top-info-strip" style={{
          background: 'linear-gradient(90deg, #0b132b 0%, #1c2541 100%)', 
          color: '#ffffff', 
          fontSize: '0.8rem', 
          padding: '0.45rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div className="flex items-center gap-4">
            {extra.phone && (
              <a href={`tel:${extra.phone}`} className="flex items-center gap-1 hover:opacity-80" style={{ color: '#ffffff', textDecoration: 'none' }}>
                <Phone size={12} color="#60a5fa" /> <span>{extra.phone}</span>
              </a>
            )}
            {extra.email && (
              <a href={`mailto:${extra.email}`} className="flex items-center gap-1 hover:opacity-80" style={{ color: '#ffffff', textDecoration: 'none' }}>
                <Mail size={12} color="#60a5fa" /> <span>{extra.email}</span>
              </a>
            )}
          </div>
          <span style={{ fontWeight: 600, opacity: 0.95, letterSpacing: '0.02em' }} className="mobile-hide">{extra.topStripText}</span>
          <div className="flex items-center gap-4">
            {extra.socialLinksEnabled && (
              <div className="flex items-center gap-3" style={{ opacity: 0.85 }}>
                <Facebook size={13} style={{ cursor: 'pointer' }} />
                <Twitter size={13} style={{ cursor: 'pointer' }} />
                <Instagram size={13} style={{ cursor: 'pointer' }} />
                <Linkedin size={13} style={{ cursor: 'pointer' }} />
              </div>
            )}
            <Link
              to="/login?portal=admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#38bdf8',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.74rem',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.28)',
                transition: 'all 0.2s ease'
              }}
              title="Administrative Control Center"
            >
              <ShieldCheck size={12} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="container flex items-center justify-between main-nav-container" style={{ height: '70px', maxWidth: '1400px', margin: '0 auto', padding: '0 1.25rem' }}>
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3" style={{ fontWeight: 900, fontSize: '1.25rem', textDecoration: 'none', flexShrink: 0 }}>
          {showLogo && fullLogoUrl ? (
            <img
              src={fullLogoUrl}
              alt={siteTitle}
              style={{ height: '44px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}
            />
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.05rem', boxShadow: '0 4px 14px rgba(0,123,255,0.3)' }}>
              JK
            </div>
          )}
          {showSiteName && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ letterSpacing: '-0.02em', color: 'var(--text-main)', fontWeight: 900, fontSize: '1.1rem' }}>JONIKWIRIA</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Technology Limited</span>
            </div>
          )}
        </Link>

        {/* Desktop Navigation in Exact Requested Order: HOME, ABOUT US, DEPARTMENT AND COURSES, NEWS, EVENT, CONTACT US */}
        <nav className="desktop-nav-bar flex items-center gap-1" style={{ marginLeft: '1rem', flexShrink: 1 }}>
          
          {/* 1. HOME */}
          <Link to="/" className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <HomeIcon size={14} color="var(--primary)" />
            <span>Home</span>
          </Link>

          {/* 2. ABOUT US */}
          <Link to="/p/about-us" className={`header-nav-link ${location.pathname === '/p/about-us' ? 'active' : ''}`}>
            <Info size={15} color="var(--primary)" />
            <span>About Us</span>
          </Link>

          {/* 3. DEPARTMENT AND COURSES (MEGA MENU) */}
          <div className="mega-menu-trigger" ref={megaMenuRef}>
            <button
              type="button"
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className={`header-nav-link ${location.pathname.startsWith('/courses') || megaMenuOpen ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', font: 'inherit' }}
            >
              <Building2 size={16} color="var(--primary)" />
              <span>Departments &amp; Courses</span>
              <ChevronDown size={14} style={{ transform: megaMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {/* Mega Menu Dropdown Panel */}
            <div className={`mega-menu-panel ${megaMenuOpen ? 'force-open' : ''}`}>
              <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 220px', minHeight: '380px' }}>
                {/* Col 1: Academic Departments List */}
                <div style={{ background: 'var(--bg-app)', padding: '1.5rem 1.25rem', borderRight: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <Building2 size={13} color="var(--primary)" />
                    <span>Academic Faculties</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {departmentsWithCourses.map(dept => {
                      const isActive = (activeDeptHover?.id === dept.id);
                      return (
                        <div
                          key={dept.id}
                          className={`dept-item-hover ${isActive ? 'active' : ''}`}
                          onMouseEnter={() => setActiveDeptHover(dept)}
                          onClick={() => setActiveDeptHover(dept)}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{dept.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dept.courses?.length || 0} Courses available</div>
                          </div>
                          <ArrowRight size={14} style={{ opacity: isActive ? 1 : 0.3 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Col 2: Active Department Courses */}
                <div style={{ padding: '1.75rem', overflowY: 'auto', maxHeight: '420px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {activeDeptHover?.name || 'Faculty Curriculum'}
                      </h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {activeDeptHover?.description || 'Select a faculty on the left to view active courses.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    {activeDeptHover?.courses && activeDeptHover.courses.length > 0 ? (
                      activeDeptHover.courses.map(course => (
                        <Link
                          key={course.id}
                          to={`/courses/${course.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="course-mini-card"
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.35 }}>
                            {course.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: 600 }}>{course.level}</span>
                            <span>⏱ {course.duration || 'Self-Paced'}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1/-1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p style={{ margin: 0, fontSize: '0.88rem' }}>No active courses registered in this department yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 3: Spotlight / Browse All */}
                <div style={{ background: 'linear-gradient(135deg, rgba(0,123,255,0.06) 0%, rgba(124,58,237,0.08) 100%)', padding: '1.5rem', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                      <Sparkles size={11} /> Featured Track
                    </div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                      Full-Stack AI &amp; Web Bootcamp
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                      12-week cohort with 1-on-1 industry mentorship and project certification.
                    </p>
                  </div>
                  <Link
                    to="/courses"
                    onClick={() => setMegaMenuOpen(false)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 700 }}
                  >
                    <span>Browse All Courses</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4. NEWS */}
          <Link to="/news" className={`header-nav-link ${location.pathname.startsWith('/news') ? 'active' : ''}`}>
            <Newspaper size={15} color="var(--primary)" />
            <span>News</span>
          </Link>

          {/* 5. EVENT */}
          <Link to="/events" className={`header-nav-link ${location.pathname.startsWith('/events') ? 'active' : ''}`}>
            <CalendarDays size={15} color="var(--primary)" />
            <span>Event</span>
          </Link>

          {/* 6. CONTACT US */}
          <a href="#contact" onClick={handleContactClick} className="header-nav-link">
            <PhoneCall size={15} color="var(--primary)" />
            <span>Contact Us</span>
          </a>

          {/* Additional Dynamic Custom Menus from DB (deduplicated) */}
          {publicMenuItems.length > 0 && publicMenuItems.map((item) => (
            <Link key={item.id} to={item.url} className="header-nav-link">
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Action Controls: Search, Theme Toggle, Auth Buttons, Mobile Hamburger */}
        <div className="header-actions-group flex items-center gap-2" style={{ flexShrink: 0 }}>
          {showSearch && (
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn btn-secondary btn-sm"
              title="Search"
              style={{ padding: '0.4rem', borderRadius: 'var(--radius-full)', width: 34, height: 34, minHeight: 34 }}
            >
              <Search size={15} />
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link to="/student/my-learning" className="btn btn-primary btn-sm mobile-hide" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, padding: '0.35rem 0.75rem', height: 34, minHeight: 34, fontSize: '0.82rem' }}>
                <BookOpen size={14} />
                <span>My Learning</span>
              </Link>
              {user.roles?.some(r => ['Super Admin', 'Admin', 'Curator', 'admin', 'superadmin'].includes(r.name)) && (
                <Link to="/admin" className="btn btn-secondary btn-sm mobile-hide" title="Admin Control Center" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', height: 34, minHeight: 34, fontSize: '0.82rem' }}>
                  <LayoutDashboard size={14} />
                  <span>Admin</span>
                </Link>
              )}
              <button onClick={logout} className="btn btn-secondary btn-sm mobile-hide" title="Logout" style={{ padding: '0.4rem', width: 34, height: 34, minHeight: 34 }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login" className="btn btn-secondary btn-sm mobile-hide" title="Student Learning Portal Login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', height: 34, minHeight: 34, fontSize: '0.82rem' }}>
                <User size={14} />
                <span>Login</span>
              </Link>
              <Link
                to="/login?portal=admin"
                className="btn btn-secondary btn-sm mobile-hide"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#0284c7',
                  borderColor: 'rgba(2, 132, 199, 0.3)',
                  background: 'rgba(2, 132, 199, 0.08)',
                  fontWeight: 700,
                  padding: '0.35rem 0.75rem',
                  height: 34,
                  minHeight: 34,
                  fontSize: '0.82rem'
                }}
                title="Staff & Management Control Center"
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm mobile-hide" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.85rem', height: 34, minHeight: 34, fontSize: '0.82rem', fontWeight: 700 }}>
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Hamburger Menu Toggle (Task Bar for Mobile & Tablet) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-menu-trigger"
            aria-label="Toggle navigation menu"
            style={{ 
              display: 'none', 
              padding: '0.55rem', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              border: '1px solid var(--border)',
              alignItems: 'center',
              justifyContent: 'center',
              background: mobileMenuOpen ? 'rgba(0,123,255,0.12)' : 'var(--bg-surface)'
            }}
          >
            {mobileMenuOpen ? <X size={22} color="var(--primary)" /> : <MenuIcon size={22} color="var(--text-main)" />}
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 100050, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-surface)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <form onSubmit={handleSearchSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={22} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Search courses, news, events, faculties..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1.1rem', color: 'var(--text-main)', outline: 'none' }}
                />
                <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={22} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* JUMIA-STYLE MOBILE SLIDE-IN DRAWER VIA PORTAL */}
      {mobileMenuOpen && createPortal(
        <>
          {/* Backdrop Overlay */}
          <div 
            className="jumia-drawer-overlay" 
            onClick={() => setMobileMenuOpen(false)} 
          />

          {/* Drawer Container */}
          <div className="jumia-drawer-container">
            {/* 1. Header Banner with User / Branding */}
            <div style={{
              background: 'linear-gradient(135deg, #0b132b 0%, #172554 60%, #007bff 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.15rem 1rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  position: 'absolute',
                  top: '0.85rem',
                  right: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff'
                }}
              >
                <X size={17} />
              </button>

              {/* Logo / Brand Name */}
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: '#fff' }}>
                {fullLogoUrl ? (
                  <img src={fullLogoUrl} alt={siteTitle} style={{ height: '34px', width: 'auto', borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ffffff', color: '#007bff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                    JK
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1, color: '#fff' }}>JONIKWIRIA</div>
                  <div style={{ fontSize: '0.62rem', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Technology Limited</div>
                </div>
              </Link>

              {/* User Account / Greeting Strip */}
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.12)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#60a5fa', color: '#0b132b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                      {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                      {user.firstName ? `Hi, ${user.firstName}` : 'Welcome Back'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <Link
                      to="/student/my-learning"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontSize: '0.72rem', background: '#3b82f6', color: '#fff', padding: '3px 8px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
                    >
                      <BookOpen size={11} />
                      <span>My Learning</span>
                    </Link>
                    {user.roles?.some(r => ['Super Admin', 'Admin', 'Curator', 'admin', 'superadmin'].includes(r.name)) && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.45rem 0.25rem',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <User size={13} />
                    <span>Student</span>
                  </Link>
                  <Link
                    to="/login?portal=admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      flex: 1,
                      background: 'rgba(2, 132, 199, 0.45)',
                      color: '#ffffff',
                      textAlign: 'center',
                      padding: '0.45rem 0.25rem',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Admin</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      flex: 1.1,
                      background: '#ffffff',
                      color: '#007bff',
                      textAlign: 'center',
                      padding: '0.45rem 0.25rem',
                      borderRadius: 8,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <Award size={13} />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Scrollable Body Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '0.85rem 0.75rem 5.5rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              {/* Quick Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0.5rem 0.75rem',
                  borderRadius: 10,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border)'
                }}>
                  <Search size={15} color="var(--primary)" />
                  <input
                    type="text"
                    placeholder="Search courses, faculties, news..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </form>

              {/* SECTION: MAIN NAVIGATION */}
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.4rem' }}>
                All Menus
              </div>

              {/* 1. HOME */}
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`jumia-menu-row ${location.pathname === '/' ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HomeIcon size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>Home</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </Link>

              {/* 2. ABOUT US */}
              <Link to="/p/about-us" onClick={() => setMobileMenuOpen(false)} className={`jumia-menu-row ${location.pathname === '/p/about-us' ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Info size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>About Us</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </Link>

              {/* 3. COURSES */}
              <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className={`jumia-menu-row ${location.pathname.startsWith('/courses') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BookOpen size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>Courses</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </Link>

              {/* 4. NEWS */}
              <Link to="/news" onClick={() => setMobileMenuOpen(false)} className={`jumia-menu-row ${location.pathname.startsWith('/news') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Newspaper size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>News &amp; Updates</span>
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 999 }}>
                  Latest
                </span>
              </Link>

              {/* 5. EVENT */}
              <Link to="/events" onClick={() => setMobileMenuOpen(false)} className={`jumia-menu-row ${location.pathname.startsWith('/events') ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CalendarDays size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>Events &amp; Seminars</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </Link>

              {/* 6. CONTACT US */}
              <a href="#contact" onClick={handleContactClick} className="jumia-menu-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <PhoneCall size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>Contact Us</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </a>

              {/* Custom Database Menus */}
              {publicMenuItems.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.5rem 0.4rem 0.2rem 0.4rem' }}>
                    Quick Links
                  </div>
                  {publicMenuItems.map(item => (
                    <Link key={item.id} to={item.url} onClick={() => setMobileMenuOpen(false)} className="jumia-menu-row">
                      <span style={{ color: 'var(--text-main)' }}>{item.title}</span>
                      <ChevronRight size={14} style={{ opacity: 0.4 }} />
                    </Link>
                  ))}
                </>
              )}

              {/* SECTION: ACCESS PORTALS */}
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.6rem 0.4rem 0.2rem 0.4rem' }}>
                Portals &amp; Dashboards
              </div>
              <Link
                to="/login?portal=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="jumia-menu-row"
                style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.2)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldCheck size={17} color="#0284c7" />
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>Admin Dashboard Login</span>
                </div>
                <ChevronRight size={14} color="#0284c7" />
              </Link>
              <Link
                to="/login?portal=student"
                onClick={() => setMobileMenuOpen(false)}
                className="jumia-menu-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BookOpen size={17} color="var(--primary)" />
                  <span style={{ color: 'var(--text-main)' }}>Student Learning Portal</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </Link>

              {/* SECTION: PREFERENCES & SUPPORT */}
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.6rem 0.4rem 0.2rem 0.4rem' }}>
                Preferences &amp; Support
              </div>


              {/* Multi-Language Quick Selector Grid */}
              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.45rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  <Globe size={13} color="var(--primary)" />
                  <span>Translate Website</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {[
                    { code: 'EN', label: 'EN' },
                    { code: 'YO', label: 'Yorùbá' },
                    { code: 'IG', label: 'Igbo' },
                    { code: 'HA', label: 'Hausa' },
                    { code: 'FR', label: 'FR' },
                    { code: 'ES', label: 'ES' },
                    { code: 'DE', label: 'DE' },
                    { code: 'AR', label: 'AR' }
                  ].map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleSelectLanguage(l.code)}
                      style={{
                        background: activeLang === l.code ? 'var(--primary)' : 'var(--bg-surface)',
                        color: activeLang === l.code ? '#ffffff' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '0.32rem 0.2rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Contact Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                {extra.phone && (
                  <a
                    href={`tel:${extra.phone}`}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      textDecoration: 'none',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <Phone size={12} />
                    <span>Call Us</span>
                  </a>
                )}
                {extra.email && (
                  <a
                    href={`mailto:${extra.email}`}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: 8,
                      background: 'rgba(0, 123, 255, 0.1)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      textDecoration: 'none',
                      border: '1px solid rgba(0, 123, 255, 0.2)'
                    }}
                  >
                    <Mail size={12} />
                    <span>Email Us</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* 3. JUMIA-STYLE MOBILE BOTTOM TASK BAR (FIXED TO BODY VIA PORTAL SO ALWAYS AT VIEWPORT BOTTOM) */}
      {createPortal(
        <div className="mobile-bottom-taskbar">
          {/* Taskbar Item 1: Home */}
          <Link 
            to="/" 
            className={`taskbar-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <div className="taskbar-icon-wrap">
              <HomeIcon size={19} />
            </div>
            <span>Home</span>
          </Link>

          {/* Taskbar Item 2: Courses */}
          <Link 
            to="/courses" 
            className={`taskbar-item ${location.pathname.startsWith('/courses') ? 'active' : ''}`}
          >
            <div className="taskbar-icon-wrap">
              <BookOpen size={19} />
            </div>
            <span>Courses</span>
          </Link>

          {/* Taskbar Item 3: Search */}
          <button 
            type="button"
            onClick={() => setSearchOpen(true)}
            className="taskbar-item"
          >
            <div className="taskbar-icon-wrap">
              <Search size={19} />
            </div>
            <span>Search</span>
          </button>

          {/* Taskbar Item 4: News */}
          <Link 
            to="/news" 
            className={`taskbar-item ${location.pathname.startsWith('/news') ? 'active' : ''}`}
          >
            <div className="taskbar-icon-wrap">
              <Newspaper size={19} />
            </div>
            <span className="taskbar-badge">New</span>
            <span>News</span>
          </Link>

          {/* Taskbar Item 5: Task Bar Menu Icon (Clicks to Show All Menus) */}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`taskbar-item ${mobileMenuOpen ? 'active' : ''}`}
            aria-label="Open complete menu"
          >
            <div className="taskbar-icon-wrap">
              <MenuIcon size={20} color="var(--primary)" />
            </div>
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Menu</span>
          </button>
        </div>,
        document.body
      )}

      {/* ===== FLOATING WHATSAPP BUTTON (Draggable, Middle-Left) ===== */}
      <div
        ref={waRef}
        style={{
          position: 'fixed',
          left: `${waPos.x}px`,
          top: `${waPos.y}px`,
          zIndex: 100001,
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          filter: 'drop-shadow(0 4px 16px rgba(37,211,102,0.45))'
        }}
        onMouseDown={(e) => startWaDrag(e.clientX, e.clientY)}
        onTouchStart={startWaDragTouch}
      >
        <button
          type="button"
          onClick={handleWaClick}
          title="Chat with us on WhatsApp"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.4)',
            animation: 'waPulse 2.2s ease-in-out infinite',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* WhatsApp SVG Icon */}
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.663 4.61 1.812 6.513L4 29l7.697-1.797A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="#fff"/>
            <path d="M21.8 18.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.19 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" fill="#25d366"/>
          </svg>
          {/* Pulse ring */}
          <span style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px solid rgba(37,211,102,0.4)',
            animation: 'waPulseRing 2.2s ease-out infinite'
          }} />
        </button>
        <style>{`
          @keyframes waPulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,0.5), 0 0 0 0 rgba(37,211,102,0.4); }
            50% { box-shadow: 0 4px 24px rgba(37,211,102,0.6), 0 0 0 10px rgba(37,211,102,0); }
          }
          @keyframes waPulseRing {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </div>

      {/* ===== FLOATING LANGUAGE BUTTON (Draggable, Middle-Right) ===== */}
      <div 
        ref={buttonRef}
        style={{
          position: 'fixed',
          left: `${dragPos.x}px`,
          top: `${dragPos.y}px`,
          zIndex: 100000,
          cursor: isDragging.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={startDragTouch}
      >
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          title="Change Language"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '0',
            width: 54,
            height: 54,
            borderRadius: '50%',
            boxShadow: langMenuOpen
              ? '0 0 0 3px rgba(0,123,255,0.35), 0 8px 24px rgba(0,123,255,0.4)'
              : '0 6px 20px rgba(0,0,0,0.28)',
            background: langMenuOpen
              ? 'linear-gradient(135deg, #7c3aed 0%, #007bff 100%)'
              : 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)',
            border: '2.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s ease, background 0.2s ease'
          }}
        >
          <Globe size={18} color="#fff" />
          <span style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1, textTransform: 'uppercase' }}>
            {activeLang.split('-')[0]}
          </span>
        </button>
      </div>

      {/* ===== LANGUAGE PICKER MODAL (Portal, Responsive) ===== */}
      {langMenuOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setLangMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              zIndex: 200000
            }}
          />
          {/* Modal Panel */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              right: 70,
              transform: 'translateY(-50%)',
              zIndex: 200001,
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '22px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.07)',
              width: 'min(380px, calc(100vw - 90px))',
              maxHeight: 'min(560px, calc(100vh - 80px))',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'langModalIn 0.22s cubic-bezier(0.16,1,0.3,1)'
            }}
          >
            <style>{`
              @keyframes langModalIn {
                from { opacity: 0; transform: translateY(-50%) translateX(20px) scale(0.95); }
                to   { opacity: 1; transform: translateY(-50%) translateX(0)   scale(1); }
              }
              .lang-opt-btn:hover {
                background: rgba(0,123,255,0.1) !important;
                border-color: rgba(0,123,255,0.22) !important;
                color: var(--primary) !important;
                transform: translateY(-1px);
              }
              .lang-search-inp:focus { outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(0,123,255,0.15); }
            `}</style>

            {/* Header */}
            <div style={{
              padding: '1.1rem 1.25rem 0.85rem',
              borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, #007bff 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Globe size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>Language</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 500 }}>Choose your preferred language</div>
                </div>
              </div>
              <button
                onClick={() => setLangMenuOpen(false)}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Search Box */}
            <div style={{ padding: '0.75rem 1rem 0.5rem', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  className="lang-search-inp"
                  type="text"
                  placeholder="Search language..."
                  id="lang-search-input"
                  onChange={e => {
                    const v = e.target.value.toLowerCase();
                    document.querySelectorAll('.lang-opt-btn').forEach(btn => {
                      btn.parentElement.style.display = btn.dataset.label.includes(v) ? '' : 'none';
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '0.83rem',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Language Grid */}
            <div style={{
              padding: '0.25rem 1rem 1rem',
              overflowY: 'auto',
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '8px',
              alignContent: 'start'
            }}>
              {[
                { code: 'EN',    label: 'English',    flag: '🇬🇧', native: 'English' },
                { code: 'YO',    label: 'Yorùbá',     flag: '🇳🇬', native: 'Yorùbá' },
                { code: 'IG',    label: 'Igbo',       flag: '🇳🇬', native: 'Igbo' },
                { code: 'HA',    label: 'Hausa',      flag: '🇳🇬', native: 'Hausa' },
                { code: 'FR',    label: 'Français',   flag: '🇫🇷', native: 'Français' },
                { code: 'ES',    label: 'Español',    flag: '🇪🇸', native: 'Español' },
                { code: 'DE',    label: 'Deutsch',    flag: '🇩🇪', native: 'Deutsch' },
                { code: 'AR',    label: 'العربية',    flag: '🇸🇦', native: 'عربي' },
                { code: 'ZH-CN', label: '中文',        flag: '🇨🇳', native: '中文' },
                { code: 'PT',    label: 'Português',  flag: '🇵🇹', native: 'Português' },
                { code: 'RU',    label: 'Русский',    flag: '🇷🇺', native: 'Русский' },
                { code: 'SW',    label: 'Kiswahili',  flag: '🌍',  native: 'Kiswahili' },
                { code: 'HI',    label: 'हिन्दी',     flag: '🇮🇳', native: 'हिन्दी' },
                { code: 'IT',    label: 'Italiano',   flag: '🇮🇹', native: 'Italiano' },
                { code: 'JA',    label: 'Japanese',   flag: '🇯🇵', native: '日本語' },
                { code: 'KO',    label: 'Korean',     flag: '🇰🇷', native: '한국어' },
                { code: 'TR',    label: 'Türkçe',     flag: '🇹🇷', native: 'Türkçe' },
                { code: 'PL',    label: 'Polski',     flag: '🇵🇱', native: 'Polski' },
                { code: 'NL',    label: 'Nederlands', flag: '🇳🇱', native: 'Nederlands' },
                { code: 'EL',    label: 'Greek',      flag: '🇬🇷', native: 'Ελληνικά' },
              ].map(l => {
                const isActive = activeLang === l.code;
                return (
                  <div key={l.code}>
                    <button
                      className="lang-opt-btn"
                      data-label={l.label.toLowerCase() + ' ' + l.native.toLowerCase()}
                      onClick={() => handleSelectLanguage(l.code)}
                      style={{
                        width: '100%',
                        background: isActive ? 'rgba(0,123,255,0.13)' : 'var(--bg-app)',
                        color: isActive ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: isActive ? 800 : 500,
                        border: isActive ? '1.5px solid rgba(0,123,255,0.35)' : '1.5px solid var(--border)',
                        borderRadius: '12px',
                        padding: '0.7rem 0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        textAlign: 'center'
                      }}
                    >
                      {isActive && (
                        <span style={{
                          position: 'absolute', top: 5, right: 5,
                          width: 8, height: 8, borderRadius: '50%',
                          background: 'var(--primary)'
                        }} />
                      )}
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{l.flag}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 800 : 600, lineHeight: 1.2 }}>{l.native}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '0.65rem 1rem',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={11} /> Powered by Google Translate
              </span>
              <button
                onClick={() => handleSelectLanguage('EN')}
                style={{
                  fontSize: '0.72rem', color: 'var(--primary)', background: 'rgba(0,123,255,0.09)',
                  border: '1px solid rgba(0,123,255,0.2)', borderRadius: '6px',
                  padding: '3px 10px', cursor: 'pointer', fontWeight: 700
                }}
              >
                Reset to English
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      <div id="google_translate_element" style={{ display: 'none' }} />
    </header>
  );
};

export default Header;
