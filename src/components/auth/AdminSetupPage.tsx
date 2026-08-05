import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, type AdminPosition } from '../../context/AuthContext';
import './auth.css';

export const AdminSetupPage: React.FC = () => {
  const { pendingGoogleAccount, completeAdminSetup } = useAuth();

  const [fullName, setFullName] = useState(pendingGoogleAccount?.name || '');
  const [position, setPosition] = useState<AdminPosition>('Head');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const POSITIONS: AdminPosition[] = [
    'President',
    'Vice President',
    'Head',
    'Coordinator',
    'Faculty',
    'Teacher',
    'Mentor'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await completeAdminSetup(fullName.trim(), position);
    } catch (err: any) {
      setError(err.message || 'Failed to complete administrator setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: '460px', textAlign: 'left', alignItems: 'stretch' }}
      >
        <h1 className="auth-heading" style={{ fontSize: '1.85rem' }}>
          Complete your administrator profile
        </h1>
        <p className="auth-subheading" style={{ marginBottom: '28px' }}>
          Verify your leadership identity for permanent workspace administration privileges.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="setup-fullname">
              Full Name
            </label>
            <input
              id="setup-fullname"
              type="text"
              className={`auth-input ${error ? 'has-error' : ''}`}
              placeholder="e.g. Alex Vance"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="setup-position">
              Position
            </label>
            <select
              id="setup-position"
              className="auth-select"
              value={position}
              onChange={(e) => setPosition(e.target.value as AdminPosition)}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {error && <span className="auth-error-msg">{error}</span>}

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Profile...' : 'Finish Setup'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminSetupPage;
