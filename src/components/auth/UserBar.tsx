import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, ChevronDown } from 'lucide-react';
import './auth.css';

interface UserBarProps {
  onNavigateNotices?: () => void;
  onNavigateTeam?: () => void;
  onNavigateStayBacks?: () => void;
  onOpenProfile?: () => void;
  onOpenDirectory?: () => void;
  onNavigateCommunity?: () => void;
  onNavigateHome?: () => void;
  currentView?: 'landing' | 'team' | 'notices' | 'staybacks' | 'directory' | 'community';
  dossierMode?: 'reality' | 'classified';
  onToggleDossierMode?: (mode: 'reality' | 'classified') => void;
}

export const UserBar: React.FC<UserBarProps> = ({
  onNavigateNotices,
  onNavigateTeam,
  onNavigateStayBacks,
  onOpenProfile,
  onOpenDirectory,
  onNavigateCommunity,
  onNavigateHome,
  currentView,
  dossierMode = 'reality',
  onToggleDossierMode,
}) => {
  const { user, member, role, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  if (!isAuthenticated || !user) return null;

  const displayName = member?.fullName || user.adminProfile?.displayName || user.name || 'ATL Member';
  const isAdmin = role === 'admin' || member?.role === 'ADMIN';
  const roleLabel = isAdmin ? 'ADMIN' : member ? member.department : 'VIEWER';
  const subLabel = member ? `Class ${member.studentClass}-${member.section}` : user.adminProfile?.position || '';

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    onOpenProfile?.();
  };

  const handleSignOutClick = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <>
      {/* ── DESKTOP CAPSULE (>= 769px) ─────────────────────────────────── */}
      <div className="user-bar user-bar-desktop" role="region" aria-label="Desktop user header">
        {/* Navigation links */}
        <div className="user-nav-links" role="navigation" aria-label="Site navigation">
          {onNavigateNotices && (
            <button
              type="button"
              className={`user-nav-link ${currentView === 'notices' ? 'active' : ''}`}
              onClick={onNavigateNotices}
              id="nav-notices-btn"
            >
              Notices
            </button>
          )}
          {onNavigateTeam && (
            <button
              type="button"
              className={`user-nav-link ${currentView === 'team' ? 'active' : ''}`}
              onClick={onNavigateTeam}
              id="nav-team-btn"
            >
              Team
            </button>
          )}
          {onNavigateStayBacks && (
            <button
              type="button"
              className={`user-nav-link ${currentView === 'staybacks' ? 'active' : ''}`}
              onClick={onNavigateStayBacks}
              id="nav-staybacks-btn"
            >
              StayBacks
            </button>
          )}
          {onNavigateCommunity && (
            <button
              type="button"
              className={`user-nav-link ${currentView === 'community' ? 'active' : ''}`}
              onClick={onNavigateCommunity}
              id="nav-community-btn"
            >
              Community
            </button>
          )}
          {onOpenDirectory && (
            <button
              type="button"
              className={`user-nav-link ${currentView === 'directory' ? 'active' : ''}`}
              onClick={onOpenDirectory}
              id="nav-directory-btn"
              title="ATL Member Roster"
            >
              Members
            </button>
          )}
          <div className="user-nav-sep" aria-hidden="true" />
        </div>

        {/* User avatar / profile trigger */}
        <div
          className="user-avatar-trigger"
          onClick={onOpenProfile}
          title="View / Edit My Profile"
          role="button"
          tabIndex={0}
        >
          <div className="user-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={displayName} />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* User info */}
          <div className="user-info">
            <span className="user-name">
              {displayName}
              {subLabel && <span style={{ opacity: 0.6, fontSize: '0.75rem', marginLeft: '4px' }}>• {subLabel}</span>}
            </span>
            <span className={`role-badge ${isAdmin ? 'admin' : 'viewer'}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        {onOpenProfile && (
          <button
            type="button"
            className="user-profile-btn"
            onClick={onOpenProfile}
            title="My Profile"
          >
            <User className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Profile</span>
          </button>
        )}

        <button
          type="button"
          className="user-signout-btn"
          onClick={logout}
          title="Sign Out"
          id="user-signout-btn"
        >
          Sign Out
        </button>
      </div>

      {/* ── MOBILE HEADER + NAVIGATION WRAPPER (<= 768px) ───────────────── */}
      <div className="user-bar-mobile-wrapper" role="banner">
        {/* 1. Primary Header with 3 Deliberate Regions: [TINKETHIX] [SWITCH] [USER] */}
        <div className="user-bar-mobile-header">
          {/* LEFT: TINKETHIX Identity */}
          <div className="mobile-header-left">
            <button
              type="button"
              className="mobile-site-brand"
              onClick={onNavigateHome}
              title="Return to Hub"
              aria-label="TINKETHIX Home"
            >
              <span className="mobile-brand-bracket">[</span>
              <span className="mobile-brand-title">TINKETHIX</span>
              <span className="mobile-brand-bracket">]</span>
            </button>
          </div>

          {/* CENTER: REALITY / CLASSIFIED Toggle Switch — ONLY VISIBLE ON TEAM/DOSSIER */}
          {currentView === 'team' && (
            <div className="mobile-header-center">
              <div className="toggle-switch-wrapper mobile-compact">
                <div className={`toggle-active-bg ${dossierMode === 'classified' ? 'active-classified' : ''}`} />
                <button
                  type="button"
                  className={`toggle-button ${dossierMode === 'reality' ? 'active' : ''}`}
                  onClick={() => onToggleDossierMode && onToggleDossierMode('reality')}
                  aria-label="Switch to Reality Mode"
                >
                  REALITY
                </button>
                <button
                  type="button"
                  className={`toggle-button ${dossierMode === 'classified' ? 'active' : ''}`}
                  onClick={() => onToggleDossierMode && onToggleDossierMode('classified')}
                  aria-label="Switch to Classified Mode"
                >
                  CLASSIFIED
                </button>
              </div>
            </div>
          )}

          {/* RIGHT: Avatar + Name ONLY (Clicking opens compact popover menu) */}
          <div className="mobile-header-right">
            <div
              ref={triggerRef}
              className="mobile-profile-trigger"
              onClick={() => setIsMenuOpen(prev => !prev)}
              role="button"
              tabIndex={0}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              aria-label="Toggle user menu"
            >
              <div className="user-avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={displayName} />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="mobile-user-name">{displayName}</span>
              <ChevronDown className={`mobile-caret ${isMenuOpen ? 'open' : ''}`} />
            </div>
          </div>
        </div>

        {/* 2. Compact User Popover (anchored, touch-friendly, viewport-contained) */}
        {isMenuOpen && (
          <>
            <div
              className="mobile-popover-backdrop"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={popoverRef}
              className="mobile-user-popover"
              role="dialog"
              aria-label="User profile and actions"
            >
              <div className="popover-profile-header">
                <div className="popover-avatar-wrap">
                  <div className="user-avatar large">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={displayName} />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="popover-text-col">
                    <span className="popover-name">{displayName}</span>
                    {subLabel && <span className="popover-sub">{subLabel}</span>}
                  </div>
                </div>
                <div className="popover-badge-row">
                  <span className={`role-badge ${isAdmin ? 'admin' : 'viewer'}`}>
                    {roleLabel}
                  </span>
                  {isAdmin && <span className="popover-admin-flag">ADMIN_LEVEL_01</span>}
                </div>
              </div>

              <div className="popover-divider" />

              <div className="popover-actions">
                {onOpenProfile && (
                  <button
                    type="button"
                    className="popover-action-btn"
                    onClick={handleProfileClick}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                )}
                <button
                  type="button"
                  className="popover-action-btn signout"
                  onClick={handleSignOutClick}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* 3. Dedicated Mobile Navigation Bar (below primary header) */}
        <nav className="mobile-nav-strip" aria-label="Mobile navigation">
          <div className="mobile-nav-scroller">
            {onNavigateNotices && (
              <button
                type="button"
                className={`mobile-nav-item ${currentView === 'notices' ? 'active' : ''}`}
                onClick={onNavigateNotices}
                id="mob-nav-notices-btn"
              >
                Notices
              </button>
            )}
            {onNavigateTeam && (
              <button
                type="button"
                className={`mobile-nav-item ${currentView === 'team' ? 'active' : ''}`}
                onClick={onNavigateTeam}
                id="mob-nav-team-btn"
              >
                Team
              </button>
            )}
            {onNavigateStayBacks && (
              <button
                type="button"
                className={`mobile-nav-item ${currentView === 'staybacks' ? 'active' : ''}`}
                onClick={onNavigateStayBacks}
                id="mob-nav-staybacks-btn"
              >
                StayBacks
              </button>
            )}
            {onNavigateCommunity && (
              <button
                type="button"
                className={`mobile-nav-item ${currentView === 'community' ? 'active' : ''}`}
                onClick={onNavigateCommunity}
                id="mob-nav-community-btn"
              >
                Community
              </button>
            )}
            {onOpenDirectory && (
              <button
                type="button"
                className={`mobile-nav-item ${currentView === 'directory' ? 'active' : ''}`}
                onClick={onOpenDirectory}
                id="mob-nav-directory-btn"
                title="ATL Member Roster"
              >
                Members
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default UserBar;
