import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

export const UserBar: React.FC = () => {
  const { user, role, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const displayName = user.adminProfile?.displayName || user.name || 'ATL User';
  const roleLabel = role === 'admin' ? 'ADMIN' : 'VIEWER';
  const positionLabel = user.adminProfile?.position ? ` • ${user.adminProfile.position}` : '';

  return (
    <div className="user-bar">
      <div className="user-avatar">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={displayName} />
        ) : (
          <span>{displayName.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className="user-info">
        <span className="user-name">
          {displayName}
          {role === 'admin' && <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{positionLabel}</span>}
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
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserBar;
