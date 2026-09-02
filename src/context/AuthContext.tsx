import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminPosition = 
  | 'President' 
  | 'Vice President' 
  | 'Head' 
  | 'Coordinator' 
  | 'Faculty' 
  | 'Teacher' 
  | 'Mentor';

export type DepartmentEnum = 
  | 'TECHNICAL'
  | 'CREATIVE'
  | 'PHOTOGRAPHY'
  | 'SOCIAL_MEDIA'
  | 'MARKETING'
  | 'HOSPITALITY';

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

export interface IMemberProfile {
  memberId: string;
  googleId: string;
  email: string;
  fullName: string;
  studentClass: string;
  section: string;
  contactNumber: string;
  department: DepartmentEnum;
  role: 'MEMBER' | 'ADMIN';
  profileCompleted: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface MemberRegistrationPayload {
  password: string;
  fullName: string;
  studentClass: string;
  section: string;
  contactNumber: string;
  department: DepartmentEnum;
}

export interface MemberProfileUpdatePayload {
  fullName?: string;
  studentClass?: string;
  section?: string;
  contactNumber?: string;
  department?: DepartmentEnum;
}

interface AuthContextType {
  user: UserSession | null;
  member: IMemberProfile | null;
  role: 'viewer' | 'admin' | null;
  isAuthenticated: boolean;
  isPendingRegistration: boolean;
  isPendingAdminSetup: boolean;
  isAdminUnlockedByPass: boolean;
  pendingGoogleAccount: { googleId: string; email: string; name: string; profilePicture?: string } | null;
  handleGoogleSuccess: (tokenPayload: { access_token?: string; credential?: string }) => Promise<void>;
  handleLoginSuccess: (data: any) => void;
  verifyRegistrationPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  completeMemberRegistration: (payload: MemberRegistrationPayload) => Promise<void>;
  updateMemberProfile: (payload: MemberProfileUpdatePayload) => Promise<void>;
  verifyAdminPassword: (password: string) => Promise<boolean>;
  completeAdminSetup: (displayName: string, position: AdminPosition) => Promise<void>;
  skipAsViewer: () => Promise<void>;
  logout: () => void;
  isModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175').replace(/\/+$/, '');

async function safeFetchJson(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('atl_jwt_token');
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
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

  const [member, setMember] = useState<IMemberProfile | null>(() => {
    const saved = localStorage.getItem('atl_member_session');
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
  const [isPendingRegistration, setIsPendingRegistration] = useState(false);
  const [pendingGoogleAccount, setPendingGoogleAccount] = useState<{ googleId: string; email: string; name: string; profilePicture?: string } | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('atl_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('atl_user_session');
    }
  }, [user]);

  useEffect(() => {
    if (member) {
      localStorage.setItem('atl_member_session', JSON.stringify(member));
    } else {
      localStorage.removeItem('atl_member_session');
    }
  }, [member]);

  // Sync session with backend on load if token present
  useEffect(() => {
    const token = localStorage.getItem('atl_jwt_token');
    if (token) {
      safeFetchJson('/api/auth/me').then(({ ok, data }) => {
        if (ok && data?.success) {
          if (data.user) setUser(data.user);
          if (data.member) {
            setMember(data.member);
            setIsPendingRegistration(false);
          } else if (data.user?.role === 'admin' || data.user?.id?.startsWith('viewer_')) {
            // Admins & Viewer Guests never undergo member registration
            setIsPendingRegistration(false);
          } else if (data.user && !data.hasMemberProfile && !member) {
            // First time Google user needing ATL Member registration
            setPendingGoogleAccount({
              googleId: data.user.googleId,
              email: data.user.email,
              name: data.user.name,
              profilePicture: data.user.profilePicture || ''
            });
            setIsPendingRegistration(true);
          } else {
            setIsPendingRegistration(false);
          }
        }
      });
    }
  }, []);

  const openAdminModal = () => setIsModalOpen(true);
  const closeAdminModal = () => setIsModalOpen(false);

  // Verify Admin Password via Backend ONLY
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

  // Verify Member Registration Password via Backend ONLY
  const verifyRegistrationPassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    const { ok, error, data } = await safeFetchJson('/api/members/verify-password', {
      method: 'POST',
      body: JSON.stringify({ password })
    });

    if (ok && data?.success) {
      return { success: true };
    }

    return {
      success: false,
      error: error || 'Invalid registration password. Please contact an ATL Head if you believe this is an error.'
    };
  };

  // Handle Real Google Token Response from Google OAuth Popup
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

    // Store Google User Session
    setUser(data.user);

    // If admin user
    if (data.user.role === 'admin' || data.isExistingAdmin) {
      setIsPendingRegistration(false);
      setIsAdminUnlockedByPass(false);
      setIsPendingAdminSetup(false);
      setPendingGoogleAccount(null);
      return;
    }

    // If member profile exists in MongoDB
    if (data.hasMemberProfile && data.member) {
      setMember(data.member);
      setIsPendingRegistration(false);
      setIsAdminUnlockedByPass(false);
      setIsPendingAdminSetup(false);
      setPendingGoogleAccount(null);
      return;
    }

    // If user came via "Unlock Admin" path
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

    // First time Google user: redirect to ATL Member Registration Flow
    setPendingGoogleAccount({
      googleId: data.user.googleId,
      email: data.user.email,
      name: data.user.name,
      profilePicture: data.user.profilePicture || ''
    });
    setIsPendingRegistration(true);
  };

  const handleLoginSuccess = (data: any) => {
    if (data.token) {
      localStorage.setItem('atl_jwt_token', data.token);
    }
    setUser(data.user);

    if (data.user.role === 'admin' || data.isExistingAdmin) {
      setIsPendingRegistration(false);
      setIsAdminUnlockedByPass(false);
      setIsPendingAdminSetup(false);
      setPendingGoogleAccount(null);
      return;
    }

    if (data.hasMemberProfile && data.member) {
      setMember(data.member);
      setIsPendingRegistration(false);
      setIsAdminUnlockedByPass(false);
      setIsPendingAdminSetup(false);
      setPendingGoogleAccount(null);
      return;
    }
    
    // For email/password registration, skip the member registration flow if they are not Google users, or we can just let them pass as viewers
    setIsPendingRegistration(false);
  };

  // Complete Member Profile Registration
  const completeMemberRegistration = async (payload: MemberRegistrationPayload) => {
    if (!pendingGoogleAccount) {
      throw new Error('No Google account session found for registration.');
    }

    const fullPayload = {
      ...payload,
      googleId: pendingGoogleAccount.googleId,
      email: pendingGoogleAccount.email
    };

    const { ok, error, data } = await safeFetchJson('/api/members/register', {
      method: 'POST',
      body: JSON.stringify(fullPayload)
    });

    if (!ok || !data?.success || !data?.member) {
      throw new Error(error || 'Registration failed. Please check your inputs and try again.');
    }

    if (data.token) {
      localStorage.setItem('atl_jwt_token', data.token);
    }

    setMember(data.member);
    setIsPendingRegistration(false);
    setPendingGoogleAccount(null);
  };

  // Update Member Profile
  const updateMemberProfile = async (payload: MemberProfileUpdatePayload) => {
    const { ok, error, data } = await safeFetchJson('/api/members/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (!ok || !data?.success || !data?.member) {
      throw new Error(error || 'Failed to update member profile.');
    }

    setMember(data.member);
  };

  // First Time Admin Setup Completion
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

  // Skip as Viewer
  const skipAsViewer = async () => {
    const { ok, data } = await safeFetchJson('/api/auth/viewer-guest', { method: 'POST' });
    if (ok && data?.success && data?.user) {
      setUser(data.user);
      if (data.token) localStorage.setItem('atl_jwt_token', data.token);
    } else {
      const fallbackUser: UserSession = {
        id: 'guest-viewer',
        googleId: 'guest-1',
        email: 'guest@atl.labs',
        name: 'ATL Explorer',
        role: 'viewer'
      };
      setUser(fallbackUser);
      localStorage.setItem('atl_user_session', JSON.stringify(fallbackUser));
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setMember(null);
    setIsPendingAdminSetup(false);
    setIsPendingRegistration(false);
    setIsAdminUnlockedByPass(false);
    setPendingGoogleAccount(null);
    localStorage.removeItem('atl_user_session');
    localStorage.removeItem('atl_member_session');
    localStorage.removeItem('atl_jwt_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        member,
        role: user?.role || null,
        isAuthenticated: !!user,
        isPendingRegistration,
        isPendingAdminSetup,
        isAdminUnlockedByPass,
        pendingGoogleAccount,
        handleGoogleSuccess,
        handleLoginSuccess,
        verifyRegistrationPassword,
        completeMemberRegistration,
        updateMemberProfile,
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
