import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const Carousel = ({ carouselId }) => {
  const [carousel, setCarousel] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Use the public endpoint: /carousels/public/:id for specific IDs,
    // or /carousels/active for the default first active carousel.
    const fetchUrl = carouselId ? `/carousels/public/${carouselId}` : '/carousels/active';
    api.get(fetchUrl)
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;
          setCarousel(Array.isArray(data) ? data[0] : data);
        }
      })
      .catch((err) => console.error('Failed to load active carousel:', err));
  }, [carouselId]);

  const slides = carousel?.slides || [];

  useEffect(() => {
    if (!carousel?.autoplay || isHovered || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, carousel.autoplaySpeed || 5000);

    return () => clearInterval(interval);
  }, [carousel, isHovered, slides.length]);

  if (!carousel || slides.length === 0) {
    return null;
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const bgImage = slide.media?.url ? `url(http://localhost:5000${slide.media.url})` : undefined;

          return (
            <div
              key={slide.id || idx}
              className="carousel-slide"
              style={{
                backgroundImage: bgImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: bgImage ? undefined : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
              }}
            >
              <div className="carousel-overlay" />
              <div className="carousel-content animate-fade-in">
                {slide.subtitle && (
                  <span
                    className="badge badge-primary"
                    style={{ marginBottom: '1rem', letterSpacing: '0.05em' }}
                  >
                    {slide.subtitle}
                  </span>
                )}
                {slide.title && (
                  <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
                    {slide.title}
                  </h1>
                )}
                {slide.description && (
                  <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {slide.description}
                  </p>
                )}
                {slide.buttonText && slide.buttonUrl && (
                  <a href={slide.buttonUrl} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                    <span>{slide.buttonText}</span>
                    <ArrowRight size={18} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {carousel.showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              background: 'rgba(15, 23, 42, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              background: 'rgba(15, 23, 42, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Indicators */}
      {carousel.showIndicators && slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: '0.5rem'
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '28px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: currentIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
