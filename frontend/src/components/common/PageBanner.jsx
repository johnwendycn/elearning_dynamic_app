import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useOrgSettings } from '../../context/OrgSettingsContext';
import { getFullMediaUrl } from '../../utils/mediaUrl';

/**
 * Unified, professional, dynamic PageBanner component.
 * Supports:
 * - badge (icon + label)
 * - title (with responsive font sizing and word-break)
 * - subtitle (clean lead text)
 * - breadcrumbs (array of { label, path })
 * - metaItems (array of { icon: Component, label, color })
 * - searchBar / children (e.g. search input or custom action CTA buttons)
 * - custom gradient / bg image overrides from page settings or admin settings
 */
const PageBanner = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  breadcrumbs = [],
  metaItems = [],
  children,
  bgGradient,
  bgImage,
  align = 'center',
  compact = false
}) => {
  const { orgSettings } = useOrgSettings();

  // Dynamic background style fallback from org settings or default dark sleek tech theme
  const computedBrandGradient = (orgSettings?.primaryColor && orgSettings?.secondaryColor)
    ? `linear-gradient(135deg, #070d1d 0%, ${orgSettings.secondaryColor} 55%, ${orgSettings.primaryColor} 100%)`
    : 'linear-gradient(135deg, #070d1d 0%, #0c1938 50%, #152046 100%)';

  // Resolve full image URL dynamically
  const resolvedBgImage = bgImage ? getFullMediaUrl(bgImage) : null;

  const backgroundStyle = {
    background: resolvedBgImage
      ? `linear-gradient(135deg, rgba(7, 13, 29, 0.82) 0%, rgba(12, 25, 56, 0.86) 60%, rgba(7, 13, 29, 0.94) 100%), url(${resolvedBgImage}) center 30%/cover no-repeat`
      : (bgGradient || orgSettings?.bannerGradient || computedBrandGradient),
    color: '#ffffff',
    padding: compact
      ? 'clamp(2.5rem, 4vw, 3.5rem) 1rem'
      : 'clamp(3.5rem, 6vw, 5.25rem) 1rem',
    position: 'relative',
    overflow: 'hidden',
    textAlign: align
  };

  return (
    <section className="page-banner animate-fade-in" style={backgroundStyle}>
      {/* Decorative Glow Elements */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 123, 255, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '960px' }}>
        {/* Breadcrumb Navigation */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: align === 'center' ? 'center' : 'flex-start',
              gap: '0.45rem',
              flexWrap: 'wrap',
              fontSize: '0.82rem',
              color: '#94a3b8',
              marginBottom: '1.25rem'
            }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: '#94a3b8',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <Home size={13} />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                  {isLast || !crumb.path ? (
                    <span style={{ color: '#e2e8f0', fontWeight: 600, wordBreak: 'break-word' }}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      style={{
                        color: '#94a3b8',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Badge Chip */}
        {badge && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(0, 123, 255, 0.18)',
              border: '1px solid rgba(0, 123, 255, 0.4)',
              borderRadius: '9999px',
              padding: '0.35rem 1rem',
              marginBottom: '1rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            {BadgeIcon && <BadgeIcon size={14} color="#60a5fa" />}
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#60a5fa',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Banner Title */}
        {title && (
          <h1
            style={{
              fontSize: 'clamp(1.85rem, 4.2vw, 3rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.2,
              margin: '0 0 1rem 0',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {title}
          </h1>
        )}

        {/* Meta Items Row (e.g. date, author, category, duration) */}
        {metaItems && metaItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: align === 'center' ? 'center' : 'flex-start',
              gap: '1.25rem',
              flexWrap: 'wrap',
              fontSize: '0.88rem',
              color: '#cbd5e1',
              marginBottom: subtitle ? '1rem' : '1.5rem'
            }}
          >
            {metaItems.map((item, mIdx) => {
              const ItemIcon = item.icon;
              return (
                <span
                  key={mIdx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: item.color || '#cbd5e1',
                    wordBreak: 'break-word'
                  }}
                >
                  {ItemIcon && <ItemIcon size={15} color={item.iconColor || item.color || '#60a5fa'} />}
                  <span>{item.label}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              color: '#cbd5e1',
              fontSize: 'clamp(0.95rem, 2vw, 1.125rem)',
              lineHeight: 1.65,
              maxWidth: '760px',
              margin: align === 'center' ? '0 auto 1.75rem auto' : '0 0 1.75rem 0',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Integrated Children (Search bar, Action buttons, Filter pills, etc.) */}
        {children && (
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: align === 'center' ? 'center' : 'flex-start',
              width: '100%'
            }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default PageBanner;
