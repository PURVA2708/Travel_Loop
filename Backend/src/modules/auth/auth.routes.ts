import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { loginHandler, meHandler, signupHandler } from './auth.controller.js';

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

authRouter.post('/signup', authLimiter, asyncHandler(signupHandler));
authRouter.post('/login', authLimiter, asyncHandler(loginHandler));
authRouter.get('/me', requireAuth, asyncHandler(meHandler));
