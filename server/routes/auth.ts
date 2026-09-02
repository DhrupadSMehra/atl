import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, IUser, AdminPosition } from '../models/User';
import { Member } from '../models/Member';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { verifyToken, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

dotenv.config();

const router = Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'atl_jwt_secret_key_2026_secure';
const getGoogleClientId = () => process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(getGoogleClientId());

// Helper to sign JWT
const generateToken = (user: { id: string; googleId?: string; email: string; name: string; role: 'viewer' | 'admin' }) => {
  return jwt.sign(user, getJwtSecret(), { expiresIn: '7d' });
};

/**
 * 1. Verify Admin Password (SERVER-SIDE ONLY)
 */
router.post('/verify-admin-pass', (req: Request, res: Response) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_ACCESS_PASSWORD;

  if (!adminPassword) {
    res.status(500).json({ success: false, error: 'Server configuration error.' });
    return;
  }

  if (!password || String(password).trim() !== String(adminPassword).trim()) {
    res.status(400).json({ success: false, error: 'Incorrect administrator password.' });
    return;
  }
  res.json({ success: true, message: 'Password verified successfully.' });
});

/**
 * 2. Google OAuth Token Verification & Authentication
 */
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, access_token } = req.body;

    if (!credential && !access_token) {
      res.status(400).json({ success: false, error: 'Google authentication token is required.' });
      return;
    }

    let googleId = '';
    let email = '';
    let name = '';
    let profilePicture = '';

    if (credential) {
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
      const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
      if (!googleRes.ok) {
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

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    const memberDoc = await Member.findOne({ $or: [{ googleId }, { email }] });

    if (user?.isBanned) {
      res.status(403).json({ success: false, error: 'Your account has been banned by a moderator.' });
      return;
    }

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
      // If user signed up via email but now uses Google, we can link the googleId
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

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
    res.status(500).json({ success: false, error: error.message || 'Google token verification failed.' });
  }
});

/**
 * 3. Email & Password Registration (Normal & Backend Team)
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, adminPassword } = req.body;
    if (!email || !name || !password) {
      res.status(400).json({ success: false, error: 'Email, name, and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'User with this email already exists.' });
      return;
    }

    let role: 'viewer' | 'admin' = 'viewer';
    
    // Check if they provided backend team password to become admin
    if (adminPassword) {
      const serverAdminPassword = process.env.ADMIN_ACCESS_PASSWORD;
      if (adminPassword === serverAdminPassword) {
        role = 'admin';
      } else {
        res.status(400).json({ success: false, error: 'Invalid backend team password.' });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role
    });

    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      isExistingAdmin: role === 'admin',
      hasMemberProfile: false
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. Email & Password Login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        error: 'Authentication service temporarily unavailable.'
      });
      return;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    if (!cleanEmail || !cleanPassword) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    let user = await User.findOne({ email: cleanEmail });
    let memberDoc = await Member.findOne({ email: cleanEmail });

    if (!user && !memberDoc) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    if (user?.isBanned) {
      res.status(403).json({ success: false, error: 'Your account has been banned by a moderator.' });
      return;
    }

    const memberBootstrapPassword = process.env.ATL_MEMBER_REGISTRATION_PASSWORD || 'atl_member_pass_2026';
    let isMatch = false;

    // 1. If User has an initialized passwordHash, verify with bcrypt
    if (user?.passwordHash) {
      isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
    }

    // 2. If the backend member account exists (in Member collection) but has no initialized User password hash:
    // verify against the designated backend member bootstrap credential (ATL_MEMBER_REGISTRATION_PASSWORD)
    if (!isMatch && memberDoc && (!user || !user.passwordHash)) {
      if (memberBootstrapPassword && cleanPassword === String(memberBootstrapPassword).trim()) {
        isMatch = true;

        // Hash and persist the password, create or update User account
        const newHash = await bcrypt.hash(cleanPassword, 10);
        if (user) {
          user.passwordHash = newHash;
          if (!user.name && memberDoc.fullName) user.name = memberDoc.fullName;
          await user.save();
        } else {
          user = await User.create({
            email: cleanEmail,
            name: memberDoc.fullName || 'ATL Member',
            passwordHash: newHash,
            role: memberDoc.role === 'ADMIN' ? 'admin' : 'viewer',
            googleId: memberDoc.googleId
          });
        }
      }
    }

    if (!isMatch || !user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    if (!memberDoc) {
      memberDoc = await Member.findOne({
        $or: [
          ...(user.googleId ? [{ googleId: user.googleId }] : []),
          { email: cleanEmail }
        ]
      });
    }

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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4b. Viewer Guest Endpoint
 */
router.post('/viewer-guest', async (_req: Request, res: Response): Promise<void> => {
  const guestUser = {
    id: `guest_${Date.now()}`,
    email: 'guest@atl.labs',
    name: 'ATL Explorer',
    role: 'viewer' as const
  };
  const token = generateToken(guestUser);
  res.json({
    success: true,
    token,
    user: guestUser,
    isExistingAdmin: false,
    hasMemberProfile: false
  });
});

/**
 * 5. Get Active Session User
 */
router.get('/me', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    // Lookup by _id if available, fallback to email
    const dbUser = req.user.id 
      ? await User.findById(req.user.id) 
      : await User.findOne({ email: req.user.email.toLowerCase() });

    if (dbUser?.isBanned) {
      res.status(403).json({ success: false, error: 'Your account has been banned by a moderator.' });
      return;
    }

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

/**
 * 6. Admin Ban User endpoint
 * PATCH /api/auth/users/:id/ban
 */
router.patch('/users/:id/ban', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Only administrators can ban accounts.' });
      return;
    }

    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    if (targetUser.role === 'admin') {
      res.status(400).json({ success: false, error: 'Cannot ban another administrator.' });
      return;
    }

    targetUser.isBanned = true;
    await targetUser.save();

    // Delete all their posts
    await Post.deleteMany({ author: targetUserId });
    // Delete all their comments
    await Comment.deleteMany({ author: targetUserId });

    res.json({ success: true, message: 'User banned and all content removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. Admin Setup
 */
router.post('/admin-setup', verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName, fullName, position } = req.body;
    const nameToUse = displayName || fullName;
    
    if (!nameToUse || !position) {
      res.status(400).json({ success: false, error: 'Full name and position are required.' });
      return;
    }

    if (!req.user || !req.user.googleId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = await User.findOne({ googleId: req.user.googleId });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    user.role = 'admin';
    user.adminProfile = {
      displayName: nameToUse,
      position: position as AdminPosition,
      createdAt: new Date()
    };

    await user.save();

    // Generate a fresh token with admin role
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
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
