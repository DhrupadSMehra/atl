import { Router, Response } from 'express';
import multer from 'multer';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { Notice } from '../models/Notice';
import { uploadService } from '../services/uploadService';

const router = Router();

// ─── Multer — in-memory, raw size guard ────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 6 * 1024 * 1024 },   // 6 MB raw ceiling; sharp enforces 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.mimetype}" for "${file.originalname}".`));
    }
  },
});

// ─── Local admin check ─────────────────────────────────────────────────────────
const requireAdmin = (req: AuthRequest, res: Response, next: () => void): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required.' });
    return;
  }
  next();
};

// ─── Utility: extract plain text from Tiptap JSON for search ──────────────────
function extractText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';
  const texts: string[] = [];
  function walk(node: Record<string, unknown>) {
    if (node.type === 'text' && typeof node.text === 'string') {
      texts.push(node.text);
    }
    if (Array.isArray(node.content)) {
      (node.content as Record<string, unknown>[]).forEach(walk);
    }
  }
  walk(doc as Record<string, unknown>);
  return texts.join(' ');
}

// ─── Utility: parse JSON field sent as string ──────────────────────────────────
function parseField<T>(raw: unknown): T | null {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw as T;
  try { return JSON.parse(raw as string) as T; } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/notices
// Viewers: published only. Admins: all statuses (or filter by ?status=).
// Query params: ?search= ?category= ?pinned= ?status= ?page= ?limit=
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const page    = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit   = Math.min(50, parseInt(req.query.limit as string) || 12);
    const skip    = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Status
    if (!isAdmin) {
      filter.status = 'published';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    // Category
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Pinned
    if (req.query.pinned === 'true') {
      filter.pinned = true;
    }

    // Search (regex across title, subtitle, contentText)
    if (req.query.search) {
      const rx = { $regex: String(req.query.search), $options: 'i' };
      filter.$or = [{ title: rx }, { subtitle: rx }, { contentText: rx }];
    }

    const [notices, total] = await Promise.all([
      Notice.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notice.countDocuments(filter),
    ]);

    res.json({
      success: true,
      notices,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Notices] GET / error:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/notices/:id
// Viewers can only fetch published notices.
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id).lean();
    if (!notice) { res.status(404).json({ success: false, error: 'Notice not found.' }); return; }
    if (req.user?.role !== 'admin' && notice.status !== 'published') {
      res.status(403).json({ success: false, error: 'Access denied.' }); return;
    }
    res.json({ success: true, notice });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: msg });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/notices — create
// Multipart fields: title, subtitle, content (JSON string), category, status,
//                   pinned, coverImageIndex
// Files: images[] (up to 10)
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/', verifyToken, requireAdmin, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  try {
    const { title, subtitle, category, status, pinned, coverImageIndex } = req.body;
    if (!title?.trim()) { res.status(400).json({ success: false, error: 'Title is required.' }); return; }

    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length > 10) { res.status(400).json({ success: false, error: 'Maximum 10 images allowed.' }); return; }

    // Upload all images
    const uploadErrors: string[] = [];
    const attachments = [];
    for (const file of files) {
      try {
        attachments.push(await uploadService.upload(file));
      } catch (e: unknown) {
        uploadErrors.push(e instanceof Error ? e.message : String(e));
      }
    }
    if (uploadErrors.length) {
      res.status(400).json({ success: false, error: uploadErrors.join(' | ') }); return;
    }

    const content     = parseField<Record<string, unknown>>(req.body.content);
    const contentText = content ? extractText(content) : '';
    const coverIdx    = Math.min(parseInt(coverImageIndex) || 0, attachments.length - 1);
    const coverImage  = attachments.length > 0 ? attachments[Math.max(0, coverIdx)].url : undefined;

    const now    = new Date();
    const notice = await Notice.create({
      title:       title.trim(),
      subtitle:    subtitle?.trim() || undefined,
      content,
      contentText,
      coverImage,
      attachments,
      category:    category || 'General',
      status:      status   || 'draft',
      pinned:      pinned === 'true' || pinned === true,
      authorId:    req.user!.id,
      authorName:  req.user!.name,
      editedAt:    now,
      editedBy:    { id: req.user!.id, name: req.user!.name },
    });

    console.log(`[Notices] Created notice "${notice.title}" (${notice._id}) by ${req.user!.name}`);
    res.status(201).json({ success: true, notice });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Notices] POST / error:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/notices/:id — update
// Accepts existing attachment JSON + new image files + list of removed URLs.
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) { res.status(404).json({ success: false, error: 'Notice not found.' }); return; }

    const { title, subtitle, category, status, pinned, coverImageIndex } = req.body;
    const files = (req.files as Express.Multer.File[]) ?? [];

    // Upload new images
    const newAttachments = [];
    for (const file of files) {
      newAttachments.push(await uploadService.upload(file));
    }

    // Parse kept attachments (sent by client as JSON string)
    const keptAttachments = parseField<{ url: string; name: string; size: number; mimeType: string; type: string }[]>(req.body.existingAttachments) ?? [];

    // Delete removed files
    const removedUrls = parseField<string[]>(req.body.removedUrls) ?? [];
    for (const url of removedUrls) {
      await uploadService.delete(url);
    }

    const allAttachments = [...keptAttachments, ...newAttachments];
    const content     = parseField<Record<string, unknown>>(req.body.content) ?? notice.content;
    const contentText = content ? extractText(content) : '';
    const coverIdx    = Math.min(parseInt(coverImageIndex) || 0, allAttachments.length - 1);
    const coverImage  = allAttachments.length > 0
      ? allAttachments[Math.max(0, coverIdx)].url
      : undefined;

    Object.assign(notice, {
      title:       title?.trim()    || notice.title,
      subtitle:    subtitle?.trim() || undefined,
      content,
      contentText,
      coverImage,
      attachments: allAttachments,
      category:    category || notice.category,
      status:      status   || notice.status,
      pinned:      pinned !== undefined ? (pinned === 'true' || pinned === true) : notice.pinned,
      editedAt:    new Date(),
      editedBy:    { id: req.user!.id, name: req.user!.name },
    });

    await notice.save();
    console.log(`[Notices] Updated notice "${notice.title}" (${notice._id}) by ${req.user!.name}`);
    res.json({ success: true, notice });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Notices] PUT /:id error:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/notices/:id
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) { res.status(404).json({ success: false, error: 'Notice not found.' }); return; }

    for (const att of notice.attachments) {
      await uploadService.delete(att.url);
    }

    await notice.deleteOne();
    console.log(`[Notices] Deleted notice (${req.params.id}) by ${req.user!.name}`);
    res.json({ success: true, message: 'Notice deleted.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: msg });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/notices/:id/pin  — toggle pinned
// ═══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/pin', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) { res.status(404).json({ success: false, error: 'Notice not found.' }); return; }
    notice.pinned   = !notice.pinned;
    notice.editedAt = new Date();
    notice.editedBy = { id: req.user!.id, name: req.user!.name };
    await notice.save();
    res.json({ success: true, notice });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/notices/:id/status  — set status (draft | published | archived)
// ═══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/status', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status value.' }); return;
    }
    const notice = await Notice.findById(req.params.id);
    if (!notice) { res.status(404).json({ success: false, error: 'Notice not found.' }); return; }
    notice.status   = status;
    notice.editedAt = new Date();
    notice.editedBy = { id: req.user!.id, name: req.user!.name };
    await notice.save();
    res.json({ success: true, notice });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/notices/:id/duplicate
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/:id/duplicate', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const source = await Notice.findById(req.params.id).lean();
    if (!source) { res.status(404).json({ success: false, error: 'Notice not found.' }); return; }

    const { _id, createdAt, updatedAt, ...rest } = source as Record<string, unknown>;
    void _id; void createdAt; void updatedAt;

    const now       = new Date();
    const duplicate = await Notice.create({
      ...rest,
      title:      `${source.title} (Copy)`,
      status:     'draft',
      pinned:     false,
      authorId:   req.user!.id,
      authorName: req.user!.name,
      editedAt:   now,
      editedBy:   { id: req.user!.id, name: req.user!.name },
    });

    console.log(`[Notices] Duplicated notice "${source.title}" → "${duplicate.title}" (${duplicate._id})`);
    res.status(201).json({ success: true, notice: duplicate });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Notices] POST /:id/duplicate error:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
