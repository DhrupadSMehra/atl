import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { StayBack, StayBackStatusEnum } from '../models/StayBack';
import { StayBackApplication, ApplicationStatusEnum } from '../models/StayBackApplication';
import { Member, DepartmentEnum } from '../models/Member';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper: calculate live deadline countdown string
function getDeadlineCountdown(deadlineDate: Date): { countdownText: string; isExpired: boolean } {
  const now = new Date().getTime();
  const deadline = new Date(deadlineDate).getTime();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return { countdownText: 'Applications Closed', isExpired: true };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return { countdownText: `${days} Day${days > 1 ? 's' : ''} Remaining`, isExpired: false };
  } else if (hours > 0) {
    return { countdownText: `${hours} Hour${hours > 1 ? 's' : ''} Remaining`, isExpired: false };
  } else {
    return { countdownText: `${minutes} Min${minutes > 1 ? 's' : ''} Remaining`, isExpired: false };
  }
}

// Optional Auth Middleware helper to extract user if token present without failing
async function extractUserOptional(req: Request): Promise<{ googleId?: string; email?: string } | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split(' ')[1];
    const jwt = await import('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'atl_jwt_secret_key_2026_secure';
    const decoded = jwt.default.verify(token, secret) as any;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * 1. GET /api/staybacks — List visible StayBacks
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userSession = await extractUserOptional(req);

    let memberId: string | null = null;
    if (userSession) {
      const memberDoc = await Member.findOne({
        $or: [{ googleId: userSession.googleId }, { email: userSession.email?.toLowerCase() }]
      });
      if (memberDoc) memberId = memberDoc._id.toString();
    }

    const staybacks = await StayBack.find({ status: { $ne: 'DRAFT' } }).sort({ date: 1 });

    const formattedList = await Promise.all(
      staybacks.map(async (sb) => {
        // Auto-close open staybacks if deadline passed
        const { countdownText, isExpired } = getDeadlineCountdown(sb.applicationDeadline);
        let currentStatus = sb.status;
        if (currentStatus === 'OPEN' && isExpired) {
          currentStatus = 'CLOSED';
        }

        const acceptedCount = await StayBackApplication.countDocuments({
          stayBackId: sb._id,
          status: 'ACCEPTED'
        });

        const totalApplications = await StayBackApplication.countDocuments({
          stayBackId: sb._id,
          status: { $ne: 'WITHDRAWN' }
        });

        const remainingSeats = Math.max(0, sb.maxParticipants - acceptedCount);
        const isFull = remainingSeats === 0;

        let userApplicationStatus: string | null = null;
        let userApplicationId: string | null = null;

        if (memberId) {
          const userApp = await StayBackApplication.findOne({
            stayBackId: sb._id,
            memberId: memberId
          });
          if (userApp) {
            userApplicationStatus = userApp.status;
            userApplicationId = userApp._id.toString();
          }
        }

        return {
          id: sb._id.toString(),
          title: sb.title,
          projectName: sb.projectName,
          description: sb.description,
          date: sb.date,
          startTime: sb.startTime,
          endTime: sb.endTime,
          applicationDeadline: sb.applicationDeadline,
          maxParticipants: sb.maxParticipants,
          acceptedCount,
          remainingSeats,
          isFull,
          totalApplications,
          requiredDepartments: sb.requiredDepartments,
          status: currentStatus,
          countdownText,
          createdByName: sb.createdByName || 'ATL Head',
          createdAt: sb.createdAt,
          updatedAt: sb.updatedAt,
          userApplicationStatus,
          userApplicationId
        };
      })
    );

    res.json({
      success: true,
      staybacks: formattedList
    });

  } catch (error: any) {
    console.error('[GET StayBacks Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch staybacks.' });
  }
});

/**
 * 2. GET /api/staybacks/my-applications — Private application tracker for logged-in member
 */
router.get('/my-applications', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const memberDoc = await Member.findOne({
      $or: [{ googleId: req.user.googleId }, { email: req.user.email.toLowerCase() }]
    });

    if (!memberDoc) {
      res.json({ success: true, applications: [] });
      return;
    }

    const applications = await StayBackApplication.find({ memberId: memberDoc._id })
      .populate('stayBackId')
      .sort({ submittedAt: -1 });

    const formattedApps = applications.map((app: any) => {
      const sb = app.stayBackId;
      if (!sb) return null;

      let displayMessage = app.memberMessage || '';
      if (!displayMessage) {
        if (app.status === 'ACCEPTED') {
          displayMessage = 'Your application has been accepted! Please ensure you have emailed parent permission.';
        } else if (app.status === 'REJECTED') {
          displayMessage = 'Thank you for applying. Unfortunately, you were not selected for this StayBack.';
        } else if (app.status === 'PENDING') {
          displayMessage = 'Your application has been submitted and is currently pending review by ATL Heads.';
        }
      }

      if (sb.status === 'CANCELLED') {
        displayMessage = 'Notice: This StayBack has been cancelled by ATL Management.';
      }

      return {
        applicationId: app._id.toString(),
        stayBackId: sb._id.toString(),
        title: sb.title,
        projectName: sb.projectName,
        date: sb.date,
        startTime: sb.startTime,
        endTime: sb.endTime,
        submittedAt: app.submittedAt,
        status: sb.status === 'CANCELLED' ? 'CANCELLED' : app.status,
        memberMessage: displayMessage,
        stayBackStatus: sb.status
      };
    }).filter(Boolean);

    res.json({
      success: true,
      applications: formattedApps
    });

  } catch (error: any) {
    console.error('[GET My Applications Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. GET /api/staybacks/:id — Single StayBack details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid StayBack ID.' });
      return;
    }

    const sb = await StayBack.findById(id);
    if (!sb) {
      res.status(404).json({ success: false, error: 'StayBack not found.' });
      return;
    }

    const userSession = await extractUserOptional(req);
    let memberId: string | null = null;
    let userDept: string | null = null;

    if (userSession) {
      const memberDoc = await Member.findOne({
        $or: [{ googleId: userSession.googleId }, { email: userSession.email?.toLowerCase() }]
      });
      if (memberDoc) {
        memberId = memberDoc._id.toString();
        userDept = memberDoc.department;
      }
    }

    const acceptedCount = await StayBackApplication.countDocuments({
      stayBackId: sb._id,
      status: 'ACCEPTED'
    });

    const totalApplications = await StayBackApplication.countDocuments({
      stayBackId: sb._id,
      status: { $ne: 'WITHDRAWN' }
    });

    const remainingSeats = Math.max(0, sb.maxParticipants - acceptedCount);
    const { countdownText, isExpired } = getDeadlineCountdown(sb.applicationDeadline);

    let currentStatus = sb.status;
    if (currentStatus === 'OPEN' && isExpired) currentStatus = 'CLOSED';

    let userAppStatus: string | null = null;
    if (memberId) {
      const app = await StayBackApplication.findOne({ stayBackId: sb._id, memberId });
      if (app) userAppStatus = app.status;
    }

    res.json({
      success: true,
      stayBack: {
        id: sb._id.toString(),
        title: sb.title,
        projectName: sb.projectName,
        description: sb.description,
        date: sb.date,
        startTime: sb.startTime,
        endTime: sb.endTime,
        applicationDeadline: sb.applicationDeadline,
        maxParticipants: sb.maxParticipants,
        acceptedCount,
        remainingSeats,
        isFull: remainingSeats === 0,
        totalApplications,
        requiredDepartments: sb.requiredDepartments,
        status: currentStatus,
        countdownText,
        createdByName: sb.createdByName || 'ATL Head',
        createdAt: sb.createdAt,
        updatedAt: sb.updatedAt,
        userApplicationStatus: userAppStatus,
        userDept
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. POST /api/staybacks/:id/apply — Submit StayBack application
 */
router.post('/:id/apply', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid StayBack ID.' });
      return;
    }

    const memberDoc = await Member.findOne({
      $or: [{ googleId: req.user.googleId }, { email: req.user.email.toLowerCase() }]
    });

    if (!memberDoc || !memberDoc.profileCompleted) {
      res.status(400).json({
        success: false,
        error: 'Please complete your ATL Member profile before applying for staybacks.'
      });
      return;
    }

    const sb = await StayBack.findById(id);
    if (!sb) {
      res.status(404).json({ success: false, error: 'StayBack not found.' });
      return;
    }

    if (sb.status === 'CANCELLED') {
      res.status(400).json({ success: false, error: 'This StayBack has been cancelled.' });
      return;
    }

    if (sb.status === 'CLOSED' || sb.status === 'COMPLETED') {
      res.status(400).json({ success: false, error: 'Applications for this StayBack are closed.' });
      return;
    }

    // Check deadline expiration
    const { isExpired } = getDeadlineCountdown(sb.applicationDeadline);
    if (isExpired) {
      res.status(400).json({ success: false, error: 'The application deadline for this StayBack has passed.' });
      return;
    }

    // Check duplicate application
    const existingApp = await StayBackApplication.findOne({
      stayBackId: sb._id,
      memberId: memberDoc._id
    });

    if (existingApp) {
      res.status(400).json({ success: false, error: 'You have already submitted an application for this StayBack.' });
      return;
    }

    // Check capacity
    const acceptedCount = await StayBackApplication.countDocuments({
      stayBackId: sb._id,
      status: 'ACCEPTED'
    });

    if (acceptedCount >= sb.maxParticipants) {
      res.status(400).json({ success: false, error: 'This StayBack has reached maximum participant capacity.' });
      return;
    }

    const newApp = await StayBackApplication.create({
      stayBackId: sb._id,
      memberId: memberDoc._id,
      status: 'PENDING',
      submittedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Application submitted successfully!',
      application: {
        id: newApp._id.toString(),
        stayBackId: newApp.stayBackId.toString(),
        status: newApp.status,
        submittedAt: newApp.submittedAt
      }
    });

  } catch (error: any) {
    console.error('[Apply StayBack Error]', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to submit application.' });
  }
});

// =========================================================================
// ADMIN API ROUTES (Contextual Admin Controls)
// =========================================================================

/**
 * 5. POST /api/staybacks — Create new StayBack (Admin)
 */
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator permissions required.' });
      return;
    }

    const { title, projectName, description, date, startTime, endTime, applicationDeadline, maxParticipants, requiredDepartments, status } = req.body;

    if (!title || !projectName || !description || !date || !startTime || !endTime || !applicationDeadline || !maxParticipants) {
      res.status(400).json({ success: false, error: 'All fields are required to create a StayBack.' });
      return;
    }

    const newStayBack = await StayBack.create({
      title: String(title).trim(),
      projectName: String(projectName).trim(),
      description: String(description).trim(),
      date: new Date(date),
      startTime: String(startTime).trim(),
      endTime: String(endTime).trim(),
      applicationDeadline: new Date(applicationDeadline),
      maxParticipants: Number(maxParticipants),
      requiredDepartments: Array.isArray(requiredDepartments) && requiredDepartments.length > 0 ? requiredDepartments : ['TECHNICAL'],
      status: status || 'OPEN',
      createdBy: req.user.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      createdByName: req.user.name || 'ATL Head'
    });

    res.json({
      success: true,
      message: 'StayBack created successfully!',
      stayBack: newStayBack
    });

  } catch (error: any) {
    console.error('[Create StayBack Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. PUT /api/staybacks/:id — Edit / Update StayBack (Admin)
 */
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator permissions required.' });
      return;
    }

    const { id } = req.params;
    const sb = await StayBack.findById(id);
    if (!sb) {
      res.status(404).json({ success: false, error: 'StayBack not found.' });
      return;
    }

    const { title, projectName, description, date, startTime, endTime, applicationDeadline, maxParticipants, requiredDepartments, status } = req.body;

    if (title) sb.title = String(title).trim();
    if (projectName) sb.projectName = String(projectName).trim();
    if (description) sb.description = String(description).trim();
    if (date) sb.date = new Date(date);
    if (startTime) sb.startTime = String(startTime).trim();
    if (endTime) sb.endTime = String(endTime).trim();
    if (applicationDeadline) sb.applicationDeadline = new Date(applicationDeadline);
    if (maxParticipants) sb.maxParticipants = Number(maxParticipants);
    if (Array.isArray(requiredDepartments)) sb.requiredDepartments = requiredDepartments;
    if (status) sb.status = status;

    await sb.save();

    res.json({
      success: true,
      message: 'StayBack updated successfully!',
      stayBack: sb
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 7. DELETE /api/staybacks/:id — Delete StayBack (Admin)
 */
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator permissions required.' });
      return;
    }

    const { id } = req.params;
    await StayBack.findByIdAndDelete(id);
    await StayBackApplication.deleteMany({ stayBackId: id });

    res.json({ success: true, message: 'StayBack and related applications deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 8. GET /api/staybacks/:id/admin-overview — Stats for contextual admin overlay
 */
router.get('/:id/admin-overview', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator permissions required.' });
      return;
    }

    const { id } = req.params;
    const sb = await StayBack.findById(id);
    if (!sb) {
      res.status(404).json({ success: false, error: 'StayBack not found.' });
      return;
    }

    const totalApplications = await StayBackApplication.countDocuments({ stayBackId: id });
    const pendingCount = await StayBackApplication.countDocuments({ stayBackId: id, status: 'PENDING' });
    const acceptedCount = await StayBackApplication.countDocuments({ stayBackId: id, status: 'ACCEPTED' });
    const rejectedCount = await StayBackApplication.countDocuments({ stayBackId: id, status: 'REJECTED' });

    const maxCapacity = sb.maxParticipants;
    const remainingCapacity = Math.max(0, maxCapacity - acceptedCount);

    res.json({
      success: true,
      stats: {
        totalApplications,
        pendingCount,
        acceptedCount,
        rejectedCount,
        maxCapacity,
        remainingCapacity,
        isFull: remainingCapacity === 0
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 9. GET /api/staybacks/:id/applications — Fetch applications for admin review
 */
router.get('/:id/applications', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator permissions required.' });
      return;
    }

    const { id } = req.params;
    const { search, department, status } = req.query;

    const apps = await StayBackApplication.find({ stayBackId: id })
      .populate('memberId')
      .sort({ submittedAt: -1 });

    const formatted = apps.map((app: any) => {
      const m = app.memberId;
      if (!m) return null;

      return {
        applicationId: app._id.toString(),
        stayBackId: app.stayBackId.toString(),
        member: {
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
          createdAt: m.createdAt
        },
        status: app.status,
        submittedAt: app.submittedAt,
        reviewedAt: app.reviewedAt,
        internalNotes: app.internalNotes || '',
        memberMessage: app.memberMessage || ''
      };
    }).filter(Boolean);

    // Apply Filters (Search by name, department, status)
    let filtered = formatted;

    if (search && String(search).trim()) {
      const query = String(search).trim().toLowerCase();
      filtered = filtered.filter(a =>
        a.member.fullName.toLowerCase().includes(query) ||
        a.member.email.toLowerCase().includes(query) ||
        a.member.contactNumber.includes(query)
      );
    }

    if (department && String(department) !== 'ALL') {
      filtered = filtered.filter(a => a.member.department === department);
    }

    if (status && String(status) !== 'ALL') {
      filtered = filtered.filter(a => a.status === status);
    }

    res.json({
      success: true,
      applications: filtered
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 10. PUT /api/staybacks/applications/:id — Accept or Reject application (Admin)
 */
router.put('/applications/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Administrator permissions required.' });
      return;
    }

    const { id } = req.params;
    const { status, internalNotes, memberMessage } = req.body;

    if (!status || !['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      res.status(400).json({ success: false, error: 'Valid status (ACCEPTED, REJECTED, PENDING) is required.' });
      return;
    }

    const app = await StayBackApplication.findById(id);
    if (!app) {
      res.status(404).json({ success: false, error: 'Application not found.' });
      return;
    }

    // Capacity Check on Accept
    if (status === 'ACCEPTED' && app.status !== 'ACCEPTED') {
      const sb = await StayBack.findById(app.stayBackId);
      if (sb) {
        const acceptedCount = await StayBackApplication.countDocuments({
          stayBackId: sb._id,
          status: 'ACCEPTED'
        });

        if (acceptedCount >= sb.maxParticipants) {
          res.status(400).json({
            success: false,
            error: 'Maximum capacity reached for this StayBack. Cannot accept more participants.'
          });
          return;
        }
      }
    }

    app.status = status as ApplicationStatusEnum;
    if (internalNotes !== undefined) app.internalNotes = String(internalNotes).trim();
    if (memberMessage !== undefined) app.memberMessage = String(memberMessage).trim();
    app.reviewedAt = new Date();
    if (req.user.id) app.reviewedBy = new mongoose.Types.ObjectId(req.user.id);

    await app.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}.`,
      application: {
        applicationId: app._id.toString(),
        status: app.status,
        internalNotes: app.internalNotes,
        memberMessage: app.memberMessage,
        reviewedAt: app.reviewedAt
      }
    });

  } catch (error: any) {
    console.error('[Review Application Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
