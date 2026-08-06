import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { INotice } from './noticeConstants';
import TiptapRenderer from './TiptapRenderer';
import ImageGallery from './ImageGallery';

interface NoticeDetailOverlayProps {
  notice:   INotice | null;
  onClose:  () => void;
  onShare:  () => void;
}

const NoticeDetailOverlay: React.FC<NoticeDetailOverlayProps> = ({ notice, onClose, onShare }) => {
  useEffect(() => {
    if (!notice) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [notice, onClose]);

  useEffect(() => {
    if (notice) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [notice]);

  if (!notice) return null;

  const publishDate = new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const editedDate  = notice.editedAt
    ? new Date(notice.editedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const showEdited  = notice.editedBy && editedDate && notice.editedBy.name !== notice.authorName;

  return (
    <AnimatePresence>
      <motion.div
        className="nb-overlay-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={notice.title}
      >
        <motion.div
          className="nd-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{    opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="nd-header">
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--nb-font-mono)', color: 'var(--nb-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              NOTICE // {notice.category.toUpperCase()}
            </span>
            <div className="nd-header-actions">
              <button className="nd-action-btn" onClick={onShare} title="Copy share link" id="notice-share-btn">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Share
              </button>
              <button className="nd-close-btn" onClick={onClose} aria-label="Close notice" id="notice-close-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="nd-body">
            {notice.coverImage && (
              <img src={notice.coverImage} alt={notice.title} className="nd-cover" />
            )}

            <div className="nd-tags">
              <span className="nc-cat-chip">{notice.category}</span>
              {notice.pinned && <span className="nc-pin-badge">Pinned</span>}
            </div>

            <h1 className="nd-title">{notice.title}</h1>
            {notice.subtitle && <p className="nd-subtitle">{notice.subtitle}</p>}

            <div className="nd-meta">
              <div className="nd-meta-item">
                <span className="nd-meta-label">Author</span>
                <span style={{ fontWeight: 600, color: 'var(--nb-text-main)' }}>{notice.authorName}</span>
                {notice.authorPosition && (
                  <span style={{ color: 'var(--nb-text-muted)', fontSize: '0.8rem' }}>· {notice.authorPosition}</span>
                )}
              </div>
              <div className="nd-meta-item">
                <span className="nd-meta-label">Published</span>
                <span>{publishDate}</span>
              </div>
              {showEdited && (
                <div className="nd-meta-edited">
                  Last edited by {notice.editedBy!.name} · {editedDate}
                </div>
              )}
            </div>

            <TiptapRenderer content={notice.content} />

            {notice.attachments.length > 0 && (
              <ImageGallery attachments={notice.attachments} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoticeDetailOverlay;
