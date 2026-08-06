import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { INotice, NoticeStatus } from './noticeConstants';
import { extractPlainText } from './TiptapRenderer';

// ─── Confirmation Dialog ───────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title:    string;
  message:  string;
  onConfirm: () => void;
  onCancel:  () => void;
  danger?:  boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title, message, onConfirm, onCancel, danger = false,
}) => (
  <div className="nb-overlay-bg" style={{ zIndex: 10002 }}>
    <motion.div
      className="nb-confirm-panel"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1,    y: 0 }}
      exit={{    opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2 }}
      role="alertdialog"
      aria-modal="true"
    >
      <div className="nb-confirm-title">{title}</div>
      <div className="nb-confirm-sub">{message}</div>
      <div className="nb-confirm-actions">
        <button className="ne-btn ne-btn-ghost" onClick={onCancel}>Cancel</button>
        <button
          className={`ne-btn ${danger ? '' : 'ne-btn-primary'}`}
          style={danger ? { background: '#ff4d4d', border: '1px solid #ff4d4d', color: '#ffffff' } : {}}
          onClick={onConfirm}
        >
          {danger ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Admin Menu (Clean typography only, no emojis) ────────────────────────────

interface AdminMenuProps {
  notice:          INotice;
  onEdit:          () => void;
  onDelete:        () => void;
  onTogglePin:     () => void;
  onSetStatus:     (s: NoticeStatus) => void;
  onDuplicate:     () => void;
}

const AdminMenu: React.FC<AdminMenuProps> = ({
  notice, onEdit, onDelete, onTogglePin, onSetStatus, onDuplicate,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const act = (fn: () => void) => { setOpen(false); fn(); };

  return (
    <div className="nc-menu-wrap" ref={ref} onClick={e => e.stopPropagation()}>
      <button
        className="nc-dots-btn"
        onClick={() => setOpen(p => !p)}
        aria-label="Notice options menu"
        aria-expanded={open}
        aria-haspopup="menu"
        id={`notice-menu-${notice._id}`}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nc-dropdown"
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.14 }}
          >
            <button className="nc-dd-item" role="menuitem" onClick={() => act(onEdit)}>
              Edit
            </button>
            <button className="nc-dd-item" role="menuitem" onClick={() => act(onDuplicate)}>
              Duplicate
            </button>
            <div className="nc-dd-sep" />
            <button className="nc-dd-item" role="menuitem" onClick={() => act(onTogglePin)}>
              {notice.pinned ? 'Unpin' : 'Pin'}
            </button>

            {notice.status !== 'published' && (
              <button className="nc-dd-item" role="menuitem" onClick={() => act(() => onSetStatus('published'))}>
                Publish
              </button>
            )}
            {notice.status !== 'draft' && (
              <button className="nc-dd-item" role="menuitem" onClick={() => act(() => onSetStatus('draft'))}>
                Move to Draft
              </button>
            )}
            {notice.status !== 'archived' && (
              <button className="nc-dd-item" role="menuitem" onClick={() => act(() => onSetStatus('archived'))}>
                Archive
              </button>
            )}
            <div className="nc-dd-sep" />
            <button className="nc-dd-item danger" role="menuitem" onClick={() => act(onDelete)}>
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Notice Card ──────────────────────────────────────────────────────────────

interface NoticeCardProps {
  notice:          INotice;
  isAdmin:         boolean;
  onClick:         () => void;
  onEdit:          () => void;
  onDelete:        () => void;
  onTogglePin:     () => void;
  onSetStatus:     (s: NoticeStatus) => void;
  onDuplicate:     () => void;
}

const NoticeCard: React.FC<NoticeCardProps> = ({
  notice, isAdmin, onClick, onEdit, onDelete, onTogglePin, onSetStatus, onDuplicate,
}) => {
  const preview  = extractPlainText(notice.content).slice(0, 160);
  const initials = notice.authorName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const dateStr = new Date(notice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <motion.article
      className="nc-card"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClick}
      role="article"
      aria-label={`Notice: ${notice.title}`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Cover image */}
      {notice.coverImage ? (
        <img
          src={notice.coverImage}
          alt={notice.title}
          className="nc-cover"
          loading="lazy"
        />
      ) : (
        <div className="nc-cover-placeholder" aria-hidden="true">
          ATL NOTICE
        </div>
      )}

      {/* Body */}
      <div className="nc-body">
        {/* Tags */}
        <div className="nc-tags">
          <span className="nc-cat-chip">{notice.category}</span>
          {notice.pinned && <span className="nc-pin-badge">Pinned</span>}
          {isAdmin && notice.status !== 'published' && (
            <span className={`nc-status-badge ${notice.status}`}>
              {notice.status}
            </span>
          )}
        </div>

        <h3 className="nc-title">{notice.title}</h3>
        {notice.subtitle && <p className="nc-subtitle">{notice.subtitle}</p>}
        {preview && <p className="nc-preview">{preview}…</p>}
      </div>

      {/* Footer */}
      <div className="nc-footer">
        <div className="nc-author">
          <div className="nc-avatar" aria-hidden="true">
            <span>{initials || 'A'}</span>
          </div>
          <div className="nc-author-info">
            <span className="nc-author-name">{notice.authorName}</span>
            <span className="nc-author-date">{dateStr}</span>
          </div>
        </div>

        {isAdmin && (
          <AdminMenu
            notice={notice}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onSetStatus={onSetStatus}
            onDuplicate={onDuplicate}
          />
        )}
      </div>
    </motion.article>
  );
};

export default NoticeCard;
