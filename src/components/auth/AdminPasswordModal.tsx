import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

interface AdminPasswordModalProps {
  onPasswordSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ onPasswordSuccess }) => {
  const { isModalOpen, closeAdminModal, verifyAdminPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the administrator access code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const isValid = await verifyAdminPassword(password);
    setIsSubmitting(false);

    if (isValid) {
      setPassword('');
      setError('');
      onPasswordSuccess();
    } else {
      setError('Incorrect administrator password. Please try again.');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    closeAdminModal();
  };

  return (
    <AnimatePresence>
      <div className="auth-modal-overlay" onClick={handleClose}>
        <motion.div
          className="auth-modal-content"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="auth-modal-title">Administrator Access</h2>
          <p className="auth-modal-subtitle">
            Only ATL Heads and Presidents should continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="admin-password-input">
                Password
              </label>
              <input
                id="admin-password-input"
                type="password"
                className={`auth-input ${error ? 'has-error' : ''}`}
                placeholder="Enter access code..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
            </div>

            {error && <span className="auth-error-msg">{error}</span>}

            <div className="auth-modal-actions">
              <button
                type="button"
                className="auth-btn-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="auth-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Continue'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminPasswordModal;
