import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { IMemberProfile } from '../../context/AuthContext';
import { Search, Filter, Mail, Phone, GraduationCap, ArrowLeft, RefreshCw } from 'lucide-react';
import './auth.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export interface MemberCardProps {
  member: IMemberProfile;
  compact?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, compact = false }) => {
  const deptFormatted = member.department
    ? member.department.replace('_', ' ')
    : 'MEMBER';

  return (
    <div className={`admin-member-card ${compact ? 'compact' : ''}`}>
      <div className="member-card-header">
        <div className="member-avatar">
          {member.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="member-primary-info">
          <h3 className="member-name">{member.fullName}</h3>
          <span className="member-dept-badge">{deptFormatted} Department</span>
        </div>
        {member.role && (
          <span className={`member-role-pill ${member.role.toLowerCase()}`}>
            {member.role}
          </span>
        )}
      </div>

      {member.email && (
        <div className="member-details-grid">
          <div className="member-detail-item">
            <GraduationCap className="detail-icon" />
            <span>Class {member.studentClass}-{member.section}</span>
          </div>

          <div className="member-detail-item">
            <Phone className="detail-icon" />
            <a href={`tel:${member.contactNumber}`} className="detail-link">
              {member.contactNumber}
            </a>
          </div>

          <div className="member-detail-item full-width">
            <Mail className="detail-icon" />
            <a href={`mailto:${member.email}`} className="detail-link">
              {member.email}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminMemberDirectory: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [members, setMembers] = useState<IMemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const res = await fetch(`${API_BASE_URL}/api/members/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers(data.members || []);
      } else {
        setError(data.error || 'Failed to fetch member directory.');
      }
    } catch (err: any) {
      setError('Network error while loading members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contactNumber.includes(searchQuery) ||
      `${m.studentClass}-${m.section}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="admin-directory-page">
      <div className="admin-directory-container">
        {/* Top Header */}
        <div className="directory-header">
          <div>
            {onBack && (
              <button type="button" className="directory-back-btn" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            )}
            <h1 className="directory-title">ATL Member Directory</h1>
            <p className="directory-subtitle">
              Central identity registry for verified ATL members ({members.length} Total Members)
            </p>
          </div>

          <button type="button" className="directory-refresh-btn" onClick={fetchMembers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Roster
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="directory-controls">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="directory-search-input"
              placeholder="Search member name, email, phone, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="dept-filter-wrapper">
            <Filter className="filter-icon" />
            <select
              className="directory-dept-select"
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
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="directory-state-box">
            <div className="directory-spinner" />
            <p>Loading member profiles from database...</p>
          </div>
        )}

        {error && (
          <div className="auth-alert error my-4">
            {error}
          </div>
        )}

        {/* Member Grid */}
        {!loading && !error && (
          <>
            {filteredMembers.length === 0 ? (
              <div className="directory-state-box">
                <p className="text-zinc-400">No ATL members found matching your search criteria.</p>
              </div>
            ) : (
              <motion.div
                className="directory-cards-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredMembers.map((m) => (
                  <MemberCard key={m.memberId || m.googleId} member={m} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMemberDirectory;
