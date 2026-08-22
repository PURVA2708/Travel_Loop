import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  userId?: string;
  userRole?: 'user' | 'admin' | string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userId?: string;
      userRole?: 'user' | 'admin' | string;
    }
  }
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.userId = decoded.userId || (decoded as any).sub;
    req.userRole = decoded.role?.toLowerCase();
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export const requireAuth = authMiddleware;

export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      req.userId = decoded.userId || (decoded as any).sub;
      req.userRole = decoded.role?.toLowerCase();
    }
    next();
  } catch {
    // If token invalid, proceed as guest without error
    next();
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const role = req.user?.role?.toLowerCase() || req.userRole?.toLowerCase();
  if (role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.',
    });
    return;
  }
  next();
};
