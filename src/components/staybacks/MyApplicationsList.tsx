import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, XCircle, Clock3, AlertTriangle, RefreshCw, MailCheck } from 'lucide-react';
import './staybacks.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export interface MemberApplicationItem {
  applicationId: string;
  stayBackId: string;
  title: string;
  projectName: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  submittedAt: string | Date;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';
  memberMessage: string;
  stayBackStatus: string;
}

export const MyApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<MemberApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_BASE_URL}/api/staybacks/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.applications || []);
      } else {
        setError(data.error || 'Failed to load your stayback applications.');
      }
    } catch (err: any) {
      setError('Network error while loading applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="status-pill badge-accepted"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.25} /> Accepted</span>;
      case 'REJECTED':
        return <span className="status-pill badge-rejected"><XCircle className="w-3.5 h-3.5" strokeWidth={2.25} /> Not Selected</span>;
      case 'CANCELLED':
        return <span className="status-pill badge-cancelled"><AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.25} /> Cancelled</span>;
      default:
        return <span className="status-pill badge-pending"><Clock3 className="w-3.5 h-3.5" strokeWidth={2.25} /> Pending</span>;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">My StayBack Applications</h2>
          <p className="text-xs text-zinc-400">Track your application status and instructions</p>
        </div>
        <button
          type="button"
          className="directory-refresh-btn"
          onClick={fetchMyApplications}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="directory-state-box">
          <div className="directory-spinner" />
          <p>Loading your applications...</p>
        </div>
      )}

      {error && <div className="auth-alert error">{error}</div>}

      {!loading && !error && applications.length === 0 && (
        <div className="directory-state-box">
          <p className="text-zinc-400">You have not submitted any StayBack applications yet.</p>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="my-apps-list">
          {applications.map((app) => {
            const stayDateFormatted = new Date(app.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });

            const appliedDateFormatted = new Date(app.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const isAccepted = app.status === 'ACCEPTED';
            const isRejected = app.status === 'REJECTED';
            const isCancelled = app.status === 'CANCELLED';

            return (
              <motion.div
                key={app.applicationId}
                className="my-app-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="my-app-header">
                  <div>
                    <span className="card-project-tag">{app.projectName}</span>
                    <h3 className="card-title">{app.title}</h3>
                  </div>
                  {getStatusPill(app.status)}
                </div>

                {/* StayBack Details List */}
                <div className="card-meta-list">
                  <div className="card-meta-item">
                    <Calendar className="card-meta-icon" />
                    <span>StayBack Date: <strong className="text-white">{stayDateFormatted}</strong> ({app.startTime} – {app.endTime})</span>
                  </div>
                  <div className="card-meta-item">
                    <Clock className="card-meta-icon" />
                    <span>Application Date: {appliedDateFormatted}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="app-status-timeline">
                  <div className="timeline-step completed">
                    <MailCheck className="w-4 h-4 text-emerald-400" />
                    <span>1. Permission Email Sent</span>
                  </div>

                  <div className="timeline-line active" />

                  <div className="timeline-step completed">
                    <div className="timeline-dot" />
                    <span>2. Application Submitted</span>
                  </div>

                  <div className="timeline-line active" />

                  <div className={`timeline-step ${isAccepted || isRejected || isCancelled ? 'completed' : 'active'}`}>
                    <div className="timeline-dot" />
                    <span>3. Under Review</span>
                  </div>

                  <div className="timeline-line active" />

                  <div className={`timeline-step ${isAccepted ? 'completed' : isRejected ? 'rejected' : isCancelled ? 'rejected' : ''}`}>
                    <div className="timeline-dot" />
                    <span>
                      4. {isAccepted ? 'Accepted' : isRejected ? 'Not Selected' : isCancelled ? 'Cancelled' : 'Decision'}
                    </span>
                  </div>
                </div>

                {/* Member Facing Message Box */}
                {app.memberMessage && (
                  <div className="my-app-message-box">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Status Message / Instructions:
                    </span>
                    <p className="margin-0 text-sm">{app.memberMessage}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsList;
