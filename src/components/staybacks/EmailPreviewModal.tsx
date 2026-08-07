import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Copy, ExternalLink } from 'lucide-react';
import './staybacks.css';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: {
    recipient: string;
    subject: string;
    bodyText: string;
    gmailUrl: string;
    onCopy: () => void;
  };
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  emailData,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="stayback-detail-overlay" onClick={onClose}>
        <motion.div
          className="stayback-detail-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="detail-header">
            <div>
              <span className="stayback-badge-sub">EMAIL PREVIEW</span>
              <h2 className="detail-title">Parent Permission Email</h2>
            </div>
            <button type="button" className="profile-close-btn" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Recipient & Subject Banner */}
          <div className="card-meta-list">
            <div className="card-meta-item">
              <Mail className="card-meta-icon" />
              <span className="font-semibold text-white">To: {emailData.recipient}</span>
            </div>
            <div className="card-meta-item">
              <span className="text-xs text-zinc-400 font-semibold">Subject:</span>
              <span className="text-xs text-zinc-200">{emailData.subject}</span>
            </div>
          </div>

          {/* Email Body Preview Box */}
          <div className="email-preview-box">
            {emailData.bodyText}
          </div>

          {/* Modal Actions */}
          <div className="email-actions-grid mt-2">
            <button
              type="button"
              className="email-action-btn"
              onClick={emailData.onCopy}
            >
              <Copy className="w-4 h-4" /> Copy Template
            </button>

            <a
              href={emailData.gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="email-action-btn primary"
            >
              <ExternalLink className="w-4 h-4" /> Open Gmail Compose
            </a>

            <button
              type="button"
              className="email-action-btn"
              onClick={onClose}
            >
              Close Preview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmailPreviewModal;
