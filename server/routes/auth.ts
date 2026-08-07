import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { User, IUser, AdminPosition } from '../models/User';
import { Member } from '../models/Member';
import { verifyToken, AuthRequest } from '../middleware/auth';

dotenv.config();

const router = Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'atl_jwt_secret_key_2026_secure';
const getGoogleClientId = () => process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(getGoogleClientId());

// Helper to sign JWT
const generateToken = (user: { id: string; googleId: string; email: string; name: string; role: 'viewer' | 'admin' }) => {
  return jwt.sign(user, getJwtSecret(), { expiresIn: '7d' });
};

/**
 * 1. Verify Admin Password (SERVER-SIDE ONLY)
 * POST /api/auth/verify-admin-pass
 * Body: { password: string }
 */
router.post('/verify-admin-pass', (req: Request, res: Response) => {
  console.log('[Auth Route] Received POST /api/auth/verify-admin-pass request');
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_ACCESS_PASSWORD;

  if (!adminPassword) {
    console.error('[Auth Error] ADMIN_ACCESS_PASSWORD is not defined in process.env');
    res.status(500).json({ success: false, error: 'Server configuration error.' });
    return;
  }

  if (!password || String(password).trim() !== String(adminPassword).trim()) {
    console.warn('[Auth Route] Admin password verification failed - incorrect password');
    res.status(400).json({ success: false, error: 'Incorrect administrator password.' });
    return;
  }

  console.log('✓ Admin password verified successfully server-side');
  res.json({ success: true, message: 'Password verified successfully.' });
});

/**
 * 2. Google OAuth Token Verification & Authentication
 * POST /api/auth/google
 * Body: { credential?: string; access_token?: string }
 */
router.post('/google', async (req: Request, res: Response) => {
  console.log('[Auth Route] Received POST /api/auth/google request');
  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      console.warn('[Auth Route] Missing credential or access_token in request body');
      res.status(400).json({ success: false, error: 'Google authentication token is required.' });
      return;
    }

    let googleId = '';
    let email = '';
    let name = '';
    let profilePicture = '';

    // Verify Google Token (ID Token or Access Token)
    if (credential) {
      console.log('[Auth Route] Verifying Google ID Token (credential)...');
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: getGoogleClientId(),
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(401).json({ success: false, error: 'Invalid Google ID token payload.' });
        return;
      }
      googleId = payload.sub;
      email = payload.email.toLowerCase();
      name = payload.name || payload.given_name || 'ATL Member';
      profilePicture = payload.picture || '';
    } else if (access_token) {
      console.log('[Auth Route] Verifying Google Access Token via UserInfo API...');
      const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
      if (!googleRes.ok) {
        console.warn(`[Auth Route] Google UserInfo API returned ${googleRes.status}`);
        res.status(401).json({ success: false, error: 'Failed to verify Google access token.' });
        return;
      }
      const payload = await googleRes.json();
      if (!payload || !payload.email) {
        res.status(401).json({ success: false, error: 'Invalid user info from Google.' });
        return;
      }
      googleId = payload.sub;
      email = payload.email.toLowerCase();
      name = payload.name || payload.given_name || 'ATL Member';
      profilePicture = payload.picture || '';
    }

    console.log(`✓ Google Token Verified for Email: ${email}`);

    // Lookup user and member in MongoDB
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    const memberDoc = await Member.findOne({ $or: [{ googleId }, { email }] });

    const memberData = memberDoc && memberDoc.profileCompleted ? {
      memberId: memberDoc._id.toString(),
      googleId: memberDoc.googleId,
      email: memberDoc.email,
      fullName: memberDoc.fullName,
      studentClass: memberDoc.studentClass,
      section: memberDoc.section,
      contactNumber: memberDoc.contactNumber,
      department: memberDoc.department,
      role: memberDoc.role,
      profileCompleted: memberDoc.profileCompleted,
      createdAt: memberDoc.createdAt,
      updatedAt: memberDoc.updatedAt
    } : null;

    if (user) {
      console.log(`✓ User found in MongoDB. Role: ${user.role}`);
      const token = generateToken({
        id: user._id.toString(),
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        role: user.role
      });

      res.json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          role: user.role,
          adminProfile: user.adminProfile
        },
        isExistingAdmin: user.role === 'admin',
        member: memberData,
        hasMemberProfile: !!memberData
      });
      return;
    }

    // New user — create default viewer account in MongoDB
    console.log(`[Auth Route] User not found in MongoDB. Creating new viewer user for ${email}...`);
    const newUser = await User.create({
      googleId,
      email,
      name,
      profilePicture,
      role: 'viewer'
    });

    const token = generateToken({
      id: newUser._id.toString(),
      googleId: newUser.googleId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        googleId: newUser.googleId,
        email: newUser.email,
        name: newUser.name,
        profilePicture: newUser.profilePicture,
        role: newUser.role
      },
      isExistingAdmin: false,
      member: memberData,
      hasMemberProfile: !!memberData
    });

  } catch (error: any) {
    console.error('[Auth API Google Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Google token verification failed.' });
  }
});

/**
 * 3. First Time Admin Setup
 * POST /api/auth/admin-setup
 * Body: { googleId, email, name, profilePicture, displayName, position }
 */
router.post('/admin-setup', async (req: Request, res: Response) => {
  console.log('[Auth Route] Received POST /api/auth/admin-setup request');
  try {
    const { googleId, email, name, profilePicture, displayName, position } = req.body;

    const validPositions: AdminPosition[] = [
      'President', 'Vice President', 'Head', 'Coordinator', 'Faculty', 'Teacher', 'Mentor'
    ];

    if (!displayName || !position || !validPositions.includes(position)) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid profile details. Position must be one of the specified leadership options.' 
      });
      return;
    }

    const adminProfileData = {
      displayName: displayName.trim(),
      position: position as AdminPosition,
      createdAt: new Date()
    };

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      user.role = 'admin';
      user.adminProfile = adminProfileData;
      await user.save();
    } else {
      user = await User.create({
        googleId: googleId || `google_${Date.now()}`,
        email: email.toLowerCase(),
        name: name || displayName,
        profilePicture: profilePicture || '',
        role: 'admin',
        adminProfile: adminProfileData
      });
    }

    console.log(`✓ Admin profile saved in MongoDB for ${user.email}. Role set to admin.`);

    const token = generateToken({
      id: user._id.toString(),
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      role: 'admin'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        role: 'admin',
        adminProfile: user.adminProfile
      }
    });

  } catch (error: any) {
    console.error('[Auth API Admin Setup Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to complete admin setup.' });
  }
});

/**
 * 4. Skip / Viewer Guest Sign-in
 * POST /api/auth/viewer-guest
 */
router.post('/viewer-guest', async (_req: Request, res: Response) => {
  console.log('[Auth Route] Received POST /api/auth/viewer-guest request');
  try {
    const guestUser = {
      id: `viewer_${Date.now()}`,
      googleId: `guest_${Date.now()}`,
      email: 'guest@atl.community',
      name: 'ATL Visitor',
      role: 'viewer' as const
    };

    const token = generateToken(guestUser);

    res.json({
      success: true,
      token,
      user: guestUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. Get Active Session User
 * GET /api/auth/me
 */
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  console.log('[Auth Route] Received GET /api/auth/me request');
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const dbUser = await User.findOne({ googleId: req.user.googleId });
    const memberDoc = await Member.findOne({
      $or: [{ googleId: req.user.googleId }, { email: req.user.email.toLowerCase() }]
    });

    const memberData = memberDoc && memberDoc.profileCompleted ? {
      memberId: memberDoc._id.toString(),
      googleId: memberDoc.googleId,
      email: memberDoc.email,
      fullName: memberDoc.fullName,
      studentClass: memberDoc.studentClass,
      section: memberDoc.section,
      contactNumber: memberDoc.contactNumber,
      department: memberDoc.department,
      role: memberDoc.role,
      profileCompleted: memberDoc.profileCompleted,
      createdAt: memberDoc.createdAt,
      updatedAt: memberDoc.updatedAt
    } : null;

    if (dbUser) {
      res.json({
        success: true,
        user: {
          id: dbUser._id.toString(),
          googleId: dbUser.googleId,
          email: dbUser.email,
          name: dbUser.name,
          profilePicture: dbUser.profilePicture,
          role: dbUser.role,
          adminProfile: dbUser.adminProfile
        },
        member: memberData,
        hasMemberProfile: !!memberData
      });
      return;
    }

    res.json({
      success: true,
      user: req.user,
      member: memberData,
      hasMemberProfile: !!memberData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
