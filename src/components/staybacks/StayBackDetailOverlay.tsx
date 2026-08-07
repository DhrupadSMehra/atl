import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Shield, CheckCircle2, AlertTriangle, Clock3, XCircle } from 'lucide-react';
import type { StayBackCardData } from './StayBackCard';
import './staybacks.css';

interface StayBackDetailOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stayBack: StayBackCardData | null;
  userDept?: string | null;
  isAdmin?: boolean;
  onApplyClick: () => void;
  onAdminManage?: () => void;
}

export const StayBackDetailOverlay: React.FC<StayBackDetailOverlayProps> = ({
  isOpen,
  onClose,
  stayBack,
  userDept,
  isAdmin = false,
  onApplyClick,
  onAdminManage,
}) => {
  if (!isOpen || !stayBack) return null;

  const formattedDate = new Date(stayBack.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const deadlineFormatted = new Date(stayBack.applicationDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const createdDateFormatted = stayBack.createdAt
    ? new Date(stayBack.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const updatedDateFormatted = stayBack.updatedAt
    ? new Date(stayBack.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : createdDateFormatted;

  // Department eligibility check
  const isDeptMatch = userDept
    ? stayBack.requiredDepartments.some((d) => d.toUpperCase() === userDept.toUpperCase())
    : false;

  const reqDeptsFormatted = stayBack.requiredDepartments.map((d) => d.replace('_', ' ')).join(' & ');

  const isClosedOrPast = stayBack.status === 'CLOSED' || stayBack.status === 'COMPLETED' || stayBack.countdownText.includes('Closed');
  const isCancelled = stayBack.status === 'CANCELLED';
  const isFull = stayBack.isFull;

  const canApply = stayBack.status === 'OPEN' && !isClosedOrPast && !isCancelled && !isFull && !stayBack.userApplicationStatus;

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
          {/* Header */}
          <div className="detail-header">
            <div>
              <span className="card-project-tag">{stayBack.projectName}</span>
              <h2 className="detail-title">{stayBack.title}</h2>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && onAdminManage && (
                <button type="button" className="admin-manage-btn" onClick={onAdminManage}>
                  <Shield className="w-3.5 h-3.5" /> Manage StayBack
                </button>
              )}
              <button type="button" className="profile-close-btn" onClick={onClose}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Department Eligibility Banner */}
          {userDept && (
            <div className={`eligibility-banner ${isDeptMatch ? 'matched' : 'unmatched'}`}>
              {isDeptMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Your department ({userDept}) matches this StayBack.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>This StayBack is primarily looking for {reqDeptsFormatted} members. You can still apply.</span>
                </>
              )}
            </div>
          )}

          {/* Meta Grid */}
          <div className="card-meta-list">
            <div className="card-meta-item">
              <Calendar className="card-meta-icon" />
              <span className="font-medium text-white">{formattedDate}</span>
            </div>
            <div className="card-meta-item">
              <Clock className="card-meta-icon" />
              <span className="font-medium text-white">{stayBack.startTime} – {stayBack.endTime}</span>
            </div>
            <div className="card-meta-item">
              <Clock3 className="card-meta-icon" />
              <span className="text-zinc-300">Deadline: {deadlineFormatted} ({stayBack.countdownText})</span>
            </div>
          </div>

          {/* Live Capacity Bar */}
          <div className="card-capacity-box">
            <div className="capacity-text-row">
              <span className="capacity-accepted-label font-semibold text-white">
                {stayBack.acceptedCount} / {stayBack.maxParticipants} Accepted
              </span>
              <span className={`capacity-remaining-label ${isFull ? 'full' : ''}`}>
                {isFull ? 'StayBack Full' : `Remaining: ${stayBack.remainingSeats} Seats`}
              </span>
            </div>
            <div className="capacity-bar-bg">
              <div
                className={`capacity-bar-fill ${isFull ? 'full' : ''}`}
                style={{ width: `${Math.min(100, (stayBack.acceptedCount / stayBack.maxParticipants) * 100)}%` }}
              />
            </div>
          </div>

          {/* Required Departments Section */}
          <div>
            <h4 className="detail-section-title">Required Departments</h4>
            <div className="card-depts-wrap">
              {stayBack.requiredDepartments.map((d) => (
                <span key={d} className="dept-pill matching">
                  {d.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="detail-section-title">StayBack Overview & Objectives</h4>
            <p className="detail-description-text">{stayBack.description}</p>
          </div>

          {/* Audit Metadata Box */}
          <div className="audit-metadata-box">
            <div><span className="text-zinc-500">Created By:</span> {stayBack.createdByName || 'ATL Head'}</div>
            <div><span className="text-zinc-500">Created:</span> {createdDateFormatted}</div>
            <div><span className="text-zinc-500">Last Updated:</span> {updatedDateFormatted}</div>
          </div>

          {/* CTA Footer */}
          <div className="pt-4 flex justify-end items-center border-t border-zinc-800/80">
            {stayBack.userApplicationStatus ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Your Status:</span>
                {stayBack.userApplicationStatus === 'ACCEPTED' && (
                  <span className="status-pill badge-accepted"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.25} /> Accepted</span>
                )}
                {stayBack.userApplicationStatus === 'PENDING' && (
                  <span className="status-pill badge-pending"><Clock3 className="w-3.5 h-3.5" strokeWidth={2.25} /> Pending Review</span>
                )}
                {stayBack.userApplicationStatus === 'REJECTED' && (
                  <span className="status-pill badge-rejected"><XCircle className="w-3.5 h-3.5" strokeWidth={2.25} /> Not Selected</span>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="auth-btn-primary cta-btn w-full sm:w-auto"
                onClick={onApplyClick}
                disabled={!canApply}
              >
                {isCancelled
                  ? 'StayBack Cancelled'
                  : isFull
                  ? 'StayBack Full'
                  : isClosedOrPast
                  ? 'Applications Closed'
                  : 'Apply for StayBack →'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StayBackDetailOverlay;
