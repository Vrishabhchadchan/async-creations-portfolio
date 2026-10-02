'use client';

import { useState } from 'react';
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

export default function WorkGallerySection({ items }: { items: GalleryItem[] }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);

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
        <div className="work-filter-row">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
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
          {filteredItems.map((item) => (
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
          ))}
        </div>
      ) : (
        <div className="work-gallery-empty">
          <p className="t-lead">No photos or videos uploaded for this category yet.</p>
          <p className="t-sub">Photos uploaded by your team in the Team Portal will appear here live.</p>
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

      {/* ---------------- LIGHTBOX MODAL ---------------- */}
      {activeLightbox && (
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
      )}
    </div>
  );
}
