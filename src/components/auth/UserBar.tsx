import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Users } from 'lucide-react';
import './auth.css';

interface UserBarProps {
  onNavigateNotices?: () => void;
  onNavigateTeam?: () => void;
  onNavigateStayBacks?: () => void;
  onOpenProfile?: () => void;
  onOpenDirectory?: () => void;
  onNavigateCommunity?: () => void;
  currentView?: 'landing' | 'team' | 'notices' | 'staybacks' | 'directory' | 'community';
}

export const UserBar: React.FC<UserBarProps> = ({
  onNavigateNotices,
  onNavigateTeam,
  onNavigateStayBacks,
  onOpenProfile,
  onOpenDirectory,
  onNavigateCommunity,
  currentView,
}) => {
  const { user, member, role, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const displayName = member?.fullName || user.adminProfile?.displayName || user.name || 'ATL Member';
  const isAdmin = role === 'admin' || member?.role === 'ADMIN';
  const roleLabel = isAdmin ? 'ADMIN' : member ? member.department : 'VIEWER';
  const subLabel = member ? `Class ${member.studentClass}-${member.section}` : user.adminProfile?.position || '';

  return (
    <div className="user-bar">
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
  );
};

export default UserBar;
