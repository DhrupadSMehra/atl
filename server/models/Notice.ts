import mongoose, { Schema, Document } from 'mongoose';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type NoticeStatus = 'draft' | 'published' | 'archived';

export type NoticeCategory =
  | 'General'
  | 'Announcement'
  | 'Event'
  | 'Research'
  | 'Achievement'
  | 'Reminder'
  | 'Workshop';

export interface IAttachment {
  type: 'image' | 'pdf' | 'document' | 'other';
  name: string;
  url: string;
  size: number;     // bytes (after processing)
  mimeType: string;
}

export interface IEditedBy {
  id: string;
  name: string;
  position?: string;
}

export interface INotice extends Document {
  title: string;
  subtitle?: string;
  /** Tiptap / ProseMirror JSON document — NOT sanitised HTML */
  content?: Record<string, unknown>;
  /** Plain-text extraction of content for full-text search */
  contentText?: string;
  coverImage?: string;
  attachments: IAttachment[];
  category: NoticeCategory;
  status: NoticeStatus;
  pinned: boolean;
  authorId: string;
  authorName: string;
  authorPosition?: string;
  editedAt?: Date;
  editedBy?: IEditedBy;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ───────────────────────────────────────────────────────────────

const AttachmentSchema = new Schema<IAttachment>(
  {
    type: {
      type: String,
      enum: ['image', 'pdf', 'document', 'other'],
      required: true,
    },
    name: { type: String, required: true },
    url:  { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

const EditedBySchema = new Schema<IEditedBy>(
  {
    id:       { type: String, required: true },
    name:     { type: String, required: true },
    position: { type: String },
  },
  { _id: false }
);

// ─── Main schema ───────────────────────────────────────────────────────────────

const NoticeSchema = new Schema<INotice>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    subtitle:    { type: String, trim: true, maxlength: 300 },
    content:     { type: Schema.Types.Mixed },           // Tiptap JSON
    contentText: { type: String },                       // plain text for search
    coverImage:  { type: String },
    attachments: { type: [AttachmentSchema], default: [] },
    category: {
      type: String,
      enum: ['General', 'Announcement', 'Event', 'Research', 'Achievement', 'Reminder', 'Workshop'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    pinned:          { type: Boolean, default: false },
    authorId:        { type: String, required: true },
    authorName:      { type: String, required: true },
    authorPosition:  { type: String },
    editedAt:        { type: Date },
    editedBy:        { type: EditedBySchema },
  },
  { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

// Text index for search
NoticeSchema.index({ title: 'text', subtitle: 'text', contentText: 'text' });

// Compound indexes for common queries
NoticeSchema.index({ status: 1, pinned: -1, createdAt: -1 });
NoticeSchema.index({ category: 1, status: 1 });
NoticeSchema.index({ pinned: -1, createdAt: -1 });

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
