'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { GalleryItem } from '@/lib/manifest';

const CATEGORY_TABS = [
  { key: 'all', label: 'Featured Works' },
  { key: 'photography', label: 'Photography' },
  { key: 'wedding', label: 'Weddings' },
  { key: 'prewedding', label: 'Pre-Weddings' },
  { key: 'drone', label: 'Drone & Aerial' },
  { key: 'corporate', label: 'Corporate & Commercial' },
  { key: 'event', label: 'Events & Concerts' },
  { key: 'film', label: 'Cinematic Films & Reels' },
  { key: 'institutional', label: 'Institutional & Education' },
  { key: 'travel', label: 'Travel & Lifestyle' },
  { key: 'social', label: 'Social Media & Brand Content' },
  { key: 'realestate', label: 'Real Estate' },
  { key: 'droneshoot', label: 'Drone Shoot' },
];

/** Dedicated Reel-sized modal player card that pops up on click */
function ReelLightboxModal({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="work-lightbox-backdrop" onClick={onClose}>
      <div className="work-reel-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="work-reel-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="work-reel-video-container" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={item.videoUrl as string}
            poster={item.imageUrl || undefined}
            autoPlay
            playsInline
            loop
            muted={muted}
            className="work-reel-video"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          {/* Big Center Play Icon when paused */}
          {!playing && (
            <div className="work-reel-center-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="54" height="54">
                <path d="M8 5v14l11-7L8 5z"/>
              </svg>
            </div>
          )}

          {/* Reel Badge */}
          <div className="work-reel-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
              <path d="M8 5v14l11-7L8 5z"/>
            </svg>
            REEL
          </div>

          {/* Bottom Overlay with Metadata & Controls */}
          <div className="work-reel-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="work-reel-meta">
              <span className="work-gallery-cat">{item.categoryLabel}</span>
              <h3 className="work-reel-title">{item.title}</h3>
            </div>

            <div className="work-reel-controls">
              <button
                type="button"
                className="work-video-btn"
                onClick={togglePlay}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M8 5v14l11-7L8 5z"/>
                  </svg>
                )}
              </button>

              <button
                type="button"
                className="work-video-btn work-video-mute-btn"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63a.996.996 0 00-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.2-1.22.83v.03c0 .41.25.77.62.91C17.1 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
                {muted && <span className="work-video-tap-sound">Tap for sound</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkGallerySection({ items }: { items: GalleryItem[] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const pill = row?.querySelector<HTMLElement>('.work-tab-btn.active');
    if (!row || !pill || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, behavior: 'smooth' });
  }, [activeTab]);

  const filteredItems = items.filter((item) => {
    if (item.visible === false) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'drone' || activeTab === 'droneshoot') {
      return item.category === 'drone' || item.category === 'droneshoot';
    }
    return item.category === activeTab;
  });

  return (
    <div className="work-gallery-section">
      {/* ---------------- CATEGORY TABS ---------------- */}
      <div className="work-filter-wrapper">
        <div className="work-filter-row" ref={rowRef} role="group" aria-label="Filter work by category">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={isActive}
                className={`work-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- PHOTO & VIDEO GRID ---------------- */}
      {filteredItems.length > 0 ? (
        <div className="work-gallery-grid">
          {filteredItems.map((item) => {
            const isVideo = item.mediaType === 'video';
            if (isVideo) {
              return (
                <div
                  key={item.id}
                  className={`work-gallery-card work-gallery-video-tile ${item.size || 'normal'}`}
                  onClick={() => setActiveLightbox(item)}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="work-gallery-img"
                      quality={85}
                    />
                  ) : (
                    <video
                      src={`${item.videoUrl}#t=0.001`}
                      preload="metadata"
                      muted
                      playsInline
                      className="work-gallery-video-thumb"
                    />
                  )}

                  {/* Centered play icon pill */}
                  <div className="work-video-tile-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
                      <path d="M8 5v14l11-7L8 5z"/>
                    </svg>
                  </div>

                  {/* Top REEL badge */}
                  <div className="work-video-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
                      <path d="M8 5v14l11-7L8 5z"/>
                    </svg>
                    REEL
                  </div>

                  <div className="work-gallery-overlay">
                    <span className="work-gallery-cat">{item.categoryLabel}</span>
                    <h3 className="work-gallery-title">{item.title}</h3>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`work-gallery-card ${item.size || 'normal'}`}
                onClick={() => setActiveLightbox(item)}
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="work-gallery-img"
                    quality={85}
                  />
                ) : (
                  <div className="work-gallery-placeholder">
                    <span>📷</span>
                  </div>
                )}
                <div className="work-gallery-overlay">
                  <span className="work-gallery-cat">{item.categoryLabel}</span>
                  <h3 className="work-gallery-title">{item.title}</h3>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="work-gallery-empty">
          <p className="t-lead">No photos or videos uploaded for this category yet.</p>
          <p className="t-sub">Photos and videos uploaded by your team in the Team Portal will appear here live.</p>
          <a
            href="/team-portal"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            Upload via Team Portal
          </a>
        </div>
      )}

      {/* ---------------- MODAL / LIGHTBOX ---------------- */}
      {activeLightbox && (
        activeLightbox.mediaType === 'video' ? (
          <ReelLightboxModal item={activeLightbox} onClose={() => setActiveLightbox(null)} />
        ) : (
          <div className="work-lightbox-backdrop" onClick={() => setActiveLightbox(null)}>
            <div className="work-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="work-lightbox-close"
                onClick={() => setActiveLightbox(null)}
                aria-label="Close lightbox"
              >
                ✕
              </button>
              {activeLightbox.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeLightbox.imageUrl}
                  alt={activeLightbox.title}
                  className="work-lightbox-img"
                />
              )}
              <div className="work-lightbox-meta">
                <span className="work-gallery-cat">{activeLightbox.categoryLabel}</span>
                <h3>{activeLightbox.title}</h3>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
