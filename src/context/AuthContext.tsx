import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminPosition = 
  | 'President' 
  | 'Vice President' 
  | 'Head' 
  | 'Coordinator' 
  | 'Faculty' 
  | 'Teacher' 
  | 'Mentor';

export interface IAdminProfile {
  displayName: string;
  position: AdminPosition;
  createdAt: string | Date;
}

export interface UserSession {
  id: string;
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: 'viewer' | 'admin';
  adminProfile?: IAdminProfile;
}

interface AuthContextType {
  user: UserSession | null;
  role: 'viewer' | 'admin' | null;
  isAuthenticated: boolean;
  isPendingAdminSetup: boolean;
  isAdminUnlockedByPass: boolean;
  pendingGoogleAccount: { googleId: string; email: string; name: string; profilePicture?: string } | null;
  handleGoogleSuccess: (tokenPayload: { access_token?: string; credential?: string }) => Promise<void>;
  verifyAdminPassword: (password: string) => Promise<boolean>;
  completeAdminSetup: (displayName: string, position: AdminPosition) => Promise<void>;
  skipAsViewer: () => Promise<void>;
  logout: () => void;
  isModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

/**
 * Safe fetch helper that handles non-JSON, 404s, and empty responses safely
 * avoiding SyntaxError: Unexpected end of JSON input
 */
async function safeFetchJson(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const contentType = response.headers.get('content-type') || '';
    let bodyData: any = null;

    if (contentType.includes('application/json')) {
      try {
        bodyData = await response.json();
      } catch (jsonErr) {
        bodyData = null;
      }
    } else {
      const textData = await response.text();
      bodyData = { success: false, error: textData || `HTTP ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      const errorMessage = bodyData?.error || bodyData?.message || `HTTP ${response.status} (${response.statusText}) from ${url}`;
      return { ok: false, status: response.status, error: errorMessage, data: bodyData };
    }

    return { ok: true, status: response.status, error: null, data: bodyData || { success: true } };

  } catch (netErr: any) {
    console.error(`[Auth Error] Network request failed for ${url}:`, netErr);
    return {
      ok: false,
      status: 0,
      error: `Unable to connect to backend server at ${API_BASE_URL}. Ensure the Express server is running.`,
      data: null
    };
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('atl_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminUnlockedByPass, setIsAdminUnlockedByPass] = useState(false);
  const [isPendingAdminSetup, setIsPendingAdminSetup] = useState(false);
  const [pendingGoogleAccount, setPendingGoogleAccount] = useState<{ googleId: string; email: string; name: string; profilePicture?: string } | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('atl_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('atl_user_session');
    }
  }, [user]);

  const openAdminModal = () => setIsModalOpen(true);
  const closeAdminModal = () => setIsModalOpen(false);

  // 1. Verify Admin Password via Backend ONLY
  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    const { ok, error, data } = await safeFetchJson('/api/auth/verify-admin-pass', {
      method: 'POST',
      body: JSON.stringify({ password })
    });

    if (ok && data?.success) {
      setIsAdminUnlockedByPass(true);
      setIsModalOpen(false);
      return true;
    }

    console.warn('[Admin Password Validation Error]', error);
    return false;
  };

  // 2. Handle Real Google Token Response from Google OAuth Popup
  const handleGoogleSuccess = async (tokenPayload: { access_token?: string; credential?: string }) => {
    const { ok, error, data } = await safeFetchJson('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(tokenPayload)
    });

    if (!ok || !data?.success || !data?.user) {
      console.error('[Google Auth Error]', error);
      alert(error || 'Google authentication failed. Please try again.');
      return;
    }

    if (data.token) {
      localStorage.setItem('atl_jwt_token', data.token);
    }

    // Check if user is already an admin in MongoDB
    if (data.isExistingAdmin || data.user.role === 'admin') {
      setUser(data.user);
      setIsAdminUnlockedByPass(false);
      setIsPendingAdminSetup(false);
      setPendingGoogleAccount(null);
      return;
    }

    // If user entered admin password first, but account is not admin yet in MongoDB
    if (isAdminUnlockedByPass) {
      setPendingGoogleAccount({
        googleId: data.user.googleId,
        email: data.user.email,
        name: data.user.name,
        profilePicture: data.user.profilePicture || ''
      });
      setIsPendingAdminSetup(true);
      setIsAdminUnlockedByPass(false);
      return;
    }

    // Regular Viewer user
    setUser(data.user);
  };

  // 3. First Time Admin Setup Completion
  const completeAdminSetup = async (displayName: string, position: AdminPosition) => {
    if (!pendingGoogleAccount) {
      throw new Error('No pending Google account found for setup.');
    }

    const setupPayload = {
      ...pendingGoogleAccount,
      displayName,
      position
    };

    const { ok, error, data } = await safeFetchJson('/api/auth/admin-setup', {
      method: 'POST',
      body: JSON.stringify(setupPayload)
    });

    if (!ok || !data?.success || !data?.user) {
      throw new Error(error || 'Failed to complete administrator setup.');
    }

    if (data.token) {
      localStorage.setItem('atl_jwt_token', data.token);
    }

    setUser(data.user);
    setIsPendingAdminSetup(false);
    setPendingGoogleAccount(null);
  };

  // 4. Skip as Viewer
  const skipAsViewer = async () => {
    const { ok, data } = await safeFetchJson('/api/auth/viewer-guest', { method: 'POST' });
    if (ok && data?.success && data?.user) {
      setUser(data.user);
      if (data.token) localStorage.setItem('atl_jwt_token', data.token);
    }
  };

  // 5. Logout
  const logout = () => {
    setUser(null);
    setIsPendingAdminSetup(false);
    setIsAdminUnlockedByPass(false);
    setPendingGoogleAccount(null);
    localStorage.removeItem('atl_user_session');
    localStorage.removeItem('atl_jwt_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isPendingAdminSetup,
        isAdminUnlockedByPass,
        pendingGoogleAccount,
        handleGoogleSuccess,
        verifyAdminPassword,
        completeAdminSetup,
        skipAsViewer,
        logout,
        isModalOpen,
        openAdminModal,
        closeAdminModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
