import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotices } from '../../hooks/useNotices';
import { useNoticeUrl, pushNoticesView, pushHomeView } from '../../hooks/useNoticeUrl';
import type {
  INotice, NoticeCategory, NoticeStatus,
} from './noticeConstants';
import { NOTICE_CATEGORIES } from './noticeConstants';
import NoticeCard, { ConfirmDialog } from './NoticeCard';
import NoticeDetailOverlay from './NoticeDetailOverlay';
import NoticeEditorOverlay from './NoticeEditorOverlay';
import ToastStack, { useToasts } from './ToastNotifications';
import type { NoticeFormData } from '../../hooks/useNotices';
import './notices.css';

// ─── Skeleton cards ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="nb-skeleton-card">
    <div className="nb-skeleton-img" />
    <div className="nb-skeleton-body">
      <div className="nb-skeleton-line" style={{ height: 14, width: '40%' }} />
      <div className="nb-skeleton-line" style={{ height: 20, width: '85%' }} />
      <div className="nb-skeleton-line" style={{ height: 14, width: '60%' }} />
      <div className="nb-skeleton-line" style={{ height: 14, width: '70%' }} />
    </div>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────

interface NoticeBoardPageProps {
  onBack: () => void;
}

const NoticeBoardPage: React.FC<NoticeBoardPageProps> = ({ onBack }) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';
  const {
    listLoading, fetchNotices,
    createNotice, updateNotice, deleteNotice,
    togglePin, setStatus, duplicateNotice,
  } = useNotices();
  const { toasts, dismiss, toast } = useToasts();

  // ── Notice list state ────────────────────────────────────────────────────────
  const [notices,     setNotices]     = useState<INotice[]>([]);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, totalPages: 1 });
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState<NoticeCategory | 'All'>('All');
  const [pinnedOnly,  setPinnedOnly]  = useState(false);
  const [adminStatus, setAdminStatus] = useState<NoticeStatus | ''>('');

  // ── Overlay state ────────────────────────────────────────────────────────────
  const [selectedNotice,  setSelectedNotice]  = useState<INotice | null>(null);
  const [editingNotice,   setEditingNotice]   = useState<INotice | null | undefined>(undefined);
  const [isEditorOpen,    setIsEditorOpen]    = useState(false);
  const [deleteTarget,    setDeleteTarget]    = useState<INotice | null>(null);

  // ── Search debounce ──────────────────────────────────────────────────────────
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // ── Fetch notices ────────────────────────────────────────────────────────────
  const load = useCallback(async (page = 1) => {
    try {
      const res = await fetchNotices({
        search:   debouncedSearch || undefined,
        category: category !== 'All' ? category : undefined,
        pinned:   pinnedOnly || undefined,
        status:   (isAdmin && adminStatus) ? adminStatus : undefined,
        page,
        limit:    12,
      });
      setNotices(res.notices);
      setPagination({ total: res.pagination.total, page, totalPages: res.pagination.totalPages });
    } catch {
      toast.error('Failed to load notices.');
    }
  }, [debouncedSearch, category, pinnedOnly, adminStatus, isAdmin]);

  useEffect(() => { load(1); }, [load]);

  // ── URL sync ─────────────────────────────────────────────────────────────────
  const { pushNotice, clearNotice } = useNoticeUrl(
    (id: string) => {
      const found = notices.find(n => n._id === id);
      if (found) {
        setSelectedNotice(found);
      } else {
        const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');
        fetch(`${apiBase}/api/notices/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('atl_jwt_token') || ''}` }
        })
          .then(r => r.json())
          .then(data => { if (data.success) setSelectedNotice(data.notice); })
          .catch(() => {});
      }
    },
    () => setSelectedNotice(null)
  );

  useEffect(() => { pushNoticesView(); }, []);

  const openNotice = (n: INotice) => {
    setSelectedNotice(n);
    pushNotice(n._id);
  };
  const closeNotice = () => {
    setSelectedNotice(null);
    clearNotice();
  };

  const handleBack = () => {
    pushHomeView();
    onBack();
  };

  // ── Admin actions ────────────────────────────────────────────────────────────
  const handleSave = async (data: NoticeFormData, publish: boolean) => {
    const finalData = { ...data, status: publish ? 'published' as NoticeStatus : data.status };
    try {
      let saved: INotice;
      if (editingNotice?._id) {
        saved = await updateNotice(editingNotice._id, finalData);
        setNotices(prev => prev.map(n => n._id === saved._id ? saved : n));
        toast.success(publish ? 'Notice published.' : 'Notice saved as draft.');
      } else {
        saved = await createNotice(finalData);
        await load(1);
        toast.success(publish ? 'Notice published.' : 'Notice saved as draft.');
      }
      setIsEditorOpen(false);
      setEditingNotice(undefined);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save notice.');
    }
  };

  const handleEdit = (n: INotice) => {
    setEditingNotice(n);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNotice(deleteTarget._id);
      setNotices(prev => prev.filter(n => n._id !== deleteTarget._id));
      toast.success('Notice deleted.');
    } catch {
      toast.error('Failed to delete notice.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleTogglePin = async (n: INotice) => {
    try {
      const updated = await togglePin(n._id);
      setNotices(prev => prev.map(x => x._id === updated._id ? updated : x));
      toast.success(updated.pinned ? 'Notice pinned.' : 'Notice unpinned.');
    } catch { toast.error('Failed to toggle pin.'); }
  };

  const handleSetStatus = async (n: INotice, s: NoticeStatus) => {
    try {
      const updated = await setStatus(n._id, s);
      setNotices(prev => prev.map(x => x._id === updated._id ? updated : x));
      toast.success(`Notice moved to ${s}.`);
    } catch { toast.error('Failed to update status.'); }
  };

  const handleDuplicate = async (n: INotice) => {
    try {
      await duplicateNotice(n._id);
      await load(pagination.page);
      toast.success('Notice duplicated as draft.');
    } catch { toast.error('Failed to duplicate notice.'); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/notices?notice=${selectedNotice!._id}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard.'));
  };

  return (
    <div className="nb-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="nb-header">
        <div className="nb-header-inner">
          <div className="nb-header-left">
            <button className="nb-back-btn" onClick={handleBack} id="nb-back-btn">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Home
            </button>
            <div className="nb-logo-block">
              <span className="nb-logo-label">ATL COMMUNITY //</span>
              <span className="nb-logo-title">Notice Board</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Toolbar: Search bar + New Notice button + Filter pills ─────────── */}
      <div className="nb-toolbar">
        <div className="nb-toolbar-top">
          {/* Search bar */}
          <div className="nb-search-wrap">
            <span className="nb-search-icon" aria-hidden="true">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              className="nb-search-input"
              type="search"
              placeholder="Search notices…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search notices"
              id="nb-search-input"
            />
          </div>

          {/* New Notice button (Aligned to far right of search/filter section) */}
          {isAdmin && (
            <button
              className="nb-new-btn"
              onClick={() => { setEditingNotice(null); setIsEditorOpen(true); }}
              id="nb-new-notice-btn"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Notice
            </button>
          )}
        </div>

        {/* Filter Chips (Outlined pill style, typography only) */}
        <div className="nb-filters" role="group" aria-label="Filter notices">
          <button
            className={`nb-filter-chip ${category === 'All' && !pinnedOnly ? 'active' : ''}`}
            onClick={() => { setCategory('All'); setPinnedOnly(false); }}
          >
            All
          </button>
          <button
            className={`nb-filter-chip ${pinnedOnly ? 'active' : ''}`}
            onClick={() => setPinnedOnly(p => !p)}
          >
            Pinned
          </button>
          {NOTICE_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`nb-filter-chip ${category === cat ? 'active' : ''}`}
              onClick={() => { setCategory(cat); setPinnedOnly(false); }}
            >
              {cat}
            </button>
          ))}

          {/* Admin status filter */}
          {isAdmin && (
            <select
              className="nb-status-select"
              value={adminStatus}
              onChange={e => setAdminStatus(e.target.value as NoticeStatus | '')}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          )}
        </div>
      </div>

      {/* ── Notice grid ─────────────────────────────────────────── */}
      <main className="nb-main">
        <div className="nb-grid">
          {listLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : notices.length === 0 ? (
            <div className="nb-empty">
              <div className="nb-empty-icon" aria-hidden="true">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
                </svg>
              </div>
              <div className="nb-empty-title">No notices found</div>
              <div className="nb-empty-sub">
                {debouncedSearch || category !== 'All' || pinnedOnly
                  ? 'Try adjusting your search or filters.'
                  : isAdmin ? 'Create the first notice using the New Notice button.' : 'Check back later for updates.'}
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notices.map(n => (
                <NoticeCard
                  key={n._id}
                  notice={n}
                  isAdmin={isAdmin}
                  onClick={() => openNotice(n)}
                  onEdit={() => handleEdit(n)}
                  onDelete={() => setDeleteTarget(n)}
                  onTogglePin={() => handleTogglePin(n)}
                  onSetStatus={(s) => handleSetStatus(n, s)}
                  onDuplicate={() => handleDuplicate(n)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && !listLoading && (
          <div className="nb-pagination">
            <button
              className="nb-pg-btn"
              onClick={() => load(pagination.page - 1)}
              disabled={pagination.page <= 1}
              id="nb-prev-page"
            >
              Previous
            </button>
            <span className="nb-pg-info">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              className="nb-pg-btn"
              onClick={() => load(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              id="nb-next-page"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* ── Detail overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedNotice && (
          <NoticeDetailOverlay
            notice={selectedNotice}
            onClose={closeNotice}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      {/* ── Editor overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {isEditorOpen && (
          <NoticeEditorOverlay
            existingNotice={editingNotice ?? undefined}
            authorName={user?.adminProfile?.displayName || user?.name || 'Admin'}
            onSave={handleSave}
            onClose={() => { setIsEditorOpen(false); setEditingNotice(undefined); }}
          />
        )}
      </AnimatePresence>

      {/* ── Delete confirmation ──────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            title="Delete Notice"
            message={`Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            danger
          />
        )}
      </AnimatePresence>

      {/* ── Toast stack ─────────────────────────────────────────── */}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default NoticeBoardPage;
