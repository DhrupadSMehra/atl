import React from 'react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import DOMPurify from 'dompurify';

// ─── Extensions must match the editor extensions exactly ──────────────────────

const RENDER_EXTENSIONS = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

// ─── Component ────────────────────────────────────────────────────────────────

interface TiptapRendererProps {
  /** Tiptap / ProseMirror JSON document from the database */
  content: Record<string, unknown> | null | undefined;
  className?: string;
}

/**
 * TiptapRenderer
 *
 * Converts a stored Tiptap JSON document to safe HTML using the same
 * extension set as the editor — guaranteeing render fidelity.
 * DOMPurify sanitizes the output as a final defence-in-depth layer.
 */
const TiptapRenderer: React.FC<TiptapRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  let html = '';
  try {
    const rawHTML = generateHTML(content as Parameters<typeof generateHTML>[0], RENDER_EXTENSIONS);
    html = DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote', 'hr',
        'a', 'span', 'div',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    });
  } catch (err) {
    console.warn('[TiptapRenderer] Failed to generate HTML from JSON:', err);
    return null;
  }

  return (
    <div
      className={`nd-content ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default TiptapRenderer;

// ─── Text extractor (for preview snippets) ────────────────────────────────────

export function extractPlainText(content: Record<string, unknown> | null | undefined): string {
  if (!content) return '';
  const texts: string[] = [];
  function walk(node: Record<string, unknown>) {
    if (node.type === 'text' && typeof node.text === 'string') texts.push(node.text);
    if (Array.isArray(node.content)) (node.content as Record<string, unknown>[]).forEach(walk);
  }
  walk(content);
  return texts.join(' ');
}
