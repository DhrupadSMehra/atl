/**
 * uploadService.ts
 *
 * Abstraction layer for file uploads.
 * The Notice feature never depends on a specific storage backend —
 * swap LocalUploadService for CloudinaryUploadService / S3UploadService
 * here without touching any route or model code.
 */

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

// ─── Public interfaces ─────────────────────────────────────────────────────────

export interface UploadedFile {
  url: string;
  name: string;
  size: number;      // bytes (after processing / compression)
  mimeType: string;
  type: 'image' | 'pdf' | 'document' | 'other';
}

export interface UploadConstraints {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  /** Max pixel width — longer side is resized, shorter scales proportionally */
  maxWidth: number;
  /** WebP quality 0–100 */
  quality: number;
}

export const DEFAULT_IMAGE_CONSTRAINTS: UploadConstraints = {
  maxSizeBytes:      5 * 1024 * 1024,   // 5 MB raw
  allowedMimeTypes:  ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth:          2400,
  quality:           85,
};

export interface UploadService {
  upload(
    file: Express.Multer.File,
    constraints?: Partial<UploadConstraints>
  ): Promise<UploadedFile>;
  delete(url: string): Promise<void>;
}

// ─── LocalUploadService ────────────────────────────────────────────────────────

class LocalUploadService implements UploadService {
  private readonly uploadDir: string;
  private readonly urlBase: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', 'notices');
    this.urlBase   = '/uploads/notices';
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async upload(
    file: Express.Multer.File,
    constraints: Partial<UploadConstraints> = {}
  ): Promise<UploadedFile> {
    const cfg = { ...DEFAULT_IMAGE_CONSTRAINTS, ...constraints };

    // ── Validate MIME type ──────────────────────────────────────────────────
    if (!cfg.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        `"${file.originalname}": unsupported type "${file.mimetype}". ` +
        `Allowed: ${cfg.allowedMimeTypes.join(', ')}.`
      );
    }

    // ── Validate raw size before processing ────────────────────────────────
    if (file.size > cfg.maxSizeBytes) {
      const maxMB = (cfg.maxSizeBytes / (1024 * 1024)).toFixed(0);
      const gotMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `"${file.originalname}": file too large (${gotMB} MB). Max allowed: ${maxMB} MB.`
      );
    }

    await this.ensureDir();

    // ── Process with sharp ─────────────────────────────────────────────────
    // Lazy import to avoid crashing if sharp native binary isn't ready yet
    let processedBuffer: Buffer;
    try {
      const sharp = (await import('sharp')).default;
      processedBuffer = await sharp(file.buffer)
        .resize({ width: cfg.maxWidth, withoutEnlargement: true })
        .webp({ quality: cfg.quality })
        .toBuffer();
    } catch {
      // Fallback: store original buffer if sharp fails (dev/CI safety)
      processedBuffer = file.buffer;
    }

    const uniqueName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}.webp`;
    const outputPath = path.join(this.uploadDir, uniqueName);
    await fs.writeFile(outputPath, processedBuffer);

    return {
      url:      `${this.urlBase}/${uniqueName}`,
      name:     file.originalname,
      size:     processedBuffer.length,
      mimeType: 'image/webp',
      type:     'image',
    };
  }

  async delete(url: string): Promise<void> {
    try {
      const filename = path.basename(url);
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
    } catch {
      // Silently ignore missing files during cleanup
    }
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

/**
 * Active upload service singleton.
 * To swap storage backends, replace `new LocalUploadService()` with
 * `new CloudinaryUploadService()` or `new S3UploadService()`.
 */
export const uploadService: UploadService = new LocalUploadService();
