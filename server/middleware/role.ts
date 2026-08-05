import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (allowedRole: 'admin' | 'viewer') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({ 
        success: false, 
        error: `Access denied. Requires '${allowedRole}' privilege.` 
      });
      return;
    }

    next();
  };
};
