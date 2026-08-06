import { useEffect, useCallback, useRef } from 'react';

/**
 * useNoticeUrl — Syncs the notice detail overlay with the browser URL.
 *
 * When a notice is opened:   URL becomes /notices?notice=<id>
 * When a notice is closed:   URL becomes /notices
 * When the page loads with ?notice=<id> in the URL, the callback fires
 * so the caller can open that notice automatically (deep link).
 *
 * Browser Back button closes the overlay correctly via popstate.
 *
 * No router library required — uses window.history.pushState.
 */
export function useNoticeUrl(
  onOpenNotice: (id: string) => void,
  onCloseNotice: () => void
) {
  const onOpenRef  = useRef(onOpenNotice);
  const onCloseRef = useRef(onCloseNotice);
  onOpenRef.current  = onOpenNotice;
  onCloseRef.current = onCloseNotice;

  // ── Handle browser back/forward ─────────────────────────────────────────────
  useEffect(() => {
    const handlePopstate = () => {
      const params  = new URLSearchParams(window.location.search);
      const noticeId = params.get('notice');
      if (noticeId) {
        onOpenRef.current(noticeId);
      } else {
        onCloseRef.current();
      }
    };
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  // ── On mount: check for ?notice=<id> in current URL ────────────────────────
  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const noticeId = params.get('notice');
    if (noticeId) {
      onOpenRef.current(noticeId);
    }
  }, []);

  // ── Public helpers ──────────────────────────────────────────────────────────

  /** Call when a notice is opened — pushes ?notice=<id> into history. */
  const pushNotice = useCallback((id: string) => {
    const url = `/notices?notice=${id}`;
    if (window.location.href !== window.location.origin + url) {
      window.history.pushState({ noticeId: id }, '', url);
    }
  }, []);

  /** Call when the detail overlay is closed — pops to /notices. */
  const clearNotice = useCallback(() => {
    if (window.location.search.includes('notice=')) {
      window.history.pushState({}, '', '/notices');
    }
  }, []);

  return { pushNotice, clearNotice };
}

// ─── Helpers for view-level navigation ────────────────────────────────────────

/** Call when navigating TO the notices page. */
export function pushNoticesView() {
  if (!window.location.pathname.startsWith('/notices')) {
    window.history.pushState({ view: 'notices' }, '', '/notices');
  }
}

/** Call when navigating AWAY from the notices page. */
export function pushHomeView() {
  window.history.pushState({ view: 'home' }, '', '/');
}
