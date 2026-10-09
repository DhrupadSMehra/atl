import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Member, DepartmentEnum } from '../models/Member.js';
import { User } from '../models/User.js';
import { verifyToken, AuthRequest } from '../middleware/auth.js';

dotenv.config();

const router = Router();

const getJwtSecret = () => process.env.JWT_SECRET || 'atl_jwt_secret_key_2026_secure';
const getRegistrationPassword = () => process.env.ATL_MEMBER_REGISTRATION_PASSWORD || 'atl_member_pass_2026';

const VALID_DEPARTMENTS: DepartmentEnum[] = [
  'TECHNICAL',
  'CREATIVE',
  'PHOTOGRAPHY',
  'SOCIAL_MEDIA',
  'MARKETING',
  'HOSPITALITY'
];

/**
 * 1. Verify ATL Member Registration Password
 * POST /api/members/verify-password
 * Body: { password: string }
 */
router.post('/verify-password', (req: Request, res: Response) => {
  const { password } = req.body;
  const expectedPassword = getRegistrationPassword();

  if (!password || String(password).trim() !== String(expectedPassword).trim()) {
    res.status(400).json({
      success: false,
      error: 'Invalid registration password. Please contact an ATL Head if you believe this is an error.'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Registration password verified successfully.'
  });
});

/**
 * 2. Register ATL Member Profile
 * POST /api/members/register
 * Body: { password, fullName, studentClass, section, contactNumber, department, googleId, email }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        code: 'SERVICE_UNAVAILABLE',
        error: 'Authentication service temporarily unavailable.'
      });
      return;
    }

    const { password, fullName, studentClass, section, contactNumber, department, googleId, email } = req.body;

    // Validate Registration Password (SERVER-SIDE ONLY)
    const expectedPassword = getRegistrationPassword();
    if (!password || String(password).trim() !== String(expectedPassword).trim()) {
      res.status(400).json({
        success: false,
        error: 'Invalid registration password. Please contact an ATL Head if you believe this is an error.'
      });
      return;
    }

    // Required Field Validations
    if (!fullName || !studentClass || !section || !contactNumber || !department) {
      res.status(400).json({
        success: false,
        error: 'All fields (Full Name, Class, Section, Contact Number, Department) are required.'
      });
      return;
    }

    // Validate Contact Number (10 digits)
    const cleanPhone = String(contactNumber).trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      res.status(400).json({
        success: false,
        error: 'Contact number must contain exactly 10 digits.'
      });
      return;
    }

    // Validate Department
    const upperDept = String(department).trim().toUpperCase() as DepartmentEnum;
    if (!VALID_DEPARTMENTS.includes(upperDept)) {
      res.status(400).json({
        success: false,
        error: `Department must be one of: ${VALID_DEPARTMENTS.join(', ')}.`
      });
      return;
    }

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email address is required for registration.'
      });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check for existing profile for duplicate prevention
    let existingMember = await Member.findOne({
      $or: [
        ...(googleId ? [{ googleId }] : []),
        { email: cleanEmail }
      ]
    });

    if (existingMember && existingMember.profileCompleted) {
      res.status(400).json({
        success: false,
        error: 'An ATL Member profile already exists for this account.'
      });
      return;
    }

    // Check if user has admin role in User collection
    const userDoc = await User.findOne({
      $or: [
        ...(googleId ? [{ googleId }] : []),
        { email: cleanEmail }
      ]
    });
    const isUserAdmin = userDoc?.role === 'admin';
    const memberRole = isUserAdmin ? 'ADMIN' : 'MEMBER';

    let member: any;
    if (existingMember) {
      if (googleId && !existingMember.googleId) existingMember.googleId = googleId;
      if (userDoc?._id && !existingMember.userId) existingMember.userId = userDoc._id;
      existingMember.fullName = String(fullName).trim();
      existingMember.studentClass = String(studentClass).trim();
      existingMember.section = String(section).trim();
      existingMember.contactNumber = cleanPhone;
      existingMember.department = upperDept;
      existingMember.role = memberRole;
      existingMember.profileCompleted = true;
      member = await existingMember.save();
    } else {
      const newMemberData: any = {
        email: cleanEmail,
        fullName: String(fullName).trim(),
        studentClass: String(studentClass).trim(),
        section: String(section).trim(),
        contactNumber: cleanPhone,
        department: upperDept,
        role: memberRole,
        profileCompleted: true
      };
      if (googleId) newMemberData.googleId = googleId;
      if (userDoc?._id) newMemberData.userId = userDoc._id;
      member = await Member.create(newMemberData);
    }

    // Issue JWT token containing member details
    const token = jwt.sign(
      {
        id: userDoc?._id.toString() || member._id.toString(),
        memberId: member._id.toString(),
        googleId: member.googleId,
        email: member.email,
        name: member.fullName,
        role: isUserAdmin ? 'admin' : 'viewer'
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      member: {
        memberId: member._id.toString(),
        googleId: member.googleId,
        email: member.email,
        fullName: member.fullName,
        studentClass: member.studentClass,
        section: member.section,
        contactNumber: member.contactNumber,
        department: member.department,
        role: member.role,
        profileCompleted: member.profileCompleted,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });

  } catch (error: any) {
    console.error('[Member Register API Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to complete member registration.' });
  }
});

/**
 * 3. Get Authenticated Member Profile
 * GET /api/members/profile
 */
router.get('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const member = await Member.findOne({
      $or: [{ googleId: req.user.googleId }, { email: req.user.email.toLowerCase() }]
    });

    if (!member) {
      res.status(444).json({ success: false, error: 'Member profile not found.', profileCompleted: false });
      return;
    }

    res.json({
      success: true,
      member: {
        memberId: member._id.toString(),
        googleId: member.googleId,
        email: member.email,
        fullName: member.fullName,
        studentClass: member.studentClass,
        section: member.section,
        contactNumber: member.contactNumber,
        department: member.department,
        role: member.role,
        profileCompleted: member.profileCompleted,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. Update Member Profile
 * PUT /api/members/profile
 * Body: { fullName, contactNumber, department, studentClass, section }
 */
router.put('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { fullName, contactNumber, department, studentClass, section } = req.body;

    const member = await Member.findOne({
      $or: [{ googleId: req.user.googleId }, { email: req.user.email.toLowerCase() }]
    });

    if (!member) {
      res.status(404).json({ success: false, error: 'Member profile not found.' });
      return;
    }

    if (fullName) member.fullName = String(fullName).trim();
    if (studentClass) member.studentClass = String(studentClass).trim();
    if (section) member.section = String(section).trim();

    if (contactNumber) {
      const cleanPhone = String(contactNumber).trim();
      if (!/^\d{10}$/.test(cleanPhone)) {
        res.status(400).json({ success: false, error: 'Contact number must contain exactly 10 digits.' });
        return;
      }
      member.contactNumber = cleanPhone;
    }

    if (department) {
      const upperDept = String(department).trim().toUpperCase() as DepartmentEnum;
      if (!VALID_DEPARTMENTS.includes(upperDept)) {
        res.status(400).json({ success: false, error: `Invalid department. Must be one of: ${VALID_DEPARTMENTS.join(', ')}` });
        return;
      }
      member.department = upperDept;
    }

    const updatedMember = await member.save();

    res.json({
      success: true,
      message: 'Member profile updated successfully.',
      member: {
        memberId: updatedMember._id.toString(),
        googleId: updatedMember.googleId,
        email: updatedMember.email,
        fullName: updatedMember.fullName,
        studentClass: updatedMember.studentClass,
        section: updatedMember.section,
        contactNumber: updatedMember.contactNumber,
        department: updatedMember.department,
        role: updatedMember.role,
        profileCompleted: updatedMember.profileCompleted,
        createdAt: updatedMember.createdAt,
        updatedAt: updatedMember.updatedAt
      }
    });

  } catch (error: any) {
    console.error('[Update Member Profile Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update member profile.' });
  }
});

/**
 * 5. Get All Members (Admin Roster)
 * GET /api/members/all
 */
router.get('/all', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const isUserAdmin = req.user?.role === 'admin';
    let isRegisteredMember = false;

    if (!isUserAdmin && req.user) {
      const member = await Member.findOne({
        $or: [{ googleId: req.user.googleId }, { email: req.user.email.toLowerCase() }]
      });
      if (member && member.profileCompleted) {
        isRegisteredMember = true;
      }
    }

    const canSeeAllDetails = isUserAdmin || isRegisteredMember;

    const members = await Member.find().sort({ createdAt: -1 });

    const formatted = members.map(m => {
      if (canSeeAllDetails) {
        return {
          memberId: m._id.toString(),
          googleId: m.googleId,
          email: m.email,
          fullName: m.fullName,
          studentClass: m.studentClass,
          section: m.section,
          contactNumber: m.contactNumber,
          department: m.department,
          role: m.role,
          profileCompleted: m.profileCompleted,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt
        };
      } else {
        return {
          memberId: m._id.toString(),
          googleId: m.googleId,
          fullName: m.fullName,
          department: m.department,
          email: '',
          studentClass: '',
          section: '',
          contactNumber: '',
          role: '',
          profileCompleted: m.profileCompleted,
        };
      }
    });

    res.json({
      success: true,
      members: formatted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
