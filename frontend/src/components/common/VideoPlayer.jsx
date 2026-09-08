import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, Settings, Loader2, AlertCircle
} from 'lucide-react';

/**
 * VideoPlayer — Reusable interactive player.
 * Supports: YouTube embeds, Vimeo embeds, native HTML5 video.
 * Props:
 *   url           {string}   - video URL
 *   title         {string}   - accessible title
 *   onComplete    {function} - called when >= 90% watched or embed ends
 *   autoplay      {boolean}
 *   startTime     {number}   - seconds
 *   className     {string}
 */
const VideoPlayer = ({ url, title = 'Video Lesson', onComplete, autoplay = false, startTime = 0, className = '' }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [completeFired, setCompleteFired] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // Detect video type
  const embedUrl = getEmbedUrl(url, autoplay, startTime);
  const isEmbed = !!embedUrl;
  const isNative = !isEmbed && !!url;

  // --- Embed handler: fire onComplete via postMessage (YouTube API)
  useEffect(() => {
    if (!isEmbed) return;
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'onStateChange' && data?.info === 0) {
          // YouTube state 0 = ended
          if (!completeFired) { setCompleteFired(true); onComplete?.(); }
        }
      } catch (_) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEmbed, completeFired, onComplete]);

  // --- Native video events
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
    // Fire onComplete at 90%
    if (!completeFired && v.duration > 0 && v.currentTime / v.duration >= 0.9) {
      setCompleteFired(true);
      onComplete?.();
    }
  }, [completeFired, onComplete]);

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) { setDuration(v.duration); setLoading(false); }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (!completeFired) { setCompleteFired(true); onComplete?.(); }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) { v.pause(); setIsPlaying(false); }
    else { v.play(); setIsPlaying(true); }
  };

  const handleProgressClick = (e) => {
    const v = videoRef.current;
    if (!v || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleVolumeChange = (e) => {
    const v = videoRef.current;
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (v) { v.volume = val; v.muted = val === 0; }
    setMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
  };

  const setPlaybackSpeed = (s) => {
    const v = videoRef.current;
    setSpeed(s);
    if (v) v.playbackRate = s;
    setShowSpeedMenu(false);
  };

  const skip = (secs) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Auto-hide controls on mouse idle
  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(hideControlsTimer.current);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isNative) return;
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') skip(10);
      if (e.code === 'ArrowLeft') skip(-10);
      if (e.code === 'KeyM') toggleMute();
      if (e.code === 'KeyF') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, isNative, muted]);

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ─── EMBED RENDER (YouTube / Vimeo) ─────────────────────────────────────
  if (isEmbed) {
    return (
      <div
        className={`vp-embed-wrapper ${className}`}
        style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '14px', overflow: 'hidden', background: '#000', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      >
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0d0f', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'vp-spin 0.8s linear infinite' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Loading video...</span>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          onLoad={() => setLoading(false)}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          enablejsapi="1"
        />
      </div>
    );
  }

  // ─── NO VIDEO STATE ──────────────────────────────────────────────────────
  if (!isNative) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', border: '2px solid rgba(56,189,248,0.25)' }}>
          <Play size={32} color="#38bdf8" style={{ marginLeft: 3 }} />
        </div>
        <h4 style={{ color: '#e2e8f0', fontWeight: 700, margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Reading & Lab Unit</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
          This lesson is a structured reading and coding exercise. Check the <strong style={{ color: '#94a3b8' }}>Notes & Guide</strong> tab or download the lab files below.
        </p>
      </div>
    );
  }

  // ─── NATIVE HTML5 VIDEO PLAYER ───────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`vp-native ${className}`}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={(e) => { if (e.target === containerRef.current || e.target.tagName === 'VIDEO') togglePlay(); }}
      style={{ position: 'relative', background: '#000', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', userSelect: 'none', cursor: 'pointer' }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: '#0b0d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <Loader2 size={40} color="#38bdf8" style={{ animation: 'vp-spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div style={{ position: 'absolute', inset: 0, background: '#0b0d0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', zIndex: 5 }}>
          <AlertCircle size={40} color="#ef4444" />
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Could not load video. Check the URL or your connection.</p>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={url}
        autoPlay={autoplay}
        style={{ width: '100%', display: 'block', maxHeight: isFullscreen ? '100vh' : '65vh', objectFit: 'contain' }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
      />

      {/* Center Play/Pause Pulse */}
      <div
        className="vp-center-icon"
        onClick={togglePlay}
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: showControls && !isPlaying ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none'
        }}
      >
        <Play size={32} color="#fff" style={{ marginLeft: 3 }} />
      </div>

      {/* Controls Bar */}
      <div
        className="vp-controls"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          padding: '2rem 1rem 0.85rem 1rem',
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.25s ease',
          zIndex: 10
        }}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 9999, cursor: 'pointer', marginBottom: '0.65rem', position: 'relative', overflow: 'visible' }}
          onMouseEnter={(e) => e.currentTarget.style.height = '7px'}
          onMouseLeave={(e) => e.currentTarget.style.height = '5px'}
        >
          {/* Buffered */}
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${buffered}%`, background: 'rgba(255,255,255,0.25)', borderRadius: 9999 }} />
          {/* Played */}
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', borderRadius: 9999, transition: 'width 0.1s linear' }}>
            <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px rgba(56,189,248,0.8)' }} />
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Play/Pause */}
          <button onClick={togglePlay} style={ctrlBtn}>
            {isPlaying ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" style={{ marginLeft: 2 }} />}
          </button>

          {/* Skip back */}
          <button onClick={() => skip(-10)} style={ctrlBtn} title="Back 10s">
            <SkipBack size={16} color="#fff" />
          </button>

          {/* Skip forward */}
          <button onClick={() => skip(10)} style={ctrlBtn} title="Forward 10s">
            <SkipForward size={16} color="#fff" />
          </button>

          {/* Volume */}
          <button onClick={toggleMute} style={ctrlBtn}>
            {muted || volume === 0 ? <VolumeX size={17} color="#fff" /> : <Volume2 size={17} color="#fff" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{ width: 70, accentColor: '#38bdf8', cursor: 'pointer' }}
          />

          {/* Time */}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div style={{ flex: 1 }} />

          {/* Speed */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowSpeedMenu(s => !s)} style={{ ...ctrlBtn, fontSize: '0.78rem', fontWeight: 800, color: '#fff', padding: '0.25rem 0.5rem', borderRadius: 6, background: 'rgba(255,255,255,0.12)' }}>
              {speed}x
            </button>
            {showSpeedMenu && (
              <div style={{ position: 'absolute', bottom: '2.2rem', right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', zIndex: 20, minWidth: 70 }}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    style={{ display: 'block', width: '100%', padding: '0.45rem 0.85rem', border: 'none', background: speed === s ? 'rgba(56,189,248,0.15)' : 'transparent', color: speed === s ? '#38bdf8' : '#cbd5e1', fontWeight: speed === s ? 800 : 500, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} style={ctrlBtn}>
            {isFullscreen ? <Minimize size={17} color="#fff" /> : <Maximize size={17} color="#fff" />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes vp-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .vp-native:hover .vp-controls { opacity: 1; }
      `}</style>
    </div>
  );
};

// Shared control button style
const ctrlBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 6, transition: 'background 0.15s',
};

// ─── Embed URL Resolver ───────────────────────────────────────────────────
function getEmbedUrl(url, autoplay = false, startTime = 0) {
  if (!url) return null;
  const ap = autoplay ? 1 : 0;
  const st = Math.round(startTime) || 0;

  if (url.includes('youtube.com/watch?v=')) {
    const vid = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${vid}?autoplay=${ap}&start=${st}&enablejsapi=1&rel=0&modestbranding=1`;
  }
  if (url.includes('youtu.be/')) {
    const vid = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${vid}?autoplay=${ap}&start=${st}&enablejsapi=1&rel=0&modestbranding=1`;
  }
  if (url.includes('youtube.com/embed/')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}autoplay=${ap}&start=${st}&enablejsapi=1&rel=0&modestbranding=1`;
  }
  if (url.includes('vimeo.com/')) {
    const vid = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${vid}?autoplay=${ap}&title=0&byline=0&portrait=0`;
  }
  // Native video (mp4, webm, ogg etc.)
  return null;
}

export { getEmbedUrl };
export default VideoPlayer;
