import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { AdminPasswordModal } from './AdminPasswordModal';
import './auth.css';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5174').replace(/\/+$/, '');

export const LoginPage: React.FC = () => {
  const { handleGoogleSuccess, handleLoginSuccess, openAdminModal } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [isBackendTeam, setIsBackendTeam] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      handleGoogleSuccess({ access_token: tokenResponse.access_token });
    },
    onError: (error) => {
      console.error('Google Sign-In Failed:', error);
      setError('Google Sign-In Failed');
    }
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: any = { email, password };
      
      if (activeTab === 'register') {
        body.name = name;
        if (isBackendTeam) {
          body.adminPassword = adminPassword;
        }
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (data.success) {
        handleLoginSuccess(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSuccess = () => {
    // Admin password verified by backend — launch real Google sign-in popup now!
    googleLogin();
  };

  return (
    <div className="auth-page-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="auth-heading">ATL Community</h1>
        <p className="auth-subheading">Internal Workspace Access</p>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {activeTab === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              className="auth-input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email Address"
            className="auth-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {activeTab === 'register' && (
            <div className="backend-team-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={isBackendTeam}
                  onChange={e => setIsBackendTeam(e.target.checked)}
                />
                Backend Team Account?
              </label>
            </div>
          )}

          <AnimatePresence>
            {activeTab === 'register' && isBackendTeam && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <input
                  type="password"
                  placeholder="Master Admin Password"
                  className="auth-input backend-password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required={isBackendTeam}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="auth-btn-google"
          onClick={() => googleLogin()}
        >
          <svg className="auth-google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <p className="auth-admin-prompt" style={{ marginTop: '24px', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
          Want administrator access via Google?
        </p>
        <button
          type="button"
          className="auth-btn-secondary"
          onClick={openAdminModal}
        >
          Unlock Admin
        </button>
      </motion.div>

      <AdminPasswordModal onPasswordSuccess={handlePasswordSuccess} />
    </div>
  );
};

export default LoginPage;
