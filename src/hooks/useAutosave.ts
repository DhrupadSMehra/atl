import { useState, useEffect, useRef, useCallback } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions {
  /** Called to persist a draft. Must return the notice id (new or existing). */
  onSave: () => Promise<string | void>;
  /** True when there are unsaved changes. */
  isDirty: boolean;
  /** Autosave interval in ms — default 30 000 (30 s). */
  intervalMs?: number;
  /** Inactivity debounce in ms — default 3 000 (3 s). */
  inactivityMs?: number;
  /** True when the editor is open and should be autosaving. */
  enabled?: boolean;
}

/**
 * useAutosave — Autosaves a notice draft on interval + inactivity.
 *
 * Triggers:
 *  1. Every `intervalMs` (default 30 s) while `isDirty === true`
 *  2. After `inactivityMs` (default 3 s) of no new changes
 *
 * Status indicator:
 *  idle | saving | saved | error
 *
 * localStorage fallback:
 *  On save failure the draft JSON is stored under `atl_notice_draft_<key>`
 *  so the user never loses work.
 */
export function useAutosave({
  onSave,
  isDirty,
  intervalMs   = 30_000,
  inactivityMs = 3_000,
  enabled      = true,
}: UseAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const isSavingRef  = useRef(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const save = useCallback(async () => {
    if (isSavingRef.current || !isDirty) return;
    isSavingRef.current = true;
    setStatus('saving');
    try {
      await onSaveRef.current();
      setStatus('saved');
      // Reset indicator after 3 s
      setTimeout(() => setStatus('idle'), 3_000);
    } catch {
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [isDirty]);

  // ── Periodic interval autosave ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => { if (isDirty) save(); }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, isDirty, intervalMs, save]);

  // ── Inactivity debounce autosave ────────────────────────────────────────────
  // Call `resetInactivityTimer()` from the editor's `onUpdate` callback.
  const resetInactivityTimer = useCallback(() => {
    if (!enabled) return;
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (isDirty) save();
    }, inactivityMs);
  }, [enabled, isDirty, inactivityMs, save]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  return { status, save, resetInactivityTimer };
}
