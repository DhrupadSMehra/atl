import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

interface UserBarProps {
  onNavigateNotices?: () => void;
  onNavigateTeam?:    () => void;
  currentView?:       'landing' | 'team' | 'notices';
}

export const UserBar: React.FC<UserBarProps> = ({
  onNavigateNotices,
  onNavigateTeam,
  currentView,
}) => {
  const { user, role, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const displayName  = user.adminProfile?.displayName || user.name || 'ATL User';
  const roleLabel    = role === 'admin' ? 'ADMIN' : 'VIEWER';
  const positionLabel = user.adminProfile?.position ? ` • ${user.adminProfile.position}` : '';

  return (
    <div className="user-bar">
      {/* Navigation links */}
      {(onNavigateNotices || onNavigateTeam) && (
        <div className="user-nav-links" role="navigation" aria-label="Site navigation">
          {onNavigateNotices && (
            <button
              type="button"
              className={`user-nav-link ${currentView === 'notices' ? 'active' : ''}`}
              onClick={onNavigateNotices}
              id="nav-notices-btn"
              aria-current={currentView === 'notices' ? 'page' : undefined}
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
              aria-current={currentView === 'team' ? 'page' : undefined}
            >
              Team
            </button>
          )}
          <div className="user-nav-sep" aria-hidden="true" />
        </div>
      )}

      {/* User avatar */}
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
          {role === 'admin' && (
            <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{positionLabel}</span>
          )}
        </span>
        <span className={`role-badge ${role || 'viewer'}`}>
          {roleLabel}
        </span>
      </div>

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
