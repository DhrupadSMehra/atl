import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Copy, ExternalLink, Eye, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { StayBackCardData } from './StayBackCard';
import EmailPreviewModal from './EmailPreviewModal';
import './staybacks.css';

interface ApplyStayBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  stayBack: StayBackCardData;
  onSuccess: () => void;
}

const COORDINATOR_EMAIL = 'raksha.ghildiyal_sajsvg@jaipuria.edu.in';

export const ApplyStayBackModal: React.FC<ApplyStayBackModalProps> = ({
  isOpen,
  onClose,
  stayBack,
  onSuccess,
}) => {
  const { member } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [hasSentEmail, setHasSentEmail] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !member) return null;

  const studentName = member.fullName || 'Student Name';
  const classSection = `Class ${member.studentClass}-${member.section}`;
  const stayDateFormatted = new Date(stayBack.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const subjectText = `ATL StayBack Permission – ${stayBack.title}`;

  const bodyText = `Dear Ma'am,

I kindly request you to allow my ward, ${studentName}, of ${classSection}, to stay back after school hours on ${stayDateFormatted} for work related to the Atal Tinkering Lab (ATL) Department.

The stay-back timings will be from ${stayBack.startTime} to ${stayBack.endTime}. During this period, my ward will be working on ${stayBack.projectName} as part of the ATL Department's ongoing work.

After the stay-back, my ward will [leave the school independently / be picked up by a parent or guardian].

I assure you that my ward will adhere to all school rules and maintain proper discipline during the stay-back period.

Kindly grant permission for the same.

Thank you.

Yours sincerely,

[Parent/Guardian's Name]
Parent/Guardian of ${studentName}
Contact Number: ${member.contactNumber || '[Phone Number]'}`;

  // Encoded Gmail Compose URL
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(COORDINATOR_EMAIL)}&su=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(bodyText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleSubmitApplication = async () => {
    if (!hasSentEmail) {
      setErrorMsg('Please confirm that the parent permission email has been sent.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('atl_jwt_token');
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

      const res = await fetch(`${API_BASE_URL}/api/staybacks/${stayBack.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      setErrorMsg('Network error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
                <span className="stayback-badge-sub">STEP {step} OF 2</span>
                <h2 className="detail-title">Apply for StayBack</h2>
                <p className="text-xs text-zinc-400 mt-1">{stayBack.title} ({stayBack.projectName})</p>
              </div>
              <button type="button" className="profile-close-btn" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
            {copySuccess && <div className="auth-alert success">✓ Email template copied to clipboard!</div>}

            {/* STEP 1: PARENT PERMISSION EMAIL */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div className="verification-info-box">
                  <Mail className="info-box-icon" />
                  <div>
                    <h3 className="info-box-title">Parent / Guardian Permission Required</h3>
                    <p className="info-box-desc">
                      A parent or guardian must send a formal permission email to the ATL Coordinator at{' '}
                      <strong className="text-white">{COORDINATOR_EMAIL}</strong> before your application can be reviewed.
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-section-title">3 Actions Available:</h4>
                  <div className="email-actions-grid">
                    <button
                      type="button"
                      className="email-action-btn"
                      onClick={() => setIsPreviewOpen(true)}
                    >
                      <Eye className="w-4 h-4" /> Preview Email
                    </button>

                    <a
                      href={gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="email-action-btn primary"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Gmail
                    </a>

                    <button
                      type="button"
                      className="email-action-btn"
                      onClick={handleCopyTemplate}
                    >
                      <Copy className="w-4 h-4" /> Copy Template
                    </button>
                  </div>
                </div>

                <div className="onboarding-actions pt-4">
                  <button type="button" className="auth-btn-cancel" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="auth-btn-primary cta-btn"
                    onClick={() => setStep(2)}
                  >
                    Continue to Submission →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIRMATION & SUBMISSION */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div className="verification-info-box">
                  <ShieldAlert className="info-box-icon text-emerald-400" />
                  <div>
                    <h3 className="info-box-title">Confirm & Submit</h3>
                    <p className="info-box-desc">
                      Please confirm that the permission email has been sent by your parent/guardian to the ATL Coordinator.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-emerald-400 cursor-pointer"
                    checked={hasSentEmail}
                    onChange={(e) => setHasSentEmail(e.target.checked)}
                  />
                  <span className="text-sm text-zinc-200 font-medium leading-snug">
                    I confirm that my parent or guardian has sent the permission email for this StayBack to {COORDINATOR_EMAIL}.
                  </span>
                </label>

                <div className="onboarding-actions pt-4">
                  <button
                    type="button"
                    className="auth-btn-cancel"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    type="button"
                    className="auth-btn-primary cta-btn"
                    onClick={handleSubmitApplication}
                    disabled={!hasSentEmail || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        emailData={{
          recipient: COORDINATOR_EMAIL,
          subject: subjectText,
          bodyText,
          gmailUrl,
          onCopy: handleCopyTemplate
        }}
      />
    </>
  );
};

export default ApplyStayBackModal;
