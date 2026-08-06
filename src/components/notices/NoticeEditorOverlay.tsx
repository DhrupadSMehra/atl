import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { motion } from 'framer-motion';
import type { INotice, NoticeCategory, NoticeStatus, IAttachment } from './noticeConstants';
import { NOTICE_CATEGORIES, NOTICE_STATUSES, UPLOAD_CONSTRAINTS } from './noticeConstants';
import type { NoticeFormData } from '../../hooks/useNotices';
import { useAutosave } from '../../hooks/useAutosave';

type EditorInstance = ReturnType<typeof useEditor>;

const TB = ({ label, isActive, onClick, title }: {
  label: React.ReactNode; isActive?: boolean; onClick: () => void; title: string;
}) => (
  <button
    type="button"
    className={`ne-tb-btn ${isActive ? 'active' : ''}`}
    onClick={onClick}
    title={title}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

const Sep = () => <div className="ne-tb-sep" aria-hidden="true" />;

// ─── Toolbar (No emojis) ───────────────────────────────────────────────────────

const EditorToolbar: React.FC<{ editor: EditorInstance }> = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('Enter URL:', editor.getAttributes('link').href || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  return (
    <div className="ne-toolbar" role="toolbar" aria-label="Text formatting">
      <TB label="H1" isActive={editor.isActive('heading', { level: 1 })} title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <TB label="H2" isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <TB label="H3" isActive={editor.isActive('heading', { level: 3 })} title="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <Sep />

      <TB label={<strong>B</strong>} isActive={editor.isActive('bold')} title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()} />
      <TB label={<em>I</em>} isActive={editor.isActive('italic')} title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()} />
      <TB label={<u>U</u>} isActive={editor.isActive('underline')} title="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <Sep />

      <TB label="Bullet List" isActive={editor.isActive('bulletList')} title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <TB label="Numbered List" isActive={editor.isActive('orderedList')} title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Sep />

      <TB label="Left" isActive={editor.isActive({ textAlign: 'left' })} title="Align left"
        onClick={() => editor.chain().focus().setTextAlign('left').run()} />
      <TB label="Center" isActive={editor.isActive({ textAlign: 'center' })} title="Align center"
        onClick={() => editor.chain().focus().setTextAlign('center').run()} />
      <TB label="Right" isActive={editor.isActive({ textAlign: 'right' })} title="Align right"
        onClick={() => editor.chain().focus().setTextAlign('right').run()} />
      <Sep />

      <TB label="Quote" isActive={editor.isActive('blockquote')} title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <TB label="Divider" title="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <TB label="Link" isActive={editor.isActive('link')} title="Insert / edit link"
        onClick={setLink} />
      <Sep />

      <TB label="Undo" title="Undo" onClick={() => editor.chain().focus().undo().run()} />
      <TB label="Redo" title="Redo" onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
};

// ─── Image uploader (No emojis) ────────────────────────────────────────────────

interface UploaderProps {
  previews:        { file: File; objectUrl: string }[];
  existingAttachments: IAttachment[];
  coverImageIndex: number;
  onAddFiles:      (files: File[]) => void;
  onRemoveNew:     (idx: number) => void;
  onRemoveExisting:(url: string) => void;
  onSetCover:      (idx: number, isExisting: boolean) => void;
  existingCoverUrl?: string;
}

const ImageUploader: React.FC<UploaderProps> = ({
  previews, existingAttachments, coverImageIndex,
  onAddFiles, onRemoveNew, onRemoveExisting, onSetCover, existingCoverUrl,
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);

  const totalCount = existingAttachments.length + previews.length;
  const remaining  = UPLOAD_CONSTRAINTS.MAX_FILES - totalCount;

  const processFiles = (files: FileList | File[]) => {
    const arr    = Array.from(files);
    const images = arr.filter(f => UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(f.type as 'image/jpeg'));
    onAddFiles(images.slice(0, remaining));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  return (
    <div className="ne-images-section">
      <div className="ne-images-label-row">
        <span className="ne-label">Images</span>
        <span className="ne-img-count">{totalCount} / {UPLOAD_CONSTRAINTS.MAX_FILES}</span>
      </div>

      {remaining > 0 && (
        <div
          className={`ne-dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Drop images or click to select"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: 'var(--nb-text-muted)' }}>
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="ne-dz-text">Drop images here or click to select</span>
          <span className="ne-dz-sub">
            JPG, PNG, WEBP · Max {UPLOAD_CONSTRAINTS.MAX_SIZE_MB} MB · {remaining} slot{remaining !== 1 ? 's' : ''} remaining
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={UPLOAD_CONSTRAINTS.ALLOWED_TYPES.join(',')}
            multiple
            style={{ display: 'none' }}
            onChange={e => e.target.files && processFiles(e.target.files)}
          />
        </div>
      )}

      {(existingAttachments.length > 0 || previews.length > 0) && (
        <div className="ne-img-grid">
          {existingAttachments.map((att, i) => {
            const isCover = existingCoverUrl === att.url;
            return (
              <div key={att.url} className={`ne-img-thumb ${isCover ? 'cover-active' : ''}`}>
                <img src={att.url} alt={att.name} loading="lazy" />
                {isCover && <div className="ne-cover-label">COVER</div>}
                <div className="ne-img-thumb-overlay">
                  <button className="ne-img-action-btn" title="Set as cover"
                    onClick={() => onSetCover(i, true)}>Cover</button>
                  <button className="ne-img-action-btn" title="Remove"
                    onClick={() => onRemoveExisting(att.url)}>Remove</button>
                </div>
              </div>
            );
          })}

          {previews.map((p, i) => {
            const globalIdx = existingAttachments.length + i;
            const isCover   = coverImageIndex === globalIdx && !existingCoverUrl;
            return (
              <div key={p.objectUrl} className={`ne-img-thumb ${isCover ? 'cover-active' : ''}`}>
                <img src={p.objectUrl} alt={p.file.name} loading="lazy" />
                {isCover && <div className="ne-cover-label">COVER</div>}
                <div className="ne-img-thumb-overlay">
                  <button className="ne-img-action-btn" title="Set as cover"
                    onClick={() => onSetCover(globalIdx, false)}>Cover</button>
                  <button className="ne-img-action-btn" title="Remove"
                    onClick={() => onRemoveNew(i)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Editor Overlay ───────────────────────────────────────────────────────

interface NoticeEditorOverlayProps {
  existingNotice?: INotice | null;
  authorName:      string;
  onSave:          (data: NoticeFormData, publish: boolean) => Promise<void>;
  onClose:         () => void;
}

const NoticeEditorOverlay: React.FC<NoticeEditorOverlayProps> = ({
  existingNotice, authorName, onSave, onClose,
}) => {
  const [title,    setTitle]    = useState(existingNotice?.title    ?? '');
  const [subtitle, setSubtitle] = useState(existingNotice?.subtitle ?? '');
  const [category, setCategory] = useState<NoticeCategory>(existingNotice?.category ?? 'General');
  const [status,   setStatus]   = useState<NoticeStatus>(existingNotice?.status   ?? 'draft');
  const [pinned,   setPinned]   = useState(existingNotice?.pinned   ?? false);
  const [saving,   setSaving]   = useState(false);

  const [coverImageIndex,  setCoverImageIndex]  = useState(0);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | undefined>(existingNotice?.coverImage);
  const [existingAttachments, setExistingAttachments] = useState<IAttachment[]>(existingNotice?.attachments ?? []);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<{ file: File; objectUrl: string }[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.objectUrl));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your notice here…' }),
    ],
    content: existingNotice?.content ?? undefined,
    onUpdate: () => {
      setIsDirty(true);
      resetInactivityTimer();
    },
  });

  const { resetInactivityTimer, status: autosaveStatus } = useAutosave({
    onSave: async () => {
      if (!isDirty || !title.trim()) return;
      const data = buildFormDataFn('draft');
      await onSave(data, false);
    },
    isDirty,
    enabled: true,
  });

  useEffect(() => { setIsDirty(true); }, [title, subtitle, category, status, pinned]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isDirty]);

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard and close?')) return;
    onClose();
  };

  const addFiles = useCallback((files: File[]) => {
    const newPreviews = files.map(f => ({ file: f, objectUrl: URL.createObjectURL(f) }));
    setPreviews(prev => [...prev, ...newPreviews]);
    setIsDirty(true);
  }, []);

  const removeNewImage = useCallback((idx: number) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[idx].objectUrl);
      return prev.filter((_, i) => i !== idx);
    });
    setIsDirty(true);
  }, []);

  const removeExistingImage = useCallback((url: string) => {
    setExistingAttachments(prev => prev.filter(a => a.url !== url));
    setRemovedUrls(prev => [...prev, url]);
    if (existingCoverUrl === url) setExistingCoverUrl(undefined);
    setIsDirty(true);
  }, [existingCoverUrl]);

  const setCover = useCallback((idx: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingCoverUrl(existingAttachments[idx]?.url);
      setCoverImageIndex(0);
    } else {
      setExistingCoverUrl(undefined);
      setCoverImageIndex(idx);
    }
    setIsDirty(true);
  }, [existingAttachments]);

  const buildFormDataFn = (overrideStatus?: NoticeStatus): NoticeFormData => ({
    title,
    subtitle: subtitle || undefined,
    content:  editor ? editor.getJSON() : undefined,
    category,
    status:   overrideStatus ?? status,
    pinned,
    coverImageIndex,
    newImages:            previews.map(p => p.file),
    existingAttachments,
    removedUrls,
  });

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) { alert('Please enter a title.'); return; }
    setSaving(true);
    try {
      const data = buildFormDataFn(publish ? 'published' : 'draft');
      await onSave(data, publish);
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const autosaveLabel =
    autosaveStatus === 'saving' ? 'Saving…' :
    autosaveStatus === 'saved'  ? 'Draft saved' :
    autosaveStatus === 'error'  ? 'Save failed' : '';

  const isEditing = !!existingNotice;

  return (
    <div className="nb-overlay-bg" onClick={handleClose} style={{ zIndex: 9500 }}>
      <motion.div
        className="ne-panel"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{    opacity: 0, y: 24 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit Notice' : 'New Notice'}
      >
        {/* Header */}
        <div className="ne-header">
          <div className="ne-header-left">
            <span className="ne-title-text">{isEditing ? 'Edit Notice' : 'New Notice'}</span>
            {autosaveLabel && (
              <span className={`ne-autosave ${autosaveStatus}`}>{autosaveLabel}</span>
            )}
          </div>
          <div className="ne-header-right">
            <button className="ne-btn ne-btn-ghost" onClick={handleClose} id="editor-cancel-btn">
              Cancel
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ne-body">
          <div className="ne-fields">
            <div className="ne-field">
              <label className="ne-label" htmlFor="ne-title">Title *</label>
              <input
                id="ne-title"
                className="ne-input"
                placeholder="Notice title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                required
                autoFocus
              />
            </div>

            <div className="ne-field">
              <label className="ne-label" htmlFor="ne-subtitle">Subtitle</label>
              <input
                id="ne-subtitle"
                className="ne-input"
                placeholder="Optional subtitle"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                maxLength={300}
              />
            </div>

            <div className="ne-row">
              <div className="ne-field">
                <label className="ne-label" htmlFor="ne-category">Category</label>
                <select
                  id="ne-category"
                  className="ne-select"
                  value={category}
                  onChange={e => setCategory(e.target.value as NoticeCategory)}
                >
                  {NOTICE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="ne-field">
                <label className="ne-label" htmlFor="ne-status">Status</label>
                <select
                  id="ne-status"
                  className="ne-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as NoticeStatus)}
                >
                  {NOTICE_STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="ne-field">
                <label className="ne-label">Options</label>
                <div className="ne-toggle-wrap">
                  <div
                    className={`ne-toggle ${pinned ? 'on' : ''}`}
                    onClick={() => setPinned(p => !p)}
                    role="switch"
                    aria-checked={pinned}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setPinned(p => !p)}
                    id="ne-pin-toggle"
                  />
                  <label className="ne-toggle-label" htmlFor="ne-pin-toggle">
                    Pin to top
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--nb-border-color)' }}>
            <EditorToolbar editor={editor} />
            <div className="ne-editor-wrap" style={{ paddingBottom: 16 }}>
              <EditorContent editor={editor} />
            </div>
          </div>

          <ImageUploader
            previews={previews}
            existingAttachments={existingAttachments}
            coverImageIndex={coverImageIndex}
            existingCoverUrl={existingCoverUrl}
            onAddFiles={addFiles}
            onRemoveNew={removeNewImage}
            onRemoveExisting={removeExistingImage}
            onSetCover={setCover}
          />
        </div>

        {/* Footer */}
        <div className="ne-footer">
          <div className="ne-footer-left">
            <span style={{ fontSize: '0.8rem', color: 'var(--nb-text-muted)' }}>
              Author: <strong style={{ color: 'var(--nb-text-main)' }}>{authorName}</strong>
            </span>
          </div>
          <div className="ne-footer-right">
            <button
              className="ne-btn ne-btn-secondary"
              onClick={() => handleSubmit(false)}
              disabled={saving || !title.trim()}
              id="editor-save-draft-btn"
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              className="ne-btn ne-btn-primary"
              onClick={() => handleSubmit(true)}
              disabled={saving || !title.trim()}
              id="editor-publish-btn"
            >
              {saving ? 'Publishing…' : isEditing ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticeEditorOverlay;
