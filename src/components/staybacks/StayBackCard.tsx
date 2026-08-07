import React from 'react';
import { Calendar, Clock, Shield, ArrowUpRight, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import type { DepartmentEnum } from '../../context/AuthContext';
import './staybacks.css';

export interface StayBackCardData {
  id: string;
  title: string;
  projectName: string;
  description: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  applicationDeadline: string | Date;
  maxParticipants: number;
  acceptedCount: number;
  remainingSeats: number;
  isFull: boolean;
  requiredDepartments: DepartmentEnum[];
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
  countdownText: string;
  createdByName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  userApplicationStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | null;
}

interface StayBackCardProps {
  stayBack: StayBackCardData;
  userDept?: string | null;
  isAdmin?: boolean;
  onClick: () => void;
  onAdminManage?: (e: React.MouseEvent) => void;
}

export const StayBackCard: React.FC<StayBackCardProps> = ({
  stayBack,
  userDept,
  isAdmin = false,
  onClick,
  onAdminManage,
}) => {
  const formattedDate = new Date(stayBack.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const getStatusBadge = () => {
    if (stayBack.status === 'CANCELLED') {
      return <span className="status-pill badge-cancelled">Cancelled</span>;
    }
    if (stayBack.status === 'COMPLETED') {
      return <span className="status-pill badge-completed">Completed</span>;
    }
    if (stayBack.isFull && stayBack.status === 'OPEN') {
      return <span className="status-pill badge-full">StayBack Full</span>;
    }
    if (stayBack.status === 'CLOSED') {
      return <span className="status-pill badge-closed">Closed</span>;
    }
    if (stayBack.status === 'DRAFT') {
      return <span className="status-pill badge-draft">Draft</span>;
    }
    return <span className="status-pill badge-open">Open</span>;
  };

  const getAppStatusTag = () => {
    if (!stayBack.userApplicationStatus) return null;
    switch (stayBack.userApplicationStatus) {
      case 'ACCEPTED':
        return (
          <span className="status-pill badge-accepted">
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.25} /> Accepted
          </span>
        );
      case 'PENDING':
        return (
          <span className="status-pill badge-pending">
            <Clock3 className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.25} /> Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="status-pill badge-rejected">
            <XCircle className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.25} /> Not Selected
          </span>
        );
      default:
        return null;
    }
  };

  const fillPercent = Math.min(100, Math.round((stayBack.acceptedCount / stayBack.maxParticipants) * 100));

  return (
    <div className="stayback-card" onClick={onClick} role="button" tabIndex={0}>
      {/* Top Tag & Title */}
      <div className="stayback-card-top">
        <div>
          <span className="card-project-tag">{stayBack.projectName}</span>
          <h3 className="card-title">{stayBack.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          {getStatusBadge()}
          {getAppStatusTag()}
        </div>
      </div>

      {/* Meta Date & Time */}
      <div className="card-meta-list">
        <div className="card-meta-item">
          <Calendar className="card-meta-icon text-zinc-400" strokeWidth={2} />
          <span>{formattedDate}</span>
        </div>
        <div className="card-meta-item">
          <Clock className="card-meta-icon text-zinc-400" strokeWidth={2} />
          <span>{stayBack.startTime} – {stayBack.endTime}</span>
        </div>
      </div>

      {/* Required Departments Pills */}
      <div className="card-depts-wrap">
        {stayBack.requiredDepartments.map((dept) => {
          const isMatching = userDept && userDept.toUpperCase() === dept.toUpperCase();
          return (
            <span key={dept} className={`dept-pill ${isMatching ? 'matching' : ''}`}>
              {dept.replace('_', ' ')}
            </span>
          );
        })}
      </div>

      {/* Live Capacity Progress Bar */}
      <div className="card-capacity-box">
        <div className="capacity-text-row">
          <span className="capacity-accepted-label">
            {stayBack.acceptedCount} / {stayBack.maxParticipants} Accepted
          </span>
          <span className={`capacity-remaining-label ${stayBack.isFull ? 'full' : ''}`}>
            {stayBack.isFull ? 'Full' : `Remaining: ${stayBack.remainingSeats}`}
          </span>
        </div>
        <div className="capacity-bar-bg">
          <div
            className={`capacity-bar-fill ${stayBack.isFull ? 'full' : ''}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Footer & Contextual Admin Button */}
      <div className="stayback-card-bottom">
        <span className={`card-countdown ${stayBack.countdownText.includes('Closed') ? '' : 'urgent'}`}>
          <Clock3 className="w-3.5 h-3.5" strokeWidth={2} />
          {stayBack.countdownText}
        </span>

        <div className="flex items-center gap-2">
          {isAdmin && onAdminManage && (
            <button
              type="button"
              className="admin-manage-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAdminManage(e);
              }}
            >
              <Shield className="w-3.5 h-3.5" strokeWidth={2} /> Manage
            </button>
          )}
          <ArrowUpRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

export default StayBackCard;
