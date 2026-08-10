import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Edit3, Trash2, MessageSquare, Lock } from 'lucide-react';
import type { StayBackCardData } from './StayBackCard';
import { MemberCard } from '../auth/AdminMemberDirectory';
import './staybacks.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

interface AdminStayBackOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stayBack: StayBackCardData | null;
  onEditClick: () => void;
  onRefreshStayBacks: () => void;
}

interface ApplicationReviewItem {
  applicationId: string;
  stayBackId: string;
  member: {
    memberId: string;
    googleId: string;
    email: string;
    fullName: string;
    studentClass: string;
    section: string;
    contactNumber: string;
    department: string;
    role: string;
    profileCompleted: boolean;
    createdAt: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  submittedAt: string;
  reviewedAt?: string;
  internalNotes: string;
  memberMessage: string;
}

export const AdminStayBackOverlay: React.FC<AdminStayBackOverlayProps> = ({
  isOpen,
  onClose,
  stayBack,
  onEditClick,
  onRefreshStayBacks,
}) => {
  const [stats, setStats] = useState<{
    totalApplications: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
    maxCapacity: number;
    remainingCapacity: number;
    isFull: boolean;
  } | null>(null);

  const [applications, setApplications] = useState<ApplicationReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Roster Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Active applicant being reviewed/viewed
  const [selectedApp, setSelectedApp] = useState<ApplicationReviewItem | null>(null);
  const [internalNotesInput, setInternalNotesInput] = useState('');
  const [memberMessageInput, setMemberMessageInput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchData = async () => {
    if (!stayBack) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('atl_jwt_token');

      // 1. Fetch Overview Stats
      const statsRes = await fetch(`${API_BASE_URL}/api/staybacks/${stayBack.id}/admin-overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
      }

      // 2. Fetch Applications
      const appsRes = await fetch(`${API_BASE_URL}/api/staybacks/${stayBack.id}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appsData = await appsRes.json();
      if (appsRes.ok && appsData.success) {
        setApplications(appsData.applications || []);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load admin overview details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stayBack) {
      fetchData();
    }
  }, [isOpen, stayBack]);

  if (!isOpen || !stayBack) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_BASE_URL}/api/staybacks/${stayBack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg(`StayBack status changed to ${newStatus}.`);
        onRefreshStayBacks();
        fetchData();
      }
    } catch (err) {
      setErrorMsg('Failed to update StayBack status.');
    }
  };

  const handleDeleteStayBack = async () => {
    if (!window.confirm(`Are you sure you want to delete StayBack "${stayBack.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_BASE_URL}/api/staybacks/${stayBack.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        onRefreshStayBacks();
        onClose();
      }
    } catch (err) {
      setErrorMsg('Failed to delete StayBack.');
    }
  };

  const openReviewApplicant = (app: ApplicationReviewItem) => {
    setSelectedApp(app);
    setInternalNotesInput(app.internalNotes || '');
    setMemberMessageInput(app.memberMessage || '');
  };

  const submitApplicationReview = async (newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
    if (!selectedApp) return;
    setReviewLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_BASE_URL}/api/staybacks/applications/${selectedApp.applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          internalNotes: internalNotesInput.trim(),
          memberMessage: memberMessageInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedApp(null);
        fetchData();
        onRefreshStayBacks();
      } else {
        setErrorMsg(data.error || 'Failed to update application review.');
      }
    } catch (err: any) {
      setErrorMsg('Network error updating application review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      a.member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.member.contactNumber.includes(searchQuery);

    const matchesDept = selectedDept === 'ALL' || a.member.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <AnimatePresence>
      <div className="stayback-detail-overlay" onClick={onClose}>
        <motion.div
          className="stayback-detail-card"
          style={{ maxWidth: '900px' }}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="detail-header">
            <div>
              <span className="stayback-badge-sub">CONTEXTUAL ADMIN OVERVIEW</span>
              <h2 className="detail-title">{stayBack.title}</h2>
              <p className="text-xs text-zinc-400 mt-1">Project: {stayBack.projectName}</p>
            </div>
            <button type="button" className="profile-close-btn" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
          {statusMsg && <div className="auth-alert success">{statusMsg}</div>}

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Change Status:</span>
              <select
                className="stayback-select"
                style={{ height: '38px', minWidth: '130px', fontSize: '0.8rem' }}
                value={stayBack.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div className="admin-actions-group">
              <button
                type="button"
                className="admin-edit-btn"
                onClick={onEditClick}
              >
                <Edit3 className="w-3.5 h-3.5" strokeWidth={2} /> Edit StayBack
              </button>

              <button
                type="button"
                className="admin-delete-btn"
                onClick={handleDeleteStayBack}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Delete
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          {stats && (
            <div className="admin-overview-grid">
              <div className="admin-stat-card">
                <span className="stat-label">Total Applicants</span>
                <span className="stat-value text-white">{stats.totalApplications}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">Pending</span>
                <span className="stat-value text-cyan-400">{stats.pendingCount}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">Accepted</span>
                <span className="stat-value text-emerald-400">{stats.acceptedCount} / {stats.maxCapacity}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">Remaining Capacity</span>
                <span className={`stat-value ${stats.isFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {stats.isFull ? 'Full' : `${stats.remainingCapacity} Seats`}
                </span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">Rejected</span>
                <span className="stat-value text-red-400">{stats.rejectedCount}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">Capacity Limit</span>
                <span className="stat-value text-zinc-300">{stats.maxCapacity}</span>
              </div>
            </div>
          )}

          {/* Applicant Roster Review Section */}
          <div className="roster-section-wrap">
            <h3 className="text-base font-bold text-white m-0">Applicant Roster & Review</h3>

            {/* Filter Bar */}
            <div className="stayback-controls-bar roster-filter-bar">
              <div className="stayback-search-box">
                <Search className="search-input-icon text-zinc-400" strokeWidth={2} />
                <input
                  type="text"
                  className="stayback-input"
                  placeholder="Search applicant name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="stayback-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                <option value="TECHNICAL">Technical</option>
                <option value="CREATIVE">Creative</option>
                <option value="PHOTOGRAPHY">Photography</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="MARKETING">Marketing</option>
                <option value="HOSPITALITY">Hospitality</option>
              </select>

              <select
                className="stayback-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {loading ? (
              <div className="directory-state-box">
                <div className="directory-spinner" />
                <p>Loading applicant roster...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="directory-state-box">
                <p className="text-zinc-400">No applicant applications found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-zinc-800/80 rounded-xl">
                <table className="admin-roster-table">
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Department</th>
                      <th>Class & Section</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr key={app.applicationId}>
                        <td>
                          <div className="roster-applicant-cell">
                            <div className="roster-avatar">
                              {app.member.fullName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-white">{app.member.fullName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="dept-pill matching">
                            {app.member.department.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-zinc-300">
                          Class {app.member.studentClass}-{app.member.section}
                        </td>
                        <td>
                          <a href={`tel:${app.member.contactNumber}`} className="detail-link text-xs">
                            {app.member.contactNumber}
                          </a>
                        </td>
                        <td>
                          {app.status === 'ACCEPTED' && <span className="status-pill badge-accepted">Accepted</span>}
                          {app.status === 'PENDING' && <span className="status-pill badge-pending">Pending</span>}
                          {app.status === 'REJECTED' && <span className="status-pill badge-rejected">Rejected</span>}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="directory-refresh-btn text-xs py-1 px-2"
                            onClick={() => openReviewApplicant(app)}
                          >
                            Review / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Review Individual Applicant Modal */}
      {selectedApp && (
        <div className="stayback-detail-overlay" style={{ zIndex: 10000 }} onClick={() => setSelectedApp(null)}>
          <motion.div
            className="stayback-detail-card"
            style={{ maxWidth: '620px' }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="detail-header">
              <div>
                <span className="stayback-badge-sub">APPLICANT REVIEW</span>
                <h3 className="detail-title">{selectedApp.member.fullName}</h3>
              </div>
              <button type="button" className="profile-close-btn" onClick={() => setSelectedApp(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reusable Member Card Component */}
            <MemberCard member={selectedApp.member as any} compact />

            {/* Dual Notes Section */}
            <div className="flex flex-col gap-4 mt-2">
              {/* Internal Notes (ADMIN ONLY) */}
              <div className="auth-form-group">
                <label className="auth-label flex items-center gap-1 text-amber-400">
                  <Lock className="w-3.5 h-3.5" /> Internal Notes (Admin-Only)
                </label>
                <textarea
                  className="auth-input"
                  style={{ height: '70px', padding: '10px' }}
                  placeholder="Private head notes e.g., 'Already enough Technical members'..."
                  value={internalNotesInput}
                  onChange={(e) => setInternalNotesInput(e.target.value)}
                  disabled={reviewLoading}
                />
                <span className="text-[11px] text-zinc-500">This note will NEVER be visible to the applicant.</span>
              </div>

              {/* Member Message (APPLICANT FACING) */}
              <div className="auth-form-group">
                <label className="auth-label flex items-center gap-1 text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5" /> Member Message (Applicant Facing)
                </label>
                <textarea
                  className="auth-input"
                  style={{ height: '70px', padding: '10px' }}
                  placeholder="Optional note e.g., 'Please report to ATL Lab by 2:00 PM'..."
                  value={memberMessageInput}
                  onChange={(e) => setMemberMessageInput(e.target.value)}
                  disabled={reviewLoading}
                />
                <span className="text-[11px] text-zinc-500">Visible directly to the student in their My Applications section.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  className="auth-btn-cancel"
                  onClick={() => setSelectedApp(null)}
                  disabled={reviewLoading}
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="admin-action-btn-reject"
                    onClick={() => submitApplicationReview('REJECTED')}
                    disabled={reviewLoading}
                  >
                    Reject Application
                  </button>

                  <button
                    type="button"
                    className="admin-action-btn-accept"
                    onClick={() => submitApplicationReview('ACCEPTED')}
                    disabled={reviewLoading || (stats?.isFull && selectedApp.status !== 'ACCEPTED')}
                  >
                    {stats?.isFull && selectedApp.status !== 'ACCEPTED' ? 'StayBack Full' : 'Accept Application'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminStayBackOverlay;
