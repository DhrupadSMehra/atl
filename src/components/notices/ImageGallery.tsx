import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { IAttachment } from './noticeConstants';

interface LightboxProps {
  images:      IAttachment[];
  startIndex?: number;
  onClose:     () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, startIndex = 0, onClose }) => {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  const current = images[idx];

  return (
    <motion.div
      className="ig-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button className="ig-lightbox-close" onClick={onClose} title="Close (Esc)" aria-label="Close image viewer">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <button
        className="ig-nav-btn ig-nav-prev"
        onClick={e => { e.stopPropagation(); setIdx(i => Math.max(i - 1, 0)); }}
        disabled={idx === 0}
        aria-label="Previous image"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <motion.img
        key={current.url}
        src={current.url}
        alt={current.name}
        className="ig-lightbox-img"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      />

      <button
        className="ig-nav-btn ig-nav-next"
        onClick={e => { e.stopPropagation(); setIdx(i => Math.min(i + 1, images.length - 1)); }}
        disabled={idx === images.length - 1}
        aria-label="Next image"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="ig-counter">{idx + 1} / {images.length}</div>
    </motion.div>
  );
};

// ─── Gallery Grid ─────────────────────────────────────────────────────────────

interface ImageGalleryProps {
  attachments: IAttachment[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ attachments }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const images = attachments.filter(a => a.type === 'image');
  if (images.length === 0) return null;

  return (
    <>
      <div className="ig-section">
        <div className="ig-label">Attachments ({images.length})</div>
        <div className="ig-grid">
          {images.map((img, i) => (
            <div
              key={img.url}
              className="ig-thumb"
              onClick={() => setLightboxIdx(i)}
              role="button"
              tabIndex={0}
              aria-label={`View image ${i + 1}: ${img.name}`}
              onKeyDown={e => e.key === 'Enter' && setLightboxIdx(i)}
            >
              <img src={img.url} alt={img.name} loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            images={images}
            startIndex={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
