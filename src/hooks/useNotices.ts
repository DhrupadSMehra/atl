import { useState, useCallback } from 'react';
import type {
  INotice,
  NoticeStatus,
  NoticeCategory,
  NoticeListResponse,
  NoticeSingleResponse,
} from '../components/notices/noticeConstants';

// ─── API base ──────────────────────────────────────────────────────────────────

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

function token(): string {
  return localStorage.getItem('atl_jwt_token') || '';
}

function authJSON(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` };
}
function authMultipart(): HeadersInit {
  return { Authorization: `Bearer ${token()}` };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, options);
  const ct  = res.headers.get('content-type') ?? '';
  const body = ct.includes('application/json') ? await res.json() : { success: false, error: `HTTP ${res.status}` };
  if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
  return body as T;
}

// ─── Filter params ─────────────────────────────────────────────────────────────

export interface NoticeFilters {
  search?:   string;
  category?: NoticeCategory | 'All';
  pinned?:   boolean;
  status?:   NoticeStatus | '';
  page?:     number;
  limit?:    number;
}

// ─── Form data type for create/update ─────────────────────────────────────────

export interface NoticeFormData {
  title:            string;
  subtitle?:        string;
  content?:         Record<string, unknown>;
  category:         NoticeCategory;
  status:           NoticeStatus;
  pinned:           boolean;
  coverImageIndex?: number;
  /** New files to upload */
  newImages?:       File[];
  /** Attachments already on the server to keep */
  existingAttachments?: INotice['attachments'];
  /** URLs to remove from the server */
  removedUrls?:     string[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotices() {
  const [loading,     setLoading]     = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Fetch list ───────────────────────────────────────────────────────────────
  const fetchNotices = useCallback(async (filters: NoticeFilters = {}): Promise<NoticeListResponse> => {
    setListLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search)   params.set('search',   filters.search);
      if (filters.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters.pinned)   params.set('pinned',   'true');
      if (filters.status)   params.set('status',   filters.status);
      if (filters.page)     params.set('page',     String(filters.page));
      if (filters.limit)    params.set('limit',    String(filters.limit));

      const qs = params.toString();
      return await apiFetch<NoticeListResponse>(`/api/notices${qs ? `?${qs}` : ''}`, {
        headers: authJSON(),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load notices';
      setError(msg);
      throw e;
    } finally {
      setListLoading(false);
    }
  }, []);

  // ── Fetch single ─────────────────────────────────────────────────────────────
  const fetchNotice = useCallback(async (id: string): Promise<INotice> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<NoticeSingleResponse>(`/api/notices/${id}`, { headers: authJSON() });
      return res.notice;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load notice';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Build FormData for create/update ─────────────────────────────────────────
  function buildFormData(data: NoticeFormData): FormData {
    const fd = new FormData();
    fd.append('title',            data.title);
    if (data.subtitle)            fd.append('subtitle', data.subtitle);
    if (data.content)             fd.append('content',  JSON.stringify(data.content));
    fd.append('category',         data.category);
    fd.append('status',           data.status);
    fd.append('pinned',           String(data.pinned));
    if (data.coverImageIndex != null) fd.append('coverImageIndex', String(data.coverImageIndex));
    if (data.existingAttachments) fd.append('existingAttachments', JSON.stringify(data.existingAttachments));
    if (data.removedUrls?.length) fd.append('removedUrls',         JSON.stringify(data.removedUrls));
    for (const file of data.newImages ?? []) {
      fd.append('images', file);
    }
    return fd;
  }

  // ── Create ───────────────────────────────────────────────────────────────────
  const createNotice = useCallback(async (data: NoticeFormData): Promise<INotice> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<NoticeSingleResponse>('/api/notices', {
        method:  'POST',
        headers: authMultipart(),
        body:    buildFormData(data),
      });
      return res.notice;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create notice';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update ───────────────────────────────────────────────────────────────────
  const updateNotice = useCallback(async (id: string, data: NoticeFormData): Promise<INotice> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<NoticeSingleResponse>(`/api/notices/${id}`, {
        method:  'PUT',
        headers: authMultipart(),
        body:    buildFormData(data),
      });
      return res.notice;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update notice';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteNotice = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch<{ success: boolean }>(`/api/notices/${id}`, {
        method:  'DELETE',
        headers: authJSON(),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete notice';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Toggle pin ───────────────────────────────────────────────────────────────
  const togglePin = useCallback(async (id: string): Promise<INotice> => {
    const res = await apiFetch<NoticeSingleResponse>(`/api/notices/${id}/pin`, {
      method: 'PATCH', headers: authJSON(),
    });
    return res.notice;
  }, []);

  // ── Set status ───────────────────────────────────────────────────────────────
  const setStatus = useCallback(async (id: string, status: NoticeStatus): Promise<INotice> => {
    const res = await apiFetch<NoticeSingleResponse>(`/api/notices/${id}/status`, {
      method:  'PATCH',
      headers: authJSON(),
      body:    JSON.stringify({ status }),
    });
    return res.notice;
  }, []);

  // ── Duplicate ────────────────────────────────────────────────────────────────
  const duplicateNotice = useCallback(async (id: string): Promise<INotice> => {
    const res = await apiFetch<NoticeSingleResponse>(`/api/notices/${id}/duplicate`, {
      method: 'POST', headers: authJSON(),
    });
    return res.notice;
  }, []);

  return {
    loading,
    listLoading,
    error,
    fetchNotices,
    fetchNotice,
    createNotice,
    updateNotice,
    deleteNotice,
    togglePin,
    setStatus,
    duplicateNotice,
  };
}
