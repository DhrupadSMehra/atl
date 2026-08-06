// ─── Notice Categories ─────────────────────────────────────────────────────────

export const NOTICE_CATEGORIES = [
  'General',
  'Announcement',
  'Event',
  'Research',
  'Achievement',
  'Reminder',
  'Workshop',
] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

// ─── Notice Status ─────────────────────────────────────────────────────────────

export const NOTICE_STATUSES = ['draft', 'published', 'archived'] as const;
export type NoticeStatus = (typeof NOTICE_STATUSES)[number];

export const STATUS_LABELS: Record<NoticeStatus, string> = {
  draft:     'Draft',
  published: 'Published',
  archived:  'Archived',
};

export const STATUS_COLORS: Record<NoticeStatus, string> = {
  draft:     '#d97706',
  published: '#16a34a',
  archived:  '#64748b',
};

// ─── Upload Constraints ────────────────────────────────────────────────────────

export const UPLOAD_CONSTRAINTS = {
  MAX_FILES:         10,
  MAX_SIZE_MB:       5,
  MAX_SIZE_BYTES:    5 * 1024 * 1024,
  ALLOWED_TYPES:     ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTS:      ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// ─── Attachment type ───────────────────────────────────────────────────────────

export interface IAttachment {
  type:     'image' | 'pdf' | 'document' | 'other';
  name:     string;
  url:      string;
  size:     number;
  mimeType: string;
}

// ─── Notice type ───────────────────────────────────────────────────────────────

export interface INotice {
  _id:            string;
  title:          string;
  subtitle?:      string;
  content?:       Record<string, unknown>;
  coverImage?:    string;
  attachments:    IAttachment[];
  category:       NoticeCategory;
  status:         NoticeStatus;
  pinned:         boolean;
  authorId:       string;
  authorName:     string;
  authorPosition?:string;
  editedAt?:      string;
  editedBy?: {
    id:        string;
    name:      string;
    position?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── API response types ────────────────────────────────────────────────────────

export interface NoticeListResponse {
  success: true;
  notices: INotice[];
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

export interface NoticeSingleResponse {
  success: true;
  notice:  INotice;
}
