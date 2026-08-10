import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, UserCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StayBackCard, { type StayBackCardData } from './StayBackCard';
import StayBackDetailOverlay from './StayBackDetailOverlay';
import ApplyStayBackModal from './ApplyStayBackModal';
import MyApplicationsList from './MyApplicationsList';
import AdminStayBackOverlay from './AdminStayBackOverlay';
import CreateStayBackModal from './CreateStayBackModal';
import './staybacks.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

export const StayBackPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { member, role } = useAuth();
  const isAdmin = role === 'admin' || member?.role === 'ADMIN';

  // Navigation Tabs: 'browse' (All StayBacks) or 'my-apps' (My Applications)
  const [activeTab, setActiveTab] = useState<'browse' | 'my-apps'>('browse');

  // StayBack List Data
  const [stayBacks, setStayBacks] = useState<StayBackCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('UPCOMING');

  // Modals & Overlays State
  const [selectedStayBack, setSelectedStayBack] = useState<StayBackCardData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isAdminManageOpen, setIsAdminManageOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [stayBackToEdit, setStayBackToEdit] = useState<StayBackCardData | null>(null);

  const fetchStayBacks = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('atl_jwt_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/staybacks`, { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setStayBacks(data.staybacks || []);
      } else {
        setErrorMsg(data.error || 'Failed to load StayBacks.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while loading StayBacks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStayBacks();
  }, []);

  // Filter and Sort Logic
  const filteredAndSortedStayBacks = stayBacks
    .filter((sb) => {
      const matchesSearch =
        sb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sb.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sb.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDept === 'ALL' ||
        sb.requiredDepartments.some((d) => d.toUpperCase() === selectedDept.toUpperCase());

      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'UPCOMING':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'NEWEST':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'OLDEST':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'DEADLINE':
          return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
        case 'MOST_APPLICANTS':
          return (b.acceptedCount || 0) - (a.acceptedCount || 0);
        case 'LEAST_APPLICANTS':
          return (a.acceptedCount || 0) - (b.acceptedCount || 0);
        default:
          return 0;
      }
    });

  const handleCardClick = (sb: StayBackCardData) => {
    setSelectedStayBack(sb);
    setIsDetailOpen(true);
  };

  const handleAdminManageClick = (sb: StayBackCardData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStayBack(sb);
    setIsAdminManageOpen(true);
  };

  const handleApplyTrigger = () => {
    setIsDetailOpen(false);
    setIsApplyOpen(true);
  };

  const handleOpenCreateModal = () => {
    setStayBackToEdit(null);
    setIsCreateOpen(true);
  };

  const handleOpenEditModal = () => {
    setIsAdminManageOpen(false);
    setStayBackToEdit(selectedStayBack);
    setIsCreateOpen(true);
  };

  return (
    <div className="stayback-page-container">
      <div className="stayback-max-wrapper">
        {/* Header Title Section */}
        <div className="stayback-header">
          <div className="stayback-title-area">
            {onBack && (
              <button type="button" className="directory-back-btn" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            )}
            <span className="stayback-badge-sub">ATL WORKSPACE</span>
            <h1 className="stayback-page-title">ATL StayBack Management</h1>
            <p className="stayback-page-desc">
              Schedule, manage, and apply for internal ATL laboratory staybacks
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="create-stayback-btn"
              onClick={handleOpenCreateModal}
            >
              <Plus className="w-4 h-4" /> Create StayBack
            </button>
          )}
        </div>

        {/* Section Tabs */}
        <div className="stayback-tabs-bar">
          <button
            type="button"
            className={`stayback-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <Calendar className="w-4 h-4" /> All StayBacks ({stayBacks.length})
          </button>

          {member && (
            <button
              type="button"
              className={`stayback-tab-btn ${activeTab === 'my-apps' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-apps')}
            >
              <UserCheck className="w-4 h-4" /> My Applications
            </button>
          )}
        </div>

        {/* TAB 1: BROWSE ALL STAYBACKS */}
        {activeTab === 'browse' && (
          <div className="flex flex-col gap-5">
            {/* Filter & Sort Controls */}
            <div className="stayback-controls-bar">
              <div className="stayback-search-box">
                <Search className="search-input-icon" />
                <input
                  type="text"
                  className="stayback-input"
                  placeholder="Search title, project name, or keywords..."
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
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="UPCOMING">Sort by: Upcoming</option>
                <option value="NEWEST">Sort by: Newest</option>
                <option value="OLDEST">Sort by: Oldest</option>
                <option value="DEADLINE">Sort by: Application Deadline</option>
                <option value="MOST_APPLICANTS">Sort by: Most Applicants</option>
                <option value="LEAST_APPLICANTS">Sort by: Least Applicants</option>
              </select>

              <button
                type="button"
                className="directory-refresh-btn"
                onClick={fetchStayBacks}
                disabled={loading}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Loading & Error States */}
            {loading && (
              <div className="directory-state-box">
                <div className="directory-spinner" />
                <p>Loading upcoming ATL StayBacks...</p>
              </div>
            )}

            {errorMsg && <div className="auth-alert error">{errorMsg}</div>}

            {!loading && !errorMsg && filteredAndSortedStayBacks.length === 0 && (
              <div className="directory-state-box">
                <p className="text-zinc-400">No StayBacks found matching your search and filter criteria.</p>
              </div>
            )}

            {/* StayBack Grid */}
            {!loading && !errorMsg && filteredAndSortedStayBacks.length > 0 && (
              <motion.div
                className="stayback-cards-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredAndSortedStayBacks.map((sb) => (
                  <StayBackCard
                    key={sb.id}
                    stayBack={sb}
                    userDept={member?.department}
                    isAdmin={isAdmin}
                    onClick={() => handleCardClick(sb)}
                    onAdminManage={(e) => handleAdminManageClick(sb, e)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 2: MY APPLICATIONS */}
        {activeTab === 'my-apps' && <MyApplicationsList />}
      </div>

      {/* Modals & Overlays */}
      <StayBackDetailOverlay
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        stayBack={selectedStayBack}
        userDept={member?.department}
        isAdmin={isAdmin}
        onApplyClick={handleApplyTrigger}
        onAdminManage={() => {
          setIsDetailOpen(false);
          setIsAdminManageOpen(true);
        }}
      />

      {selectedStayBack && (
        <ApplyStayBackModal
          isOpen={isApplyOpen}
          onClose={() => setIsApplyOpen(false)}
          stayBack={selectedStayBack}
          onSuccess={() => {
            fetchStayBacks();
            setActiveTab('my-apps');
          }}
        />
      )}

      {/* Contextual Admin Overview Overlay */}
      <AdminStayBackOverlay
        isOpen={isAdminManageOpen}
        onClose={() => setIsAdminManageOpen(false)}
        stayBack={selectedStayBack}
        onEditClick={handleOpenEditModal}
        onRefreshStayBacks={fetchStayBacks}
      />

      {/* Create / Edit StayBack Modal */}
      <CreateStayBackModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        stayBackToEdit={stayBackToEdit}
        onSuccess={fetchStayBacks}
      />
    </div>
  );
};

export default StayBackPage;
