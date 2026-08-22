import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/ApiError.js';
import { verifyAccessToken } from '../lib/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: 'user' | 'admin';
    }
  }
}

/**
 * Minimal JWT bearer-token guard shared by every module's routes.
 * Owned jointly (built in Phase 0) — Person A's `auth` module is the
 * source of truth for issuing these tokens (signup/login/refresh).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing bearer token');
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    throw ApiError.forbidden('Admin access required');
  }
  next();
}
